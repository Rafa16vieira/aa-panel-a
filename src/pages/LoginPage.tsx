import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { registerAccount } from '../services/authService';
import { mensagemAuth } from '../services/authErrors';
import { useAuthStore } from '../store/useAuthStore';
import './AuthPages.css';

export function LoginPage() {
  const navigate = useNavigate();
  const session = useAuthStore((s) => s.session);
  const login = useAuthStore((s) => s.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Login';
  }, []);

  if (session) {
    return <Navigate to="/" replace />;
  }

  async function onEntrar(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await login(username, password);
      if (result.ok) {
        navigate('/', { replace: true });
        return;
      }
      if (result.erro === 'pending') {
        navigate('/aguardando-aprovacao', { replace: true });
        return;
      }
      setError(mensagemAuth(result.erro));
    } catch {
      setError(mensagemAuth(undefined));
    } finally {
      setBusy(false);
    }
  }

  async function onCriarConta() {
    setError('');
    setBusy(true);
    try {
      const result = await registerAccount(username, password);
      if (result.ok) {
        navigate('/aguardando-aprovacao', { replace: true });
        return;
      }
      setError(mensagemAuth(result.erro));
    } catch {
      setError(mensagemAuth(undefined));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onEntrar}>
        <h1>Login</h1>
        {error ? <p className="auth-error">{error}</p> : null}
        <div className="auth-fields">
          <label className="sr-only" htmlFor="login-usuario">
            Usuário
          </label>
          <input
            id="login-usuario"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuário"
            disabled={busy}
          />
          <label className="sr-only" htmlFor="login-senha">
            Senha
          </label>
          <input
            id="login-senha"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            disabled={busy}
          />
        </div>
        <div className="auth-actions">
          <button type="submit" className="btn-primary" disabled={busy}>
            Entrar
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={busy}
            onClick={() => void onCriarConta()}
          >
            Criar conta
          </button>
        </div>
      </form>
    </div>
  );
}
