import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Loader2 } from 'lucide-react';
import { fetchQuote } from '../api/client';

const BANNER_TICKER = 'AAPL';

export function Banner() {
  const [quote, setQuote] = useState<{ price: number; change: number; changePercent: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchQuote(BANNER_TICKER)
      .then((q) => {
        if (!cancelled) setQuote(q);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="rounded-xl bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 p-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white border border-primary-100 flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
          ) : (
            <TrendingUp className="w-5 h-5 text-primary-600" />
          )}
        </div>
        <div>
          {loading && !quote && (
            <p className="text-sm font-semibold text-slate-600">Cargando {BANNER_TICKER}…</p>
          )}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {quote && !error && (
            <>
              <p className="text-sm font-semibold text-slate-800">{BANNER_TICKER} · ${quote.price.toFixed(2)}</p>
              <p className={`text-xs font-medium ${quote.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)} ({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(1)}%) hoy
              </p>
            </>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-slate-700">Tu cuenta no es solo para ahorrar</p>
        <p className="text-xs text-slate-500">Empieza a invertir desde tu balance en los mercados que siguen.</p>
      </div>
      <Link
        to="/proyecciones"
        className="shrink-0 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
      >
        Ver proyección →
      </Link>
    </div>
  );
}
