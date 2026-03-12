import { Settings, Bell, Link2 } from 'lucide-react';

export function ConfiguracionPage() {
  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Conexión Telegram
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Conecta tu cuenta de Telegram para recibir notificaciones de noticias importantes y oportunidades de inversión.
        </p>
        <button className="px-4 py-2 rounded-lg bg-[#0088cc] text-white text-sm font-medium hover:opacity-90">
          Conectar Telegram
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Preferencias de notificaciones
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Elige qué alertas quieres recibir: noticias de mercados, oportunidades IA, cambios de sentimiento.
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-slate-300" />
            <span className="text-sm text-slate-700">Noticias importantes del mercado</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-slate-300" />
            <span className="text-sm text-slate-700">Oportunidades de inversión (IA)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-300" />
            <span className="text-sm text-slate-700">Cambios bruscos de sentimiento</span>
          </label>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Preferencias de IA (Oportunidades)
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Indica tu perfil de inversión para que la IA te sugiera oportunidades alineadas: valor, crecimiento, dividendos, sectores, etc.
        </p>
        <textarea
          placeholder="Ej: Inversión a largo plazo, dividendos, sector tecnológico y energético..."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200 min-h-24"
        />
      </div>
    </div>
  );
}
