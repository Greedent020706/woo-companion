import { ChevronRight, Search } from 'lucide-react';
import { Button, Form, InputGroup, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router';
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  formatDate,
  formatPrice,
  orderStatusSchema,
  type Order,
} from '@woo/shared';
import { EmptyState, ErrorState, LoadingState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { PaginationControls } from '../components/PaginationControls';
import { StatusBadge } from '../components/StatusBadge';
import { SurfaceCard } from '../components/SurfaceCard';
import { useDebouncedSearchParam } from '../hooks/useDebouncedSearchParam';
import { useOrders } from '../hooks/useOrders';
import { useUrlFilters } from '../hooks/useUrlFilters';
import styles from './ListPage.module.css';

const ORDERS_PER_PAGE = 10;

export function OrdersPage() {
  const { searchParams, updateFilters } = useUrlFilters();
  const search = useDebouncedSearchParam('search');
  const parsedStatus = orderStatusSchema.safeParse(searchParams.get('status'));
  const status = parsedStatus.success ? parsedStatus.data : undefined;
  const page = Number(searchParams.get('page')) || 1;

  const ordersQuery = useOrders({
    search: search.debouncedValue || undefined,
    status,
    page,
    perPage: ORDERS_PER_PAGE,
  });

  const hasFilters = Boolean(search.inputValue || status);

  const clearFilters = () => {
    search.setInputValue('');
    updateFilters({ search: '', status: '' });
  };

  return (
    <>
      <PageHeader title="Pedidos" description="Consulta pedidos y actualiza su estado." />

      <SurfaceCard>
        <form className={styles.filters} role="search" onSubmit={(event) => event.preventDefault()}>
          <Form.Group controlId="order-search" className={styles.searchField}>
            <Form.Label className="visually-hidden">Buscar por número o cliente</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <Search aria-hidden="true" size={16} />
              </InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="Buscar por número, nombre o email"
                value={search.inputValue}
                onChange={(event) => search.setInputValue(event.target.value)}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="order-status-filter">
            <Form.Label className="visually-hidden">Estado</Form.Label>
            <Form.Select
              value={status ?? ''}
              onChange={(event) => updateFilters({ status: event.target.value })}
            >
              <option value="">Todos los estados</option>
              {ORDER_STATUSES.map((orderStatus) => (
                <option key={orderStatus} value={orderStatus}>
                  {ORDER_STATUS_LABELS[orderStatus]}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className={styles.resultCount} aria-live="polite">
            {ordersQuery.isFetching && <Spinner size="sm" aria-hidden="true" />}
            {ordersQuery.data && `${ordersQuery.data.total} pedidos`}
          </div>
        </form>

        {ordersQuery.isPending && <LoadingState label="Cargando pedidos…" />}
        {ordersQuery.isError && (
          <ErrorState error={ordersQuery.error} onRetry={() => ordersQuery.refetch()} />
        )}
        {ordersQuery.data?.items.length === 0 && (
          <EmptyState
            title="No hay pedidos que mostrar"
            description={
              hasFilters ? 'Prueba con otros filtros.' : 'Aún no se ha hecho ningún pedido.'
            }
            action={
              hasFilters && (
                <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )
            }
          />
        )}
        {ordersQuery.data && ordersQuery.data.items.length > 0 && (
          <>
            <OrdersTable orders={ordersQuery.data.items} />
            <PaginationControls
              page={ordersQuery.data.page}
              totalPages={ordersQuery.data.totalPages}
              onPageChange={(nextPage) => updateFilters({ page: String(nextPage) })}
            />
          </>
        )}
      </SurfaceCard>
    </>
  );
}

function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <Table hover responsive className="mb-3">
      <caption className="visually-hidden">Listado de pedidos</caption>
      <thead>
        <tr>
          <th scope="col">Pedido</th>
          <th scope="col">Fecha</th>
          <th scope="col">Cliente</th>
          <th scope="col">Estado</th>
          <th scope="col" className="text-end">
            Total
          </th>
          <th scope="col">
            <span className="visually-hidden">Acciones</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td className="fw-semibold">#{order.number}</td>
            <td className="text-nowrap">{formatDate(order.createdAt)}</td>
            <td>
              <div>
                {order.customer.firstName} {order.customer.lastName}
              </div>
              <div className="small text-body-secondary">{order.customer.email}</div>
            </td>
            <td>
              <StatusBadge status={order.status} />
            </td>
            <td className="text-end fw-semibold text-nowrap">
              {formatPrice(order.total, order.currency)}
            </td>
            <td className="text-end">
              <Link to={`/orders/${order.id}`} className="btn btn-sm btn-outline-secondary">
                Ver<span className="visually-hidden"> pedido {order.number}</span>
                <ChevronRight aria-hidden="true" size={14} className="ms-1" />
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
