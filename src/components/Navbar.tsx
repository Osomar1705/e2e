import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand" onClick={() => navigate(user?.role === 'DRIVER' ? '/driver' : '/passenger')}>
        🚗 UberClone
      </span>
      <div className="navbar-links">
        {user?.role === 'PASSENGER' && (
          <>
            <button className="nav-btn" onClick={() => navigate('/passenger')}>Dashboard</button>
            <button className="nav-btn" onClick={() => navigate('/request-trip')}>Pedir viaje</button>
            <button className="nav-btn" onClick={() => navigate('/history')}>Historial</button>
          </>
        )}
        {user?.role === 'DRIVER' && (
          <>
            <button className="nav-btn" onClick={() => navigate('/driver')}>Dashboard</button>
            <button className="nav-btn" onClick={() => navigate('/history')}>Historial</button>
          </>
        )}
        <span className="nav-user">{user?.firstName}</span>
        <button className="nav-btn logout" onClick={handleLogout}>Salir</button>
      </div>
    </nav>
  );
}
