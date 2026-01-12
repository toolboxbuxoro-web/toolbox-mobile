import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export function useTrendingProducts() {
  return useQuery({
    queryKey: ['trending-products'],
    queryFn: async () => {
      // Logic for "Trending":
      // 1. If backend supports sorting by "popularity" or "sales", use it.
      // 2. Fallback: Fetch latest products or just generic list.
      // 3. We can pass specific collection_ids if we have a "Featured" collection.
      
      const params = new URLSearchParams();
      params.append('limit', '20');
      
      console.log('[useTrendingProducts] Fetching...');
      const products = await productService.getProducts(params.toString());
      console.log('[useTrendingProducts] Received:', products.length);
      
      return products;
    },
    staleTime: 1000 * 60 * 15, // 15 mins
  });
}
