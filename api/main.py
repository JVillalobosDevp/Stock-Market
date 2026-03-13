"""
API para el dashboard StockFlow. Sirve datos reales de mercados vía yfinance.
"""
import json
import os
from datetime import datetime, timedelta
from pathlib import Path

import yfinance as yf
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

# #region agent log
_LOG_PATH = Path(__file__).resolve().parent.parent / "debug-604f20.log"

def _dbg(msg: str, data: dict, hypothesis_id: str) -> None:
    try:
        with open(_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(
                json.dumps(
                    {
                        "message": msg,
                        "data": data,
                        "hypothesisId": hypothesis_id,
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                    },
                    ensure_ascii=False,
                )
                + "\n"
            )
    except Exception:  # noqa: S110
        pass
# #endregion

app = FastAPI(title="StockFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tickers principales para el dashboard
MARKET_TICKERS = {
    "S&P 500": "SPY",
    "NASDAQ": "QQQ",
    "DXY (Dólar)": "DX-Y.NYB",
    "BTC/USD": "BTC-USD",
    "Oro": "GLD",
}


def _parse_quote(ticker: str, name: str) -> dict:
    """Obtiene precio actual y cambio % de un ticker."""
    try:
        obj = yf.Ticker(ticker)
        hist = obj.history(period="5d")
        if hist.empty or len(hist) < 2:
            info = obj.info
            price = info.get("regularMarketPrice") or info.get("previousClose") or 0
            return {"name": name, "ticker": ticker, "value": f"{price:.2f}", "change": 0, "positive": True}
        last = hist["Close"].iloc[-1]
        prev = hist["Close"].iloc[-2]
        pct = ((last - prev) / prev * 100) if prev else 0
        if "DX" in ticker or "GLD" in ticker:
            val_str = f"{last:.2f}"
        elif "BTC" in ticker:
            val_str = f"{last:,.0f}"
        else:
            val_str = f"{last:,.2f}"
        return {
            "name": name,
            "ticker": ticker,
            "value": val_str,
            "change": round(pct, 2),
            "positive": pct >= 0,
        }
    except Exception as e:
        return {"name": name, "ticker": ticker, "value": "—", "change": 0, "positive": True, "error": str(e)}


@app.on_event("startup")
def _on_startup():
    _dbg("backend_started", {"port": 8000}, "H1")

@app.get("/api/markets")
def get_markets():
    """Lista de mercados principales con precio y cambio %."""
    _dbg("route_entered", {"endpoint": "/api/markets"}, "H1")
    return [ _parse_quote(symbol, name) for name, symbol in MARKET_TICKERS.items() ]


@app.get("/api/history")
def get_history(
    ticker: str = Query("SPY", description="Símbolo del activo"),
    period: str = Query("6mo", description="1mo, 3mo, 6mo, 1y, 2y"),
):
    """Datos históricos para gráficos (OHLC)."""
    _dbg("route_entered", {"endpoint": "/api/history", "ticker": ticker}, "H3")
    try:
        obj = yf.Ticker(ticker)
        df = obj.history(period=period)
        if df.empty or len(df) < 2:
            raise HTTPException(status_code=404, detail="Sin datos para este ticker/periodo")
        df = df.reset_index()
        df["Date"] = df["Date"].dt.strftime("%Y-%m-%d")
        # Para gráficos genéricos: mes corto y Close
        series = []
        for _, row in df.iterrows():
            d = row["Date"]
            month_short = datetime.strptime(d[:10], "%Y-%m-%d").strftime("%b")
            series.append({
                "date": d,
                "month": month_short,
                "close": round(float(row["Close"]), 2),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
            })
        return {"ticker": ticker, "series": series}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projection")
def get_projection(
    ticker: str = Query("AAPL", description="Símbolo del activo"),
    days: int = Query(30, ge=5, le=90),
):
    """Proyección basada en datos recientes (media móvil + tendencia simple)."""
    try:
        obj = yf.Ticker(ticker)
        df = obj.history(period="3mo")
        if df.empty or len(df) < 20:
            raise HTTPException(status_code=404, detail="Datos insuficientes para proyección")
        df = df[["Close"]].copy()
        df["ma5"] = df["Close"].rolling(5).mean()
        df["ma20"] = df["Close"].rolling(20).mean()
        df = df.dropna()
        last_close = float(df["Close"].iloc[-1])
        # Proyección simple: últimos 10 días de rendimiento medio diario
        returns = df["Close"].pct_change().dropna().tail(10)
        daily_drift = float(returns.mean()) if len(returns) else 0
        series = []
        start = df.index[-1]
        for i in range(min(days, 60)):
            d = start + timedelta(days=i)
            if i == 0:
                val = last_close
            else:
                val = last_close * ((1 + daily_drift) ** i)
            series.append({
                "date": d.strftime("%Y-%m-%d"),
                "label": d.strftime("%d %b"),
                "value": round(val, 2),
            })
        return {"ticker": ticker, "series": series, "lastClose": last_close}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/quote/{ticker}")
def get_quote(ticker: str):
    """Precio actual y cambio de un ticker (para banner)."""
    try:
        obj = yf.Ticker(ticker)
        hist = obj.history(period="5d")
        if hist.empty or len(hist) < 2:
            info = obj.info
            price = info.get("regularMarketPrice") or info.get("previousClose") or 0
            return {"ticker": ticker, "price": price, "change": 0, "changePercent": 0}
        last = hist["Close"].iloc[-1]
        prev = hist["Close"].iloc[-2]
        ch = last - prev
        pct = (ch / prev * 100) if prev else 0
        return {
            "ticker": ticker,
            "price": round(last, 2),
            "change": round(ch, 2),
            "changePercent": round(pct, 2),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/portfolio-allocation")
def get_portfolio_allocation():
    """Distribución ejemplo de portafolio (puede venir de BD después)."""
    _dbg("route_entered", {"endpoint": "/api/portfolio-allocation"}, "H2")
    return [
        {"name": "Equities", "value": 45, "color": "#3b82f6"},
        {"name": "Bonos", "value": 25, "color": "#10b981"},
        {"name": "Commodities", "value": 15, "color": "#f59e0b"},
        {"name": "ETFs", "value": 10, "color": "#8b5cf6"},
        {"name": "Otros", "value": 5, "color": "#64748b"},
    ]


@app.get("/api/sentiment")
def get_sentiment():
    """Placeholder: índice de sentimiento por activo (mock; luego integrar Reddit/X/Telegram/News/Trends)."""
    tickers = ["AAPL", "MSFT", "NVDA", "BTC-USD", "SPY"]
    import random
    random.seed(42)
    return [
        {
            "asset": t if t != "BTC-USD" else "BTC",
            "score": min(95, max(40, 50 + random.randint(-5, 25))),
            "sources": {"reddit": 65, "twitter": 70, "telegram": 68, "news": 72, "trends": 65},
        }
        for t in tickers
    ]


# ----- Telegram -----
import threading
import time
from api.telegram_client import (
    get_me,
    send_message,
    register_chat_id,
    get_registered_chats,
    send_to_all,
    get_updates,
    process_updates,
    _load_last_update_id,
    _save_last_update_id,
)


def _build_news_message() -> str:
    """Construye un mensaje de noticia con datos de mercados (para envío periódico)."""
    now = datetime.now().strftime("%H:%M")
    lines = [f"📊 <b>StockFlow</b> · {now}"]
    try:
        for name, symbol in list(MARKET_TICKERS.items())[:4]:  # SPY, QQQ, DXY, BTC
            q = _parse_quote(symbol, name)
            sign = "+" if q["positive"] else ""
            lines.append(f"• {name}: {q['value']} ({sign}{q['change']}%)")
    except Exception:
        lines.append("• Mercados: datos no disponibles")
    return "\n".join(lines)


def _telegram_news_loop() -> None:
    """En segundo plano: envía una noticia cada 1 minuto a todos los chats registrados."""
    while True:
        try:
            time.sleep(60)
            if not os.environ.get("TELEGRAM_BOT_TOKEN"):
                continue
            chats = get_registered_chats()
            if not chats:
                continue
            msg = _build_news_message()
            send_to_all(msg)
        except Exception:
            pass


def _telegram_polling_loop() -> None:
    """En segundo plano: recibe /start en el bot y registra el chat_id automáticamente."""
    while True:
        try:
            if not os.environ.get("TELEGRAM_BOT_TOKEN"):
                time.sleep(5)
                continue
            offset = _load_last_update_id()
            r = get_updates(offset=offset if offset > 0 else None)
            if not r.get("ok"):
                time.sleep(5)
                continue
            results = r.get("result", [])
            for u in results:
                offset = u.get("update_id", 0) + 1
                _save_last_update_id(offset)
            process_updates(r)
            if not results:
                time.sleep(2)
            else:
                time.sleep(0.5)
        except Exception:
            time.sleep(5)


@app.on_event("startup")
def _start_telegram_polling():
    if os.environ.get("TELEGRAM_BOT_TOKEN"):
        threading.Thread(target=_telegram_polling_loop, daemon=True).start()
        threading.Thread(target=_telegram_news_loop, daemon=True).start()


@app.get("/api/telegram/status")
def telegram_status():
    """Estado del bot: si hay token configurado y datos del bot."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        return {
            "configured": False,
            "bot_username": None,
            "bot_link": "https://t.me/stockflow_notibot",
            "message": "Configura TELEGRAM_BOT_TOKEN en el archivo .env",
        }
    r = get_me()
    if not r.get("ok"):
        return {
            "configured": True,
            "bot_username": None,
            "bot_link": "https://t.me/stockflow_notibot",
            "error": r.get("description") or r.get("error"),
        }
    username = (r.get("result") or {}).get("username", "")
    return {
        "configured": True,
        "bot_username": username,
        "bot_link": f"https://t.me/{username}" if username else "https://t.me/stockflow_notibot",
        "chats_registered": len(get_registered_chats()),
    }


@app.post("/api/telegram/register")
def telegram_register(body: dict = Body(...)):
    """Registra tu Chat ID para recibir notificaciones. Obtén tu ID con @userinfobot en Telegram."""
    chat_id = body.get("chat_id")
    if chat_id is None:
        raise HTTPException(status_code=400, detail="Falta chat_id")
    try:
        chat_id = int(chat_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="chat_id debe ser un número")
    register_chat_id(chat_id)
    return {"ok": True, "chat_id": chat_id, "total_chats": len(get_registered_chats())}


@app.post("/api/telegram/test")
def telegram_test(body: dict = Body(...)):
    """Envía un mensaje de prueba. Si pasas chat_id lo envía solo a ese; si no, a todos los registrados."""
    chat_id = body.get("chat_id")
    message = body.get("message") or "✅ StockFlow: notificación de prueba. El bot está conectado."
    if chat_id is not None:
        try:
            cid = int(chat_id)
            r = send_message(cid, message)
            return {"ok": r.get("ok", False), "chat_id": cid, "result": r}
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail="chat_id debe ser un número")
    # Enviar a todos los registrados
    results = send_to_all(message)
    return {"ok": True, "sent_to": len(results), "results": results}


@app.get("/health")
def health():
    return {"status": "ok"}
