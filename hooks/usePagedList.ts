'use client';
import { useEffect, useState } from 'react';

/** Pagination "charger plus" : réinitialise à `pageSize` dès que la liste source change. */
export function usePagedList<T>(items: T[], pageSize = 12) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => { setVisibleCount(pageSize); }, [items.length, pageSize]);

  return {
    visible: items.slice(0, visibleCount),
    hasMore: visibleCount < items.length,
    remaining: Math.max(0, items.length - visibleCount),
    loadMore: () => setVisibleCount(c => c + pageSize),
  };
}
