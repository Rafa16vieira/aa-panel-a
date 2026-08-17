import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { CityPanel } from '../map/CityPanel';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { useAgendaSync } from '../../hooks/useAgendaSync';
import { personalizar } from '../../theme/personalizar';
import './DashboardLayout.css';

export function DashboardLayout() {
  useRealtimeData();
  useAgendaSync();

  useEffect(() => {
    document.title = personalizar.nomeSistema;
  }, []);

  return (
    <div className="dashboard-layout">
      <Header />
      <main className="dashboard-main">
        <Outlet />
      </main>
      <CityPanel />
    </div>
  );
}
