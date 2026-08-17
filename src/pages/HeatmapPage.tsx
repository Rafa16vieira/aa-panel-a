import { AlagoasMap } from '../components/map/AlagoasMap';
import { useAppStore } from '../store/useAppStore';
import './DashboardPage.css';

export function HeatmapPage() {
  const isLoading = useAppStore((s) => s.isLoading);

  return (
    <div className="dashboard-page">
      <header>
        <h2 className="dashboard-page__title">Mapa de calor</h2>
        <p className="dashboard-page__subtitle">
          Cobertura: pessoas cadastradas ÷ eleitorado TSE de julho/2026 (verde na menor taxa → verde escuro na maior)
        </p>
      </header>

      {isLoading ? (
        <div className="dashboard-loading">Carregando dados...</div>
      ) : (
        <AlagoasMap viewMode="cobertura" />
      )}
    </div>
  );
}
