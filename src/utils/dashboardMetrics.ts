import type { Cidade, Lideranca, Visita } from '../types';
import { isVisitaEmAberto, isVisitaRealizada } from './visitas';

export interface CityMetric {
  cidadeId: string;
  nome: string;
  valor: number;
}

export const DASHBOARD_TOP_N = 15;

interface MetricsInput {
  cidades: Cidade[];
  liderancas: Lideranca[];
  visitas: Visita[];
}

function cidadeNomeMap(cidades: Cidade[]): Map<string, string> {
  return new Map(cidades.map((c) => [c.id, c.nome]));
}

function liderancaCidadeMap(liderancas: Lideranca[]): Map<string, string> {
  return new Map(liderancas.map((l) => [l.id, l.cidade_id]));
}

function toTopMetrics(
  totals: Map<string, number>,
  nomes: Map<string, string>,
  topN: number,
): CityMetric[] {
  return Array.from(totals.entries())
    .filter(([, valor]) => valor > 0)
    .map(([cidadeId, valor]) => ({
      cidadeId,
      nome: nomes.get(cidadeId) ?? 'Cidade desconhecida',
      valor,
    }))
    .sort((a, b) => b.valor - a.valor || a.nome.localeCompare(b.nome, 'pt-BR'))
    .slice(0, topN);
}

/** Contagem de municípios com/sem ao menos uma liderança (não o total de registros). */
export function contagemCidadesComSemLideranca({
  cidades,
  liderancas,
}: Pick<MetricsInput, 'cidades' | 'liderancas'>): {
  comLideranca: number;
  semLideranca: number;
} {
  const cidadesComLideranca = new Set(liderancas.map((l) => l.cidade_id));
  const comLideranca = cidades.filter((c) => cidadesComLideranca.has(c.id)).length;
  return {
    comLideranca,
    semLideranca: Math.max(0, cidades.length - comLideranca),
  };
}

/** Soma de quantidade_pessoas das lideranças por cidade. */
export function pessoasPorCidade(
  { cidades, liderancas }: Pick<MetricsInput, 'cidades' | 'liderancas'>,
  topN = DASHBOARD_TOP_N,
): CityMetric[] {
  const nomes = cidadeNomeMap(cidades);
  const totals = new Map<string, number>();

  for (const l of liderancas) {
    totals.set(l.cidade_id, (totals.get(l.cidade_id) ?? 0) + l.quantidade_pessoas);
  }

  return toTopMetrics(totals, nomes, topN);
}

/** Contagem de lideranças por cidade. */
export function liderancasPorCidade(
  { cidades, liderancas }: Pick<MetricsInput, 'cidades' | 'liderancas'>,
  topN = DASHBOARD_TOP_N,
): CityMetric[] {
  const nomes = cidadeNomeMap(cidades);
  const totals = new Map<string, number>();

  for (const l of liderancas) {
    totals.set(l.cidade_id, (totals.get(l.cidade_id) ?? 0) + 1);
  }

  return toTopMetrics(totals, nomes, topN);
}

/**
 * Visitas em aberto por cidade: sem data, ou com data ainda não anterior a agora.
 */
export function visitasEmAbertoPorCidade(
  { cidades, liderancas, visitas }: MetricsInput,
  topN = DASHBOARD_TOP_N,
  agora: Date = new Date(),
): CityMetric[] {
  const nomes = cidadeNomeMap(cidades);
  const liderancaCidade = liderancaCidadeMap(liderancas);
  const totals = new Map<string, number>();

  for (const v of visitas) {
    if (!isVisitaEmAberto(v.data_hora, agora)) continue;
    const cidadeId = liderancaCidade.get(v.lideranca_id);
    if (!cidadeId) continue;
    totals.set(cidadeId, (totals.get(cidadeId) ?? 0) + 1);
  }

  return toTopMetrics(totals, nomes, topN);
}

/**
 * Cidades mais visitadas: só visitas realizadas (data já anterior a agora).
 * Não inclui visitas em aberto.
 */
