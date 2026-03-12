import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  MessageSquare,
  Bell,
  Sparkles,
  Settings,
  Send,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: BarChart3, label: 'Mercados', to: '/mercados' },
  { icon: TrendingUp, label: 'Proyecciones', to: '/proyecciones' },
  { icon: MessageSquare, label: 'Simulador', to: '/simulador' },
  { icon: Send, label: 'Sentiment', to: '/sentiment' },
  { icon: Bell, label: 'Notificaciones', to: '/notificaciones' },
  { icon: Sparkles, label: 'Oportunidades IA', to: '/oportunidades' },
  { icon: Settings, label: 'Configuración', to: '/configuracion' },
];

export function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-5 border-b border-slate-100">
        <NavLink to="/dashboard" className="flex items-center gap-2 no-underline text-inherit">
          <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-800">StockFlow</h1>
            <p className="text-xs text-slate-500">Tu compañero de mercados</p>
          </div>
        </NavLink>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
            U
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800 truncate">Usuario</p>
            <p className="text-xs text-slate-500 truncate">usuario@email.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
