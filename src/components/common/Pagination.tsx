import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
  compact?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel = 'items',
  className = '',
  compact = false
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate numbered pages with smart ellipses
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, 'ellipsis', totalPages];
    }

    if (safeCurrentPage >= totalPages - 2) {
      return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [
      1,
      'ellipsis',
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      'ellipsis',
      totalPages
    ];
  };

  const pages = getPageNumbers();

  return (
    <div 
      className={`p-3.5 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-normal ${className}`}
    >
      {/* Left: Info & Rows per page */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          Showing <strong className="text-slate-800 font-semibold">{startItem}</strong> to{' '}
          <strong className="text-slate-800 font-semibold">{endItem}</strong> of{' '}
          <strong className="text-slate-800 font-semibold">{totalItems}</strong> {itemLabel}
        </div>

        {onPageSizeChange && !compact && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold focus:outline-none focus:border-blue-500 transition cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Controls & Page Numbers */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage === 1}
          title="First Page"
          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
        >
          <ChevronsLeft size={13} />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(Math.max(safeCurrentPage - 1, 1))}
          disabled={safeCurrentPage === 1}
          title="Previous Page"
          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
        >
          <ChevronLeft size={13} />
        </button>

        {/* Numbered Pills (hidden on very small compact unless needed) */}
        {!compact ? (
          <div className="flex items-center gap-1 px-1">
            {pages.map((p, idx) => {
              if (p === 'ellipsis') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 select-none">
                    …
                  </span>
                );
              }

              const isCurrent = p === safeCurrentPage;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-blue-500/20'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        ) : (
          <span className="px-2 text-slate-700 font-semibold text-xs">
            {safeCurrentPage} / {totalPages}
          </span>
        )}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(Math.min(safeCurrentPage + 1, totalPages))}
          disabled={safeCurrentPage === totalPages}
          title="Next Page"
          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
        >
          <ChevronRight size={13} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={safeCurrentPage === totalPages}
          title="Last Page"
          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
        >
          <ChevronsRight size={13} />
        </button>
      </div>
    </div>
  );
};
