import { Link, useLocation, useNavigate } from 'react-router-dom';
import { personalizar } from '../../theme/personalizar';
import { getStorageMode } from '../../services/dataService';
import { useAuthStore } from '../../store/useAuthStore';
import './Header.css';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = getStorageMode();
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);

  const isInicio = location.pathname === '/';
  const isMapa = location.pathname === '/mapa';
  const isMapaCalor = location.pathname === '/mapa-de-calor';
  const isLiderancas = location.pathname.startsWith('/lideranca');
  const isUsuarios = location.pathname === '/usuarios';
  const isConta = location.pathname === '/conta';

  async function onSair() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="app-header">
      <Link to="/" className="app-header__brand">
        <img src={personalizar.logo} alt={personalizar.nomeSistema} className="app-header__logo" />
        <h1>{personalizar.nomeSistema}</h1>
      </Link>
      <nav className="app-header__nav">
        <Link to="/" className={isInicio ? 'active' : ''}>
          Início
        </Link>
        <Link to="/mapa" className={isMapa ? 'active' : ''}>
          Mapa
        </Link>
        <Link to="/mapa-de-calor" className={isMapaCalor ? 'active' : ''}>
          Mapa de calor
        </Link>
        <Link to="/liderancas" className={isLiderancas ? 'active' : ''}>
          Lideranças
        </Link>
        {session?.isAdmin ? (
          <Link to="/usuarios" className={isUsuarios ? 'active' : ''}>
            Usuários
          </Link>
        ) : null}
      </nav>
      <div className="app-header__account">
        <span className="app-header__username">{session?.username}</span>
        <Link to="/conta" className={isConta ? 'active' : ''}>
          Senha
        </Link>
        <button type="button" className="app-header__logout" onClick={() => void onSair()}>
          Sair
        </button>
        <span className="app-header__mode" title="Modo de armazenamento">
          {mode === 'supabase' ? 'Supabase' : 'Local'}
        </span>
      </div>
    </header>
  );
}
