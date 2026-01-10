export interface Order {
  id: string;
  display_id: number;
  status: string;
  fulfillment_status: string;
  payment_status: string;
  total: number;
  currency_code: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  title: string;
  thumbnail: string;
  quantity: number;
  unit_price: number;
}

export interface StoreOrderListResponse {
  orders: Order[];
  count: number;
  offset: number;
  limit: number;
}
