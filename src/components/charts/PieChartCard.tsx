import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import './PieChartCard.css';

export interface PieSlice {
  name: string;
  value: number;
  color: string;
}

interface PieChartCardProps {
  title: string;
  description?: string;
  data: PieSlice[];
  emptyMessage?: string;
}

function formatPct(value: number, total: number): string {
  if (total <= 0) return '0%';
  return `${Math.round((value / total) * 1000) / 10}%`;
}

export function PieChartCard({
  title,
  description,
  data,
  emptyMessage = 'Sem dados para exibir',
}: PieChartCardProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const hasData = total > 0;

  return (
    <article className="pie-chart-card">
      <header className="pie-chart-card__header">
        <h2 className="pie-chart-card__title">{title}</h2>
        {description && <p className="pie-chart-card__desc">{description}</p>}
      </header>

      {!hasData ? (
        <div className="pie-chart-card__empty">{emptyMessage}</div>
      ) : (
        <div className="pie-chart-card__body">
          <div className="pie-chart-card__chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="42%"
                  outerRadius="72%"
                  paddingAngle={2}
                  stroke="var(--cor-fundo-painel)"
                  strokeWidth={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value as number} (${formatPct(value as number, total)})`,
                    name as string,
                  ]}
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid var(--cor-borda)',
                    background: 'var(--cor-fundo-painel)',
                    color: 'var(--cor-texto)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => {
                    const slice = data.find((d) => d.name === value);
                    if (!slice) return value;
                    return `${value} — ${formatPct(slice.value, total)}`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </article>
  );
}
