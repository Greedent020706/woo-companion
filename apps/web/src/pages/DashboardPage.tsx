import { AlertTriangle, Euro, Package, Receipt, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router';
import { ORDER_STATUS_LABELS, formatPrice, type DashboardStats } from '@woo/shared';
import { ErrorState, LoadingState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { SurfaceCard } from '../components/SurfaceCard';
import { useDashboardStats } from '../hooks/useOrders';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const statsQuery = useDashboardStats();

  return (
    <>
      <PageHeader title="Dashboard" description="Resumen de la actividad de la tienda." />
      {statsQuery.isPending && <LoadingState label="Cargando métricas…" />}
      {statsQuery.isError && (
        <ErrorState error={statsQuery.error} onRetry={() => statsQuery.refetch()} />
      )}
      {statsQuery.data && <DashboardContent stats={statsQuery.data} />}
    </>
  );
}

function DashboardContent({ stats }: { stats: DashboardStats }) {
  const metrics = [
    { label: 'Ingresos', value: formatPrice(stats.totalRevenue, stats.currency), icon: Euro },
    { label: 'Pedidos', value: String(stats.ordersCount), icon: ShoppingBag },
    {
      label: 'Ticket medio',
      value: formatPrice(stats.averageOrderValue, stats.currency),
      icon: Receipt,
    },
    { label: 'Productos', value: String(stats.productsCount), icon: Package },
  ];
  const maxStatusCount = Math.max(1, ...stats.ordersByStatus.map(({ count }) => count));

  return (
    <div className={styles.grid}>
      <ul className={styles.metrics} aria-label="Métricas principales">
        {metrics.map(({ label, value, icon: Icon }) => (
          <li key={label} className={styles.metric}>
            <span className={styles.metricIcon} aria-hidden="true">
              <Icon size={20} />
            </span>
            <span className={styles.metricLabel}>{label}</span>
            <span className={styles.metricValue}>{value}</span>
          </li>
        ))}
      </ul>

      <SurfaceCard title="Pedidos por estado" className={styles.statusCard}>
        <ul className={styles.statusList}>
          {stats.ordersByStatus.map(({ status, count }) => (
            <li key={status} className={styles.statusRow}>
              <StatusBadge status={status} />
              <span className={styles.statusTrack} aria-hidden="true">
                <span
                  className={styles.statusBar}
                  style={{ inlineSize: `${(count / maxStatusCount) * 100}%` }}
                />
              </span>
              <span className={styles.statusCount}>
                {count}
                <span className="visually-hidden"> pedidos {ORDER_STATUS_LABELS[status]}</span>
              </span>
            </li>
          ))}
        </ul>
      </SurfaceCard>

      <SurfaceCard title="Stock bajo" className={styles.stockCard}>
        {stats.lowStockProducts.length === 0 ? (
          <p className="text-body-secondary mb-0">Todo el catálogo tiene stock suficiente.</p>
        ) : (
          <ul className={styles.stockList}>
            {stats.lowStockProducts.map((product) => (
              <li key={product.id}>
                <Link to={`/products/${product.id}/edit`} className={styles.stockLink}>
                  <AlertTriangle aria-hidden="true" size={16} className={styles.stockIcon} />
                  <span className={styles.stockName}>{product.name}</span>
                  <span className={styles.stockQuantity}>
                    {product.stockQuantity === 0 ? 'Agotado' : `${product.stockQuantity} uds.`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SurfaceCard>
    </div>
  );
}
