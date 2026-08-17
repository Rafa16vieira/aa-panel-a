import { personalizar } from '../theme/personalizar';

/** taxa = Σ quantidade_pessoas / eleitorado TSE */
export function taxaCobertura(pessoas: number, eleitorado: number): number {
  if (eleitorado <= 0) return 0;
  return pessoas / eleitorado;
}

export function formatTaxaPercent(taxa: number): string {
  return `${(taxa * 100).toFixed(2).replace('.', ',')}%`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) => Math.round(v).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Interpola entre duas cores hex (t em 0..1). */
export function lerpHex(from: string, to: string, t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  return rgbToHex(
    r1 + (r2 - r1) * clamped,
    g1 + (g2 - g1) * clamped,
    b1 + (b2 - b1) * clamped,
  );
}

/**
 * Intensidade da cor (0..1) relativa à maior taxa do mapa.
 * taxaMax = 0 → tudo em 0 (sem cobertura para comparar).
 */
export function intensidadeRelativa(taxa: number, taxaMax: number): number {
  if (taxaMax <= 0) return 0;
  return Math.min(1, Math.max(0, taxa / taxaMax));
}

/**
 * Cor do heatmap de cobertura:
 * - sem liderança → mesma cor do mapa de status (`municipioSemLideranca`)
 * - com liderança → verde (menor taxa) → verde escuro na maior taxa do mapa
 */
export function corCoberturaHeatmap(
  temLideranca: boolean,
  taxa: number,
  taxaMax = 1,
): string {
  if (!temLideranca) return personalizar.cores.municipioSemLideranca;
  return lerpHex(
    personalizar.cores.heatmapCoberturaMin,
    personalizar.cores.heatmapCoberturaMax,
    intensidadeRelativa(taxa, taxaMax),
  );
}
