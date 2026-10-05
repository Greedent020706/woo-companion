import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { Controller, useForm, type DefaultValues } from 'react-hook-form';
import { productInputSchema, type Category, type ProductInput } from '@woo/shared';

type ProductFormProps = {
  categories: Category[];
  initialValues?: ProductInput;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (input: ProductInput) => void;
};

const NEW_PRODUCT_DEFAULTS: DefaultValues<ProductInput> = {
  name: '',
  sku: '',
  status: 'draft',
  salePrice: null,
  stockQuantity: null,
  categoryIds: [],
  imageUrl: '',
  shortDescription: '',
  description: '',
};

function toNullableNumber(rawValue: unknown): number | null {
  if (rawValue === '' || rawValue === null || rawValue === undefined) return null;
  return Number(rawValue);
}

export function ProductForm({
  categories,
  initialValues,
  isSubmitting,
  submitLabel,
  onSubmit,
}: ProductFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productInputSchema),
    defaultValues: initialValues ?? NEW_PRODUCT_DEFAULTS,
  });

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)} aria-label="Formulario de producto">
      <Row className="g-3">
        <Col md={8}>
          <Form.Group controlId="product-name">
            <Form.Label>Nombre</Form.Label>
            <Form.Control isInvalid={Boolean(errors.name)} {...register('name')} />
            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="product-sku">
            <Form.Label>SKU</Form.Label>
            <Form.Control isInvalid={Boolean(errors.sku)} {...register('sku')} />
            <Form.Control.Feedback type="invalid">{errors.sku?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col sm={6} lg={3}>
          <Form.Group controlId="product-regular-price">
            <Form.Label>Precio (€)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              isInvalid={Boolean(errors.regularPrice)}
              {...register('regularPrice', { valueAsNumber: true })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.regularPrice?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col sm={6} lg={3}>
          <Form.Group controlId="product-sale-price">
            <Form.Label>Precio rebajado (€)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              isInvalid={Boolean(errors.salePrice)}
              aria-describedby="product-sale-price-help"
              {...register('salePrice', { setValueAs: toNullableNumber })}
            />
            <Form.Text id="product-sale-price-help">Déjalo vacío si no hay oferta.</Form.Text>
            <Form.Control.Feedback type="invalid">
              {errors.salePrice?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col sm={6} lg={3}>
          <Form.Group controlId="product-stock">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              step="1"
              min="0"
              inputMode="numeric"
              isInvalid={Boolean(errors.stockQuantity)}
              aria-describedby="product-stock-help"
              {...register('stockQuantity', { setValueAs: toNullableNumber })}
            />
            <Form.Text id="product-stock-help">Vacío = no gestionar stock.</Form.Text>
            <Form.Control.Feedback type="invalid">
              {errors.stockQuantity?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col sm={6} lg={3}>
          <Form.Group controlId="product-status">
            <Form.Label>Estado</Form.Label>
            <Form.Select {...register('status')}>
              <option value="publish">Publicado</option>
              <option value="draft">Borrador</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={12}>
          <Form.Group controlId="product-image">
            <Form.Label>URL de la imagen</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://…"
              isInvalid={Boolean(errors.imageUrl)}
              {...register('imageUrl')}
            />
            <Form.Control.Feedback type="invalid">{errors.imageUrl?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12}>
          <fieldset>
            <legend className="form-label fs-6">Categorías</legend>
            <Controller
              control={control}
              name="categoryIds"
              render={({ field }) => (
                <div className="d-flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <Form.Check
                      key={category.id}
                      id={`product-category-${category.id}`}
                      type="checkbox"
                      label={category.name}
                      checked={field.value.includes(category.id)}
                      onChange={(event) =>
                        field.onChange(
                          event.target.checked
                            ? [...field.value, category.id]
                            : field.value.filter((categoryId) => categoryId !== category.id),
                        )
                      }
                    />
                  ))}
                </div>
              )}
            />
          </fieldset>
        </Col>

        <Col xs={12}>
          <Form.Group controlId="product-short-description">
            <Form.Label>Descripción corta</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              isInvalid={Boolean(errors.shortDescription)}
              {...register('shortDescription')}
            />
            <Form.Control.Feedback type="invalid">
              {errors.shortDescription?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="product-description">
            <Form.Label>Descripción</Form.Label>
            <Form.Control as="textarea" rows={5} {...register('description')} />
          </Form.Group>
        </Col>

        <Col xs={12} className="d-flex justify-content-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner size="sm" aria-hidden="true" className="me-2" />
            ) : (
              <Save aria-hidden="true" size={18} className="me-2" />
            )}
            {submitLabel}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
