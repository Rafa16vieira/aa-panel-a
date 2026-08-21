import { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, GeoJSON, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoJsonObject } from 'geojson';
import { useAppStore } from '../../store/useAppStore';
import { personalizar } from '../../theme/personalizar';
import type { CidadeStatus } from '../../types';
import {
  isVisitaAgendadaContabilizada,
  isVisitaEmAbertoContabilizada,
  isVisitaRealizadaContabilizada,
} from '../../utils/visitas';
import {
  corCoberturaHeatmap,
  formatTaxaPercent,
  taxaCobertura,
} from '../../utils/cobertura';
import 'leaflet/dist/leaflet.css';
import './AlagoasMap.css';

export type MapViewMode = 'status' | 'cobertura';

interface AlagoasMapProps {
  viewMode?: MapViewMode;
}

interface EleitoradoTseFile {
  fonte: string;
  eleitorado_por_municipio: Record<string, number>;
}

function getCorPorStatus(status: CidadeStatus): string {
  switch (status) {
    case 'visita_recente':
      return personalizar.cores.municipioVisitaRecente;
    case 'visita_agendada':
      return personalizar.cores.municipioVisitaAgendada;
    case 'com_lideranca':
      return personalizar.cores.municipioComLideranca;
    default:
      return personalizar.cores.municipioSemLideranca;
  }
}

function MapFitBounds({ geojson }: { geojson: GeoJsonObject }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const layer = L.geoJSON(geojson);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [geojson, map]);

  return null;
}

