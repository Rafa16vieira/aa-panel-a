import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { sincronizarAgendaSeNecessario } from '../services/agendaService';

export function useAgendaSync() {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAppStore((s) => s.isLoading);
  const liderancas = useAppStore((s) => s.liderancas);

  useEffect(() => {
    if (!session || isLoading || liderancas.length === 0) return;
    void sincronizarAgendaSeNecessario(liderancas);
  }, [session, isLoading, liderancas]);
}
