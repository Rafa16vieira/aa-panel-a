import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Cidade, Lideranca, Visita, LiderancaInput, VisitaInput } from '../types';
import { RESPONSAVEL_PADRAO } from '../types';
import { AGENDA_VISITA_PREFIX, idsAgendaParaRemover, isVisitaAgenda } from '../utils/agendaCampanha';
import { getSupabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'painel-alagoas-local-data';
const SEED_CHUNK_SIZE = 50;
const CONNECT_TIMEOUT_MS = 8000;

interface LocalStore {
  cidades: Cidade[];
  liderancas: Lideranca[];
  visitas: Visita[];
}

export type AppData = {
  cidades: Cidade[];
  liderancas: Lideranca[];
  visitas: Visita[];
};

type Listener = (data: LocalStore) => void;
type Unsubscribe = () => void;

let localStore: LocalStore = { cidades: [], liderancas: [], visitas: [] };
const localListeners = new Set<Listener>();

/** Quando true, força persistência local mesmo com Supabase no .env (ex.: falha de conexão). */
let forceLocalMode = false;

function loadLocalStore(): LocalStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LocalStore;
  } catch {
    /* ignore */
  }
  return { cidades: [], liderancas: [], visitas: [] };
}

function saveLocalStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(localStore));
  localListeners.forEach((fn) => fn(localStore));
}

function generateId(): string {
  return crypto.randomUUID();
}

function isSupabaseActive(): boolean {
  return isSupabaseConfigured() && !forceLocalMode;
}

function mapVisitaRow(row: {
  id: string;
  lideranca_id: string;
  data_hora: string | null;
  observacoes: string | null;
}): Visita {
  return {
    id: row.id,
    lideranca_id: row.lideranca_id,
    data_hora: row.data_hora,
    observacoes: row.observacoes ?? '',
  };
}

function normalizeVisitas(liderancaId: string, inputs: VisitaInput[]): Visita[] {
  return inputs.map((v) => ({
    id: v.id ?? generateId(),
    lideranca_id: liderancaId,
    data_hora: v.data_hora,
    observacoes: v.observacoes?.trim() ?? '',
  }));
}

function syncVisitasLocal(liderancaId: string, inputs: VisitaInput[]): void {
  const desired = normalizeVisitas(liderancaId, inputs);
  const desiredIds = new Set(desired.map((v) => v.id));
  localStore.visitas = [
    ...localStore.visitas.filter(
      (v) =>
        v.lideranca_id !== liderancaId ||
        (isVisitaAgenda(v.id) && !desiredIds.has(v.id)),
    ),
    ...desired,
  ];
}

function subscribeLocal(onData: (data: AppData) => void): Unsubscribe {
  localStore = loadLocalStore();
  onData(localStore);
  const listener: Listener = (data) => onData(data);
  localListeners.add(listener);
  return () => localListeners.delete(listener);
}

async function fetchAllTables(): Promise<AppData> {
  const sb = getSupabase();
  const [cidadesRes, liderancasRes, visitasRes] = await Promise.all([
    sb.from('cidades').select('id,nome'),
    sb.from('liderancas').select('id,nome,cidade_id,quantidade_pessoas,responsavel'),
    sb.from('visitas').select('id,lideranca_id,data_hora,observacoes'),
  ]);

  if (cidadesRes.error) throw cidadesRes.error;
  if (liderancasRes.error) throw liderancasRes.error;
  if (visitasRes.error) throw visitasRes.error;

  return {
    cidades: (cidadesRes.data ?? []) as Cidade[],
    liderancas: ((liderancasRes.data ?? []) as Lideranca[]).map((l) => ({
      ...l,
      responsavel: l.responsavel?.trim() || RESPONSAVEL_PADRAO,
    })),
    visitas: (visitasRes.data ?? []).map(mapVisitaRow),
  };
}

