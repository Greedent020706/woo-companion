import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Category } from '@woo/shared';
import { ProductForm } from './ProductForm';

const categories: Category[] = [
  { id: 11, name: 'Café en grano', slug: 'cafe-en-grano', count: 3 },
  { id: 14, name: 'Accesorios', slug: 'accesorios', count: 2 },
];

function renderForm() {
  const onSubmit = vi.fn();
  render(
    <ProductForm
      categories={categories}
      isSubmitting={false}
      submitLabel="Crear producto"
      onSubmit={onSubmit}
    />,
  );
  return { onSubmit, user: userEvent.setup() };
}

describe('ProductForm', () => {
  it('shows validation errors and does not submit an empty form', async () => {
    const { onSubmit, user } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(await screen.findByText('El nombre debe tener al menos 3 caracteres')).toBeVisible();
    expect(screen.getByText('El SKU es obligatorio')).toBeVisible();
    expect(screen.getByText('Introduce un precio válido')).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a sale price that is not lower than the regular price', async () => {
    const { onSubmit, user } = renderForm();

    await user.type(screen.getByLabelText('Nombre'), 'Taza nueva');
    await user.type(screen.getByLabelText('SKU'), 'TZ-1');
    await user.type(screen.getByLabelText('Precio (€)'), '10');
    await user.type(screen.getByLabelText('Precio rebajado (€)'), '12');
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(
      await screen.findByText('El precio rebajado debe ser menor que el precio normal'),
    ).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits typed values converted to numbers and nulls', async () => {
    const { onSubmit, user } = renderForm();

    await user.type(screen.getByLabelText('Nombre'), 'Molinillo eléctrico');
    await user.type(screen.getByLabelText('SKU'), 'MO-2');
    await user.type(screen.getByLabelText('Precio (€)'), '89.90');
    await user.type(screen.getByLabelText('Stock'), '7');
    await user.selectOptions(screen.getByLabelText('Estado'), 'publish');
    await user.click(screen.getByLabelText('Accesorios'));
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      name: 'Molinillo eléctrico',
      sku: 'MO-2',
      status: 'publish',
      regularPrice: 89.9,
      salePrice: null,
      stockQuantity: 7,
      categoryIds: [14],
    });
  });
});
