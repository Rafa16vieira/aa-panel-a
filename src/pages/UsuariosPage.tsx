import { useCallback, useEffect, useState } from 'react';
import type { UsuarioPublico } from '../types';
import {
  adminApproveUser,
  adminChangeUserPassword,
  adminDeleteUser,
  adminListUsers,
} from '../services/authService';
import { mensagemAuth } from '../services/authErrors';
import { useAuthStore } from '../store/useAuthStore';
import './UsuariosPage.css';

export function UsuariosPage() {
  const session = useAuthStore((s) => s.session);
  const [usuarios, setUsuarios] = useState<UsuarioPublico[]>([]);
  const [error, setError] = useState('');
  const [senhaAlvo, setSenhaAlvo] = useState<string | null>(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setError('');
    try {
      setUsuarios(await adminListUsers());
    } catch {
      setError(mensagemAuth(undefined));
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function aprovar(id: string) {
    setBusyId(id);
    setError('');
    try {
      const result = await adminApproveUser(id);
      if (!result.ok) {
        setError(mensagemAuth(result.erro));
        return;
      }
      await carregar();
    } catch {
      setError(mensagemAuth(undefined));
    } finally {
      setBusyId(null);
    }
  }

  async function salvarSenha(id: string) {
    setBusyId(id);
    setError('');
    try {
      const result = await adminChangeUserPassword(id, novaSenha);
      if (!result.ok) {
        setError(mensagemAuth(result.erro));
        return;
      }
      setSenhaAlvo(null);
      setNovaSenha('');
      await carregar();
    } catch {
      setError(mensagemAuth(undefined));
    } finally {
      setBusyId(null);
    }
  }

  async function excluir(user: UsuarioPublico) {
    if (!window.confirm(`Excluir o usuário "${user.username}"?`)) return;
    setBusyId(user.id);
    setError('');
    try {
      const result = await adminDeleteUser(user.id);
      if (!result.ok) {
        setError(mensagemAuth(result.erro));
        return;
      }
      await carregar();
    } catch {
      setError(mensagemAuth(undefined));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="usuarios-page">
      <h2>Usuários</h2>
      {error ? <p className="form-error">{error}</p> : null}

      {usuarios.length === 0 ? (
        <p className="usuarios-empty">Nenhum usuário encontrado.</p>
      ) : (
        <ul className="usuarios-list">
          {usuarios.map((user) => {
            const isSelf = user.id === session?.id;
            const busy = busyId === user.id;
            return (
              <li key={user.id} className="usuario-card">
                <div className="usuario-card__info">
                  <p className="usuario-card__nome">{user.username}</p>
                  <div className="usuario-card__meta">
                    <span className={`status-pill${user.aprovado ? ' status-pill--ok' : ''}`}>
                      {user.aprovado ? 'Aprovado' : 'Aguardando aprovação'}
                    </span>
                    {user.isAdmin ? <span className="status-pill status-pill--admin">Admin</span> : null}
                  </div>
                </div>
                <div className="usuario-card__actions">
                  {!user.aprovado ? (
                    <button type="button" className="action-btn" disabled={busy} onClick={() => void aprovar(user.id)}>
                      Aprovar
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="action-btn"
                    disabled={busy}
                    onClick={() => {
                      setSenhaAlvo(senhaAlvo === user.id ? null : user.id);
                      setNovaSenha('');
                    }}
                  >
                    Alterar senha
                  </button>
                  <button
                    type="button"
                    className="action-btn action-btn--danger"
                    disabled={busy || isSelf}
                    onClick={() => void excluir(user)}
                  >
                    Excluir
                  </button>
                </div>
                {senhaAlvo === user.id ? (
                  <form
                    className="usuario-senha"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void salvarSenha(user.id);
                    }}
                  >
                    <label className="sr-only" htmlFor={`nova-senha-${user.id}`}>
                      Nova senha de {user.username}
                    </label>
                    <input
                      id={`nova-senha-${user.id}`}
                      type="password"
                      autoComplete="new-password"
                      placeholder="Nova senha"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      disabled={busy}
                    />
                    <button type="submit" className="action-btn" disabled={busy || !novaSenha}>
                      Salvar senha
                    </button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
