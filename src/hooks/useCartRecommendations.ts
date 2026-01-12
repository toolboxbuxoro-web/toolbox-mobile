import { useQuery } from '@tanstack/react-query';
import { Cart } from '../types/cart';
import { productService } from '../services/product.service';
import { Product } from '../types/product';

export function useCartRecommendations(cart: Cart | null) {
  // 1. Get Product IDs from Cart
  const cartProductIds = cart?.items
    ?.map(item => item.variant?.product?.id)
    .filter(Boolean) as string[] || [];
  
  console.log('[useCartRecommendations] Cart IDs:', cartProductIds);
  const hasItems = cartProductIds.length > 0;

  // 2. Fetch Full Details for Cart Items (to get categories/collections)
  const { data: cartProducts } = useQuery({
    queryKey: ['cart-products-details', cartProductIds],
    queryFn: async () => {
      if (!hasItems) return [];
      // Fetch full product objects
      // Construct query string manually for array params
      const params = new URLSearchParams();
      cartProductIds.forEach(id => params.append('id[]', id));
      
      const products = await productService.getProducts(params.toString());
      return products;
    },
    enabled: hasItems,
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  // 3. Extract Categories & Collections from Cart Products
  const categoryIds = new Set<string>();
  const collectionIds = new Set<string>();
  
  cartProducts?.forEach(p => {
    if (p.collection_id) collectionIds.add(p.collection_id);
    p.categories?.forEach(c => categoryIds.add(c.id));
  });

  console.log('[useCartRecommendations] Context:', { 
    cats: categoryIds.size, 
    colls: collectionIds.size 
  });

  // 4. Fetch Recommendations based on these categories
  return useQuery({
    queryKey: ['cart-upsell', Array.from(categoryIds), Array.from(collectionIds)],
    queryFn: async () => {
      if (categoryIds.size === 0 && collectionIds.size === 0) return [];

      const params = new URLSearchParams();
      params.append('limit', '12');

      // Prioritize Collection, then Category
      if (collectionIds.size > 0) {
        collectionIds.forEach(id => params.append('collection_id[]', id));
      }
      if (categoryIds.size > 0) {
        categoryIds.forEach(id => params.append('category_id[]', id));
      }

      const products = await productService.getProducts(params.toString());
      
      // Filter out items already in cart
      const upsells = products.filter(p => !cartProductIds.includes(p.id));
      console.log('[useCartRecommendations] Upsells found:', upsells.length);
      
      // Heuristic: Prefer cheaper items (Accessories logic)
      // We can't easily sort by price without client-side logic as Medusa sort is limited
      // Let's simple-sort client side by cheapest variant price
      upsells.sort((a, b) => {
         const priceA = a.variants[0]?.prices[0]?.amount || 0;
         const priceB = b.variants[0]?.prices[0]?.amount || 0;
         return priceA - priceB;
      });

      return upsells.slice(0, 8);
    },
    enabled: (categoryIds.size > 0 || collectionIds.size > 0),
    staleTime: 1000 * 60 * 2,
  });
}
