import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { RequireAdmin, RequireAuth } from './components/layout/RequireAuth';
import { MainPage } from './pages/MainPage';
import { DashboardPage } from './pages/DashboardPage';
import { HeatmapPage } from './pages/HeatmapPage';
import { LiderancaFormPage } from './pages/LiderancaFormPage';
import { LiderancasPage } from './pages/LiderancasPage';
import { LoginPage } from './pages/LoginPage';
import { AguardandoAprovacaoPage } from './pages/AguardandoAprovacaoPage';
import { AlterarSenhaPage } from './pages/AlterarSenhaPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { useTheme } from './hooks/useTheme';
import { useAuthStore } from './store/useAuthStore';
import './pages/AuthPages.css';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/aguardando-aprovacao" element={<AguardandoAprovacaoPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/mapa" element={<DashboardPage />} />
          <Route path="/mapa-de-calor" element={<HeatmapPage />} />
          <Route path="/liderancas" element={<LiderancasPage />} />
          <Route path="/lideranca/nova" element={<LiderancaFormPage />} />
          <Route path="/lideranca/editar/:id" element={<LiderancaFormPage />} />
          <Route path="/conta" element={<AlterarSenhaPage />} />
          <Route element={<RequireAdmin />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  useTheme();
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return <div className="auth-page" />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
