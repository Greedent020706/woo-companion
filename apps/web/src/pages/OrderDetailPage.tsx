import { ArrowLeft, CheckCircle2, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Form, Spinner, Table } from 'react-bootstrap';
import { Link, useParams } from 'react-router';
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  formatDate,
  formatPrice,
  type Order,
  type OrderStatus,
} from '@woo/shared';
import { ErrorState, LoadingState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { SurfaceCard } from '../components/SurfaceCard';
import { useOrder, useUpdateOrderStatus } from '../hooks/useOrders';
import { getErrorMessage } from '../lib/error-message';
import styles from './OrderDetailPage.module.css';

export function OrderDetailPage() {
  const orderId = Number(useParams().orderId);
  const orderQuery = useOrder(orderId);

  return (
    <>
      <Link to="/orders" className="d-inline-flex align-items-center gap-1 mb-3">
        <ArrowLeft aria-hidden="true" size={16} />
        Volver a pedidos
      </Link>
      {orderQuery.isPending && <LoadingState label="Cargando pedido…" />}
      {orderQuery.isError && (
        <ErrorState error={orderQuery.error} onRetry={() => orderQuery.refetch()} />
      )}
      {orderQuery.data && <OrderDetail order={orderQuery.data} />}
    </>
  );
}

function OrderDetail({ order }: { order: Order }) {
  return (
    <>
      <PageHeader
        title={`Pedido #${order.number}`}
        description={`Realizado el ${formatDate(order.createdAt)}`}
        actions={<StatusBadge status={order.status} />}
      />

      <div className={styles.layout}>
        <SurfaceCard title="Artículos" className={styles.items}>
          <Table responsive className="mb-0">
            <caption className="visually-hidden">Artículos del pedido</caption>
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col" className="text-end">
                  Cantidad
                </th>
                <th scope="col" className="text-end">
                  Precio
                </th>
                <th scope="col" className="text-end">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {order.lineItems.map((lineItem) => (
                <tr key={`${lineItem.productId}-${lineItem.name}`}>
                  <td>{lineItem.name}</td>
                  <td className="text-end">{lineItem.quantity}</td>
                  <td className="text-end">{formatPrice(lineItem.price, order.currency)}</td>
                  <td className="text-end">{formatPrice(lineItem.total, order.currency)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={3} className="text-end">
                  Total
                </th>
                <td className="text-end fw-bold">{formatPrice(order.total, order.currency)}</td>
              </tr>
            </tfoot>
          </Table>
        </SurfaceCard>

        <div className={styles.sidebar}>
          <SurfaceCard title="Cliente">
            <p className={styles.customerLine}>
              <User aria-hidden="true" size={16} />
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p className={styles.customerLine}>
              <Mail aria-hidden="true" size={16} />
              <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>
            </p>
          </SurfaceCard>

          <SurfaceCard title="Cambiar estado">
            <OrderStatusForm order={order} />
          </SurfaceCard>
        </div>
      </div>
    </>
  );
}

function OrderStatusForm({ order }: { order: Order }) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const updateStatus = useUpdateOrderStatus(order.id);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        updateStatus.mutate(selectedStatus);
      }}
    >
      <Form.Group controlId="order-status" className="mb-3">
        <Form.Label>Nuevo estado</Form.Label>
        <Form.Select
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value as OrderStatus)}
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Button
        type="submit"
        className="w-100"
        disabled={updateStatus.isPending || selectedStatus === order.status}
      >
        {updateStatus.isPending && <Spinner size="sm" aria-hidden="true" className="me-2" />}
        Actualizar estado
      </Button>

      <div aria-live="polite" className="mt-3">
        {updateStatus.isSuccess && (
          <Alert variant="success" className="d-flex align-items-center gap-2 mb-0">
            <CheckCircle2 aria-hidden="true" size={18} />
            Estado actualizado a «{ORDER_STATUS_LABELS[updateStatus.data.status]}».
          </Alert>
        )}
        {updateStatus.isError && (
          <Alert variant="danger" className="mb-0">
            {getErrorMessage(updateStatus.error)}
          </Alert>
        )}
      </div>
    </Form>
  );
}
