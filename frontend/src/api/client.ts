const BASE = '';

/** Mensaje cuando el proxy devuelve 502: el backend no está corriendo en el puerto 8000. */
export const API_NOT_RUNNING_MSG =
  'El servidor API no está en marcha (502). En una terminal, desde la raíz del proyecto ejecuta: uvicorn api.main:app --reload --host 127.0.0.1 --port 8000';

function _apiError(status: number, defaultMsg: string): string {
  if (status === 502) return API_NOT_RUNNING_MSG;
  return defaultMsg;
}

// #region agent log
function _log(msg: string, data: Record<string, unknown>, hypothesisId: string) {
  fetch('http://127.0.0.1:7303/ingest/da5a0c41-e981-496c-959d-66765c6ec8db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '604f20' },
    body: JSON.stringify({ sessionId: '604f20', location: 'client.ts', message: msg, data, timestamp: Date.now(), hypothesisId }),
  }).catch(() => {});
}
// #endregion

export type MarketItem = {
  name: string;
  ticker: string;
  value: string;
  change: number;
  positive: boolean;
  error?: string;
};

export async function fetchMarkets(): Promise<MarketItem[]> {
  const url = `${BASE}/api/markets`;
  _log('fetch start', { url }, 'H1');
  const r = await fetch(url);
  _log('fetch response', { url, status: r.status, statusText: r.statusText, ok: r.ok }, 'H1');
  if (!r.ok) throw new Error(_apiError(r.status, 'Error al cargar mercados'));
  return r.json();
}

export type HistoryPoint = {
  date: string;
  month: string;
  close: number;
  open?: number;
  high?: number;
  low?: number;
};

export async function fetchHistory(
  ticker: string = 'SPY',
  period: string = '6mo'
): Promise<{ ticker: string; series: HistoryPoint[] }> {
  const url = `${BASE}/api/history?ticker=${encodeURIComponent(ticker)}&period=${encodeURIComponent(period)}`;
  _log('fetch start', { url }, 'H3');
  const r = await fetch(url);
  _log('fetch response', { url, status: r.status, ok: r.ok }, 'H3');
  if (!r.ok) throw new Error(_apiError(r.status, 'Error al cargar histórico'));
  return r.json();
}

export type ProjectionPoint = {
  date: string;
  label: string;
  value: number;
};

export async function fetchProjection(
  ticker: string = 'AAPL',
  days: number = 30
): Promise<{ ticker: string; series: ProjectionPoint[]; lastClose: number }> {
  const r = await fetch(`${BASE}/api/projection?ticker=${encodeURIComponent(ticker)}&days=${days}`);
  if (!r.ok) throw new Error(_apiError(r.status, 'Error al cargar proyección'));
  return r.json();
}

export type Quote = {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
};

export async function fetchQuote(ticker: string): Promise<Quote> {
  const r = await fetch(`${BASE}/api/quote/${encodeURIComponent(ticker)}`);
  if (!r.ok) throw new Error(_apiError(r.status, 'Error al cargar cotización'));
  return r.json();
}

export type AllocationItem = { name: string; value: number; color: string };

export async function fetchPortfolioAllocation(): Promise<AllocationItem[]> {
  const url = `${BASE}/api/portfolio-allocation`;
  _log('fetch start', { url }, 'H2');
  const r = await fetch(url);
  _log('fetch response', { url, status: r.status, ok: r.ok }, 'H2');
  if (!r.ok) throw new Error(_apiError(r.status, 'Error al cargar asignación'));
  return r.json();
}

export type SentimentItem = {
  asset: string;
  score: number;
  sources?: Record<string, number>;
};

export async function fetchSentiment(): Promise<SentimentItem[]> {
  const r = await fetch(`${BASE}/api/sentiment`);
  if (!r.ok) throw new Error(_apiError(r.status, 'Error al cargar sentimiento'));
  return r.json();
}

// ----- Telegram -----
export type TelegramStatus = {
  configured: boolean;
  bot_username: string | null;
  bot_link: string;
  message?: string;
  error?: string;
  chats_registered?: number;
};

export async function fetchTelegramStatus(): Promise<TelegramStatus> {
  const r = await fetch(`${BASE}/api/telegram/status`);
  if (!r.ok) throw new Error(_apiError(r.status, 'Error al cargar estado de Telegram'));
  return r.json();
}

export async function registerTelegramChat(chatId: number): Promise<{ ok: boolean; chat_id: number; total_chats: number }> {
  const r = await fetch(`${BASE}/api/telegram/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId }),
  });
  if (!r.ok) throw new Error('Error al registrar Chat ID');
  return r.json();
}

export async function sendTelegramTest(chatId?: number, message?: string): Promise<{ ok: boolean; sent_to?: number; results?: unknown[] }> {
  const r = await fetch(`${BASE}/api/telegram/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chatId != null ? { chat_id: chatId, message } : { message }),
  });
  if (!r.ok) throw new Error('Error al enviar prueba');
  return r.json();
}
