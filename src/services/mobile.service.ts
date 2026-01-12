import { HomeBanner } from '../types/mobile';

const MEDUSA_API_URL = process.env.EXPO_PUBLIC_MEDUSA_API_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_PUBLISHABLE_KEY || '';

class MobileService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${MEDUSA_API_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(PUBLISHABLE_KEY && { 'x-publishable-api-key': PUBLISHABLE_KEY }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Medusa API Error: ${response.status} ${JSON.stringify(errorBody)}`);
    }

    return response.json();
  }
  /**
   * Fetch banners from store metadata.
   * This is optional content - NEVER throws, returns [] on any failure.
   */
  async getBanners(): Promise<HomeBanner[]> {
    try {
      const url = `${MEDUSA_API_URL}/store/banners`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(PUBLISHABLE_KEY && { 'x-publishable-api-key': PUBLISHABLE_KEY }),
      };

      const response = await fetch(url, { headers });

      if (!response.ok) {
        console.warn(`[MobileService] getBanners: /store/banners returned ${response.status}, skipping banners`);
        return [];
      }

      const data = await response.json();
      const rawBanners = data?.banners || [];
      
      // Map backend fields to frontend interface
      return rawBanners.map((b: any) => ({
        id: b.id,
        image: b.image_url,
        action: b.href || '/',
        title: {
          ru: b.title || '',
          uz: b.title_uz || b.title || ''
        }
      }));
    } catch {
      console.warn('[MobileService] getBanners: Network/parse error, skipping banners');
      return [];
    }
  }
}

export const mobileService = new MobileService();
