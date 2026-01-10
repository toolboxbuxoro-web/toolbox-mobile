import { Order } from '../../types/order';

export interface OrderStatusInfo {
  label: string;
  color: string;
  bgColor: string;
  icon: 'time-outline' | 'sync-outline' | 'checkmark-circle-outline' | 'close-circle-outline' | 'cube-outline';
}

/**
 * Maps Medusa order statuses to human-readable UX statuses.
 * Uses Uzum-style soft colors for a premium mobile experience.
 * 
 * @param order - The order object
 * @param locale - The locale for label text ('ru' or 'uz')
 * @returns StatusInfo object with label, colors, and icon
 */
export function getOrderStatus(order: Order, locale: 'ru' | 'uz' = 'ru'): OrderStatusInfo {
  const status = order.status?.toLowerCase() || 'pending';

  const labels: Record<string, { ru: string; uz: string }> = {
    pending: { ru: 'Принят', uz: 'Qabul qilindi' },
    processing: { ru: 'В обработке', uz: 'Jarayonda' },
    fulfilled: { ru: 'Готов к получению', uz: 'Olib ketishga tayyor' },
    completed: { ru: 'Завершён', uz: 'Yakunlandi' },
    canceled: { ru: 'Отменён', uz: 'Bekor qilindi' },
  };

  // Uzum-style soft, non-acidic colors
  const statusMap: Record<string, Omit<OrderStatusInfo, 'label'>> = {
    pending: { 
      color: '#92400E', // Warm amber text
      bgColor: '#FEF3C7', // Soft amber bg
      icon: 'time-outline'
    },
    processing: { 
      color: '#1E40AF', // Deep blue text
      bgColor: '#DBEAFE', // Soft blue bg
      icon: 'sync-outline'
    },
    fulfilled: { 
      color: '#065F46', // Deep green text
      bgColor: '#D1FAE5', // Soft green bg
      icon: 'checkmark-circle-outline'
    },
    completed: { 
      color: '#374151', // Neutral gray text
      bgColor: '#F3F4F6', // Light gray bg
      icon: 'cube-outline'
    },
    canceled: { 
      color: '#991B1B', // Deep red text
      bgColor: '#FEE2E2', // Soft red bg
      icon: 'close-circle-outline'
    },
  };

  const info = statusMap[status] || statusMap.pending;
  const label = labels[status]?.[locale] || labels.pending[locale];

  return { ...info, label };
}

/**
 * Determines which date to display for an order.
 * - fulfilled orders: show fulfilled_at (when ready)
 * - other orders: show created_at
 * 
 * @param order - The order object
 * @returns The appropriate date string to display
 */
export function getOrderDisplayDate(order: Order): string {
  if (order.status?.toLowerCase() === 'fulfilled' && order.fulfilled_at) {
    return order.fulfilled_at;
  }
  return order.created_at;
}
