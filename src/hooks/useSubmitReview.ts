import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/review.service';

interface SubmitReviewData {
  productId: string;
  rating: number;
  comment?: string;
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, rating, comment }: SubmitReviewData) => {
      return reviewService.createReview(productId, rating, comment);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      // Clear can-review cache as user just reviewed
      queryClient.invalidateQueries({ queryKey: ['can-review', variables.productId] });
    },
  });
}
