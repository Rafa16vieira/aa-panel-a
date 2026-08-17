import type { Lideranca } from '../types';
import { replaceAgendaVisitas } from './dataService';
import {
  AGENDA_DOC_EXPORT_URL,
  montarVisitasAgenda,
  parseAgendaCampanha,
  type AgendaSyncResult,
} from '../utils/agendaCampanha';

const LAST_SYNC_KEY = 'painel-alagoas-agenda-sync-at';
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

export async function baixarAgendaCampanha(): Promise<string> {
  const res = await fetch(AGENDA_DOC_EXPORT_URL);
  if (!res.ok) {
    throw new Error(`Falha ao baixar agenda (${res.status})`);
  }
  return res.text();
}

export async function sincronizarAgendaCampanha(
  liderancas: Pick<Lideranca, 'id' | 'nome'>[],
): Promise<AgendaSyncResult> {
  const texto = await baixarAgendaCampanha();
  const eventos = parseAgendaCampanha(texto);
  const result = await montarVisitasAgenda(eventos, liderancas);
  await replaceAgendaVisitas(result.visitas);
  return result;
}

export async function sincronizarAgendaSeNecessario(
  liderancas: Pick<Lideranca, 'id' | 'nome'>[],
): Promise<void> {
  try {
    const last = Number(localStorage.getItem(LAST_SYNC_KEY) ?? 0);
    if (Number.isFinite(last) && Date.now() - last < SYNC_INTERVAL_MS) {
      return;
    }
    const result = await sincronizarAgendaCampanha(liderancas);
    localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
    if (result.semMatch.length > 0) {
      console.warn('[painel-alagoas] Agenda: lideranças não encontradas', result.semMatch);
    }
  } catch (err) {
    console.warn('[painel-alagoas] Sync da agenda indisponível neste navegador; o job diário cobre o Supabase.', err);
  }
}
