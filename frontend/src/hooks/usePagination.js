import { useState, useMemo, useCallback } from 'react';
import { DEFAULT_PAGE_SIZE } from '../constants';

/**
 * Client-side pagination hook. Returns the current page slice of `items`
 * along with pagination controls.
 */
export const usePagination = (items = [], initialPageSize = DEFAULT_PAGE_SIZE) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const goToPage = useCallback(
    (targetPage) => {
      setPage(Math.min(Math.max(1, targetPage), totalPages));
    },
    [totalPages]
  );

  const nextPage = useCallback(() => goToPage(page + 1), [goToPage, page]);
  const prevPage = useCallback(() => goToPage(page - 1), [goToPage, page]);

  const changePageSize = useCallback((size) => {
    setPageSize(size);
    setPage(1);
  }, []);

  return {
    page,
    pageSize,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
  };
};
