import { authService } from './auth.service';

const MEDUSA_API_URL = process.env.EXPO_PUBLIC_MEDUSA_API_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_PUBLISHABLE_KEY || '';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  average_rating: number;
  distribution: Record<number, number>;
}

export interface CanReviewResponse {
  can_review: boolean;
  order_id?: string;
  reason?: string;
}

class ReviewService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${MEDUSA_API_URL}${endpoint}`;
    const token = await authService.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(PUBLISHABLE_KEY && { 'x-publishable-api-key': PUBLISHABLE_KEY }),
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  async getReviews(productId: string): Promise<ReviewsResponse> {
    return this.request(`/store/products/${productId}/reviews`);
  }

  async checkCanReview(productId: string): Promise<CanReviewResponse> {
    return this.request(`/store/products/${productId}/can-review`);
  }

  async createReview(productId: string, rating: number, comment?: string): Promise<{ review: Review }> {
    return this.request(`/store/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  }
}

export const reviewService = new ReviewService();
