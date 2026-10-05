import { AlertTriangle, Inbox, RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { getErrorMessage } from '../lib/error-message';
import styles from './DataState.module.css';

type LoadingStateProps = { label?: string; fullPage?: boolean };

export function LoadingState({ label = 'Cargando…', fullPage = false }: LoadingStateProps) {
  return (
    <div className={fullPage ? styles.fullPage : styles.box} role="status" aria-live="polite">
      <Spinner animation="border" variant="primary" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

type ErrorStateProps = { error: unknown; onRetry?: () => void };

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className={`${styles.box} ${styles.error}`} role="alert">
      <AlertTriangle aria-hidden="true" size={28} />
      <p className={styles.title}>No se han podido cargar los datos</p>
      <p className={styles.description}>{getErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="outline-secondary" size="sm" onClick={onRetry}>
          <RotateCw aria-hidden="true" size={16} className="me-2" />
          Reintentar
        </Button>
      )}
    </div>
  );
}

type EmptyStateProps = { title: string; description?: string; action?: ReactNode };

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.box}>
      <Inbox aria-hidden="true" size={28} />
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action}
    </div>
  );
}
