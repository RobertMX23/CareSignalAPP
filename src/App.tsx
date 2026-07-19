import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DemoSessionProvider } from './components/DemoSessionContext';
import { SupervisorDashboardPage } from './pages/SupervisorDashboardPage';
import { CaregiverRoundsPage } from './pages/CaregiverRoundsPage';
import { ResidentDetailPage } from './pages/ResidentDetailPage';
import { AlertDetailPage } from './pages/AlertDetailPage';
import { DemoControlPage } from './pages/DemoControlPage';

const App = (): JSX.Element => (
  <DemoSessionProvider>
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<SupervisorDashboardPage />} />
          <Route path="mis-rondas" element={<CaregiverRoundsPage />} />
          <Route path="residentes" element={<ResidentDetailPage />} />
          <Route path="residentes/:residentId" element={<ResidentDetailPage />} />
          <Route path="alertas" element={<AlertDetailPage />} />
          <Route path="alertas/:alertId" element={<AlertDetailPage />} />
          <Route path="control-demo" element={<DemoControlPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  </DemoSessionProvider>
);

export default App;
