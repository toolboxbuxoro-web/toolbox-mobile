import * as SecureStore from 'expo-secure-store';
import { Order, StoreOrderListResponse } from '../types/order';

const MEDUSA_API_URL = process.env.EXPO_PUBLIC_MEDUSA_API_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_PUBLISHABLE_KEY || '';
const TOKEN_KEY = 'auth_token';

class OrderService {
  private async getHeaders() {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      ...(PUBLISHABLE_KEY && { 'x-publishable-api-key': PUBLISHABLE_KEY }),
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async listOrders(): Promise<StoreOrderListResponse> {
    const url = `${MEDUSA_API_URL}/store/orders`;
    const headers = await this.getHeaders();

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `Error ${response.status}`);
    }

    return response.json();
  }

  async retrieveOrder(id: string): Promise<{ order: Order }> {
    const url = `${MEDUSA_API_URL}/store/orders/${id}`;
    const headers = await this.getHeaders();

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `Error ${response.status}`);
    }

    return response.json();
  }
}

export const orderService = new OrderService();
