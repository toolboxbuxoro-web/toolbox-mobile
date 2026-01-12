export interface LineItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  quantity: number;
  unit_price: number;
  variant_id: string;
  variant: {
    id: string;
    title: string;
    weight?: number;
    product: {
      id: string;
      title: string;
      thumbnail: string;
      weight?: number;
    };
  };
  total: number;
}

export interface Cart {
  id: string;
  region_id?: string;
  email?: string;
  items: LineItem[];
  subtotal: number;
  total: number;
  currency_code: string;
  completed_at?: string | null;
  payment_collection?: {
    id: string;
    payment_sessions?: Array<{
      id: string;
      provider_id: string;
      status: string;
      data: Record<string, any>;
    }>;
  };
}

export interface StoreCartResponse {
  cart: Cart;
}

export interface Order {
  id: string;
  display_id: number;
  cart_id: string;
  email: string;
  total: number;
  currency_code: string;
  created_at: string;
  status: string;
  items: LineItem[];
}

export interface StoreCompleteCartRes {
  type: 'order';
  data: Order;
}
