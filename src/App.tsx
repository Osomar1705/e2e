import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import PassengerDashboard from './pages/PassengerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import RequestTrip from './pages/RequestTrip';
import TripDetailPassenger from './pages/TripDetailPassenger';
import TripDetailDriver from './pages/TripDetailDriver';
import History from './pages/History';
import type { JSX } from 'react';

function RequireAuth({ children, role }: { children: JSX.Element; role?: 'PASSENGER' | 'DRIVER' }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'DRIVER' ? '/driver' : '/passenger'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Cargando...</div>;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={user.role === 'DRIVER' ? '/driver' : '/passenger'} replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/passenger"
        element={
          <RequireAuth role="PASSENGER">
            <PassengerDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/request-trip"
        element={
          <RequireAuth role="PASSENGER">
            <RequestTrip />
          </RequireAuth>
        }
      />
      <Route
        path="/trips/:id"
        element={
          <RequireAuth role="PASSENGER">
            <TripDetailPassenger />
          </RequireAuth>
        }
      />

      <Route
        path="/driver"
        element={
          <RequireAuth role="DRIVER">
            <DriverDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/driver/trips/:id"
        element={
          <RequireAuth role="DRIVER">
            <TripDetailDriver />
          </RequireAuth>
        }
      />

      <Route
        path="/history"
        element={
          <RequireAuth>
            <History />
          </RequireAuth>
        }
      />

      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'DRIVER' ? '/driver' : '/passenger'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
