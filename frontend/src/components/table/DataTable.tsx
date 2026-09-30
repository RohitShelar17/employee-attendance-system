import type { ReactNode } from 'react';
import { Icon } from '../common/Icon';
import { Spinner } from '../common/Spinner';
import { cn } from '../../utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  /** Column key the API sorts on. Omit to make the column unsortable. */
  sortKey?: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;

  /** Server-side paging. Page numbers are zero-based, matching the API. */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;

  sort?: string;
  onSortChange?: (sort: string) => void;
}

const PAGE_SIZES = [10, 20, 50, 100];

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  emptyTitle = 'Nothing to show',
  emptyMessage = 'No records match the current filters.',
  onRowClick,
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onSizeChange,
  sort,
  onSortChange,
}: DataTableProps<T>) {
  const [sortField, sortDirection] = (sort ?? '').split(',');

  const toggleSort = (sortKey: string) => {
    if (!onSortChange) return;
    const nextDirection = sortField === sortKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(`${sortKey},${nextDirection}`);
  };

  const firstRow = totalElements === 0 ? 0 : page * size + 1;
  const lastRow = Math.min((page + 1) * size, totalElements);

  return (
    <div className="card overflow-hidden">
      {/* Wide tables scroll inside their own container, never the page body. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/60 bg-surface-container-low">
              {columns.map((column) => {
                const sortable = Boolean(column.sortKey && onSortChange);
                const isSorted = column.sortKey === sortField;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                    className={cn(
                      'px-md py-3 text-left text-label-md uppercase text-on-surface-variant',
                      column.headerClassName,
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.sortKey as string)}
                        // `uppercase` is repeated here on purpose: Tailwind's
                        // preflight sets `text-transform: none` on button, which
                        // otherwise makes sortable headers disagree with plain ones.
                        className="inline-flex items-center gap-1 uppercase tracking-[0.05em] transition-colors hover:text-primary"
                      >
                        {column.header}
                        <Icon
                          name={
                            isSorted
                              ? sortDirection === 'asc'
                                ? 'arrow_upward'
                                : 'arrow_downward'
                              : 'unfold_more'
                          }
                          className={cn('text-[14px]', isSorted ? 'text-primary' : 'text-outline')}
                        />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="px-md py-xl">
                  <div className="flex items-center justify-center gap-sm text-on-surface-variant">
                    <Spinner className="h-5 w-5 text-primary" />
                    <span className="text-body-md">Loading</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={columns.length} className="px-md py-xl text-center">
                  <Icon name="error" className="text-[32px] text-error" />
                  <p className="mt-sm text-body-md text-on-surface">{error}</p>
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-md py-xl text-center">
                  <Icon name="inbox" className="text-[32px] text-outline-variant" />
                  <p className="mt-sm text-body-lg text-on-surface">{emptyTitle}</p>
                  <p className="mt-unit text-body-md text-on-surface-variant">{emptyMessage}</p>
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-outline-variant/40 last:border-b-0 transition-colors',
                    // Alternating stripes, per the design system's table rules.
                    'even:bg-surface-container-low/40',
                    onRowClick && 'cursor-pointer hover:bg-secondary-container/40',
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn('px-md py-3 text-body-md text-on-surface', column.className)}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-sm border-t border-outline-variant/60 px-md py-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-sm tabular-nums text-on-surface-variant">
          {totalElements === 0
            ? 'No records'
            : `Showing ${firstRow}–${lastRow} of ${totalElements.toLocaleString()}`}
        </p>

        <div className="flex items-center gap-sm">
          {onSizeChange && (
            <label className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              Rows
              <select
                value={size}
                onChange={(event) => onSizeChange(Number(event.target.value))}
                className="rounded-sm border border-outline-variant bg-surface-container-lowest px-2 py-1 text-body-sm"
              >
                {PAGE_SIZES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 0}
              className="rounded-sm p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <Icon name="chevron_left" className="text-[20px]" />
            </button>

            <span className="px-2 text-body-sm tabular-nums text-on-surface">
              {totalPages === 0 ? 0 : page + 1} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page + 1 >= totalPages}
              className="rounded-sm p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <Icon name="chevron_right" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
