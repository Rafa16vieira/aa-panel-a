import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChartCard } from '../components/charts/BarChartCard';
import { useAppStore } from '../store/useAppStore';
import { personalizar } from '../theme/personalizar';
import {
  pessoasPorCidade,
  liderancasPorCidade,
  visitasEmAbertoPorCidade,
  cidadesMaisVisitadas,
} from '../utils/dashboardMetrics';
import { isVisitaEmAbertoContabilizada, isVisitaRealizadaContabilizada } from '../utils/visitas';
import './MainPage.css';

export function MainPage() {
  const isLoading = useAppStore((s) => s.isLoading);
  const cidades = useAppStore((s) => s.cidades);
  const liderancas = useAppStore((s) => s.liderancas);
  const visitas = useAppStore((s) => s.visitas);

  const metrics = useMemo(() => {
    const input = { cidades, liderancas, visitas };
    return {
      pessoas: pessoasPorCidade(input),
      liderancas: liderancasPorCidade(input),
      abertas: visitasEmAbertoPorCidade(input),
      visitadas: cidadesMaisVisitadas(input),
    };
  }, [cidades, liderancas, visitas]);

  const cores = personalizar.cores;
  const comLideranca = liderancas.length;
  const visitasRealizadas = visitas.filter((v) =>
    isVisitaRealizadaContabilizada(v.data_hora),
  ).length;
  const visitasAbertas = visitas.filter((v) => isVisitaEmAbertoContabilizada(v.data_hora)).length;

  if (isLoading) {
    return <div className="main-page__loading">Carregando dados...</div>;
  }

  return (
    <div className="main-page">
      <header className="main-page__intro">
        <div>
          <h2 className="main-page__title">Visão geral</h2>
          <p className="main-page__subtitle">
            Indicadores por município — Top 15 com dados cadastrados
          </p>
        </div>
        <div className="main-page__actions">
          <Link to="/mapa" className="main-page__cta">
            Abrir mapa
          </Link>
          <Link to="/relatorio" className="main-page__cta main-page__cta--secondary">
            Relatório
          </Link>
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-value">{cidades.length}</span>
          <span className="stat-label">Municípios</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{comLideranca}</span>
          <span className="stat-label">Lideranças</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{visitasRealizadas}</span>
          <span className="stat-label">Visitas realizadas</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{visitasAbertas}</span>
          <span className="stat-label">Visitas em aberto</span>
        </div>
      </div>

      <div className="charts-grid">
        <BarChartCard
          title="Pessoas por cidade"
          description="Soma de pessoas vinculadas às lideranças"
          data={metrics.pessoas}
          barColor={cores.primaria}
          valueLabel="Pessoas"
        />
        <BarChartCard
          title="Lideranças por cidade"
          description="Quantidade de lideranças cadastradas"
          data={metrics.liderancas}
          barColor={cores.municipioComLideranca}
          valueLabel="Lideranças"
        />
        <BarChartCard
          title="Visitas em aberto por cidade"
          description="Sem data ou com data ainda não vencida"
          data={metrics.abertas}
          barColor={cores.secundaria}
          valueLabel="Em aberto"
        />
        <BarChartCard
          title="Cidades mais visitadas"
          description="Somente visitas já realizadas (data anterior a hoje)"
          data={metrics.visitadas}
          barColor={cores.municipioVisitaAgendada}
          valueLabel="Visitas"
        />
      </div>
    </div>
  );
}
