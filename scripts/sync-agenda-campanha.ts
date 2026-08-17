import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import {
  AGENDA_DOC_EXPORT_URL,
  AGENDA_VISITA_PREFIX,
  idsAgendaParaRemover,
  montarVisitasAgenda,
  parseAgendaCampanha,
} from '../src/utils/agendaCampanha';

function loadEnv(): void {
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) return;
  try {
    const raw = readFileSync('.env', 'utf8');
    for (const line of raw.split('\n')) {
      if (!line || line.startsWith('#') || !line.includes('=')) continue;
      const i = line.indexOf('=');
      const key = line.slice(0, i).trim();
      const value = line.slice(i + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* CI usa secrets */
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL?.trim();
const key = process.env.VITE_SUPABASE_ANON_KEY?.trim();
if (!url || !key) {
  throw new Error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
}

const sb = createClient(url, key);

const res = await fetch(AGENDA_DOC_EXPORT_URL);
if (!res.ok) {
  throw new Error(`Falha ao baixar agenda (${res.status})`);
}

const texto = await res.text();
const eventos = parseAgendaCampanha(texto);
console.log(`eventos com liderança: ${eventos.length}`);

const { data: liderancas, error: lidError } = await sb
  .from('liderancas')
  .select('id,nome');
if (lidError) throw lidError;

const { visitas, semMatch } = await montarVisitasAgenda(eventos, liderancas ?? []);
console.log(`visitas casadas: ${visitas.length}`);
if (semMatch.length > 0) {
  console.warn('sem match:', semMatch.join(' | '));
}

const { data: existing, error: listError } = await sb
  .from('visitas')
  .select('id,data_hora')
  .like('id', `${AGENDA_VISITA_PREFIX}%`);
if (listError) throw listError;

const ids = new Set(visitas.map((v) => v.id));
const toDelete = idsAgendaParaRemover(existing ?? [], ids);

if (toDelete.length > 0) {
  const { error } = await sb.from('visitas').delete().in('id', toDelete);
  if (error) throw error;
  console.log(`removidas: ${toDelete.length}`);
}

if (visitas.length > 0) {
  const { error } = await sb.from('visitas').upsert(visitas);
  if (error) throw error;
}

console.log('agenda sincronizada');
