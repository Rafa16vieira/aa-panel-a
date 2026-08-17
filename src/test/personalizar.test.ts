import { describe, it, expect } from 'vitest';
import { personalizar } from '../theme/personalizar';

describe('Arquivo personalizar', () => {
  it('define todas as cores obrigatórias', () => {
    expect(personalizar.cores.fundo).toBeTruthy();
    expect(personalizar.cores.primaria).toBeTruthy();
    expect(personalizar.cores.municipioComLideranca).toBeTruthy();
    expect(personalizar.cores.municipioVisitaRecente).toBeTruthy();
    expect(personalizar.cores.municipioSemLideranca).toBeTruthy();
    expect(personalizar.cores.heatmapCoberturaMin).toBeTruthy();
    expect(personalizar.cores.heatmapCoberturaMax).toBeTruthy();
    expect(personalizar.cores.heatmapSemLideranca).toBeTruthy();
    expect(personalizar.cores.municipioVisitaAgendada).toBeTruthy();
    expect(personalizar.cores.municipioHover).toBeTruthy();
  });

  it('define caminhos de favicon e logo', () => {
    expect(personalizar.favicon).toMatch(/^\//);
    expect(personalizar.logo).toMatch(/^\//);
  });
});
