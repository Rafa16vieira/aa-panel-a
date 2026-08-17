import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { subscribeData, seedCidades } from '../services/dataService';
import type { Cidade } from '../types';

async function loadCidadesFromGeo(): Promise<Cidade[]> {
  const res = await fetch('/geo/alagoas-municipios.geojson');
  if (!res.ok) {
    throw new Error(`Falha ao carregar GeoJSON (${res.status})`);
  }
  const geo = await res.json();
  return geo.features.map(
    (f: { properties: { id: string; name: string } }) => ({
      id: f.properties.id,
      nome: f.properties.name,
    }),
  );
}

export function useRealtimeData() {
  const setData = useAppStore((s) => s.setData);
  const setLoading = useAppStore((s) => s.setLoading);
  const seededRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    async function init() {
      setLoading(true);
      try {
        const geoCidades = await loadCidadesFromGeo();
        if (cancelled) return;

        // Libera a UI imediatamente; a assinatura atualiza em seguida.
        setData({
          cidades: geoCidades,
          liderancas: [],
          visitas: [],
        });

        unsub = subscribeData((data) => {
          if (cancelled) return;
          const mergedCidades =
            data.cidades.length > 0 ? data.cidades : geoCidades;
          setData({
            cidades: mergedCidades,
            liderancas: data.liderancas,
            visitas: data.visitas,
          });

          if (!seededRef.current && data.cidades.length === 0) {
            seededRef.current = true;
            void seedCidades(geoCidades).catch((err) => {
              console.warn('[painel-alagoas] Falha ao fazer seed de cidades', err);
            });
          }
        });
      } catch (err) {
        console.error('[painel-alagoas] Falha ao inicializar dados', err);
        if (!cancelled) {
          setData({ cidades: [], liderancas: [], visitas: [] });
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [setData, setLoading]);
}

export function formatVisita(dataHora: string | null | undefined): string {
  if (!dataHora) return 'Não há agendamento';
  try {
    return new Date(dataHora).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return 'Não há agendamento';
  }
}
