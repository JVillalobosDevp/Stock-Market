import { useLocation } from 'react-router-dom';
import { Search, Bell, Info } from 'lucide-react';

const titles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Resumen de mercados, proyecciones y simulador.' },
  '/mercados': { title: 'Mercados', subtitle: 'Estadísticas recientes de los principales índices y activos.' },
  '/proyecciones': { title: 'Proyecciones', subtitle: 'Proyección de inversión por activo con datos estadísticos.' },
  '/simulador': { title: 'Simulador', subtitle: 'Simula escenarios con lenguaje natural y recalcula el portafolio.' },
  '/sentiment': { title: 'Sentiment', subtitle: 'Índice de sentimiento en tiempo real por activo (Reddit, X, Telegram, noticias, Trends).' },
  '/notificaciones': { title: 'Notificaciones', subtitle: 'Noticias del mercado y alertas por Telegram.' },
  '/oportunidades': { title: 'Oportunidades IA', subtitle: 'Sugerencias según tus intereses de inversión.' },
  '/configuracion': { title: 'Configuración', subtitle: 'Preferencias y conexión Telegram.' },
};

export function Header() {
  const location = useLocation();
  const path = location.pathname || '/dashboard';
  const { title, subtitle } = titles[path] ?? titles['/dashboard'];

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-56 pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
          />
        </div>
        <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700">
          <Info className="w-5 h-5" />
        </button>
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
