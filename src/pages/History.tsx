import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTrips, getDriverTrips } from '../api/trips';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import type { Trip, TripStatus } from '../types';

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TripStatus | 'ALL'>('ALL');

  useEffect(() => {
    const fetcher = user?.role === 'DRIVER' ? getDriverTrips : getMyTrips;
    fetcher()
      .then((res) => setTrips(res.data))
      .finally(() => setLoading(false));
  }, [user?.role]);

  const filtered = filter === 'ALL' ? trips : trips.filter((t) => t.status === filter);

  const detailPath = (id: number) =>
    user?.role === 'DRIVER' ? `/driver/trips/${id}` : `/trips/${id}`;

  return (
    <>
      <Navbar />
      <div className="page">
        <h1>Historial de viajes</h1>

        <div className="filter-bar">
          {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL' ? 'Todos' : f === 'PENDING' ? 'Pendiente' : f === 'IN_PROGRESS' ? 'En curso' : 'Completado'}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Cargando historial...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No hay viajes{filter !== 'ALL' ? ` con estado "${filter}"` : ''}.</p>
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Estado</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>{user?.role === 'DRIVER' ? 'Pasajero' : 'Conductor'}</th>
                <th>Fecha</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trip) => (
                <tr
                  key={trip.id}
                  className="history-row"
                  onClick={() => navigate(detailPath(trip.id))}
                >
                  <td>{trip.id}</td>
                  <td><StatusBadge status={trip.status} /></td>
                  <td className="address-cell">{trip.pickupAddress}</td>
                  <td className="address-cell">{trip.dropoffAddress}</td>
                  <td>
                    {user?.role === 'DRIVER'
                      ? `${trip.passenger.firstName} ${trip.passenger.lastName}`
                      : trip.driver
                        ? `${trip.driver.firstName} ${trip.driver.lastName}`
                        : '—'}
                  </td>
                  <td>{new Date(trip.requestedAt).toLocaleDateString('es-PE')}</td>
                  <td>
                    {trip.passengerRating !== null
                      ? `${'⭐'.repeat(trip.passengerRating)} (${trip.passengerRating})`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
