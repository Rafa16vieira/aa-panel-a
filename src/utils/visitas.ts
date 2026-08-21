/**
 * Visitas do painel: só contam a partir desta data (inclusive).
 * Datas anteriores são ignoradas em mapa, KPIs e relatório.
 */
export const VISITAS_DATA_MINIMA = '2026-08-16';

function parseDataMinima(dataMinima: string): Date {
  return new Date(`${dataMinima}T00:00:00`);
}

/**
 * Visita contabilizada no painel: sem data (em aberto) ou com data ≥ 16/08/2026.
 */
export function isVisitaContabilizada(
  dataHora: string | null | undefined,
  dataMinima = VISITAS_DATA_MINIMA,
): boolean {
  if (!dataHora) return true;
  const data = new Date(dataHora);
  if (Number.isNaN(data.getTime())) return true;
  return data.getTime() >= parseDataMinima(dataMinima).getTime();
}

/**
 * Visita em aberto: sem data, ou com data ainda não anterior ao momento atual.
 * Visita realizada: data preenchida e já passou (anterior ao momento atual).
 */

export function isVisitaEmAberto(
  dataHora: string | null | undefined,
  agora: Date = new Date(),
): boolean {
  if (!dataHora) return true;
  const data = new Date(dataHora);
  if (Number.isNaN(data.getTime())) return true;
  return data.getTime() >= agora.getTime();
}

export function isVisitaRealizada(
  dataHora: string | null | undefined,
  agora: Date = new Date(),
): boolean {
  if (!dataHora) return false;
  const data = new Date(dataHora);
  if (Number.isNaN(data.getTime())) return false;
  return data.getTime() < agora.getTime();
}

/** Visita com data futura/hoje (ainda em aberto e com agendamento). */
export function isVisitaAgendada(
  dataHora: string | null | undefined,
  agora: Date = new Date(),
): boolean {
  return Boolean(dataHora) && isVisitaEmAberto(dataHora, agora);
}

/** Realizada e dentro do período do painel (≥ 16/08/2026). */
export function isVisitaRealizadaContabilizada(
  dataHora: string | null | undefined,
  agora: Date = new Date(),
  dataMinima = VISITAS_DATA_MINIMA,
): boolean {
  return isVisitaContabilizada(dataHora, dataMinima) && isVisitaRealizada(dataHora, agora);
}

/** Em aberto e dentro do período (sem data ou data ≥ mínima). */
export function isVisitaEmAbertoContabilizada(
  dataHora: string | null | undefined,
  agora: Date = new Date(),
  dataMinima = VISITAS_DATA_MINIMA,
): boolean {
  return isVisitaContabilizada(dataHora, dataMinima) && isVisitaEmAberto(dataHora, agora);
}

/** Agendada e dentro do período. */
export function isVisitaAgendadaContabilizada(
  dataHora: string | null | undefined,
  agora: Date = new Date(),
  dataMinima = VISITAS_DATA_MINIMA,
): boolean {
  return isVisitaContabilizada(dataHora, dataMinima) && isVisitaAgendada(dataHora, agora);
}
