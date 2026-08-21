import { describe, expect, it } from 'vitest';
import {
  filtrarVisitasAgendaNaoBloqueadas,
  idsAgendaParaRemover,
  matchLideranca,
  montarVisitasAgenda,
  parseAgendaCampanha,
  splitNomesLideranca,
} from '../utils/agendaCampanha';

const AGENDA = `
▪️17 de Agosto de 2026 (Segunda-feira)
✔️19:30 h - Reunião no Poço Lider: Davi Honorato Coordenador: Victor Alvim e Gustavo

▪️18 de Agosto de 2026 (Terça-feira)
✔️GRAVAÇÃO PELA MANHÃ
*✔️19:00 h - Reunião com a Luar do Sertão Liderança: Zé Cláudio e Evandro Coordenador: Matheus Acioly

▪️20 de Agosto de 2026 (Quinta-feira)
✔️19:00 h - Reunião em Marechal Liderança: Dr. Luiz Teles Coordenador: Thiago Agra
✔️20:00 h - Reunião em Marechal Liderança: Paulinho Francês Coordenador: Thiago Agra

▪️21 de Agosto de 2026 (Sexta-feira)
✔️19:00 h - Reunião em Satuba Liderança: Islan Brito Coordenador: Cândido

▪️22 de Agosto de 2026 (Sábado)
✔️10:00 h - Adesivaço na SESAU em Maceió
✔️12:00 h - Almoço na Massagueira Líder: Levy. Coordenador: Victor Almeida

▪️24 de Agosto de 2026 (Segunda-feira)
AGENDA BLOQUEADA

▪️26 de Agosto de 2026 (Quarta-feira)
✔️14:00 h - Festival da Cultura no Consolador Liderança: Ana Coordenador: Bernardo

▪️04 de Setembro de 2026 (Sexta-feira)
✔️19:00 h - Reunião em Arapiraca Lideranças: Neurício, Gustavo Brandão e Júnior Bala Coordenador: Victor Alvim
`;

const liderancas = [
  { id: 'l1', nome: 'DAVI HONORATO' },
  { id: 'l2', nome: 'ZÉ CLÁUDIO' },
  { id: 'l3', nome: 'EVANDRO' },
  { id: 'l4', nome: 'LUIZ TELES' },
  { id: 'l5', nome: 'PAULINHO FRANCÊS' },
  { id: 'l6', nome: 'ISLAN BRITO' },
  { id: 'l7', nome: 'LEVY' },
  { id: 'l8', nome: 'ANA PACHECO' },
  { id: 'l9', nome: 'NEURÍCIO' },
  { id: 'l10', nome: 'GUSTAVO BRANDÃO' },
  { id: 'l11', nome: 'JÚNIOR BALA' },
];

describe('agenda campanha', () => {
  it('divide nomes ligados por e e vírgula', () => {
    expect(splitNomesLideranca('Neurício, Gustavo Brandão e Júnior Bala')).toEqual([
      'Neurício',
      'Gustavo Brandão',
      'Júnior Bala',
    ]);
  });

  it('ignora gravação, agenda bloqueada e evento sem liderança', () => {
    const eventos = parseAgendaCampanha(AGENDA);
    expect(eventos.some((e) => /gravação/i.test(e.bruto))).toBe(false);
    expect(eventos.some((e) => /SESAU/i.test(e.bruto))).toBe(false);
    expect(eventos.some((e) => /bloqueada/i.test(e.bruto))).toBe(false);
  });

  it('extrai data, hora, título e lideranças', () => {
    const eventos = parseAgendaCampanha(AGENDA);
    const poco = eventos.find((e) => e.titulo.includes('Poço'));
    expect(poco?.dataHoraIso).toBe('2026-08-17T19:30:00-03:00');
    expect(poco?.nomesLideranca).toEqual(['Davi Honorato']);

    const luar = eventos.find((e) => e.titulo.includes('Luar'));
    expect(luar?.nomesLideranca).toEqual(['Zé Cláudio', 'Evandro']);

    const arapiraca = eventos.find((e) => e.titulo.includes('Arapiraca'));
    expect(arapiraca?.nomesLideranca).toHaveLength(3);
    expect(arapiraca?.dataHoraIso).toBe('2026-09-04T19:00:00-03:00');
  });

  it('casa Dr. Luiz Teles com Luiz Teles e Ana só se for única', () => {
    expect(matchLideranca('Dr. Luiz Teles', liderancas)?.id).toBe('l4');
    expect(matchLideranca('Ana', liderancas)?.id).toBe('l8');

    const ambiguas = [
      ...liderancas,
      { id: 'l12', nome: 'ANA CONSOLADOR' },
    ];
    expect(matchLideranca('Ana', ambiguas)).toBeNull();
    expect(matchLideranca('Ana', ambiguas, 'Festival da Cultura no Consolador')?.id).toBe('l12');
  });

  it('cria uma visita por liderança responsável', async () => {
    const eventos = parseAgendaCampanha(AGENDA);
    const { visitas, semMatch } = await montarVisitasAgenda(eventos, liderancas);
    expect(semMatch).toEqual([]);
    expect(visitas.every((v) => v.id.startsWith('agenda-'))).toBe(true);

    const luar = visitas.filter((v) => v.data_hora?.startsWith('2026-08-18T19:00'));
    expect(luar).toHaveLength(2);
    expect(luar.map((v) => v.lideranca_id).sort()).toEqual(['l2', 'l3']);

    const davi = visitas.find((v) => v.lideranca_id === 'l1');
    expect(davi?.observacoes).toContain('Poço');
  });

  it('só remove da agenda o que ainda não aconteceu', () => {
    const agora = new Date('2026-08-20T12:00:00-03:00');
    const existentes = [
      { id: 'agenda-passada', data_hora: '2026-08-17T19:30:00-03:00' },
      { id: 'agenda-futura', data_hora: '2026-09-04T19:00:00-03:00' },
      { id: 'manual-1', data_hora: '2026-09-10T10:00:00-03:00' },
    ];
    const naPauta = new Set<string>();
    expect(idsAgendaParaRemover(existentes, naPauta, agora)).toEqual(['agenda-futura']);
    expect(idsAgendaParaRemover(existentes, new Set(['agenda-futura']), agora)).toEqual([]);
  });

  it('não inclui visitas bloqueadas após remoção manual', () => {
    const visitas = [
      { id: 'agenda-a', lideranca_id: 'l1' },
      { id: 'agenda-b', lideranca_id: 'l2' },
      { id: 'agenda-c', lideranca_id: 'l3' },
    ];
    expect(filtrarVisitasAgendaNaoBloqueadas(visitas, ['agenda-b']).map((v) => v.id)).toEqual([
      'agenda-a',
      'agenda-c',
    ]);
    expect(filtrarVisitasAgendaNaoBloqueadas(visitas, new Set(['agenda-a', 'agenda-c']))).toEqual([
      { id: 'agenda-b', lideranca_id: 'l2' },
    ]);
  });
});
