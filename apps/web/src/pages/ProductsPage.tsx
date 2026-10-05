import { CheckCircle2, Pencil, Plus, Search } from 'lucide-react';
import { Alert, Button, Form, InputGroup, Spinner, Table } from 'react-bootstrap';
import { Link, useLocation } from 'react-router';
import { formatPrice, type Product } from '@woo/shared';
import { EmptyState, ErrorState, LoadingState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { PaginationControls } from '../components/PaginationControls';
import { StockBadge } from '../components/StockBadge';
import { SurfaceCard } from '../components/SurfaceCard';
import { useDebouncedSearchParam } from '../hooks/useDebouncedSearchParam';
import { useCategories, useProducts } from '../hooks/useProducts';
import { useUrlFilters } from '../hooks/useUrlFilters';
import styles from './ListPage.module.css';

const PRODUCTS_PER_PAGE = 10;

export function ProductsPage() {
  const location = useLocation();
  const flashMessage = (location.state as { flash?: string } | null)?.flash;
  const { searchParams, updateFilters } = useUrlFilters();
  const search = useDebouncedSearchParam('search');
  const categoryId = Number(searchParams.get('category')) || undefined;
  const page = Number(searchParams.get('page')) || 1;

  const productsQuery = useProducts({
    search: search.debouncedValue || undefined,
    category: categoryId,
    page,
    perPage: PRODUCTS_PER_PAGE,
  });
  const categoriesQuery = useCategories();

  const hasFilters = Boolean(search.inputValue || categoryId);

  const clearFilters = () => {
    search.setInputValue('');
    updateFilters({ search: '', category: '' });
  };

  return (
    <>
      <PageHeader
        title="Productos"
        description="Busca, filtra y edita el catálogo."
        actions={
          <Link to="/products/new" className="btn btn-primary">
            <Plus aria-hidden="true" size={18} className="me-1" />
            Nuevo producto
          </Link>
        }
      />

      {flashMessage && (
        <Alert variant="success" className="d-flex align-items-center gap-2" role="status">
          <CheckCircle2 aria-hidden="true" size={18} />
          {flashMessage}
        </Alert>
      )}

      <SurfaceCard>
        <form className={styles.filters} role="search" onSubmit={(event) => event.preventDefault()}>
          <Form.Group controlId="product-search" className={styles.searchField}>
            <Form.Label className="visually-hidden">Buscar por nombre o SKU</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <Search aria-hidden="true" size={16} />
              </InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="Buscar por nombre o SKU"
                value={search.inputValue}
                onChange={(event) => search.setInputValue(event.target.value)}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="product-category">
            <Form.Label className="visually-hidden">Categoría</Form.Label>
            <Form.Select
              value={categoryId ?? ''}
              onChange={(event) => updateFilters({ category: event.target.value })}
              disabled={categoriesQuery.isPending}
            >
              <option value="">Todas las categorías</option>
              {categoriesQuery.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className={styles.resultCount} aria-live="polite">
            {productsQuery.isFetching && <Spinner size="sm" aria-hidden="true" />}
            {productsQuery.data && `${productsQuery.data.total} productos`}
          </div>
        </form>

        {productsQuery.isPending && <LoadingState label="Cargando productos…" />}
        {productsQuery.isError && (
          <ErrorState error={productsQuery.error} onRetry={() => productsQuery.refetch()} />
        )}
        {productsQuery.data?.items.length === 0 && (
          <EmptyState
            title="No hay productos que mostrar"
            description={
              hasFilters ? 'Prueba con otra búsqueda o categoría.' : 'Crea tu primer producto.'
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
        {productsQuery.data && productsQuery.data.items.length > 0 && (
          <>
            <ProductsTable products={productsQuery.data.items} />
            <PaginationControls
              page={productsQuery.data.page}
              totalPages={productsQuery.data.totalPages}
              onPageChange={(nextPage) => updateFilters({ page: String(nextPage) })}
            />
          </>
        )}
      </SurfaceCard>
    </>
  );
}

function ProductsTable({ products }: { products: Product[] }) {
  return (
    <Table hover responsive className="mb-3">
      <caption className="visually-hidden">Listado de productos</caption>
      <thead>
        <tr>
          <th scope="col">Producto</th>
          <th scope="col">Categoría</th>
          <th scope="col" className="text-end">
            Precio
          </th>
          <th scope="col">Stock</th>
          <th scope="col">Estado</th>
          <th scope="col">
            <span className="visually-hidden">Acciones</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>
              <div className={styles.productCell}>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt=""
                    width={44}
                    height={44}
                    loading="lazy"
                    className={styles.thumbnail}
                  />
                ) : (
                  <span className={styles.thumbnail} aria-hidden="true" />
                )}
                <div>
                  <div className="fw-semibold">{product.name}</div>
                  <div className="small text-body-secondary">SKU {product.sku}</div>
                </div>
              </div>
            </td>
            <td>{product.categories.map((category) => category.name).join(', ') || '—'}</td>
            <td className="text-end text-nowrap">
              {product.salePrice !== null && (
                <del className="small text-body-secondary me-2">
                  <span className="visually-hidden">Antes </span>
                  {formatPrice(product.regularPrice)}
                </del>
              )}
              <span className="fw-semibold">{formatPrice(product.price)}</span>
            </td>
            <td>
              <StockBadge stockStatus={product.stockStatus} stockQuantity={product.stockQuantity} />
            </td>
            <td>{product.status === 'publish' ? 'Publicado' : 'Borrador'}</td>
            <td className="text-end">
              <Link
                to={`/products/${product.id}/edit`}
                className="btn btn-sm btn-outline-secondary"
              >
                <Pencil aria-hidden="true" size={14} className="me-1" />
                Editar<span className="visually-hidden"> {product.name}</span>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
