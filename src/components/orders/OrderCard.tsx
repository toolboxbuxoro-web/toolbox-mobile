import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Order } from '../../types/order';
import { formatMoney, formatOrderDateShort, getOrderStatus, getOrderDisplayDate } from '../../lib/formatters';

interface OrderCardProps {
  order: Order;
  onPress: (id: string) => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const statusInfo = getOrderStatus(order);
  const displayDate = getOrderDisplayDate(order);

  const getItemsSummary = () => {
    if (!order.items || order.items.length === 0) return '';
    const mainItem = order.items[0].title;
    const extraCount = order.items.length - 1;
    return extraCount > 0 
      ? `${mainItem} + ${extraCount} ${extraCount === 1 ? 'товар' : 'товара'}`
      : mainItem;
  };

  return (
    <Pressable 
      style={styles.card}
      onPress={() => onPress(order.id)}
      android_ripple={{ color: '#F3F4F6' }}
    >
      <View style={styles.header}>
        <Text style={styles.orderId}>Заказ №{order.display_id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.date}>{formatOrderDateShort(displayDate)}</Text>
      
      <Text style={styles.itemsSummary} numberOfLines={1}>
        {getItemsSummary()}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Сумма заказа</Text>
        <Text style={styles.totalPrice}>
          {formatMoney(order.total)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minHeight: 24, // Fixed height prevents jumping
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  date: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  itemsSummary: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
});
