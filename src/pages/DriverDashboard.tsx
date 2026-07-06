import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingTrips, getDriverTrips, acceptTrip, completeTrip } from '../api/trips';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import type { Trip } from '../types';
import { getApiError } from '../utils/apiError';

export default function DriverDashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [pendingTrips, setPendingTrips] = useState<Trip[]>([]);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [completingActive, setCompletingActive] = useState(false);
  const [error, setError] = useState('');

  const activeTrip = myTrips.find((t) => t.status === 'IN_PROGRESS');

  const loadData = async () => {
    try {
      const [pending, my] = await Promise.all([getPendingTrips(), getDriverTrips()]);
      setPendingTrips(pending.data);
      setMyTrips(my.data);
    } catch (err: unknown) {
      setError(getApiError(err, 'Error al cargar viajes'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (tripId: number) => {
    setAccepting(tripId);
    setError('');
    try {
      await acceptTrip(tripId);
      await refreshUser();
      await loadData();
      navigate(`/driver/trips/${tripId}`);
    } catch (err: unknown) {
      setError(getApiError(err, 'Error al aceptar viaje'));
      setAccepting(null);
    }
  };

  const handleCompleteActive = async () => {
    if (!activeTrip) return;
    setCompletingActive(true);
    setError('');
    try {
      await completeTrip(activeTrip.id);
      await refreshUser();
      await loadData();
    } catch (err: unknown) {
      setError(getApiError(err, 'Error al completar viaje'));
    } finally {
      setCompletingActive(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Hola, {user?.firstName} 👋</h1>
            <p className="subtitle">
              Tu rating: ⭐ {user?.rating.toFixed(1)} ·{' '}
              <span className={user?.available ? 'available' : 'busy'}>
                {user?.available ? 'Disponible' : 'Ocupado'}
              </span>
            </p>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {activeTrip && (
          <div className="active-trip-banner">
            <div>
              <h3>Viaje activo</h3>
              <p>{activeTrip.pickupAddress} → {activeTrip.dropoffAddress}</p>
              <p>Pasajero: {activeTrip.passenger.firstName} {activeTrip.passenger.lastName}</p>
            </div>
            <div className="active-trip-actions">
              <button
                className="btn btn-success"
                onClick={handleCompleteActive}
                disabled={completingActive}
              >
                {completingActive ? 'Completando...' : '✓ Completar viaje'}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate(`/driver/trips/${activeTrip.id}`)}
              >
                Ver detalle
              </button>
            </div>
          </div>
        )}

        <h2>Viajes disponibles ({pendingTrips.length})</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : pendingTrips.length === 0 ? (
          <div className="empty-state">
            <p>No hay viajes pendientes en este momento.</p>
          </div>
        ) : (
          <div className="trip-list">
            {pendingTrips.map((trip) => (
              <div key={trip.id} className="trip-card pending-card">
                <div className="trip-card-header">
                  <StatusBadge status={trip.status} />
                  <span className="trip-date">
                    {new Date(trip.requestedAt).toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="trip-addresses">
                  <p><span className="label">Origen:</span> {trip.pickupAddress}</p>
                  <p><span className="label">Destino:</span> {trip.dropoffAddress}</p>
                  <p><span className="label">Pasajero:</span> {trip.passenger.firstName} {trip.passenger.lastName}</p>
                </div>
                <div className="card-actions">
                  <button
                    className="btn btn-primary"
                    disabled={!user?.available || accepting === trip.id}
                    onClick={() => handleAccept(trip.id)}
                  >
                    {accepting === trip.id ? 'Aceptando...' : 'Aceptar viaje'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
