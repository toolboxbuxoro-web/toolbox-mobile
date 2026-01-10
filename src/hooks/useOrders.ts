import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/order.service';
import { Order } from '../types/order';
import { useAuthStore } from '../store/auth-store';

export type OrdersState = 'loading' | 'empty' | 'loaded' | 'error';

export function useOrders() {
  const [state, setState] = useState<OrdersState>('loading');
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { status } = useAuthStore();

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (status !== 'authorized') return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setState('loading');
    }

    try {
      const data = await orderService.listOrders();
      // Sort orders by date, newest first
      const sortedOrders = [...data.orders].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOrders(sortedOrders);
      
      if (data.orders.length === 0) {
        setState('empty');
      } else {
        setState('loaded');
      }
    } catch (error) {
      console.error('[useOrders] Error fetching orders:', error);
      setState('error');
    } finally {
      setRefreshing(false);
    }
  }, [status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    state,
    orders,
    refreshing,
    refresh: () => fetchOrders(true),
    retry: () => fetchOrders(false),
  };
}
