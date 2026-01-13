import { useQuery } from '@tanstack/react-query';
import { reviewService } from '@/services/review.service';
import { useAuthStore } from '@/store/auth-store';

export function useCanReview(productId: string) {
  const { status } = useAuthStore();
  const isLoggedIn = status === 'authorized';

  return useQuery({
    queryKey: ['can-review', productId],
    queryFn: () => reviewService.checkCanReview(productId),
    enabled: !!productId && isLoggedIn,
    retry: false,
  });
}
