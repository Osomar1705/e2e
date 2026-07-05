import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableDrivers } from '../api/users';
import { createTrip } from '../api/trips';
import Navbar from '../components/Navbar';
import type { User } from '../types';

export default function RequestTrip() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<User[]>([]);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAvailableDrivers().then((res) => setDrivers(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddress.trim() || !dropoffAddress.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await createTrip({ pickupAddress, dropoffAddress });
      navigate(`/trips/${res.data.id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Error al solicitar viaje');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <button className="back-btn" onClick={() => navigate('/passenger')}>← Volver</button>
        <h1>Solicitar viaje</h1>

        <div className="drivers-panel">
          <h3>Conductores disponibles ({drivers.length})</h3>
          {drivers.length === 0 ? (
            <p className="no-drivers">No hay conductores disponibles en este momento.</p>
          ) : (
            <div className="drivers-grid">
              {drivers.map((d) => (
                <div key={d.id} className="driver-chip">
                  <span className="driver-name">{d.firstName} {d.lastName}</span>
                  <span className="driver-rating">⭐ {d.rating.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="trip-form">
          <label className="form-label">Punto de recogida</label>
          <input
            className="input"
            placeholder="Ej: Av. Javier Prado 100, San Isidro"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            required
          />
          <label className="form-label">Destino</label>
          <input
            className="input"
            placeholder="Ej: Miraflores, Lima"
            value={dropoffAddress}
            onChange={(e) => setDropoffAddress(e.target.value)}
            required
          />
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/passenger')}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || drivers.length === 0}>
              {loading ? 'Solicitando...' : 'Confirmar viaje'}
            </button>
          </div>
          {drivers.length === 0 && (
            <p className="form-hint">No hay conductores disponibles. Intenta más tarde.</p>
          )}
        </form>
      </div>
    </>
  );
}
