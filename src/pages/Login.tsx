import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import { getApiError } from '../utils/apiError';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('PASSENGER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let token: string;
      if (isRegister) {
        const res = await register({ firstName, lastName, email, password, role });
        token = res.data.token;
      } else {
        const res = await login({ email, password });
        token = res.data.token;
      }
      const me = await setToken(token);
      if (me) {
        navigate(me.role === 'DRIVER' ? '/driver' : '/passenger');
      }
    } catch (err: unknown) {
      setError(getApiError(err, 'Error al autenticar'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">🚗 UberClone</h1>
        <h2>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h2>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <>
              <input
                className="input"
                placeholder="Nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </>
          )}
          <input
            className="input"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {isRegister && (
            <div className="role-selector">
              <label className={`role-option ${role === 'PASSENGER' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="PASSENGER"
                  checked={role === 'PASSENGER'}
                  onChange={() => setRole('PASSENGER')}
                />
                Pasajero
              </label>
              <label className={`role-option ${role === 'DRIVER' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="DRIVER"
                  checked={role === 'DRIVER'}
                  onChange={() => setRole('DRIVER')}
                />
                Conductor
              </label>
            </div>
          )}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Cargando...' : isRegister ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button className="link-btn" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </p>

        <div className="demo-accounts">
          <p><strong>Cuentas de demo:</strong></p>
          <p>Pasajero: ana@uber.com / pass123</p>
          <p>Conductor: carlos@uber.com / pass123</p>
        </div>
      </div>
    </div>
  );
}
