import { describe, it, expect } from 'vitest';
import {
  taxaCobertura,
  lerpHex,
  corCoberturaHeatmap,
  formatTaxaPercent,
} from '../utils/cobertura';
import { personalizar } from '../theme/personalizar';

describe('cobertura heatmap', () => {
  it('taxaCobertura = pessoas / eleitorado', () => {
    expect(taxaCobertura(100, 1000)).toBeCloseTo(0.1);
    expect(taxaCobertura(0, 1000)).toBe(0);
    expect(taxaCobertura(50, 0)).toBe(0);
  });

  it('formatTaxaPercent usa vírgula decimal', () => {
    expect(formatTaxaPercent(0.1234)).toBe('12,34%');
  });

  it('lerpHex no 0% e 100%', () => {
    expect(lerpHex('#FFFFFF', '#07361b', 0).toLowerCase()).toBe('#ffffff');
    expect(lerpHex('#FFFFFF', '#07361b', 1).toLowerCase()).toBe('#07361b');
  });

  it('sem liderança usa a cor do mapa de status; com liderança a menor taxa já é verde visível', () => {
    expect(corCoberturaHeatmap(false, 0.5, 0.2)).toBe(personalizar.cores.municipioSemLideranca);
    expect(corCoberturaHeatmap(true, 0, 0.2).toLowerCase()).toBe(
      personalizar.cores.heatmapCoberturaMin.toLowerCase(),
    );
    expect(corCoberturaHeatmap(true, 0, 0.2).toLowerCase()).not.toBe(
      personalizar.cores.municipioSemLideranca.toLowerCase(),
    );
    expect(corCoberturaHeatmap(true, 0.2, 0.2).toLowerCase()).toBe(
      personalizar.cores.heatmapCoberturaMax.toLowerCase(),
    );
  });

  it('escala a cor pela maior taxa do mapa, não por 100%', () => {
    const metade = corCoberturaHeatmap(true, 0.1, 0.2);
    const noMaximo = corCoberturaHeatmap(true, 0.2, 0.2);
    const absolutoCem = corCoberturaHeatmap(true, 1, 1);
    expect(metade.toLowerCase()).not.toBe(personalizar.cores.heatmapCoberturaMin.toLowerCase());
    expect(metade.toLowerCase()).not.toBe(personalizar.cores.heatmapCoberturaMax.toLowerCase());
    expect(noMaximo.toLowerCase()).toBe(personalizar.cores.heatmapCoberturaMax.toLowerCase());
    expect(absolutoCem.toLowerCase()).toBe(personalizar.cores.heatmapCoberturaMax.toLowerCase());
  });
});
