import { Navigate, Outlet, Route, HashRouter as Router, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DemoSessionProvider, useDemoSession } from './components/DemoSessionContext';
import type { Role } from './domain/taxonomy';
import { SupervisorDashboardPage } from './pages/SupervisorDashboardPage';
import { CaregiverRoundsPage } from './pages/CaregiverRoundsPage';
import { ResidentDetailPage } from './pages/ResidentDetailPage';
import { AlertDetailPage } from './pages/AlertDetailPage';
import { DemoControlPage } from './pages/DemoControlPage';
import { ManagerDashboardPage } from './pages/ManagerDashboardPage';
import { BitacoraPage } from './pages/BitacoraPage';
import { PersonalPage } from './pages/PersonalPage';

function defaultRouteForRole(role: Role): string {
  switch (role) {
    case 'caregiver':  return '/mis-rondas';
    case 'supervisor': return '/dashboard';
    case 'manager':    return '/dashboard';
    case 'demo_admin': return '/dashboard';
  }
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
  <DemoSessionProvider>
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DefaultRedirect />} />

          <Route element={<RoleGuard allowedRoles={['caregiver', 'demo_admin']} />}>
            <Route path="mis-rondas" element={<CaregiverRoundsPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={['supervisor', 'manager', 'demo_admin']} />}>
            <Route path="dashboard" element={<SupervisorDashboardPage />} />
            <Route path="alertas" element={<AlertDetailPage />} />
            <Route path="alertas/:alertId" element={<AlertDetailPage />} />
            <Route path="personal" element={<PersonalPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={['caregiver', 'supervisor', 'manager', 'demo_admin']} />}>
            <Route path="residentes" element={<ResidentDetailPage />} />
            <Route path="residentes/:residentId" element={<ResidentDetailPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={['manager', 'demo_admin']} />}>
            <Route path="manager" element={<ManagerDashboardPage />} />
            <Route path="bitacora" element={<BitacoraPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={['demo_admin']} />}>
            <Route path="control-demo" element={<DemoControlPage />} />
          </Route>

          <Route path="*" element={<DefaultRedirect />} />
        </Route>
      </Routes>
    </Router>
  </DemoSessionProvider>
);

export default App;