export function AlagoasMap({ viewMode = 'status' }: AlagoasMapProps) {
  const [geojson, setGeojson] = useState<GeoJsonObject | null>(null);
  const [eleitoradoPorMunicipio, setEleitoradoPorMunicipio] = useState<Record<string, number>>({});
  const liderancas = useAppStore((s) => s.liderancas);
  const visitas = useAppStore((s) => s.visitas);
  const selectedCidadeId = useAppStore((s) => s.selectedCidadeId);
  const hoveredCidadeId = useAppStore((s) => s.hoveredCidadeId);
  const getCidadeStatus = useAppStore((s) => s.getCidadeStatus);
  const getCidadeComDados = useAppStore((s) => s.getCidadeComDados);
  const getLiderancasByCidade = useAppStore((s) => s.getLiderancasByCidade);
  const openPanel = useAppStore((s) => s.openPanel);
  const hoverCidade = useAppStore((s) => s.hoverCidade);

  useEffect(() => {
    fetch('/geo/alagoas-municipios.geojson')
      .then((r) => r.json())
      .then(setGeojson);
  }, []);

  useEffect(() => {
    fetch('/geo/alagoas-eleitorado-tse.json')
      .then((r) => r.json())
      .then((data: EleitoradoTseFile) => {
        setEleitoradoPorMunicipio(data.eleitorado_por_municipio ?? {});
      })
      .catch((err) => {
        console.warn('[painel-alagoas] Falha ao carregar eleitorado TSE', err);
      });
  }, []);

  const pessoasPorCidadeId = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of liderancas) {
      map.set(l.cidade_id, (map.get(l.cidade_id) ?? 0) + l.quantidade_pessoas);
    }
    return map;
  }, [liderancas]);

  const taxaMaxCobertura = useMemo(() => {
    let max = 0;
    for (const [cidadeId, pessoas] of pessoasPorCidadeId) {
      const taxa = taxaCobertura(pessoas, eleitoradoPorMunicipio[cidadeId] ?? 0);
      if (taxa > max) max = taxa;
    }
    return max;
  }, [pessoasPorCidadeId, eleitoradoPorMunicipio]);

  const corMunicipio = useCallback(
    (cidadeId: string) => {
      if (viewMode === 'cobertura') {
        const lids = getLiderancasByCidade(cidadeId);
        const pessoas = pessoasPorCidadeId.get(cidadeId) ?? 0;
        const eleitorado = eleitoradoPorMunicipio[cidadeId] ?? 0;
        const taxa = taxaCobertura(pessoas, eleitorado);
        return corCoberturaHeatmap(lids.length > 0, taxa, taxaMaxCobertura);
      }
      return getCorPorStatus(getCidadeStatus(cidadeId));
    },
    [
      viewMode,
      getLiderancasByCidade,
      pessoasPorCidadeId,
      eleitoradoPorMunicipio,
      taxaMaxCobertura,
      getCidadeStatus,
    ],
  );

  const styleFeature = useCallback(
    (feature?: GeoJSON.Feature) => {
      const id = feature?.properties?.id as string;
      const isHovered = id === hoveredCidadeId;
      const isSelected = id === selectedCidadeId;

      if (isHovered || isSelected) {
        return {
          fillColor: personalizar.cores.municipioHover,
          weight: isSelected ? 3 : 2.5,
          opacity: 1,
          color: isSelected ? personalizar.cores.primaria : personalizar.cores.municipioBorda,
          fillOpacity: 0.95,
        };
      }

      return {
        fillColor: corMunicipio(id),
        weight: personalizar.mapa.pesoBorda,
        opacity: 1,
        color: personalizar.cores.municipioBorda,
        fillOpacity: 0.85,
      };
    },
    [corMunicipio, hoveredCidadeId, selectedCidadeId],
  );

  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: L.Layer) => {
      const id = feature.properties?.id as string;
      const nome = feature.properties?.name as string;

      layer.on({
        mouseover: (e: L.LeafletMouseEvent) => {
          hoverCidade(id);
          const target = e.target as L.Path;
          target.setStyle({
            fillColor: personalizar.cores.municipioHover,
            fillOpacity: 0.95,
            weight: 2.5,
          });

          const dados = getCidadeComDados(id);
          const lids = dados?.liderancas ?? [];
          const visitasCidade = dados?.visitas ?? [];
          const totalPessoas = lids.reduce((acc, l) => acc + l.quantidade_pessoas, 0);
          const eleitorado = eleitoradoPorMunicipio[id] ?? 0;
          const taxa = taxaCobertura(totalPessoas, eleitorado);
          const realizadas = visitasCidade.filter((v) =>
            isVisitaRealizadaContabilizada(v.data_hora),
          ).length;
          const abertas = visitasCidade.filter((v) =>
            isVisitaEmAbertoContabilizada(v.data_hora),
          ).length;
          const agendadas = visitasCidade.filter((v) =>
            isVisitaAgendadaContabilizada(v.data_hora),
          ).length;
          const liderancaTexto =
            lids.length === 0
              ? 'Sem liderança'
              : lids.length === 1
                ? lids[0].nome
                : `${lids.length} lideranças`;
          const visitaTexto =
            visitasCidade.length === 0
              ? 'Não há agendamento'
              : `${realizadas} realizada(s) · ${abertas} em aberto${agendadas ? ` (${agendadas} com data)` : ''}`;
          const coberturaTexto =
            lids.length === 0
              ? '—'
              : eleitorado > 0
                ? `${formatTaxaPercent(taxa)} (${totalPessoas.toLocaleString('pt-BR')} / ${eleitorado.toLocaleString('pt-BR')})`
                : 'Eleitorado indisponível';

          target
            .bindTooltip(
              `<div class="map-tooltip"><strong>${nome}</strong><p><strong>Liderança:</strong> ${liderancaTexto}</p><p><strong>Pessoas:</strong> ${totalPessoas.toLocaleString('pt-BR')}</p><p><strong>Cobertura:</strong> ${coberturaTexto}</p><p><strong>Visitas:</strong> ${visitaTexto}</p></div>`,
              { sticky: true, className: 'custom-tooltip' },
            )
            .openTooltip();
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          hoverCidade(null);
          const target = e.target as L.Path;
          target.closeTooltip();
          target.setStyle(styleFeature(feature));
        },
        click: () => openPanel(id),
      });
    },
    [
      getCidadeComDados,
      hoverCidade,
      openPanel,
      styleFeature,
      eleitoradoPorMunicipio,
    ],
  );

  if (!geojson) {
    return <div className="map-loading">Carregando mapa de Alagoas...</div>;
  }

  return (
    <div className="map-wrapper">
      <MapContainer
        center={personalizar.mapa.centro}
        zoom={personalizar.mapa.zoomInicial}
        className="alagoas-map"
        zoomControl={false}
        scrollWheelZoom
      >
        <ZoomControl position="bottomleft" />
        <MapFitBounds geojson={geojson} />
        <GeoJSON
          key={`${viewMode}-${liderancas.length}-${visitas.length}-${selectedCidadeId}-${Object.keys(eleitoradoPorMunicipio).length}-${taxaMaxCobertura}`}
          data={geojson}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      {viewMode === 'status' ? (
        <div className="map-legend">
          <span className="legend-item">
            <i style={{ background: personalizar.cores.municipioComLideranca }} />
            Com liderança
          </span>
          <span className="legend-item">
            <i style={{ background: personalizar.cores.municipioVisitaRecente }} />
            Cidade já visitada
          </span>
          <span className="legend-item">
            <i style={{ background: personalizar.cores.municipioVisitaAgendada }} />
            Visita agendada
          </span>
          <span className="legend-item">
            <i style={{ background: personalizar.cores.municipioSemLideranca }} />
            Sem liderança
          </span>
        </div>
      ) : (
        <div className="map-legend map-legend--cobertura">
          <span className="legend-item">
            <i style={{ background: personalizar.cores.municipioSemLideranca }} />
            Sem liderança
          </span>
          <span className="legend-scale" aria-label="Escala de cobertura">
            <span className="legend-scale__label">0%</span>
            <span
              className="legend-scale__bar"
              style={{
                background: `linear-gradient(90deg, ${personalizar.cores.heatmapCoberturaMin}, ${personalizar.cores.heatmapCoberturaMax})`,
              }}
            />
            <span className="legend-scale__label">{formatTaxaPercent(taxaMaxCobertura || 0)}</span>
          </span>
          <span className="legend-item legend-item--hint">
            pessoas / eleitorado
          </span>
        </div>
      )}
    </div>
  );
}