async function syncVisitasSupabase(liderancaId: string, inputs: VisitaInput[]): Promise<void> {
  const sb = getSupabase();
  const desired = normalizeVisitas(liderancaId, inputs);
  const desiredIds = new Set(desired.map((v) => v.id));

  const { data: existing, error: listError } = await sb
    .from('visitas')
    .select('id')
    .eq('lideranca_id', liderancaId);

  if (listError) throw listError;

  const toDelete = (existing ?? [])
    .map((row) => row.id as string)
    .filter((id) => !desiredIds.has(id) && !isVisitaAgenda(id));

  if (toDelete.length > 0) {
    const { error: delError } = await sb.from('visitas').delete().in('id', toDelete);
    if (delError) throw delError;
  }

  if (desired.length > 0) {
    const { error: upsertError } = await sb.from('visitas').upsert(
      desired.map((v) => ({
        id: v.id,
        lideranca_id: v.lideranca_id,
        data_hora: v.data_hora,
        observacoes: v.observacoes,
      })),
    );
    if (upsertError) throw upsertError;
  }
}

export async function seedCidades(cidades: Cidade[]): Promise<void> {
  if (isSupabaseActive()) {
    const sb = getSupabase();
    for (let i = 0; i < cidades.length; i += SEED_CHUNK_SIZE) {
      const chunk = cidades.slice(i, i + SEED_CHUNK_SIZE);
      const { error } = await sb.from('cidades').upsert(chunk);
      if (error) throw error;
    }
  } else {
    localStore.cidades = cidades;
    saveLocalStore();
  }
}

/**
 * Assina dados em tempo real via Supabase Realtime.
 * Se falhar (rede, schema, projeto inválido), cai para localStorage.
 */
export function subscribeData(onData: (data: AppData) => void): Unsubscribe {
  if (!isSupabaseActive()) {
    return subscribeLocal(onData);
  }

  let cidades: Cidade[] = [];
  let liderancas: Lideranca[] = [];
  let visitas: Visita[] = [];
  let settled = false;
  let unsubscribed = false;
  let localUnsub: Unsubscribe | undefined;
  let channel: RealtimeChannel | undefined;

  const emit = () => onData({ cidades, liderancas, visitas });

  const fallbackToLocal = (reason: unknown) => {
    if (settled || unsubscribed) return;
    settled = true;
    forceLocalMode = true;
    console.warn('[painel-alagoas] Supabase indisponível — usando modo local.', reason);
    if (channel) {
      void getSupabase().removeChannel(channel);
      channel = undefined;
    }
    localUnsub = subscribeLocal(onData);
  };

  const applyChange = <T extends { id: string }>(
    list: T[],
    eventType: string,
    row: T | null,
  ): T[] => {
    if (!row) return list;
    if (eventType === 'INSERT') {
      if (list.some((item) => item.id === row.id)) return list;
      return [...list, row];
    }
    if (eventType === 'UPDATE') {
      return list.map((item) => (item.id === row.id ? row : item));
    }
    if (eventType === 'DELETE') {
      return list.filter((item) => item.id !== row.id);
    }
    return list;
  };

  void (async () => {
    try {
      const initial = await fetchAllTables();
      if (unsubscribed) return;
      settled = true;
      cidades = initial.cidades;
      liderancas = initial.liderancas;
      visitas = initial.visitas;
      emit();

      channel = getSupabase()
        .channel('painel-alagoas-data')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'cidades' },
          (payload) => {
            const row = (payload.new ?? payload.old) as Cidade | null;
            cidades = applyChange(cidades, payload.eventType, row);
            emit();
          },
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'liderancas' },
          (payload) => {
            const row = (payload.new ?? payload.old) as Lideranca | null;
            liderancas = applyChange(liderancas, payload.eventType, row);
            emit();
          },
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'visitas' },
          (payload) => {
            const raw = (payload.new ?? payload.old) as Parameters<typeof mapVisitaRow>[0] | null;
            const row = raw ? mapVisitaRow(raw) : null;
            visitas = applyChange(visitas, payload.eventType, row);
            emit();
          },
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            fallbackToLocal(new Error(`Realtime status: ${status}`));
          }
        });
    } catch (err) {
      fallbackToLocal(err);
    }
  })();

  const timeoutId = window.setTimeout(() => {
    if (!settled && !unsubscribed) {
      fallbackToLocal(new Error('Timeout ao conectar no Supabase'));
    }
  }, CONNECT_TIMEOUT_MS);

  return () => {
    unsubscribed = true;
    window.clearTimeout(timeoutId);
    if (channel) {
      void getSupabase().removeChannel(channel);
    }
    localUnsub?.();
  };
}

