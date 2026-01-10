import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Order } from '../../types/cart';
import { formatMoney, formatOrderDateShort, getOrderStatus } from '../../lib/formatters';

interface LastOrderCardProps {
  order?: Order;
}

/**
 * LastOrderCard component that displays summary of the most recent order.
 * Follows strict rules: only renders if data is provided and uses unified formatters.
 */
export function LastOrderCard({ order }: LastOrderCardProps) {
  const router = useRouter();

  if (!order) return null;

  const statusInfo = getOrderStatus(order as any);

  const handlePress = () => {
    router.push(`/order/${order.id}`);
  };

  const handleViewAll = () => {
    router.push('/orders');
  };

  return (
    <View className="px-4 mt-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-900 text-lg font-bold">Последний заказ</Text>
        <Pressable onPress={handleViewAll}>
          <Text className="text-primary font-bold text-sm">Все</Text>
        </Pressable>
      </View>

      <Pressable 
        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex-row items-center"
        onPress={handlePress}
      >
        <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center mr-3">
          <Ionicons name="cube-outline" size={24} color="#374151" />
        </View>

        <View className="flex-1">
          <Text className="text-gray-900 font-bold text-base">
            Заказ №{order.display_id}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-500 text-xs">
              {formatOrderDateShort(order.created_at)}
            </Text>
            <Text className="text-gray-300 text-xs mx-2">•</Text>
            <View 
              className="px-2 py-0.5 rounded"
              style={{ backgroundColor: statusInfo.bgColor }}
            >
              <Text style={{ color: statusInfo.color, fontSize: 10, fontWeight: '700' }}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-gray-900 font-bold">
            {formatMoney(order.total)}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#E5E7EB" style={{ marginTop: 4 }} />
        </View>
      </Pressable>
    </View>
  );
}
