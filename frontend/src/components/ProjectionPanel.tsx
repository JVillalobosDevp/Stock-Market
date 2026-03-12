import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend, Tooltip as PieTooltip } from 'recharts';
import { Loader2 } from 'lucide-react';
import { fetchProjection, fetchPortfolioAllocation, type ProjectionPoint, type AllocationItem } from '../api/client';

const TICKER_OPTIONS = ['AAPL', 'MSFT', 'SPY', 'QQQ', 'NVDA'];
const DAYS_OPTIONS = [14, 30, 60];

export function ProjectionPanel() {
  const [ticker, setTicker] = useState('AAPL');
  const [days, setDays] = useState(30);
  const [projection, setProjection] = useState<ProjectionPoint[]>([]);
  const [lastClose, setLastClose] = useState<number | null>(null);
  const [allocation, setAllocation] = useState<AllocationItem[]>([]);
  const [loadingProj, setLoadingProj] = useState(true);
  const [loadingAlloc, setLoadingAlloc] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingProj(true);
    setError(null);
    fetchProjection(ticker, days)
      .then((res) => {
        if (!cancelled) {
          setProjection(res.series);
          setLastClose(res.lastClose);
        }
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoadingProj(false); });
    return () => { cancelled = true; };
  }, [ticker, days]);

  useEffect(() => {
    let cancelled = false;
    setLoadingAlloc(true);
    fetchPortfolioAllocation()
      .then((data) => { if (!cancelled) setAllocation(data); })
      .finally(() => { if (!cancelled) setLoadingAlloc(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Proyección de inversión (activo/mercado)</h2>
          <div className="flex gap-2">
            <select
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-slate-50"
            >
              {TICKER_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-slate-50"
            >
              {DAYS_OPTIONS.map((d) => (
                <option key={d} value={d}>{d} días</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-2">
          Proyección en base a datos estadísticos del activo seleccionado.
        </p>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <div className="h-64">
          {loadingProj ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : projection.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => (typeof v === 'number' ? `$${v.toFixed(0)}` : v)} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                  formatter={(value) => [typeof value === 'number' ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : value, 'Valor']}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                {lastClose != null && (
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Proyección" />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Distribución del portafolio</h2>
        {loadingAlloc ? (
          <div className="h-52 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
        ) : allocation.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-slate-500 text-sm">Sin datos</div>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {allocation.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <PieTooltip formatter={(value) => [typeof value === 'number' ? `${value}%` : value, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
