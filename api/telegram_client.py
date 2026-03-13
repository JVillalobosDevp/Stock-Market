"""
Cliente para Telegram Bot API. Envía mensajes usando el token en TELEGRAM_BOT_TOKEN.
"""
import json
import os
import urllib.error
import urllib.request
from pathlib import Path

TELEGRAM_API = "https://api.telegram.org/bot{token}/{method}"

# Carpeta para guardar chat_ids suscritos (en la raíz del proyecto)
_DATA_DIR = Path(__file__).resolve().parent.parent / "data"
_CHATS_FILE = _DATA_DIR / "telegram_chats.json"
_OFFSET_FILE = _DATA_DIR / "telegram_offset.json"


def _get_token() -> str | None:
    return os.environ.get("TELEGRAM_BOT_TOKEN") or None


def _api(method: str, data: dict | None = None) -> dict:
    token = _get_token()
    if not token:
        return {"ok": False, "error": "TELEGRAM_BOT_TOKEN no configurado"}
    url = TELEGRAM_API.format(token=token, method=method)
    body = json.dumps(data).encode("utf-8") if data else b""
    req = urllib.request.Request(url, data=body or None, method="POST" if body else "GET")
    if body:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {"ok": False, "error": str(e.code), "body": e.read().decode()[:200]}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def get_me() -> dict:
    """Verifica el token y devuelve info del bot."""
    return _api("getMe")


def send_message(chat_id: int | str, text: str) -> dict:
    """Envía un mensaje a un chat_id."""
    return _api("sendMessage", {"chat_id": chat_id, "text": text, "parse_mode": "HTML"})


def _load_chats() -> list[int]:
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not _CHATS_FILE.exists():
        return []
    try:
        with open(_CHATS_FILE, encoding="utf-8") as f:
            data = json.load(f)
        return list(data.get("chat_ids", []))
    except Exception:
        return []


def _save_chats(chat_ids: list[int]) -> None:
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(_CHATS_FILE, "w", encoding="utf-8") as f:
        json.dump({"chat_ids": chat_ids}, f, indent=2)


def register_chat_id(chat_id: int) -> list[int]:
    """Registra un chat_id para recibir notificaciones. Devuelve la lista actual."""
    chats = _load_chats()
    if chat_id not in chats:
        chats.append(chat_id)
        _save_chats(chats)
    return chats


def get_registered_chats() -> list[int]:
    return _load_chats()


def _load_last_update_id() -> int:
    if not _OFFSET_FILE.exists():
        return 0
    try:
        with open(_OFFSET_FILE, encoding="utf-8") as f:
            data = json.load(f)
        return int(data.get("last_update_id", 0))
    except Exception:
        return 0


def _save_last_update_id(update_id: int) -> None:
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(_OFFSET_FILE, "w", encoding="utf-8") as f:
        json.dump({"last_update_id": update_id}, f)


def get_updates(offset: int | None = None) -> dict:
    """Obtiene updates pendientes (para long polling)."""
    payload = {"timeout": 25}
    if offset is not None:
        payload["offset"] = offset
    return _api("getUpdates", payload)


def process_updates(updates: dict) -> None:
    """
    Procesa updates: si alguien envía /start o /connect, lo registramos
    y le enviamos confirmación.
    """
    for u in updates.get("result", []):
        msg = u.get("message") or u.get("edited_message")
        if not msg:
            continue
        chat_id = msg.get("chat", {}).get("id")
        text = (msg.get("text") or "").strip().lower()
        if chat_id and text in ("/start", "/connect", "/start connect"):
            register_chat_id(chat_id)
            send_message(
                chat_id,
                "✅ <b>Conectado a StockFlow</b>\n\n"
                "Recibirás notificaciones de noticias del mercado y oportunidades de inversión.",
            )


def send_to_all(text: str) -> list[dict]:
    """Envía el mensaje a todos los chat_ids registrados. Devuelve resultados por chat."""
    results = []
    for cid in get_registered_chats():
        results.append({"chat_id": cid, "result": send_message(cid, text)})
    return results