export async function saveLideranca(
  input: LiderancaInput,
  existingId?: string,
): Promise<string> {
  const liderancaId = existingId ?? generateId();

  const lideranca: Lideranca = {
    id: liderancaId,
    nome: input.nome.trim(),
    cidade_id: input.cidade_id,
    quantidade_pessoas: input.quantidade_pessoas,
    responsavel: (input.responsavel?.trim() || RESPONSAVEL_PADRAO),
  };

  const visitasInput = input.visitas ?? [];

  if (isSupabaseActive()) {
    const sb = getSupabase();
    const { error } = await sb.from('liderancas').upsert(lideranca);
    if (error) throw error;
    await syncVisitasSupabase(liderancaId, visitasInput);
  } else {
    const idx = localStore.liderancas.findIndex((l) => l.id === liderancaId);
    if (idx >= 0) {
      localStore.liderancas[idx] = lideranca;
    } else {
      localStore.liderancas.push(lideranca);
    }
    syncVisitasLocal(liderancaId, visitasInput);
    saveLocalStore();
  }

  return liderancaId;
}

export async function deleteLideranca(liderancaId: string): Promise<void> {
  if (isSupabaseActive()) {
    const sb = getSupabase();
    // visitas: ON DELETE CASCADE no schema
    const { error } = await sb.from('liderancas').delete().eq('id', liderancaId);
    if (error) throw error;
  } else {
    localStore.liderancas = localStore.liderancas.filter((l) => l.id !== liderancaId);
    localStore.visitas = localStore.visitas.filter((v) => v.lideranca_id !== liderancaId);
    saveLocalStore();
  }
}

export function getStorageMode(): 'supabase' | 'local' {
  return isSupabaseActive() ? 'supabase' : 'local';
}

/** Atualiza visitas da agenda; mantém as já realizadas se saírem da pauta. */
export async function replaceAgendaVisitas(visitas: Visita[]): Promise<void> {
  const ids = new Set(visitas.map((v) => v.id));

  if (isSupabaseActive()) {
    const sb = getSupabase();
    const { data: existing, error: listError } = await sb
      .from('visitas')
      .select('id,data_hora')
      .like('id', `${AGENDA_VISITA_PREFIX}%`);
    if (listError) throw listError;

    const toDelete = idsAgendaParaRemover(existing ?? [], ids);

    if (toDelete.length > 0) {
      const { error: delError } = await sb.from('visitas').delete().in('id', toDelete);
      if (delError) throw delError;
    }

    if (visitas.length > 0) {
      const { error: upsertError } = await sb.from('visitas').upsert(
        visitas.map((v) => ({
          id: v.id,
          lideranca_id: v.lideranca_id,
          data_hora: v.data_hora,
          observacoes: v.observacoes,
        })),
      );
      if (upsertError) throw upsertError;
    }
  } else {
    const toDelete = new Set(idsAgendaParaRemover(localStore.visitas, ids));
    localStore.visitas = [
      ...localStore.visitas.filter((v) => !ids.has(v.id) && !toDelete.has(v.id)),
      ...visitas,
    ];
    saveLocalStore();
  }
}
