import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { fetchSentiment, type SentimentItem } from '../api/client';

const sources = [
  { name: 'Reddit', color: '#ff4500' },
  { name: 'X (Twitter)', color: '#1da1f2' },
  { name: 'Telegram', color: '#0088cc' },
  { name: 'Noticias ES/EN', color: '#10b981' },
  { name: 'Google Trends', color: '#8b5cf6' },
];

export function SentimentScore() {
  const [data, setData] = useState<SentimentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSentiment()
      .then((list) => { if (!cancelled) setData(list); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const chartData = data.map((a) => ({
    asset: a.asset,
    score: a.score,
    fill: a.score >= 65 ? '#10b981' : a.score >= 45 ? '#f59e0b' : '#ef4444',
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
      <h2 className="font-semibold text-slate-800 mb-1">Sentiment score en tiempo real</h2>
      <p className="text-sm text-slate-500 mb-4">
        Índice de sentimiento por activo desde Reddit, X, Telegram, noticias en español/inglés y señales de Google Trends.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {sources.map(({ name, color }) => (
          <span key={name} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {name}
          </span>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <div className="h-48">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">Sin datos</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis type="category" dataKey="asset" tick={{ fontSize: 12 }} width={40} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(value) => [value ?? '—', 'Sentimiento']}
                labelFormatter={(label) => `Activo: ${label}`}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} name="Índice" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {data.map((a) => (
          <div key={a.asset} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
            <span className="font-medium text-slate-700">{a.asset}</span>
            <span className={`font-semibold ${a.score >= 65 ? 'text-emerald-600' : a.score >= 45 ? 'text-amber-600' : 'text-red-600'}`}>
              {a.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
