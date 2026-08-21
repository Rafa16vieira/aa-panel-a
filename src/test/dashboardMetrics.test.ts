import { describe, it, expect } from 'vitest';
import type { Cidade, Lideranca, Visita } from '../types';
import {
  pessoasPorCidade,
  liderancasPorCidade,
  visitasEmAbertoPorCidade,
  cidadesMaisVisitadas,
  contagemCidadesComSemLideranca,
  buildRelatorioResumo,
  liderancasPorPessoasRelatorio,
} from '../utils/dashboardMetrics';
import {
  isVisitaEmAberto,
  isVisitaRealizada,
  isVisitaAgendada,
  isVisitaContabilizada,
  isVisitaRealizadaContabilizada,
  isVisitaEmAbertoContabilizada,
} from '../utils/visitas';

const agora = new Date('2026-08-21T12:00:00');

const cidades: Cidade[] = [
  { id: 'c1', nome: 'Maceió' },
  { id: 'c2', nome: 'Arapiraca' },
  { id: 'c3', nome: 'Palmeira' },
];

const liderancas: Lideranca[] = [
  { id: 'l1', nome: 'A', cidade_id: 'c1', quantidade_pessoas: 10, responsavel: 'NTR' },
  { id: 'l2', nome: 'B', cidade_id: 'c1', quantidade_pessoas: 5, responsavel: 'NTR' },
  { id: 'l3', nome: 'C', cidade_id: 'c2', quantidade_pessoas: 20, responsavel: 'NTR' },
  { id: 'l4', nome: 'D', cidade_id: 'c3', quantidade_pessoas: 3, responsavel: 'NTR' },
];

/** v1 null aberto; v2 passado (≥16/08); v3 null aberto; v4 futuro aberto */
const visitas: Visita[] = [
  { id: 'v1', lideranca_id: 'l1', data_hora: null, observacoes: '' },
  { id: 'v2', lideranca_id: 'l2', data_hora: '2026-08-17T14:00:00', observacoes: '' },
  { id: 'v3', lideranca_id: 'l3', data_hora: null, observacoes: '' },
  { id: 'v4', lideranca_id: 'l4', data_hora: '2026-08-25T10:00:00', observacoes: '' },
];

describe('visitas status helpers', () => {
  it('classifica aberto / realizado / agendado', () => {
    expect(isVisitaEmAberto(null, agora)).toBe(true);
    expect(isVisitaEmAberto('2026-08-25T10:00:00', agora)).toBe(true);
    expect(isVisitaEmAberto('2026-08-17T10:00:00', agora)).toBe(false);
    expect(isVisitaRealizada('2026-08-17T10:00:00', agora)).toBe(true);
    expect(isVisitaRealizada(null, agora)).toBe(false);
    expect(isVisitaRealizada('2026-08-25T10:00:00', agora)).toBe(false);
    expect(isVisitaAgendada('2026-08-25T10:00:00', agora)).toBe(true);
    expect(isVisitaAgendada(null, agora)).toBe(false);
  });

  it('só contabiliza visitas a partir de 16/08/2026', () => {
    expect(isVisitaContabilizada(null)).toBe(true);
    expect(isVisitaContabilizada('2026-08-16T00:00:00')).toBe(true);
    expect(isVisitaContabilizada('2026-08-15T23:59:59')).toBe(false);
    expect(isVisitaRealizadaContabilizada('2026-08-10T10:00:00', agora)).toBe(false);
    expect(isVisitaRealizadaContabilizada('2026-08-17T10:00:00', agora)).toBe(true);
    expect(isVisitaEmAbertoContabilizada('2026-08-10T10:00:00', agora)).toBe(false);
    expect(isVisitaEmAbertoContabilizada(null, agora)).toBe(true);
  });
});

