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

1. **Backend API** (datos reales vía yfinance). Abre una terminal y entra a la carpeta del proyecto, luego ejecuta **solo una** de estas opciones:

```bash
cd Stock-Market
pip install -r api/requirements.txt
uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

**En Windows**, desde la carpeta `Stock-Market` puedes usar en su lugar:
```bash
.\start-api.bat
```
(El punto y barra son necesarios en PowerShell para ejecutar un script en el directorio actual.)

2. **Frontend**. En **otra** terminal:

```bash
cd frontend
npm install
npm run dev
```

3. Abre **http://localhost:5173**. El frontend hace proxy de `/api` al backend en el puerto 8000.

Cada apartado del menú es clicable: Dashboard, Mercados, Proyecciones, Simulador, Sentiment, Notificaciones, Oportunidades IA, Configuración. Las gráficas y listados usan datos reales de la API.

### Build

```bash
cd frontend
npm run build
npm run preview   # opcional: previsualizar build
```