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

/** Visita realizada nos últimos `dias` (padrão 30). */
export function isVisitaNosUltimosDias(
  dataHora: string | null | undefined,
  dias = 30,
  agora: Date = new Date(),
): boolean {
  if (!isVisitaRealizada(dataHora, agora)) return false;
  const data = new Date(dataHora!);
  const limite = new Date(agora.getTime());
  limite.setDate(limite.getDate() - dias);
  return data.getTime() >= limite.getTime();
}
