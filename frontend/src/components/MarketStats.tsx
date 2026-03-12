import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { fetchMarkets, fetchHistory, type MarketItem, type HistoryPoint } from '../api/client';

const PERIOD_OPTIONS = ['1mo', '3mo', '6mo', '1y'] as const;
const CHART_TICKER = 'SPY';

export function MarketStats() {
  const [markets, setMarkets] = useState<MarketItem[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [period, setPeriod] = useState<string>('6mo');
  const [loadingMarkets, setLoadingMarkets] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingMarkets(true);
    setError(null);
    fetchMarkets()
      .then((data) => { if (!cancelled) setMarkets(data); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoadingMarkets(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingHistory(true);
    fetchHistory(CHART_TICKER, period)
      .then((res) => { if (!cancelled) setHistory(res.series); })
      .catch(() => { if (!cancelled) setHistory([]); })
      .finally(() => { if (!cancelled) setLoadingHistory(false); });
    return () => { cancelled = true; };
  }, [period]);

  const chartData = history.map((p) => ({ month: p.month, close: p.close }));

  const avgChange = markets.length
    ? markets.reduce((acc, m) => acc + m.change, 0) / markets.length
    : 0;
  const volPct = history.length >= 2
    ? (Math.max(...history.map((p) => p.close)) - Math.min(...history.map((p) => p.close))) / Math.min(...history.map((p) => p.close)) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Estadísticas mercados principales</h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p === '1mo' ? '1 mes' : p === '3mo' ? '3 meses' : p === '6mo' ? '6 meses' : '1 año'}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <div className="flex gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500">Índice promedio (SPY)</p>
            <p className={`text-lg font-semibold ${avgChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {loadingMarkets ? '—' : `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Rango período</p>
            <p className="text-lg font-semibold text-amber-600">
              {loadingHistory ? '—' : `${volPct.toFixed(2)}%`}
            </p>
          </div>
        </div>
        <div className="h-56">
          {loadingHistory ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => (typeof v === 'number' ? `$${v.toFixed(0)}` : v)} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                  formatter={(value) => [typeof value === 'number' ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : value, '']}
                />
                <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} dot={false} name="Cierre" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Mercados en tiempo real</h2>
        {loadingMarkets ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {markets.map((m) => (
              <div key={m.ticker} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="font-medium text-slate-700">{m.name}</span>
                <div className="text-right">
                  <span className="font-semibold text-slate-800">{m.value}</span>
                  <span className={`ml-2 text-sm flex items-center justify-end gap-0.5 ${m.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {m.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {m.positive ? '+' : ''}{m.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
