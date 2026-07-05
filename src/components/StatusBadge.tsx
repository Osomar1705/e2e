import type { TripStatus } from '../types';

const colors: Record<TripStatus, string> = {
  PENDING: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#10b981',
};

const labels: Record<TripStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
};

export default function StatusBadge({ status }: { status: TripStatus }) {
  return (
    <span
      style={{
        background: colors[status],
        color: '#fff',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {labels[status]}
    </span>
  );
}
