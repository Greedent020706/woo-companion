import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '@woo/shared';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it.each(ORDER_STATUSES)('shows a readable label for "%s"', (status) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(ORDER_STATUS_LABELS[status])).toBeInTheDocument();
  });

  it('pairs the colour tone with an icon hidden from screen readers', () => {
    const { container } = render(<StatusBadge status="failed" />);
    const badge = container.querySelector('[data-tone]');

    expect(badge).toHaveAttribute('data-tone', ORDER_STATUS_TONES.failed);
    expect(badge?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(badge).toHaveTextContent('Fallido');
  });
});
