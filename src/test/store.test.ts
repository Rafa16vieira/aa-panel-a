import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { formatVisita } from '../hooks/useRealtimeData';

describe('Store — gestão de lideranças (N por cidade, N visitas)', () => {
  beforeEach(() => {
    useAppStore.setState({
      cidades: [
        { id: '2704302', nome: 'Maceió' },
        { id: '2700300', nome: 'Arapiraca' },
      ],
      liderancas: [],
      visitas: [],
      isLoading: false,
    });
  });

  it('retorna sem_lideranca para cidade sem cadastro', () => {
    expect(useAppStore.getState().getCidadeStatus('2704302')).toBe('sem_lideranca');
  });

  it('retorna com_lideranca quando há liderança sem visita agendada', () => {
    useAppStore.setState({
      liderancas: [{ id: 'l1', nome: 'João', cidade_id: '2704302', quantidade_pessoas: 10, responsavel: 'NTR' }],
      visitas: [{ id: 'v1', lideranca_id: 'l1', data_hora: null, observacoes: '' }],
    });
    expect(useAppStore.getState().getCidadeStatus('2704302')).toBe('com_lideranca');
  });

  it('retorna visita_agendada quando há visita com data ainda não vencida', () => {
    useAppStore.setState({
      liderancas: [
        { id: 'l1', nome: 'João', cidade_id: '2704302', quantidade_pessoas: 10, responsavel: 'NTR' },
        { id: 'l2', nome: 'Ana', cidade_id: '2704302', quantidade_pessoas: 4, responsavel: 'NTR' },
      ],
      visitas: [
        { id: 'v1', lideranca_id: 'l1', data_hora: null, observacoes: '' },
        { id: 'v2', lideranca_id: 'l2', data_hora: '2099-08-10T14:00:00', observacoes: '' },
        { id: 'v3', lideranca_id: 'l2', data_hora: null, observacoes: 'aberta' },
      ],
    });
    expect(useAppStore.getState().getCidadeStatus('2704302')).toBe('visita_agendada');
  });

  it('não marca visita_agendada só com visitas já realizadas', () => {
    useAppStore.setState({
      liderancas: [{ id: 'l1', nome: 'João', cidade_id: '2704302', quantidade_pessoas: 10, responsavel: 'NTR' }],
      visitas: [{ id: 'v1', lideranca_id: 'l1', data_hora: '2020-01-01T10:00:00', observacoes: '' }],
    });
    expect(useAppStore.getState().getCidadeStatus('2704302')).toBe('com_lideranca');
  });

  it('marca visita_recente (cidade já visitada) a partir de 16/08/2026', () => {
    useAppStore.setState({
      liderancas: [{ id: 'l1', nome: 'João', cidade_id: '2704302', quantidade_pessoas: 10, responsavel: 'NTR' }],
      visitas: [{ id: 'v1', lideranca_id: 'l1', data_hora: '2026-08-17T14:00:00', observacoes: '' }],
    });
    expect(useAppStore.getState().getCidadeStatus('2704302')).toBe('visita_recente');
  });

  it('ignora visita realizada antes de 16/08/2026 no status', () => {
    useAppStore.setState({
      liderancas: [{ id: 'l1', nome: 'João', cidade_id: '2704302', quantidade_pessoas: 10, responsavel: 'NTR' }],
      visitas: [{ id: 'v1', lideranca_id: 'l1', data_hora: '2026-08-10T10:00:00', observacoes: '' }],
    });
    expect(useAppStore.getState().getCidadeStatus('2704302')).toBe('com_lideranca');
  });

  it('não marca visita_agendada se a cidade já foi visitada no período', () => {
    useAppStore.setState({
      liderancas: [{ id: 'l1', nome: 'João', cidade_id: '2704302', quantidade_pessoas: 10, responsavel: 'NTR' }],
      visitas: [
        { id: 'v1', lideranca_id: 'l1', data_hora: '2026-08-17T10:00:00', observacoes: '' },
        { id: 'v2', lideranca_id: 'l1', data_hora: '2099-09-01T14:00:00', observacoes: '' },
      ],
    });
    expect(useAppStore.getState().getCidadeStatus('2704302')).toBe('visita_recente');
  });

  it('lista múltiplas lideranças e visitas por cidade', () => {
    useAppStore.setState({
      liderancas: [
        { id: 'l1', nome: 'Maria', cidade_id: '2700300', quantidade_pessoas: 5, responsavel: 'NTR' },
        { id: 'l2', nome: 'Pedro', cidade_id: '2700300', quantidade_pessoas: 8, responsavel: 'Equipe A' },
      ],
      visitas: [
        { id: 'v1', lideranca_id: 'l1', data_hora: '2026-08-01T10:00:00', observacoes: '' },
        { id: 'v2', lideranca_id: 'l1', data_hora: null, observacoes: 'retorno' },
        { id: 'v3', lideranca_id: 'l2', data_hora: null, observacoes: '' },
      ],
    });

    const dados = useAppStore.getState().getCidadeComDados('2700300');
    expect(dados?.liderancas).toHaveLength(2);
    expect(dados?.liderancas[1].responsavel).toBe('Equipe A');
    expect(dados?.visitas).toHaveLength(3);
    expect(useAppStore.getState().getVisitasByLideranca('l1')).toHaveLength(2);
  });

  it('limpa selectedCidadeId ao fechar o painel de detalhes (closePanel)', () => {
    useAppStore.getState().openPanel('2704302');
    expect(useAppStore.getState().selectedCidadeId).toBe('2704302');
    expect(useAppStore.getState().isPanelOpen).toBe(true);

    useAppStore.getState().closePanel();
    expect(useAppStore.getState().selectedCidadeId).toBeNull();
    expect(useAppStore.getState().isPanelOpen).toBe(false);
  });
});

describe('formatVisita', () => {
  it('exibe texto padrão quando não há agendamento', () => {
    expect(formatVisita(null)).toBe('Não há agendamento');
    expect(formatVisita(undefined)).toBe('Não há agendamento');
  });

  it('formata data quando há agendamento', () => {
    const result = formatVisita('2026-08-10T14:00:00');
    expect(result).not.toBe('Não há agendamento');
  });
});
