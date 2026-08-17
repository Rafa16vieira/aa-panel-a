import { AlagoasMap } from '../components/map/AlagoasMap';
import { useAppStore } from '../store/useAppStore';
import { contagemCidadesComSemLideranca } from '../utils/dashboardMetrics';
import './DashboardPage.css';

export function DashboardPage() {
  const isLoading = useAppStore((s) => s.isLoading);
  const liderancas = useAppStore((s) => s.liderancas);
  const cidades = useAppStore((s) => s.cidades);

  const { comLideranca, semLideranca } = contagemCidadesComSemLideranca({
    cidades,
    liderancas,
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-value">{cidades.length}</span>
          <span className="stat-label">Municípios</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{comLideranca}</span>
          <span className="stat-label">Com liderança</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{semLideranca}</span>
          <span className="stat-label">Sem liderança</span>
        </div>
      </div>

      {isLoading ? (
        <div className="dashboard-loading">Carregando dados...</div>
      ) : (
        <AlagoasMap viewMode="status" />
      )}
    </div>
  );
}
