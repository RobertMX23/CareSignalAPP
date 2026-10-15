import { Navigate, Outlet, Route, HashRouter as Router, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DemoSessionProvider, useDemoSession } from './components/DemoSessionContext';
import { ToastProvider } from './components/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import type { Role } from './domain/taxonomy';
import { DashboardPage } from './pages/DashboardPage';
import { CaregiverRoundsPage } from './pages/CaregiverRoundsPage';
import { ResidentDetailPage } from './pages/ResidentDetailPage';
import { AlertDetailPage } from './pages/AlertDetailPage';
import { DemoControlPage } from './pages/DemoControlPage';
import { BitacoraPage } from './pages/BitacoraPage';
import { PersonalPage } from './pages/PersonalPage';
import { MetricasDashboardPage } from './pages/MetricasDashboardPage';
import { RoundsPage } from './pages/RoundsPage';
import { LoginPage } from './pages/LoginPage';

function defaultRouteForRole(_role: Role): string {
  return '/dashboard';
}

// Si Firebase está configurado y el usuario no está autenticado → /login
function AuthGuard(): JSX.Element {
  const { user, loading } = useAuth();
  // Si aún está verificando la sesión, no renderizar nada
  if (loading) return <></>;
  // Si no hay usuario autenticado (Firebase configurado), ir a login
  if (user === null) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RoleGuard({ allowedRoles }: { allowedRoles: Role[] }): JSX.Element {
  const { activeStaff } = useDemoSession();
  if (!allowedRoles.includes(activeStaff.role)) {
    return <Navigate to={defaultRouteForRole(activeStaff.role)} replace />;
  }
  return <Outlet />;
}

function DefaultRedirect(): JSX.Element {
  const { activeStaff } = useDemoSession();
  return <Navigate to={defaultRouteForRole(activeStaff.role)} replace />;
}

const App = (): JSX.Element => (
  <AuthProvider>
  <DemoSessionProvider>
    <ToastProvider>
    <Router>
      <Routes>
        {/* Ruta pública de login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Todas las rutas privadas requieren autenticación Firebase */}
        <Route element={<AuthGuard />}>
          <Route element={<AppLayout />}>
            <Route index element={<DefaultRedirect />} />

            <Route element={<RoleGuard allowedRoles={['caregiver', 'supervisor', 'manager', 'demo_admin']} />}>
              <Route path="dashboard" element={<DashboardPage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={['caregiver', 'demo_admin']} />}>
              <Route path="mis-rondas" element={<CaregiverRoundsPage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={['caregiver', 'supervisor', 'manager', 'demo_admin']} />}>
              <Route path="rondas" element={<RoundsPage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={['supervisor', 'manager', 'demo_admin']} />}>
              <Route path="alertas" element={<AlertDetailPage />} />
              <Route path="alertas/:alertId" element={<AlertDetailPage />} />
              <Route path="personal" element={<PersonalPage />} />
              <Route path="metricas" element={<MetricasDashboardPage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={['caregiver', 'supervisor', 'manager', 'demo_admin']} />}>
              <Route path="residentes" element={<ResidentDetailPage />} />
              <Route path="residentes/:residentId" element={<ResidentDetailPage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={['manager', 'demo_admin']} />}>
              <Route path="bitacora" element={<BitacoraPage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={['demo_admin']} />}>
              <Route path="control-demo" element={<DemoControlPage />} />
            </Route>

            <Route path="*" element={<DefaultRedirect />} />
          </Route>
        </Route>
      </Routes>
    </Router>
    <ToastContainer />
    </ToastProvider>
  </DemoSessionProvider>
  </AuthProvider>
);

export default App;
