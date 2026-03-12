import { Bell, Send, CheckCircle } from 'lucide-react';

const notifications = [
  { id: 1, title: 'Fed mantiene tasas; mensaje más hawkish', source: 'Reuters', time: 'Hace 2 h', read: false, type: 'news' },
  { id: 2, title: 'Apple anuncia evento productivo para mayo', source: 'Bloomberg', time: 'Hace 5 h', read: true, type: 'news' },
  { id: 3, title: 'Oportunidad: sector energético con momentum alcista', source: 'IA Oportunidades', time: 'Ayer', read: false, type: 'opportunity' },
];

export function TelegramNotifications() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800">Notificaciones por Telegram</h2>
        <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Ver todas →
        </a>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Noticias importantes del mercado y alertas configuradas. Conecta tu cuenta en Configuración.
      </p>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
              n.read ? 'bg-slate-50/50 border-slate-100' : 'bg-primary-50/30 border-primary-100'
            }`}
          >
            <div className={`mt-0.5 ${n.type === 'opportunity' ? 'text-amber-500' : 'text-primary-500'}`}>
              {n.type === 'opportunity' ? <Send className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${n.read ? 'text-slate-600' : 'text-slate-800'}`}>{n.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{n.source} · {n.time}</p>
            </div>
            {!n.read && (
              <span className="shrink-0 w-2 h-2 rounded-full bg-primary-500 mt-1.5" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <CheckCircle className="w-4 h-4 text-emerald-500" />
        Telegram conectado. Recibiendo noticias y oportunidades.
      </div>
    </div>
  );
}
