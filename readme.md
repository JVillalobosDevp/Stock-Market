Stock-Market
----
Proyecto de plataforma de mercados con predicciones, proyecciones y simulador de escenarios.

## Frontend (Dashboard)

Interfaz tipo Spendly/Finova con:

- **Estadísticas de mercados principales**: S&P 500, NASDAQ, DXY, BTC, Oro y gráfico de tendencia.
- **Panel de proyección**: Proyección por activo (AAPL, MSFT, SPY) con datos estadísticos y distribución del portafolio.
- **Simulador de escenarios con lenguaje natural**: Campo para preguntas como *"¿Qué pasa si el dólar sube 15% y la Fed sube tasas en junio?"*; la IA recalcula el portafolio en tiempo real con proyecciones visuales (gráfico base vs escenario).
- **Sentiment score en tiempo real**: Índice por activo desde Reddit, X, Telegram, noticias ES/EN y Google Trends (visualización en barras y resumen por activo).
- **Notificaciones por Telegram**: Listado de noticias importantes del mercado y estado de conexión.
- **Módulo IA – Oportunidades**: Sugerencias según intereses de inversión y notificaciones vía Telegram.

### Cómo ejecutar la plataforma (datos reales)

**Necesitas tener los dos en marcha:** primero la API, luego el frontend. Si solo abres el frontend verás "502" y "Error al cargar..."; inicia la API en una terminal y recarga.

**Importante:** Todos los comandos deben ejecutarse **desde la carpeta del proyecto** (`Stock-Market`). Si tu terminal está en otra carpeta (por ejemplo `Projects`), entra primero con:

```powershell
cd C:\Users\Karoll\Desktop\Projects\Stock-Market
```

---

**1. Backend API** (datos reales vía yfinance). En una terminal, **desde la carpeta Stock-Market**:

Instalar dependencias (solo la primera vez):

```powershell
pip install -r api/requirements.txt
```

Arrancar la API (elige **una** de estas dos líneas; no escribas las dos ni la palabra "o"):

**Opción A** — Script (PowerShell, desde Stock-Market):

```powershell
.\start-api.bat
```

**Opción B** — Comando directo:

```powershell
python -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

---

**2. Frontend.** En **otra** terminal, también **desde la carpeta Stock-Market**:

```powershell
cd frontend
npm install
npm run dev
```

3. Abre **http://localhost:5173**. El frontend hace proxy de `/api` al backend en el puerto 8000.

Cada apartado del menú es clicable: Dashboard, Mercados, Proyecciones, Simulador, Sentiment, Notificaciones, Oportunidades IA, Configuración. Las gráficas y listados usan datos reales de la API.

### Telegram

El bot **@stockflow_notibot** (t.me/stockflow_notibot) envía notificaciones. Para conectarlo:

1. Crea un archivo **`.env`** en la raíz del proyecto (junto a `api/`) con:
   ```
   TELEGRAM_BOT_TOKEN=tu_token_de_BotFather
   ```
   Puedes copiar `.env.example` y pegar tu token. El archivo `.env` no se sube a git.

2. Con la API en marcha, ve a **Configuración** en el dashboard: abre el bot en Telegram, pulsa **Start** y ya quedarás conectado (no hace falta pegar ningún ID). Usa «Enviar notificación de prueba» para comprobar que recibes mensajes.

### Build

```bash
cd frontend
npm run build
npm run preview   # opcional: previsualizar build
```