describe('dashboardMetrics', () => {
  it('pessoasPorCidade soma quantidade_pessoas e ordena desc', () => {
    const result = pessoasPorCidade({ cidades, liderancas });
    expect(result.map((r) => r.cidadeId)).toEqual(['c2', 'c1', 'c3']);
    expect(result[0]).toMatchObject({ nome: 'Arapiraca', valor: 20 });
    expect(result[1]).toMatchObject({ nome: 'Maceió', valor: 15 });
  });

  it('liderancasPorCidade conta lideranças por cidade', () => {
    const result = liderancasPorCidade({ cidades, liderancas });
    expect(result.find((r) => r.cidadeId === 'c1')?.valor).toBe(2);
    expect(result.find((r) => r.cidadeId === 'c2')?.valor).toBe(1);
  });

  it('visitasEmAbertoPorCidade inclui null e datas futuras, não passadas', () => {
    const result = visitasEmAbertoPorCidade({ cidades, liderancas, visitas }, 15, agora);
    expect(result.find((r) => r.cidadeId === 'c1')?.valor).toBe(1); // só null
    expect(result.find((r) => r.cidadeId === 'c2')?.valor).toBe(1);
    expect(result.find((r) => r.cidadeId === 'c3')?.valor).toBe(1); // futuro
  });

  it('cidadesMaisVisitadas só conta visitas já realizadas no período', () => {
    const result = cidadesMaisVisitadas({ cidades, liderancas, visitas }, 15, agora);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ cidadeId: 'c1', valor: 1 });
  });

  it('ignora visitas antes de 16/08 e em aberto em cidadesMaisVisitadas', () => {
    const extraVisitas = [
      ...visitas,
      { id: 'v5', lideranca_id: 'l1', data_hora: '2026-09-01T09:00:00', observacoes: '' },
      { id: 'v6', lideranca_id: 'l1', data_hora: '2026-08-10T09:00:00', observacoes: '' },
      { id: 'v7', lideranca_id: 'l1', data_hora: '2026-08-18T09:00:00', observacoes: '' },
    ];
    const result = cidadesMaisVisitadas(
      { cidades, liderancas, visitas: extraVisitas },
      15,
      agora,
    );
    // c1: v2 + v7 = 2; v6 antes do corte e v5 futuro não contam
    expect(result.find((r) => r.cidadeId === 'c1')?.valor).toBe(2);
  });

  it('contagemCidadesComSemLideranca conta municípios, não registros', () => {
    const { comLideranca, semLideranca } = contagemCidadesComSemLideranca({
      cidades,
      liderancas,
    });
    expect(comLideranca).toBe(3);
    expect(semLideranca).toBe(0);

    const comUmaCidadeExtra = contagemCidadesComSemLideranca({
      cidades: [...cidades, { id: 'c4', nome: 'Penedo' }],
      liderancas,
    });
    expect(comUmaCidadeExtra.comLideranca).toBe(3);
    expect(comUmaCidadeExtra.semLideranca).toBe(1);
  });

  it('respeita Top N e ignora valor 0', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      id: `cx${i}`,
      nome: `Cidade ${i}`,
    }));
    const lids = many.map((c, i) => ({
      id: `lx${i}`,
      nome: `L${i}`,
      cidade_id: c.id,
      quantidade_pessoas: 20 - i,
      responsavel: 'NTR',
    }));
    const result = pessoasPorCidade({ cidades: many, liderancas: lids }, 5);
    expect(result).toHaveLength(5);
    expect(result[0].valor).toBe(20);
    expect(result[4].valor).toBe(16);
  });

  it('buildRelatorioResumo agrega totais e tabelas completas', () => {
    const rel = buildRelatorioResumo({ cidades, liderancas, visitas }, agora);
    expect(rel.totalMunicipios).toBe(3);
    expect(rel.totalLiderancas).toBe(4);
    expect(rel.totalPessoas).toBe(38);
    expect(rel.visitasRealizadas).toBe(1);
    expect(rel.visitasAbertas).toBe(3);
    expect(rel.cidadesComLideranca).toBe(3);
    expect(rel.pessoasPorCidade).toHaveLength(3);
    expect(rel.visitasRealizadasPorCidade).toHaveLength(1);
  });

  it('liderancasPorPessoasRelatorio agrega Marechal Deodoro e ordena por pessoas', () => {
    const cidadesComMarechal: Cidade[] = [
      ...cidades,
      { id: 'c4', nome: 'Marechal Deodoro' },
    ];
    const lids: Lideranca[] = [
      { id: 'l1', nome: 'A', cidade_id: 'c1', quantidade_pessoas: 10, responsavel: 'NTR' },
      { id: 'l5', nome: 'M1', cidade_id: 'c4', quantidade_pessoas: 30, responsavel: 'NTR' },
      { id: 'l6', nome: 'M2', cidade_id: 'c4', quantidade_pessoas: 20, responsavel: 'NTR' },
      { id: 'l3', nome: 'C', cidade_id: 'c2', quantidade_pessoas: 20, responsavel: 'NTR' },
    ];
    const result = liderancasPorPessoasRelatorio({ cidades: cidadesComMarechal, liderancas: lids });
    expect(result.find((r) => r.agregada)).toMatchObject({
      nome: 'Marechal Deodoro',
      valor: 50,
    });
    expect(result.filter((r) => r.nome === 'M1' || r.nome === 'M2')).toHaveLength(0);
    expect(result[0].valor).toBe(50);
    expect(result.map((r) => r.valor)).toEqual([50, 20, 10]);
  });
});
