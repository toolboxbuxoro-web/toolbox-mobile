import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth.service';

interface SubmitReviewData {
  productId: string;
  rating: number;
  comment?: string;
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, rating, comment }: SubmitReviewData) => {
      const baseUrl = process.env.EXPO_PUBLIC_MEDUSA_API_URL || 'http://localhost:9000';
      
      const token = await authService.getToken();
      
      const response = await fetch(`${baseUrl}/store/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      // Also potentially invalidate product details if we added rating stats to it.
    },
  });
}
