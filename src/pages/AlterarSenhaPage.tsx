import { useState, type FormEvent } from 'react';
import { changeOwnPassword } from '../services/authService';
import { mensagemAuth } from '../services/authErrors';
import '../components/forms/LiderancaForm.css';
import './AuthPages.css';

export function AlterarSenhaPage() {
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirma, setConfirma] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setOk(false);

    if (nova !== confirma) {
      setError('A confirmação não confere com a nova senha.');
      return;
    }

    setBusy(true);
    try {
      const result = await changeOwnPassword(atual, nova);
      if (!result.ok) {
        setError(mensagemAuth(result.erro));
        return;
      }
      setAtual('');
      setNova('');
      setConfirma('');
      setOk(true);
    } catch {
      setError(mensagemAuth(undefined));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form-page">
      <h2>Alterar senha</h2>
      <form className="lideranca-form" onSubmit={onSubmit}>
        {error ? <p className="form-error">{error}</p> : null}
        {ok ? <p className="auth-success">Senha alterada.</p> : null}
        <div className="form-group">
          <label htmlFor="senha-atual">Senha atual</label>
          <input
            id="senha-atual"
            type="password"
            autoComplete="current-password"
            value={atual}
            onChange={(e) => setAtual(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="form-group">
          <label htmlFor="senha-nova">Nova senha</label>
          <input
            id="senha-nova"
            type="password"
            autoComplete="new-password"
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="form-group">
          <label htmlFor="senha-confirma">Confirmar nova senha</label>
          <input
            id="senha-confirma"
            type="password"
            autoComplete="new-password"
            value={confirma}
            onChange={(e) => setConfirma(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={busy}>
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
