import { Link } from 'react-router';
import { EmptyState } from '../components/DataState';

export function NotFoundPage() {
  return (
    <main>
      <title>Página no encontrada · Woo Companion</title>
      <EmptyState
        title="Esta página no existe"
        description="Puede que el enlace esté roto o que la página se haya movido."
        action={
          <Link to="/" className="btn btn-primary">
            Ir al dashboard
          </Link>
        }
      />
    </main>
  );
}
