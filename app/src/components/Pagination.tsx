interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 4) {
        // Near the start
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near the end
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-carbon-700/50">
      {/* Info */}
      <div className="text-sm text-slate-500 dark:text-steel-500">
        Mostrando <span className="text-slate-900 dark:text-white font-medium">{startItem}</span> a{' '}
        <span className="text-slate-900 dark:text-white font-medium">{endItem}</span> de{' '}
        <span className="text-slate-900 dark:text-white font-medium">{totalItems}</span> produtos
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 bg-white dark:bg-carbon-800 border border-slate-200 dark:border-carbon-600/50 rounded-lg text-slate-500 dark:text-steel-400 hover:border-amber-500/50 hover:text-amber-500 dark:hover:text-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 dark:disabled:hover:border-carbon-600/50 disabled:hover:text-slate-500 dark:disabled:hover:text-steel-400 shadow-sm dark:shadow-none"
          aria-label="Página anterior"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-slate-400 dark:text-steel-500">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-white dark:text-carbon-900 border border-amber-500'
                    : 'bg-white dark:bg-carbon-800 border border-slate-200 dark:border-carbon-600/50 text-slate-600 dark:text-steel-400 hover:border-amber-500/50 hover:text-amber-500 dark:hover:text-amber-400 shadow-sm dark:shadow-none'
                }`}
                aria-label={`Ir para página ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 bg-white dark:bg-carbon-800 border border-slate-200 dark:border-carbon-600/50 rounded-lg text-slate-500 dark:text-steel-400 hover:border-amber-500/50 hover:text-amber-500 dark:hover:text-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 dark:disabled:hover:border-carbon-600/50 disabled:hover:text-slate-500 dark:disabled:hover:text-steel-400 shadow-sm dark:shadow-none"
          aria-label="Próxima página"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
