import { Cart, StoreCartResponse } from '../types/cart';

const MEDUSA_API_URL = process.env.EXPO_PUBLIC_MEDUSA_API_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_PUBLISHABLE_KEY || '';

class CartService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${MEDUSA_API_URL}${endpoint}`;
    
    // Medusa requires 'application/json' for most post/puts
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

  async createCart(regionId?: string): Promise<Cart> {
    // Default to Uzbekistan region for consistency
    const DEFAULT_REGION_ID = 'reg_01KAY0QXWMQSDRYZRGRCKE0GAN';
    const body = { region_id: regionId || DEFAULT_REGION_ID };
    const data = await this.request<StoreCartResponse>('/store/carts', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return data.cart;
  }

  async getCart(cartId: string): Promise<Cart> {
    const fields = '*items.variant.product';
    const data = await this.request<StoreCartResponse>(`/store/carts/${cartId}?fields=${fields}`);
    return data.cart;
  }

  async addItem(cartId: string, variantId: string, quantity: number): Promise<Cart> {
    const fields = '*items.variant.product';
    const data = await this.request<StoreCartResponse>(`/store/carts/${cartId}/line-items?fields=${fields}`, {
      method: 'POST',
      body: JSON.stringify({ variant_id: variantId, quantity }),
    });
    return data.cart;
  }

  async updateItem(cartId: string, lineItemId: string, quantity: number): Promise<Cart> {
    const fields = '*items.variant.product';
    const data = await this.request<StoreCartResponse>(`/store/carts/${cartId}/line-items/${lineItemId}?fields=${fields}`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
    return data.cart;
  }

  async removeItem(cartId: string, lineItemId: string): Promise<Cart> {
    const fields = '*items.variant.product';
    const data = await this.request<StoreCartResponse>(`/store/carts/${cartId}/line-items/${lineItemId}?fields=${fields}`, {
      method: 'DELETE',
    });
    return data.cart;
  }

  async updateCart(cartId: string, updates: {
    shipping_address?: {
      first_name: string;
      last_name?: string;
      phone: string;
      address_1: string;
      city: string;
      country_code: string;
      postal_code?: string;
    };
    email?: string;
    metadata?: Record<string, any>;
  }): Promise<Cart> {
    const data = await this.request<StoreCartResponse>(`/store/carts/${cartId}`, {
      method: 'POST',
      body: JSON.stringify(updates),
    });
    return data.cart;
  }

  async setShippingMethod(cartId: string, optionId: string): Promise<Cart> {
    const data = await this.request<StoreCartResponse>(`/store/carts/${cartId}/shipping-methods`, {
      method: 'POST',
      body: JSON.stringify({ option_id: optionId }),
    });
    return data.cart;
  }

  async getShippingOptions(cartId: string): Promise<any[]> {
    const data = await this.request<{ shipping_options: any[] }>(`/store/shipping-options?cart_id=${cartId}`);
    return data.shipping_options || [];
  }

  /**
   * Check payment status by retrieving cart and inspecting payment session.
   * Replicates web storefront's /api/check-payment logic inline.
   * Returns: 'pending' | 'authorized' | 'completed' | 'cancelled' | 'error'
   */
  async checkPaymentStatus(cartId: string): Promise<string> {
    try {
      const cart = await this.getCart(cartId);
      
      // If cart is completed, order was created
      if (cart.completed_at) {
        return 'completed';
      }
      
      const paymentSession = cart.payment_collection?.payment_sessions?.[0];
      if (!paymentSession) {
        return 'pending';
      }
      
      const sessionData = paymentSession.data as any;
      
      // Payme-specific states
      if (paymentSession.provider_id?.includes('payme')) {
        if (sessionData?.payme_state === 2) {
          return 'authorized';
        }
        if (sessionData?.payme_state === -1 || sessionData?.payme_state === -2) {
          return 'cancelled';
        }
      }
      
      // Click-specific states
      if (paymentSession.provider_id?.includes('click')) {
        if (sessionData?.click_state === 'paid' || sessionData?.click_state === 'completed' || sessionData?.click_error === 0) {
          return 'authorized';
        }
        if (sessionData?.click_state === 'cancelled' || (typeof sessionData?.click_error === 'number' && sessionData.click_error < 0)) {
          return 'cancelled';
        }
      }
      
      // Generic authorized check
      if (paymentSession.status === 'authorized') {
        return 'authorized';
      }
      
      return 'pending';
    } catch (err: any) {
      // Cart not found = likely converted to order (success case)
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        return 'completed';
      }
      console.error('[CartService] checkPaymentStatus error:', err);
      return 'error';
    }
  }

  /**
   * P0 Workaround: Uses custom backend endpoint to force-attach shipping 
   * without price validation (required for BTS zero-price options)
   */
  async setShippingMethodBTS(cartId: string, optionId: string, amount: number = 0): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/store/bts/shipping-method`, {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId, shipping_option_id: optionId, amount }),
    });
  }

  /**
   * Medusa 2.0: Create a payment collection for the cart
   */
  async createPaymentCollection(cartId: string): Promise<{ payment_collection: { id: string } }> {
    return this.request<{ payment_collection: { id: string } }>(`/store/payment-collections`, {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId }),
    });
  }

  /**
   * Medusa 2.0: Initiate session on a specific payment collection
   */
  async initiatePaymentSession(collectionId: string, providerId: string): Promise<any> {
    return this.request(`/store/payment-collections/${collectionId}/payment-sessions`, {
      method: 'POST',
      body: JSON.stringify({ provider_id: providerId }),
    });
  }

  /**
   * Medusa 2.0: Get payment collection details (used for polling status)
   */
  async getPaymentCollection(collectionId: string): Promise<any> {
    return this.request(`/store/payment-collections/${collectionId}`);
  }

  async complete(cartId: string): Promise<import('../types/cart').Order> {
    const data = await this.request<import('../types/cart').StoreCompleteCartRes>(`/store/carts/${cartId}/complete`, {
      method: 'POST',
    });
    
    if (data.type !== 'order') {
       throw new Error('Cart completion did not return an order. Is payment required?');
    }

    return data.data;
  }
}

export const cartService = new CartService();
