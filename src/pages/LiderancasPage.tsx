import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { isVisitaAgendada, isVisitaEmAberto, isVisitaRealizada } from '../utils/visitas';
import './LiderancasPage.css';

type OrdemType = 'cidade' | 'pessoas';

function avatarInicial(nome: string): string {
  return nome.trim().charAt(0).toUpperCase();
}

export function LiderancasPage() {
  const cidades = useAppStore((s) => s.cidades);
  const liderancas = useAppStore((s) => s.liderancas);
  const visitas = useAppStore((s) => s.visitas);

  const [busca, setBusca] = useState('');
  const [ordem, setOrdem] = useState<OrdemType>('cidade');

  const cidadeMap = useMemo(
    () => new Map(cidades.map((c) => [c.id, c.nome])),
    [cidades],
  );

  const visitasPorLideranca = useMemo(() => {
    const map = new Map<string, typeof visitas>();
    for (const v of visitas) {
      const list = map.get(v.lideranca_id) ?? [];
      list.push(v);
      map.set(v.lideranca_id, list);
    }
    return map;
  }, [visitas]);

  const liderancasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return liderancas.filter((l) =>
      !termo ||
      l.nome.toLowerCase().includes(termo) ||
      (cidadeMap.get(l.cidade_id) ?? '').toLowerCase().includes(termo),
    );
  }, [liderancas, busca, cidadeMap]);

  const gruposPorCidade = useMemo(() => {
    const grupos = new Map<string, { cidadeNome: string; liderancas: typeof liderancasFiltradas }>();

    for (const l of liderancasFiltradas) {
      const cidadeNome = cidadeMap.get(l.cidade_id) ?? 'Cidade desconhecida';
      if (!grupos.has(l.cidade_id)) {
        grupos.set(l.cidade_id, { cidadeNome, liderancas: [] });
      }
      grupos.get(l.cidade_id)!.liderancas.push(l);
    }

    const gruposArr = Array.from(grupos.values());

    if (ordem === 'cidade') {
      gruposArr.sort((a, b) => a.cidadeNome.localeCompare(b.cidadeNome, 'pt-BR'));
    } else {
      gruposArr.sort((a, b) => {
        const totalB = b.liderancas.reduce((acc, l) => acc + l.quantidade_pessoas, 0);
        const totalA = a.liderancas.reduce((acc, l) => acc + l.quantidade_pessoas, 0);
        return totalB - totalA;
      });
    }

    return gruposArr;
  }, [liderancasFiltradas, cidadeMap, ordem]);

  const totalPessoas = useMemo(
    () => liderancasFiltradas.reduce((acc, l) => acc + l.quantidade_pessoas, 0),
    [liderancasFiltradas],
  );

  return (
    <div className="liderancas-page">
      {/* Toolbar */}
      <div className="liderancas-toolbar">
        <div className="search-input-wrapper">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            id="busca-lideranca"
            type="search"
            className="search-input"
            placeholder="Pesquisar por nome ou cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Pesquisar lideranças por nome ou cidade"
          />
        </div>
        <div className="sort-controls">
          <span className="sort-label">Ordenar por:</span>
          <button
            id="btn-ordem-cidade"
            type="button"
            className={`sort-btn${ordem === 'cidade' ? ' active' : ''}`}
            onClick={() => setOrdem('cidade')}
          >
            Cidade (A–Z)
          </button>
          <button
            id="btn-ordem-pessoas"
            type="button"
            className={`sort-btn${ordem === 'pessoas' ? ' active' : ''}`}
            onClick={() => setOrdem('pessoas')}
          >
            Nº de pessoas
          </button>
        </div>
        <Link to="/lideranca/nova" className="liderancas-btn-nova">
          Nova liderança
        </Link>
      </div>

      {/* Summary */}
      <p className="liderancas-summary">
        {liderancasFiltradas.length === 0
          ? 'Nenhuma liderança encontrada'
          : `${liderancasFiltradas.length} liderança${liderancasFiltradas.length !== 1 ? 's' : ''} em ${gruposPorCidade.length} cidade${gruposPorCidade.length !== 1 ? 's' : ''} · ${totalPessoas.toLocaleString('pt-BR')} pessoas no total`}
      </p>

      {/* Empty state */}
      {liderancasFiltradas.length === 0 && (
        <div className="liderancas-empty">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {busca ? (
            <p>Nenhuma liderança encontrada para <strong>"{busca}"</strong>.</p>
          ) : (
            <p>Ainda não há lideranças cadastradas.</p>
          )}
          <Link to="/lideranca/nova" className="btn-primary">
            Cadastrar liderança
          </Link>
        </div>
      )}

      {/* Grupos por cidade */}
      {gruposPorCidade.map(({ cidadeNome, liderancas: lids }) => (
        <div key={cidadeNome} className="cidade-group">
          <header className="cidade-group-header">
            <h2 className="cidade-group-nome">{cidadeNome}</h2>
            <span className="cidade-group-badge">{lids.length}</span>
          </header>

          {lids.map((lideranca) => {
            const liderancaVisitas = visitasPorLideranca.get(lideranca.id) ?? [];
            const abertas = liderancaVisitas.filter((v) => isVisitaEmAberto(v.data_hora));
            const realizadas = liderancaVisitas.filter((v) => isVisitaRealizada(v.data_hora));
            const agendadas = liderancaVisitas.filter((v) => isVisitaAgendada(v.data_hora));

            return (
              <div key={lideranca.id} className="lideranca-card">
                <div className="lideranca-card__avatar" aria-hidden="true">
                  {avatarInicial(lideranca.nome)}
                </div>

                <div className="lideranca-card__info">
                  <p className="lideranca-card__nome">{lideranca.nome}</p>
                  <div className="lideranca-card__meta">
                    <span className="meta-item meta-item--pessoas">
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      </svg>
                      {lideranca.quantidade_pessoas} pessoas
                    </span>
                    <span className="meta-item">
                      Resp.: {lideranca.responsavel || 'NTR'}
                    </span>
                    {liderancaVisitas.length === 0 ? (
                      <span className="status-badge status-badge--lideranca">
                        Sem visitas
                      </span>
                    ) : (
                      <span className="status-badge status-badge--visita">
                        {realizadas.length} realizada{realizadas.length === 1 ? '' : 's'}
                        {abertas.length > 0
                          ? ` · ${abertas.length} em aberto`
                          : ''}
                        {agendadas.length > 0
                          ? ` (${agendadas.length} com data)`
                          : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="lideranca-card__actions">
                  <Link
                    to={`/lideranca/editar/${lideranca.id}`}
                    className="action-btn"
                    aria-label={`Editar liderança de ${lideranca.nome}`}
                  >
                    Editar
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
