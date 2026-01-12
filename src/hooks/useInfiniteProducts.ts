import { useInfiniteQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { Product } from '../types/product';

const ITEMS_PER_PAGE = 20;

export interface InfiniteProductsOptions {
  categoryId?: string;
  searchQuery?: string;
  priceMin?: number;
  priceMax?: number;
  categoryIds?: string[];
  brands?: string[];
  inStock?: boolean;
  sortBy?: string;
  enabled?: boolean;
}

export function useInfiniteProducts(options: InfiniteProductsOptions = {}) {
  const {
    categoryId,
    searchQuery,
    priceMin,
    priceMax,
    categoryIds,
    brands,
    inStock,
    sortBy,
    enabled = true
  } = options;

  return useInfiniteQuery({
    queryKey: ['products', 'infinite', options],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      
      // Basic pagination
      params.append('limit', ITEMS_PER_PAGE.toString());
      params.append('offset', pageParam.toString());
      
      // Sorting
      if (sortBy) {
        params.append('order', sortBy);
      } else {
        params.append('order', '-created_at');
      }

      // Search and Category
      if (searchQuery) params.append('q', searchQuery);
      
      // Use categoryIds if present (support multiple), otherwise fall back to single categoryId
      if (categoryIds && categoryIds.length > 0) {
        categoryIds.forEach(id => params.append('category_id', id));
      } else if (categoryId) {
        params.append('category_id', categoryId);
      }

      // Filters
      if (priceMin) params.append('price_gte', (priceMin * 100).toString());
      if (priceMax) params.append('price_lte', (priceMax * 100).toString());
      
      if (brands && brands.length > 0) {
        brands.forEach(brand => params.append('metadata.brand[]', brand));
      }
      
      if (inStock) {
        params.append('inventory_quantity_gt', '0');
      }

      const products = await productService.getProducts(params.toString());
      return products as Product[];
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than requested, we reached the end
      if (!lastPage || lastPage.length < ITEMS_PER_PAGE) {
        return undefined;
      }
      // Next offset is the total count of items fetched so far
      return allPages.length * ITEMS_PER_PAGE;
    },
    initialPageParam: 0,
    enabled: enabled,
    // Keep data fresh but allow background updates
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
