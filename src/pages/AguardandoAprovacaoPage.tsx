import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AuthPages.css';

export function AguardandoAprovacaoPage() {
  useEffect(() => {
    document.title = 'Aguardando aprovação';
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Aguardando aprovação</h1>
        <p>Sua conta será liberada depois da aprovação do administrador.</p>
        <div className="auth-actions">
          <Link to="/login" className="btn-primary">
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}
