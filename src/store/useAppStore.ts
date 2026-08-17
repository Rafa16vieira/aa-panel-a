import { create } from 'zustand';
import type { Cidade, Lideranca, Visita, CidadeComDados, CidadeStatus } from '../types';
import { isVisitaAgendada, isVisitaNosUltimosDias } from '../utils/visitas';

interface AppState {
  cidades: Cidade[];
  liderancas: Lideranca[];
  visitas: Visita[];
  selectedCidadeId: string | null;
  hoveredCidadeId: string | null;
  isPanelOpen: boolean;
  isLoading: boolean;

  setData: (data: { cidades: Cidade[]; liderancas: Lideranca[]; visitas: Visita[] }) => void;
  setLoading: (loading: boolean) => void;
  selectCidade: (id: string | null) => void;
  hoverCidade: (id: string | null) => void;
  openPanel: (cidadeId: string) => void;
  closePanel: () => void;

  getCidadeComDados: (cidadeId: string) => CidadeComDados | undefined;
  getCidadeStatus: (cidadeId: string) => CidadeStatus;
  getLiderancasByCidade: (cidadeId: string) => Lideranca[];
  getVisitasByLideranca: (liderancaId: string) => Visita[];
}

export const useAppStore = create<AppState>((set, get) => ({
  cidades: [],
  liderancas: [],
  visitas: [],
  selectedCidadeId: null,
  hoveredCidadeId: null,
  isPanelOpen: false,
  isLoading: true,

  setData: (data) => set({ ...data, isLoading: false }),

  setLoading: (loading) => set({ isLoading: loading }),

  selectCidade: (id) => set({ selectedCidadeId: id }),

  hoverCidade: (id) => set({ hoveredCidadeId: id }),

  openPanel: (cidadeId) => set({ selectedCidadeId: cidadeId, isPanelOpen: true }),

  closePanel: () => set({ isPanelOpen: false, selectedCidadeId: null }),

  getLiderancasByCidade: (cidadeId) =>
    get().liderancas.filter((l) => l.cidade_id === cidadeId),

  getVisitasByLideranca: (liderancaId) =>
    get().visitas.filter((v) => v.lideranca_id === liderancaId),

  getCidadeComDados: (cidadeId) => {
    const cidade = get().cidades.find((c) => c.id === cidadeId);
    if (!cidade) return undefined;
    const liderancas = get().getLiderancasByCidade(cidadeId);
    const liderancaIds = new Set(liderancas.map((l) => l.id));
    const visitas = get().visitas.filter((v) => liderancaIds.has(v.lideranca_id));
    return { ...cidade, liderancas, visitas };
  },

  getCidadeStatus: (cidadeId) => {
    const liderancas = get().getLiderancasByCidade(cidadeId);
    if (liderancas.length === 0) return 'sem_lideranca';
    const liderancaIds = new Set(liderancas.map((l) => l.id));
    const visitasCidade = get().visitas.filter((v) => liderancaIds.has(v.lideranca_id));

    if (visitasCidade.some((v) => isVisitaNosUltimosDias(v.data_hora))) {
      return 'visita_recente';
    }
    if (visitasCidade.some((v) => isVisitaAgendada(v.data_hora))) {
      return 'visita_agendada';
    }
    return 'com_lideranca';
  },
}));
