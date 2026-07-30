import { useState } from 'react';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const usePagination = (initialLimit: number = 10) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: initialLimit,
    total: 0,
    pages: 0,
  });

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const nextPage = () => {
    if (pagination.page < pagination.pages) {
      goToPage(pagination.page + 1);
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1);
    }
  };

  const setTotal = (total: number) => {
    const pages = Math.ceil(total / pagination.limit);
    setPagination(prev => ({ ...prev, total, pages }));
  };

  return {
    ...pagination,
    goToPage,
    nextPage,
    prevPage,
    setTotal,
  };
};