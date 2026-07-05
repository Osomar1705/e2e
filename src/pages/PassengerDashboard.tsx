import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTrips } from '../api/trips';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Navbar from '../components/Navbar';
import type { Trip } from '../types';

export default function PassengerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTrips()
      .then((res) => setTrips(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Hola, {user?.firstName} 👋</h1>
            <p className="subtitle">¿A dónde vas hoy?</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/request-trip')}>
            + Pedir viaje
          </button>
        </div>

        <h2>Mis viajes</h2>
        {loading ? (
          <p>Cargando viajes...</p>
        ) : trips.length === 0 ? (
          <div className="empty-state">
            <p>No tienes viajes todavía.</p>
            <button className="btn btn-primary" onClick={() => navigate('/request-trip')}>
              Pedir tu primer viaje
            </button>
          </div>
        ) : (
          <div className="trip-list">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="trip-card"
                onClick={() => navigate(`/trips/${trip.id}`)}
              >
                <div className="trip-card-header">
                  <StatusBadge status={trip.status} />
                  <span className="trip-date">
                    {new Date(trip.requestedAt).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="trip-addresses">
                  <p><span className="label">Origen:</span> {trip.pickupAddress}</p>
                  <p><span className="label">Destino:</span> {trip.dropoffAddress}</p>
                </div>
                {trip.driver && (
                  <p className="trip-driver">
                    Conductor: {trip.driver.firstName} {trip.driver.lastName} ⭐ {trip.driver.rating.toFixed(1)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
