import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Send, Loader2 } from 'lucide-react';

const initialScenario = [
  { period: 'Hoy', portfolio: 100, scenario: 100 },
  { period: '+1m', portfolio: 102, scenario: 98 },
  { period: '+3m', portfolio: 105, scenario: 94 },
  { period: '+6m', portfolio: 108, scenario: 91 },
  { period: '+12m', portfolio: 112, scenario: 88 },
];

export function ScenarioSimulator() {
  const [query, setQuery] = useState('¿Qué pasa si el dólar sube 15% y la Fed sube tasas en junio?');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(initialScenario);

  const handleSimulate = () => {
    setLoading(true);
    setTimeout(() => {
      setData([
        { period: 'Hoy', portfolio: 100, scenario: 100 },
        { period: '+1m', portfolio: 102, scenario: 96 },
        { period: '+3m', portfolio: 105, scenario: 90 },
        { period: '+6m', portfolio: 108, scenario: 85 },
        { period: '+12m', portfolio: 112, scenario: 82 },
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
      <h2 className="font-semibold text-slate-800 mb-2">Simulador de escenarios con lenguaje natural</h2>
      <p className="text-sm text-slate-500 mb-4">
        Escribe un escenario y la IA recalcula el portafolio en tiempo real con proyecciones visuales.
      </p>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Ej: "¿qué pasa si el dólar sube 15% y la Fed sube tasas en junio?"'
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
        />
        <button
          onClick={handleSimulate}
          disabled={loading}
          className="px-4 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-60 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Simular
        </button>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={(value) => [typeof value === 'number' ? `${value}%` : value, '']}
            />
            <Line type="monotone" dataKey="portfolio" stroke="#10b981" strokeWidth={2} name="Portafolio base" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="scenario" stroke="#f59e0b" strokeWidth={2} name="Escenario simulado" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Escenario: dólar +15%, Fed sube tasas en junio → proyección ajustada a la baja en activos en USD.
      </p>
    </div>
  );
}
