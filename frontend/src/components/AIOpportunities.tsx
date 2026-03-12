import { Sparkles, TrendingUp } from 'lucide-react';

const opportunities = [
  { asset: 'Sector energético', reason: 'Alineado con tu perfil de valor y dividendos', match: 92 },
  { asset: 'Bonos corto plazo', reason: 'Fed podría recortar en 2H; cobertura de tasas', match: 88 },
  { asset: 'ETF tecnología Asia', reason: 'Diversificación que comentaste en preferencias', match: 85 },
];

export function AIOpportunities() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-accent-purple" />
        <h2 className="font-semibold text-slate-800">Oportunidades de inversión (IA)</h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Módulo de IA que entiende tus intereses de inversión y envía notificaciones por Telegram con oportunidades.
      </p>
      <div className="space-y-3">
        {opportunities.map((o) => (
          <div key={o.asset} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-primary-200 hover:bg-primary-50/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-purple/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-accent-purple" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{o.asset}</p>
                <p className="text-sm text-slate-500 mt-0.5">{o.reason}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                {o.match}% match
              </span>
            </div>
          </div>
        ))}
      </div>
      <a href="#" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
        Configurar preferencias de IA →
      </a>
    </div>
  );
}
