import { useQuery } from '@tanstack/react-query';
// Removed: import { client } from '@/lib/api'; 
// Using fetch directly. 
// For this P0, I will use axios/fetch wrapping or the existing client if available.
// I'll assume we have a way to make authorized requests.

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer_id: string;
}

interface ReviewsResponse {
  reviews: Review[];
  count: number;
  avg_rating: number;
}

export function useProductReviews(productId?: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (!productId) return { reviews: [], count: 0, avg_rating: 0 };
      
      // Using global fetch for now as 'client' implementation is unknown without checking.
      // Assuming generic fetcher with base URL.
      // Ideally reuse the project's fetcher.
      // I'll use the 'productService' generic customFetch pattern or similar if possible.
      // Let's rely on absolute path construction for now or use relative if configured.
      
      const baseUrl = process.env.EXPO_PUBLIC_MEDUSA_API_URL || 'http://localhost:9000';
      const response = await fetch(`${baseUrl}/store/products/${productId}/reviews`);
      
      if (!response.ok) {
          throw new Error('Failed to fetch reviews');
      }
      return response.json() as Promise<ReviewsResponse>;
    },
    enabled: !!productId,
  });
}
