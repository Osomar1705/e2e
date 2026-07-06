import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTripById, completeTrip } from '../api/trips';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import type { Trip } from '../types';
import { getApiError } from '../utils/apiError';

export default function TripDetailDriver() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTrip = useCallback(async () => {
    try {
      const res = await getTripById(Number(id));
      setTrip(res.data);
      setLoadError('');
      if (res.data.status === 'COMPLETED') {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch (err: unknown) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setLoadError(getApiError(err, 'No se pudo cargar el viaje'));
      setTrip(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setLoadError('');
    fetchTrip();
    intervalRef.current = setInterval(fetchTrip, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchTrip]);

  const handleComplete = async () => {
    setCompleting(true);
    setError('');
    try {
      const res = await completeTrip(Number(id));
      setTrip(res.data);
      setCompleted(true);
      await refreshUser();
      if (intervalRef.current) clearInterval(intervalRef.current);
    } catch (err: unknown) {
      setError(getApiError(err, 'Error al completar viaje'));
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page"><p>Cargando viaje...</p></div>
      </>
    );
  }

  if (loadError || !trip) {
    return (
      <>
        <Navbar />
        <div className="page">
          <button className="back-btn" onClick={() => navigate('/driver')}>← Volver</button>
          <div className="error-box">{loadError || 'Viaje no encontrado'}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <button className="back-btn" onClick={() => navigate('/driver')}>← Volver</button>
        <div className="detail-card">
          <div className="detail-header">
            <h2>Viaje #{trip.id}</h2>
            <StatusBadge status={trip.status} />
          </div>

          {completed && (
            <div className="success-box">
              ¡Viaje completado! Vuelves a estar disponible.
            </div>
          )}

          {error && <div className="error-box">{error}</div>}

          <div className="detail-section">
            <h3>Ruta</h3>
            <p><span className="label">Origen:</span> {trip.pickupAddress}</p>
            <p><span className="label">Destino:</span> {trip.dropoffAddress}</p>
          </div>

          <div className="detail-section">
            <h3>Pasajero</h3>
            <p className="driver-big-name">{trip.passenger.firstName} {trip.passenger.lastName}</p>
            <p>{trip.passenger.email}</p>
          </div>

          <div className="detail-section">
            <h3>Tiempos</h3>
            <p><span className="label">Solicitado:</span> {new Date(trip.requestedAt).toLocaleString('es-PE')}</p>
            {trip.acceptedAt && (
              <p><span className="label">Aceptado:</span> {new Date(trip.acceptedAt).toLocaleString('es-PE')}</p>
            )}
            {trip.completedAt && (
              <p><span className="label">Completado:</span> {new Date(trip.completedAt).toLocaleString('es-PE')}</p>
            )}
          </div>

          {trip.status === 'IN_PROGRESS' && !completed && (
            <button
              className="btn btn-success btn-large"
              onClick={handleComplete}
              disabled={completing}
            >
              {completing ? 'Completando...' : '✓ Completar viaje'}
            </button>
          )}

          {completed && (
            <div className="summary-box">
              <h3>Resumen del viaje</h3>
              <p><span className="label">Origen:</span> {trip.pickupAddress}</p>
              <p><span className="label">Destino:</span> {trip.dropoffAddress}</p>
              <p><span className="label">Pasajero:</span> {trip.passenger.firstName} {trip.passenger.lastName}</p>
              <p><span className="label">Completado a las:</span> {trip.completedAt ? new Date(trip.completedAt).toLocaleTimeString('es-PE') : '-'}</p>
              <button className="btn btn-primary" onClick={() => navigate('/driver')}>
                Volver al dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
