import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { CityMetric } from '../../utils/dashboardMetrics';
import './BarChartCard.css';

interface BarChartCardProps {
  title: string;
  description?: string;
  data: CityMetric[];
  barColor: string;
  emptyMessage?: string;
  valueLabel?: string;
}

function truncateLabel(name: string, max = 14): string {
  if (name.length <= max) return name;
  return `${name.slice(0, max - 1)}…`;
}

export function BarChartCard({
  title,
  description,
  data,
  barColor,
  emptyMessage = 'Sem dados para exibir',
  valueLabel = 'Valor',
}: BarChartCardProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: truncateLabel(d.nome),
  }));

  return (
    <article className="bar-chart-card">
      <header className="bar-chart-card__header">
        <h2 className="bar-chart-card__title">{title}</h2>
        {description && <p className="bar-chart-card__desc">{description}</p>}
      </header>

      {chartData.length === 0 ? (
        <div className="bar-chart-card__empty">{emptyMessage}</div>
      ) : (
        <div className="bar-chart-card__chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--cor-borda)" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--cor-texto-secundario)' }} />
              <YAxis
                type="category"
                dataKey="label"
                width={100}
                tick={{ fontSize: 11, fill: 'var(--cor-texto)' }}
              />
              <Tooltip
                formatter={(value) => [value as number, valueLabel]}
                labelFormatter={(_, payload) => {
                  const item = payload?.[0]?.payload as CityMetric | undefined;
                  return item?.nome ?? '';
                }}
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid var(--cor-borda)',
                  background: 'var(--cor-fundo-painel)',
                  color: 'var(--cor-texto)',
                }}
              />
              <Bar dataKey="valor" fill={barColor} radius={[0, 6, 6, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}
