import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTripById, rateTrip } from '../api/trips';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import type { Trip } from '../types';
import { getApiError } from '../utils/apiError';

export default function TripDetailPassenger() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);
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

  const handleRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setRatingLoading(true);
    setRatingError('');
    try {
      const res = await rateTrip(Number(id), { rating, comment: comment || undefined });
      setTrip(res.data);
      setRatingSuccess(true);
    } catch (err: unknown) {
      setRatingError(getApiError(err, 'Error al calificar'));
    } finally {
      setRatingLoading(false);
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
          <button className="back-btn" onClick={() => navigate('/passenger')}>← Volver</button>
          <div className="error-box">{loadError || 'Viaje no encontrado'}</div>
        </div>
      </>
    );
  }

  const showRatingForm = trip.status === 'COMPLETED' && trip.passengerRating === null && !ratingSuccess;

  return (
    <>
      <Navbar />
      <div className="page">
        <button className="back-btn" onClick={() => navigate('/passenger')}>← Volver</button>
        <div className="detail-card">
          <div className="detail-header">
            <h2>Viaje #{trip.id}</h2>
            <StatusBadge status={trip.status} />
          </div>

          <div className="detail-section">
            <p><span className="label">Origen:</span> {trip.pickupAddress}</p>
            <p><span className="label">Destino:</span> {trip.dropoffAddress}</p>
            <p><span className="label">Solicitado:</span> {new Date(trip.requestedAt).toLocaleString('es-PE')}</p>
            {trip.acceptedAt && (
              <p><span className="label">Aceptado:</span> {new Date(trip.acceptedAt).toLocaleString('es-PE')}</p>
            )}
            {trip.completedAt && (
              <p><span className="label">Completado:</span> {new Date(trip.completedAt).toLocaleString('es-PE')}</p>
            )}
          </div>

          <div className="detail-section">
            <h3>Conductor</h3>
            {trip.driver ? (
              <div className="driver-info">
                <p className="driver-big-name">{trip.driver.firstName} {trip.driver.lastName}</p>
                <p>⭐ {trip.driver.rating.toFixed(1)} · {trip.driver.email}</p>
              </div>
            ) : (
              <div className="searching-driver">
                <div className="spinner" />
                <p>Buscando conductor...</p>
              </div>
            )}
          </div>

          {trip.passengerRating !== null && (
            <div className="detail-section rating-done">
              <h3>Tu calificación</h3>
              <p>{'⭐'.repeat(trip.passengerRating)} ({trip.passengerRating}/5)</p>
              {trip.ratingComment && <p className="rating-comment">"{trip.ratingComment}"</p>}
            </div>
          )}

          {ratingSuccess && (
            <div className="success-box">¡Calificación enviada! Gracias por tu feedback.</div>
          )}

          {showRatingForm && (
            <div className="detail-section">
              <h3>Calificar viaje</h3>
              {ratingError && <div className="error-box">{ratingError}</div>}
              <form onSubmit={handleRate} className="rating-form">
                <div className="stars-selector">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      className={`star-btn ${n <= rating ? 'active' : ''}`}
                      onClick={() => setRating(n)}
                    >
                      ★
                    </button>
                  ))}
                  <span className="star-label">{rating} / 5</span>
                </div>
                <textarea
                  className="input textarea"
                  placeholder="Comentario (opcional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <button className="btn btn-primary" type="submit" disabled={ratingLoading}>
                  {ratingLoading ? 'Enviando...' : 'Enviar calificación'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
