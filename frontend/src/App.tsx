import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { MercadosPage } from './pages/MercadosPage';
import { ProyeccionesPage } from './pages/ProyeccionesPage';
import { SimuladorPage } from './pages/SimuladorPage';
import { SentimentPage } from './pages/SentimentPage';
import { NotificacionesPage } from './pages/NotificacionesPage';
import { OportunidadesPage } from './pages/OportunidadesPage';
import { ConfiguracionPage } from './pages/ConfiguracionPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="mercados" element={<MercadosPage />} />
          <Route path="proyecciones" element={<ProyeccionesPage />} />
          <Route path="simulador" element={<SimuladorPage />} />
          <Route path="sentiment" element={<SentimentPage />} />
          <Route path="notificaciones" element={<NotificacionesPage />} />
          <Route path="oportunidades" element={<OportunidadesPage />} />
          <Route path="configuracion" element={<ConfiguracionPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
