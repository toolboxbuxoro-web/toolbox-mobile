import { useQuery } from '@tanstack/react-query';
import { mobileService } from '../services/mobile.service';
import { HomeBanner } from '../types/mobile';

export function useBanners() {
  return useQuery<HomeBanner[], Error>({
    queryKey: ['mobile', 'banners'],
    queryFn: () => mobileService.getBanners(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
