import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { personalizar } from '../theme/personalizar';
import { buildRelatorioResumo } from '../utils/dashboardMetrics';
import './RelatorioPage.css';

function formatData(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function formatNum(n: number): string {
  return n.toLocaleString('pt-BR');
}

interface MetricTableProps {
  title: string;
  description: string;
  rows: { nome: string; valor: number }[];
  valueLabel: string;
}

function TableChunk({
  rows,
  startIndex,
  valueLabel,
}: {
  rows: { nome: string; valor: number }[];
  startIndex: number;
  valueLabel: string;
}) {
  return (
    <table className="relatorio-table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Município</th>
          <th scope="col">{valueLabel}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.nome}>
            <td>{startIndex + i + 1}</td>
            <td>{row.nome}</td>
            <td>{formatNum(row.valor)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MetricTable({ title, description, rows, valueLabel }: MetricTableProps) {
  const splitAt = Math.ceil(rows.length / 2);
  const colA = rows.slice(0, splitAt);
  const colB = rows.slice(splitAt);
  const maxRowsPorColuna = Math.max(colA.length, colB.length);
  const densityClass =
    maxRowsPorColuna > 52
      ? ' relatorio-section--print-ultra'
      : maxRowsPorColuna > 42
        ? ' relatorio-section--print-dense'
        : '';

  return (
    <section className={`relatorio-section${densityClass}`}>
      <h3 className="relatorio-section__title">{title}</h3>
      <p className="relatorio-section__desc">{description}</p>
      {rows.length === 0 ? (
        <p className="relatorio-empty">Sem dados para exibir.</p>
      ) : (
        <>
          <div className="relatorio-table-wrap relatorio-table-wrap--screen">
            <TableChunk rows={rows} startIndex={0} valueLabel={valueLabel} />
          </div>
          <div
            className={`relatorio-table-columns relatorio-table-columns--print${
              colB.length === 0 ? ' relatorio-table-columns--single' : ''
            }`}
          >
            <div className="relatorio-table-col">
              <TableChunk rows={colA} startIndex={0} valueLabel={valueLabel} />
            </div>
            {colB.length > 0 && (
              <div className="relatorio-table-col">
                <TableChunk rows={colB} startIndex={splitAt} valueLabel={valueLabel} />
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export function RelatorioPage() {
  const isLoading = useAppStore((s) => s.isLoading);
  const cidades = useAppStore((s) => s.cidades);
  const liderancas = useAppStore((s) => s.liderancas);
  const visitas = useAppStore((s) => s.visitas);

  const relatorio = useMemo(
    () => buildRelatorioResumo({ cidades, liderancas, visitas }),
    [cidades, liderancas, visitas],
  );

  function exportarPdf() {
    window.print();
  }

  if (isLoading) {
    return <div className="relatorio-loading">Carregando relatório...</div>;
  }

  return (
    <div className="relatorio-page">
      <header className="relatorio-header no-print">
        <div>
          <h2 className="relatorio-header__title">Relatório</h2>
          <p className="relatorio-header__subtitle">
            Indicadores consolidados · gerado em {formatData(relatorio.geradoEm)}
          </p>
        </div>
        <button type="button" className="relatorio-btn-pdf" onClick={exportarPdf}>
          Exportar PDF
        </button>
      </header>

      <div className="relatorio-print-title print-only">
        <h1>{personalizar.nomeSistema}</h1>
        <p>Relatório de indicadores · {formatData(relatorio.geradoEm)}</p>
      </div>

      <div className="dashboard-stats relatorio-kpis">
        <div className="stat-card">
          <span className="stat-value">{formatNum(relatorio.totalMunicipios)}</span>
          <span className="stat-label">Municípios</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatNum(relatorio.totalLiderancas)}</span>
          <span className="stat-label">Lideranças</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatNum(relatorio.totalPessoas)}</span>
          <span className="stat-label">Pessoas</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatNum(relatorio.cidadesComLideranca)}</span>
          <span className="stat-label">Cidades com liderança</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatNum(relatorio.cidadesSemLideranca)}</span>
          <span className="stat-label">Cidades sem liderança</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatNum(relatorio.visitasRealizadas)}</span>
          <span className="stat-label">Visitas realizadas</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatNum(relatorio.visitasAbertas)}</span>
          <span className="stat-label">Visitas em aberto</span>
        </div>
      </div>

      <MetricTable
        title="Pessoas por cidade"
        description="Soma de pessoas vinculadas às lideranças de cada município"
        rows={relatorio.pessoasPorCidade}
        valueLabel="Pessoas"
      />
      <MetricTable
        title="Lideranças por cidade"
        description="Quantidade de lideranças cadastradas por município"
        rows={relatorio.liderancasPorCidade}
        valueLabel="Lideranças"
      />
      <MetricTable
        title="Visitas em aberto por cidade"
        description="Visitas sem data ou com data ainda não vencida"
        rows={relatorio.visitasAbertasPorCidade}
        valueLabel="Em aberto"
      />
      <MetricTable
        title="Visitas realizadas por cidade"
        description="Visitas com data anterior ao momento da geração do relatório"
        rows={relatorio.visitasRealizadasPorCidade}
        valueLabel="Realizadas"
      />
    </div>
  );
}
