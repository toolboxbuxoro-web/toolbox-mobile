import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { useRecentlyViewedStore } from '../store/recently-viewed-store';
import { Product } from '../types/product';

export function useRecommendations(currentProduct?: Product) {
  const viewedIds = useRecentlyViewedStore((state) => state.viewedIds);

  // Helper to extract a relevant ID (collection or first category)
  const getContextInfo = () => {
    if (!currentProduct) return { categoryId: null, collectionId: null };
    
    let categoryId = null;
    if (currentProduct.categories && currentProduct.categories.length > 0) {
      categoryId = currentProduct.categories[0].id;
    }
    
    return {
      categoryId,
      collectionId: currentProduct.collection_id
    };
  };

  // 1. Similar Products (Alternatives)
  // Logic: Same category, similar price, exclude current
  const { data: similarProducts = [], isLoading: isSimilarLoading } = useQuery({
    queryKey: ['similar-products', currentProduct?.id],
    queryFn: async () => {
      const { categoryId, collectionId } = getContextInfo();
      if (!categoryId && !collectionId) return [];

      const params = new URLSearchParams();
      if (categoryId) params.append('category_id[]', categoryId);
      if (collectionId) params.append('collection_id[]', collectionId);
      params.append('limit', '12');

      const products = await productService.getProducts(params.toString());
      const filtered = products.filter((p) => p.id !== currentProduct?.id);

      // Sort by price proximity to current product
      if (currentProduct?.variants?.[0]) {
        const currentPrice = currentProduct.variants[0].prices?.[0]?.amount || 0;
        filtered.sort((a, b) => {
          const priceA = a.variants?.[0]?.prices?.[0]?.amount || 0;
          const priceB = b.variants?.[0]?.prices?.[0]?.amount || 0;
          return Math.abs(priceA - currentPrice) - Math.abs(priceB - currentPrice);
        });
      }

      return filtered.slice(0, 10);
    },
    enabled: !!currentProduct,
    staleTime: 1000 * 60 * 10,
  });

  // 2. Bought Together (Cross-sell heuristic)
  // Logic: Items from same category but CHEAPER (likely accessories/consumables)
  const { data: boughtTogetherProducts = [], isLoading: isBoughtTogetherLoading } = useQuery({
    queryKey: ['bought-together', currentProduct?.id],
    queryFn: async () => {
      const { categoryId, collectionId } = getContextInfo();
      if (!categoryId && !collectionId) return [];

      const params = new URLSearchParams();
      if (categoryId) params.append('category_id[]', categoryId);
      if (collectionId) params.append('collection_id[]', collectionId);
      params.append('limit', '12');

      const products = await productService.getProducts(params.toString());
      const filtered = products.filter((p) => p.id !== currentProduct?.id);

      // Heuristic for bought together: price asc (accessories often cheaper)
      filtered.sort((a, b) => {
        const priceA = a.variants?.[0]?.prices?.[0]?.amount || 0;
        const priceB = b.variants?.[0]?.prices?.[0]?.amount || 0;
        return priceA - priceB;
      });

      return filtered.slice(0, 8);
    },
    enabled: !!currentProduct,
    staleTime: 1000 * 60 * 10,
  });

  // 3. Recently Viewed Products
  const { data: recentlyViewedProducts = [], isLoading: isRecentLoading } = useQuery({
    queryKey: ['recently-viewed', viewedIds],
    queryFn: async () => {
      if (viewedIds.length === 0) return [];
      
      const targetIds = currentProduct 
        ? viewedIds.filter(id => id !== currentProduct.id).slice(0, 10) 
        : viewedIds.slice(0, 10);
        
      if (targetIds.length === 0) return [];

      const params = new URLSearchParams();
      targetIds.forEach(id => params.append('id[]', id));
      params.append('limit', '10');

      const products = await productService.getProducts(params.toString());
      
      return targetIds
        .map(id => products.find(p => p.id === id))
        .filter(Boolean) as Product[];
    },
    enabled: viewedIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // Deduplicate: Don't show same products in multiple rails
  const boughtTogetherIds = new Set(boughtTogetherProducts.map(p => p.id));
  const finalSimilarProducts = similarProducts.filter(p => !boughtTogetherIds.has(p.id));

  return {
    similarProducts: finalSimilarProducts,
    boughtTogetherProducts,
    recentlyViewedProducts,
    isLoading: isSimilarLoading || isBoughtTogetherLoading || (viewedIds.length > 0 && isRecentLoading)
  };
}
