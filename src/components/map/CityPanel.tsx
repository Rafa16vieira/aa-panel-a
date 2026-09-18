import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { setCidadeVisitadaMarcada } from '../../services/dataService';
import { formatVisita } from '../../hooks/useRealtimeData';
import { isVisitaRealizadaContabilizada } from '../../utils/visitas';
import './CityPanel.css';

export function CityPanel() {
  const isPanelOpen = useAppStore((s) => s.isPanelOpen);
  const selectedCidadeId = useAppStore((s) => s.selectedCidadeId);
  const closePanel = useAppStore((s) => s.closePanel);
  const getCidadeComDados = useAppStore((s) => s.getCidadeComDados);
  const getVisitasByLideranca = useAppStore((s) => s.getVisitasByLideranca);
  const getCidadeStatus = useAppStore((s) => s.getCidadeStatus);
  const isCidadeVisitadaMarcada = useAppStore((s) => s.isCidadeVisitadaMarcada);
  const setCidadesVisitadasMarcadas = useAppStore((s) => s.setCidadesVisitadasMarcadas);

  const [marcando, setMarcando] = useState(false);

  if (!isPanelOpen || !selectedCidadeId) return null;

  const dados = getCidadeComDados(selectedCidadeId);
  if (!dados) return null;

  const { liderancas } = dados;
  const totalPessoas = liderancas.reduce((acc, l) => acc + l.quantidade_pessoas, 0);
  const status = getCidadeStatus(dados.id);
  const marcadaManual = isCidadeVisitadaMarcada(dados.id);
  const temVisitaRegistrada = liderancas.some((l) =>
    getVisitasByLideranca(l.id).some((v) => isVisitaRealizadaContabilizada(v.data_hora)),
  );
  const jaVisitada = status === 'visita_recente';

  async function alternarVisitada() {
    if (!dados || temVisitaRegistrada) return;
    setMarcando(true);
    try {
      const ids = await setCidadeVisitadaMarcada(dados.id, !marcadaManual);
      setCidadesVisitadasMarcadas(ids);
    } catch (err) {
      console.error('[painel-alagoas] Falha ao marcar cidade visitada', err);
      alert(
        'Não foi possível atualizar a marcação. Confira se a migration 005 foi aplicada no Supabase.',
      );
    } finally {
      setMarcando(false);
    }
  }

  return (
    <>
      <div className="panel-overlay" onClick={closePanel} aria-hidden="true" />
      <aside className="city-panel" role="dialog" aria-label={`Detalhes de ${dados.nome}`}>
        <header className="city-panel__header">
          <h2>{dados.nome}</h2>
          <button type="button" className="city-panel__close" onClick={closePanel} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="city-panel__body">
          <div className="detail-row">
            <span className="detail-label">Resumo</span>
            <span className="detail-value">
              {liderancas.length} liderança{liderancas.length === 1 ? '' : 's'} · {totalPessoas} pessoas
            </span>
          </div>

          {liderancas.length > 0 && (
            <div className="city-panel__visita-mark">
              {temVisitaRegistrada ? (
                <p className="city-panel__visita-status">Já visitada (com registro de visita)</p>
              ) : (
                <button
                  type="button"
                  className={`btn-visita-mark${jaVisitada ? ' btn-visita-mark--active' : ''}`}
                  onClick={() => void alternarVisitada()}
                  disabled={marcando}
                >
                  {marcando
                    ? 'Salvando...'
                    : jaVisitada
                      ? 'Desmarcar como visitada'
                      : 'Marcar como visitada'}
                </button>
              )}
              {!temVisitaRegistrada && (
                <p className="city-panel__visita-hint">
                  Marca a cidade no mapa sem criar uma visita na agenda.
                </p>
              )}
            </div>
          )}

          {liderancas.length === 0 ? (
            <>
              <p className="city-panel__empty">Nenhuma liderança cadastrada para esta cidade.</p>
              <Link
                to={`/lideranca/nova?cidade=${dados.id}`}
                className="btn-primary"
                onClick={closePanel}
              >
                Cadastrar liderança
              </Link>
            </>
          ) : (
            <>
              {liderancas.map((lideranca) => {
                const visitas = getVisitasByLideranca(lideranca.id);
                return (
                  <section key={lideranca.id} className="lideranca-block">
                    <div className="detail-row">
                      <span className="detail-label">Liderança</span>
                      <span className="detail-value">{lideranca.nome}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Responsável</span>
                      <span className="detail-value">{lideranca.responsavel || 'NTR'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Quantidade de pessoas</span>
                      <span className="detail-value">{lideranca.quantidade_pessoas}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Visitas ({visitas.length})</span>
                      {visitas.length === 0 ? (
                        <span className="detail-value">{formatVisita(null)}</span>
                      ) : (
                        <ul className="visita-list">
                          {visitas.map((visita) => (
                            <li key={visita.id}>
                              <strong>{formatVisita(visita.data_hora)}</strong>
                              {visita.observacoes ? ` — ${visita.observacoes}` : ''}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Link
                      to={`/lideranca/editar/${lideranca.id}`}
                      className="btn-primary btn-primary--compact"
                      onClick={closePanel}
                    >
                      Editar liderança
                    </Link>
                  </section>
                );
              })}

              <Link
                to={`/lideranca/nova?cidade=${dados.id}`}
                className="btn-secondary-panel"
                onClick={closePanel}
              >
                Adicionar outra liderança
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
