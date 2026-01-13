import { useQuery } from '@tanstack/react-query';
import { reviewService } from '@/services/review.service';

export function useProductReviews(productId?: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (!productId) return { reviews: [], total: 0, average_rating: 0, distribution: {} };
      return reviewService.getReviews(productId);
    },
    enabled: !!productId,
  });
}
