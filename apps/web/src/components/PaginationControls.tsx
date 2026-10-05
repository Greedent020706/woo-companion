import { Pagination } from 'react-bootstrap';

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const VISIBLE_PAGE_RADIUS = 2;

export function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const firstVisiblePage = Math.max(1, page - VISIBLE_PAGE_RADIUS);
  const lastVisiblePage = Math.min(totalPages, page + VISIBLE_PAGE_RADIUS);
  const visiblePages = Array.from(
    { length: lastVisiblePage - firstVisiblePage + 1 },
    (_, index) => firstVisiblePage + index,
  );

  return (
    <nav
      aria-label="Paginación"
      className="d-flex flex-wrap align-items-center justify-content-between gap-2"
    >
      <span className="text-body-secondary small">
        Página {page} de {totalPages}
      </span>
      <Pagination className="mb-0">
        <Pagination.Prev
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        />
        {visiblePages.map((visiblePage) => (
          <Pagination.Item
            key={visiblePage}
            active={visiblePage === page}
            onClick={() => onPageChange(visiblePage)}
            aria-label={`Ir a la página ${visiblePage}`}
            aria-current={visiblePage === page ? 'page' : undefined}
          >
            {visiblePage}
          </Pagination.Item>
        ))}
        <Pagination.Next
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Página siguiente"
        />
      </Pagination>
    </nav>
  );
}
