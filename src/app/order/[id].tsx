import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { orderService } from '../../services/order.service';
import { Order } from '../../types/order';
import { Ionicons } from '@expo/vector-icons';
import { formatMoney, formatOrderDate, getOrderStatus, getOrderDisplayDate } from '../../lib/formatters';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await orderService.retrieveOrder(id);
        setOrder(data.order);
      } catch (err) {
        console.error('[OrderDetailScreen] Error:', err);
        setError('Не удалось загрузить детали заказа');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#D1D5DB" />
        <Text style={styles.errorText}>{error || 'Заказ не найден'}</Text>
      </View>
    );
  }

  const statusInfo = getOrderStatus(order);
  const displayDate = getOrderDisplayDate(order);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `Заказ №${order.display_id}`,
          headerBackTitle: 'Назад',
          headerShadowVisible: false,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatOrderDate(displayDate)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Состав заказа</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemImageContainer}>
                {item.thumbnail ? (
                  <Image source={{ uri: item.thumbnail }} style={styles.itemImage} />
                ) : (
                  <Ionicons name="image-outline" size={24} color="#D1D5DB" />
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} шт. × {formatMoney(item.unit_price)}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatMoney(item.quantity * item.unit_price)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Итого</Text>
            <Text style={styles.summaryPrice}>
              {formatMoney(order.total)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scrollContent: {
    padding: 20,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 28,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  summarySection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#DC2626',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
