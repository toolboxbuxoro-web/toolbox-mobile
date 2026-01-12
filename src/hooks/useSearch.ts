import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useInfiniteProducts } from './useInfiniteProducts';
import { useRecentSearches } from './useRecentSearches';
import { Product } from '../types/product';
import { SortOption, SORT_OPTIONS_CONFIG } from '../types/search';

export interface SearchFilters {
  priceMin?: number;
  priceMax?: number;
  categoryIds?: string[];
  brands?: string[];
  inStock?: boolean;
}

const ITEMS_PER_PAGE = 20;

export function useSearch(externalQuery?: string) {
  const [internalQuery, setInternalQuery] = useState('');
  const query = externalQuery !== undefined ? externalQuery : internalQuery;
  const setQuery = setInternalQuery;
  
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [draftFilters, setDraftFilters] = useState<SearchFilters>({});
  const [sort, setSort] = useState<SortOption>(SortOption.RELEVANCE);
  
  const { addSearch } = useRecentSearches();
  const previousQueryRef = useRef<string>('');
  const previousFiltersRef = useRef<string>('');
  const previousSortRef = useRef<SortOption>(SortOption.RELEVANCE);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query.trim().length > 2) {
        addSearch(query.trim());
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, addSearch]);

  const { 
    data, 
    isLoading, 
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error, 
    refetch 
  } = useInfiniteProducts({
    searchQuery: debouncedQuery,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    categoryIds: filters.categoryIds,
    brands: filters.brands,
    inStock: filters.inStock,
    sortBy: SORT_OPTIONS_CONFIG[sort].value,
    enabled: true
  });

  const products = useMemo(() => data?.pages.flat() ?? [], [data]);

  // Detect query, filter or sort change to trigger refetch (Query key change handles it automatically)
  useEffect(() => {
    const currentQuery = debouncedQuery;
    const currentFilters = JSON.stringify(filters);
    
    if (currentQuery !== previousQueryRef.current || 
        currentFilters !== previousFiltersRef.current || 
        sort !== previousSortRef.current) {
      
      previousQueryRef.current = currentQuery;
      previousFiltersRef.current = currentFilters;
      previousSortRef.current = sort;
    }
  }, [debouncedQuery, filters, sort]);

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, isLoading, fetchNextPage]);

  // Refresh function (pull-to-refresh)
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const setDraftFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setDraftFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    setFilters(draftFilters);
  }, [draftFilters]);

  const resetFilters = useCallback(() => {
    setFilters({});
    setDraftFilters({});
  }, []);

  const clearFilter = useCallback((key: keyof SearchFilters) => {
    setFilters(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setDraftFilters(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const removeCategoryFilter = useCallback((id: string) => {
    setFilters(prev => ({
      ...prev,
      categoryIds: prev.categoryIds?.filter(cid => cid !== id)
    }));
    setDraftFilters(prev => ({
      ...prev,
      categoryIds: prev.categoryIds?.filter(cid => cid !== id)
    }));
  }, []);

  const removeBrandFilter = useCallback((brand: string) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands?.filter(b => b !== brand)
    }));
    setDraftFilters(prev => ({
      ...prev,
      brands: prev.brands?.filter(b => b !== brand)
    }));
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.categoryIds?.length) count++;
    if (filters.brands?.length) count++;
    if (filters.inStock) count++;
    return count;
  }, [filters]);

  return {
    query,
    setQuery,
    debouncedQuery,
    filters,
    draftFilters,
    setDraftFilter,
    applyFilters,
    resetFilters,
    clearFilter,
    removeCategoryFilter,
    removeBrandFilter,
    activeFilterCount,
    products,
    isLoading: isLoading && products.length === 0, // Only show loading for first page
    isLoadingMore: isFetchingNextPage,
    error,
    refetch: refresh,
    loadMore,
    hasMore: hasNextPage,
    sortBy: sort,
    setSort,
    page: 1, // Reset page display to 1 as it's handled internally
    syncDraft: () => setDraftFilters(filters)
  };
}