export function cidadesMaisVisitadas(
  { cidades, liderancas, visitas }: MetricsInput,
  topN = DASHBOARD_TOP_N,
  agora: Date = new Date(),
): CityMetric[] {
  const nomes = cidadeNomeMap(cidades);
  const liderancaCidade = liderancaCidadeMap(liderancas);
  const totals = new Map<string, number>();

  for (const v of visitas) {
    if (!isVisitaRealizada(v.data_hora, agora)) continue;
    const cidadeId = liderancaCidade.get(v.lideranca_id);
    if (!cidadeId) continue;
    totals.set(cidadeId, (totals.get(cidadeId) ?? 0) + 1);
  }

  return toTopMetrics(totals, nomes, topN);
}

export const RELATORIO_TOP_N = 999;

export const RELATORIO_MARECHAL_DEODORO = 'Marechal Deodoro';

export interface LiderancaRelatorioRow {
  key: string;
  nome: string;
  valor: number;
  /** Linha agregada do município (ex.: Marechal Deodoro). */
  agregada: boolean;
}

function normalizeNomeCidade(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

function isMarechalDeodoro(nomeCidade: string): boolean {
  const n = normalizeNomeCidade(nomeCidade);
  return n.includes('marechal') && n.includes('deodoro');
}

/** Lideranças ordenadas por pessoas; Marechal Deodoro vira uma linha com total absoluto. */
export function liderancasPorPessoasRelatorio({
  cidades,
  liderancas,
}: Pick<MetricsInput, 'cidades' | 'liderancas'>): LiderancaRelatorioRow[] {
  const marechalCidade = cidades.find((c) => isMarechalDeodoro(c.nome));

  const rows: LiderancaRelatorioRow[] = [];
  let marechalTotal = 0;
  let marechalLiderancas = 0;

  for (const l of liderancas) {
    if (marechalCidade && l.cidade_id === marechalCidade.id) {
      marechalTotal += l.quantidade_pessoas;
      marechalLiderancas += 1;
      continue;
    }
    rows.push({
      key: l.id,
      nome: l.nome,
      valor: l.quantidade_pessoas,
      agregada: false,
    });
  }

  if (marechalCidade && marechalLiderancas > 0) {
    rows.push({
      key: `cidade-${marechalCidade.id}`,
      nome: marechalCidade.nome,
      valor: marechalTotal,
      agregada: true,
    });
  }

  return rows.sort(
    (a, b) => b.valor - a.valor || a.nome.localeCompare(b.nome, 'pt-BR'),
  );
}

export interface RelatorioResumo {
  geradoEm: string;
  totalMunicipios: number;
  totalLiderancas: number;
  totalPessoas: number;
  visitasRealizadas: number;
  visitasAbertas: number;
  cidadesComLideranca: number;
  cidadesSemLideranca: number;
  pessoasPorCidade: CityMetric[];
  liderancasPorCidade: CityMetric[];
  visitasAbertasPorCidade: CityMetric[];
  visitasRealizadasPorCidade: CityMetric[];
  liderancasPorPessoas: LiderancaRelatorioRow[];
}

/** Snapshot completo para tela/PDF de relatório (todas as cidades com dado). */
export function buildRelatorioResumo(input: MetricsInput, agora: Date = new Date()): RelatorioResumo {
  const { comLideranca, semLideranca } = contagemCidadesComSemLideranca(input);
  const visitasRealizadas = input.visitas.filter((v) =>
    isVisitaRealizada(v.data_hora, agora),
  ).length;
  const visitasAbertas = input.visitas.filter((v) =>
    isVisitaEmAberto(v.data_hora, agora),
  ).length;

  return {
    geradoEm: agora.toISOString(),
    totalMunicipios: input.cidades.length,
    totalLiderancas: input.liderancas.length,
    totalPessoas: input.liderancas.reduce((acc, l) => acc + l.quantidade_pessoas, 0),
    visitasRealizadas,
    visitasAbertas,
    cidadesComLideranca: comLideranca,
    cidadesSemLideranca: semLideranca,
    pessoasPorCidade: pessoasPorCidade(input, RELATORIO_TOP_N),
    liderancasPorCidade: liderancasPorCidade(input, RELATORIO_TOP_N),
    visitasAbertasPorCidade: visitasEmAbertoPorCidade(input, RELATORIO_TOP_N, agora),
    visitasRealizadasPorCidade: cidadesMaisVisitadas(input, RELATORIO_TOP_N, agora),
    liderancasPorPessoas: liderancasPorPessoasRelatorio(input),
  };
}
