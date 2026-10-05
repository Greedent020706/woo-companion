import { ArrowLeft } from 'lucide-react';
import { Alert } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router';
import type { Product, ProductInput } from '@woo/shared';
import { ErrorState, LoadingState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { ProductForm } from '../components/ProductForm';
import { SurfaceCard } from '../components/SurfaceCard';
import { useCategories, useProduct, useSaveProduct } from '../hooks/useProducts';
import { getErrorMessage } from '../lib/error-message';

function toProductInput(product: Product): ProductInput {
  return {
    name: product.name,
    sku: product.sku,
    status: product.status,
    regularPrice: product.regularPrice,
    salePrice: product.salePrice,
    stockQuantity: product.stockQuantity,
    categoryIds: product.categories.map((category) => category.id),
    imageUrl: product.imageUrl ?? '',
    shortDescription: product.shortDescription,
    description: product.description,
  };
}

export function ProductFormPage() {
  const { productId: productIdParam } = useParams();
  const productId = productIdParam ? Number(productIdParam) : undefined;
  const isEditing = productId !== undefined;

  const navigate = useNavigate();
  const productQuery = useProduct(productId);
  const categoriesQuery = useCategories();
  const saveProduct = useSaveProduct(productId);

  const handleSubmit = (input: ProductInput) => {
    saveProduct.mutate(input, {
      onSuccess: (savedProduct) =>
        navigate('/products', { state: { flash: `Producto «${savedProduct.name}» guardado.` } }),
    });
  };

  const isLoading = categoriesQuery.isPending || (isEditing && productQuery.isPending);
  const loadError = categoriesQuery.error ?? (isEditing ? productQuery.error : null);

  return (
    <>
      <Link to="/products" className="d-inline-flex align-items-center gap-1 mb-3">
        <ArrowLeft aria-hidden="true" size={16} />
        Volver a productos
      </Link>
      <PageHeader
        title={isEditing ? 'Editar producto' : 'Nuevo producto'}
        description={isEditing ? productQuery.data?.name : 'Añade un producto al catálogo.'}
      />

      {saveProduct.isError && (
        <Alert variant="danger" role="alert">
          No se pudo guardar: {getErrorMessage(saveProduct.error)}
        </Alert>
      )}

      <SurfaceCard>
        {isLoading && <LoadingState />}
        {!isLoading && loadError && <ErrorState error={loadError} />}
        {!isLoading && !loadError && categoriesQuery.data && (
          <ProductForm
            key={productId ?? 'new'}
            categories={categoriesQuery.data}
            initialValues={productQuery.data ? toProductInput(productQuery.data) : undefined}
            isSubmitting={saveProduct.isPending}
            submitLabel={isEditing ? 'Guardar cambios' : 'Crear producto'}
            onSubmit={handleSubmit}
          />
        )}
      </SurfaceCard>
    </>
  );
}
