import { useEffect, useState, useRef } from 'react';
import { Settings, Bell, Link2, Send, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { fetchTelegramStatus, sendTelegramTest, type TelegramStatus } from '../api/client';

const BOT_LINK = 'https://t.me/stockflow_notibot';
const POLL_INTERVAL_MS = 3000;

export function ConfiguracionPage() {
  const [telegram, setTelegram] = useState<TelegramStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStatus = () => {
    fetchTelegramStatus()
      .then(setTelegram)
      .catch((e) => setStatusError(e.message));
  };

  useEffect(() => {
    setLoadingStatus(true);
    setStatusError(null);
    loadStatus();
    setLoadingStatus(false);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Cuando el bot está configurado, hacemos polling para detectar si el usuario ya pulsó Start
  useEffect(() => {
    if (!telegram?.configured) return;
    pollRef.current = setInterval(loadStatus, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [telegram?.configured]);

  const handleTest = async () => {
    setSendingTest(true);
    setTestMsg(null);
    try {
      const res = await sendTelegramTest();
      setTestMsg({
        ok: res.ok,
        text: res.sent_to != null
          ? `Enviado a ${res.sent_to} chat(s). Revisa Telegram.`
          : res.ok
            ? 'Enviado. Revisa Telegram.'
            : 'No hay chats conectados. Abre el bot y pulsa Start.',
      });
      if (res.ok) loadStatus();
    } catch (e) {
      setTestMsg({ ok: false, text: e instanceof Error ? e.message : 'Error al enviar' });
    } finally {
      setSendingTest(false);
    }
  };

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

        {loadingStatus && <p className="text-sm text-slate-500">Comprobando estado del bot…</p>}
        {statusError && (
          <p className="text-sm text-amber-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {statusError}
          </p>
        )}

        {!loadingStatus && telegram && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {telegram.configured ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm text-slate-700">
                    Bot configurado
                    {telegram.bot_username && ` (@${telegram.bot_username})`}
                    {(telegram.chats_registered ?? 0) > 0 && (
                      <> · <strong>{telegram.chats_registered} conectado(s)</strong></>
                    )}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="text-sm text-slate-700">{telegram.message || 'Token no configurado'}</span>
                </>
              )}
            </div>
            {telegram.error && <p className="text-sm text-red-600">{telegram.error}</p>}

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={telegram.bot_link || BOT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0088cc] text-white text-sm font-medium hover:opacity-90"
              >
                Abrir bot en Telegram
                <ExternalLink className="w-4 h-4" />
              </a>
              <span className="text-slate-500 text-sm">t.me/stockflow_notibot</span>
            </div>

            {telegram.configured && (
              <>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Conectar en 2 pasos (sin pegar ningún ID):</p>
                  <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                    <li>Haz clic en <strong>«Abrir bot en Telegram»</strong> (arriba).</li>
                    <li>En Telegram, pulsa <strong>Start</strong> o escribe <strong>/start</strong>.</li>
                  </ol>
                  <p className="text-sm text-slate-500 mt-2">
                    El bot te responderá «Conectado a StockFlow» y a partir de entonces recibirás las notificaciones. Esta página se actualiza sola al detectar la conexión.
                  </p>
                </div>
                <div>
                  <button
                    onClick={handleTest}
                    disabled={sendingTest}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Enviar notificación de prueba
                  </button>
                  {testMsg && (
                    <p className={`mt-2 text-sm ${testMsg.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                      {testMsg.text}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
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
