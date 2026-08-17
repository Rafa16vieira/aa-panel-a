import type { Lideranca, Visita } from '../types';
import { isVisitaAgendada } from './visitas';

export const AGENDA_VISITA_PREFIX = 'agenda-';

export const AGENDA_DOC_ID = '1-I4OUgSi9dbPdJUxfBrQW0Oq0KAg37PetH4G6lULlFY';

export const AGENDA_DOC_EXPORT_URL =
  `https://docs.google.com/document/d/${AGENDA_DOC_ID}/export?format=txt`;

const MESES: Record<string, number> = {
  janeiro: 1,
  fevereiro: 2,
  marco: 3,
  março: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
};

export interface AgendaEvento {
  dataHoraIso: string;
  titulo: string;
  nomesLideranca: string[];
  bruto: string;
}

export interface AgendaMatch {
  visita: Visita;
  liderancaNome: string;
}

export interface AgendaSyncResult {
  visitas: Visita[];
  semMatch: string[];
}

const LIDER_RE =
  /(?:lideran[cç]as?|l[ií]deres?|lider)\s*:\s*(.+?)(?=\s*coordenad|$)/i;

export function normalizarNome(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTituloPessoa(nome: string): string {
  return nome
    .replace(/^(dr\.?a?|dra\.?|professor[a]?|vereador[a]?|deputad[oa])\s+/i, '')
    .trim();
}

export function splitNomesLideranca(raw: string): string[] {
  return raw
    .split(/\s*,\s*|\s+e\s+/i)
    .map((parte) => parte.replace(/[.\s]+$/g, '').trim())
    .filter((parte) => parte.length > 1);
}

function mesNumero(nome: string): number {
  const key = nome
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
  return MESES[key] ?? MESES[nome.toLowerCase()] ?? 0;
}

function isoMaceio(ano: number, mes: number, dia: number, hora: number, minuto: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${ano}-${pad(mes)}-${pad(dia)}T${pad(hora)}:${pad(minuto)}:00-03:00`;
}

function extrairLideranca(linha: string): string | null {
  const match = linha.match(LIDER_RE);
  const valor = match?.[1]?.trim();
  if (!valor) return null;
  return valor.replace(/[.\s]+$/g, '').trim();
}

function extrairTitulo(linha: string): string {
  return linha
    .replace(/✔️/g, '')
    .replace(/^[*\s]+/, '')
    .replace(/^\d{1,2}:\d{2}\s*h(?:rs?)?\s*-?\s*/i, '')
    .replace(/(?:lideran[cç]as?|l[ií]deres?|lider)\s*:.*/i, '')
    .replace(/coordenad.*/i, '')
    .replace(/[.\-\s]+$/g, '')
    .trim();
}

function deveIgnorar(linha: string): boolean {
  return /agenda bloqueada|grava[cç][aã]o|dia da vit[oó]ria/i.test(linha);
}

export function parseAgendaCampanha(texto: string): AgendaEvento[] {
  const linhas = texto.replace(/^\uFEFF/, '').split(/\r?\n/);
  let ano = 0;
  let mes = 0;
  let dia = 0;
  const eventos: AgendaEvento[] = [];

  for (const bruta of linhas) {
    const linha = bruta.replace(/^[*\s]+/, '').trim();
    if (!linha) continue;

    const diaMatch = linha.match(
      /^▪️\s*(\d{1,2})\s+de\s+(\p{L}+)\s+de\s+(\d{4})/u,
    );
    if (diaMatch) {
      dia = Number(diaMatch[1]);
      mes = mesNumero(diaMatch[2]);
      ano = Number(diaMatch[3]);
      continue;
    }

    if (!linha.includes('✔️') || deveIgnorar(linha) || !ano || !mes || !dia) {
      continue;
    }

    const liderRaw = extrairLideranca(linha);
    if (!liderRaw) continue;

    const nomes = splitNomesLideranca(liderRaw);
    if (nomes.length === 0) continue;

    const horaMatch = linha.match(/✔️\s*(\d{1,2}):(\d{2})\s*h/u);
    const hora = horaMatch ? Number(horaMatch[1]) : 9;
    const minuto = horaMatch ? Number(horaMatch[2]) : 0;
    const titulo = extrairTitulo(linha);

    eventos.push({
      dataHoraIso: isoMaceio(ano, mes, dia, hora, minuto),
      titulo,
      nomesLideranca: nomes,
      bruto: linha,
    });
  }

  return eventos;
}

export function matchLideranca(
  nomeAgenda: string,
  liderancas: Pick<Lideranca, 'id' | 'nome'>[],
  contexto = '',
): Pick<Lideranca, 'id' | 'nome'> | null {
  const query = normalizarNome(stripTituloPessoa(nomeAgenda));
  if (!query) return null;

  const exact = liderancas.filter((l) => normalizarNome(l.nome) === query);
  if (exact.length === 1) return exact[0];

  const prefixo = liderancas.filter((l) => {
    const n = normalizarNome(l.nome);
    return n.startsWith(query) || query.startsWith(n);
  });
  if (prefixo.length === 1) return prefixo[0];
  const peloContexto = desambiguarPorContexto(prefixo, contexto);
  if (peloContexto) return peloContexto;

  const contem = liderancas.filter((l) => {
    const n = normalizarNome(l.nome);
    return n.includes(query) || query.includes(n);
  });
  if (contem.length === 1) return contem[0];
  return desambiguarPorContexto(contem, contexto);
}

function desambiguarPorContexto(
  candidatos: Pick<Lideranca, 'id' | 'nome'>[],
  contexto: string,
): Pick<Lideranca, 'id' | 'nome'> | null {
  if (candidatos.length < 2 || !contexto) return null;
  const ctx = normalizarNome(contexto);
  const hits = candidatos.filter((l) => {
    const partes = normalizarNome(l.nome).split(' ').filter((p) => p.length > 3);
    return partes.some((p) => ctx.includes(p));
  });
  return hits.length === 1 ? hits[0] : null;
}

async function hashAgendaId(chave: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(chave));
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${AGENDA_VISITA_PREFIX}${hex.slice(0, 32)}`;
}

export async function montarVisitasAgenda(
  eventos: AgendaEvento[],
  liderancas: Pick<Lideranca, 'id' | 'nome'>[],
): Promise<AgendaSyncResult> {
  const visitas: Visita[] = [];
  const semMatch: string[] = [];
  const vistos = new Set<string>();

  for (const evento of eventos) {
    for (const nome of evento.nomesLideranca) {
      const lideranca = matchLideranca(nome, liderancas, evento.titulo);
      if (!lideranca) {
        semMatch.push(`${nome} (${evento.titulo || evento.bruto})`);
        continue;
      }

      const id = await hashAgendaId(
        `${evento.dataHoraIso}|${lideranca.id}|${evento.titulo}`,
      );
      if (vistos.has(id)) continue;
      vistos.add(id);

      visitas.push({
        id,
        lideranca_id: lideranca.id,
        data_hora: evento.dataHoraIso,
        observacoes: evento.titulo || lideranca.nome,
      });
    }
  }

  return { visitas, semMatch };
}

export function isVisitaAgenda(id: string): boolean {
  return id.startsWith(AGENDA_VISITA_PREFIX);
}

/**
 * Compromissos da agenda que saíram da pauta e ainda não aconteceram.
 * Visitas com data já passada permanecem no registro.
 */
export function idsAgendaParaRemover(
  existentes: Array<{ id: string; data_hora: string | null }>,
  idsNaAgenda: Set<string>,
  agora: Date = new Date(),
): string[] {
  return existentes
    .filter(
      (v) =>
        isVisitaAgenda(v.id) &&
        !idsNaAgenda.has(v.id) &&
        isVisitaAgendada(v.data_hora, agora),
    )
    .map((v) => v.id);
}
