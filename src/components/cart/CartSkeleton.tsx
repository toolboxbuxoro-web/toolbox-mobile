import React from 'react';
import { View, Dimensions } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';

const SCREEN_WIDTH = Dimensions.get('window').width;

export function CartSkeleton() {
  return (
    <View className="flex-1 bg-gray-50 p-4">
      {/* Items Skeleton */}
      {[1, 2, 3].map((i) => (
        <View key={i} className="bg-white rounded-2xl p-4 mb-3 flex-row shadow-sm">
          <Skeleton width={96} height={96} borderRadius={12} style={{ marginRight: 12 }} />
          <View className="flex-1 space-y-2">
            <Skeleton width="100%" height={20} />
            <Skeleton width="60%" height={20} />
            <View className="flex-row justify-between items-center mt-2">
              <Skeleton width={80} height={32} borderRadius={8} />
              <Skeleton width={32} height={32} borderRadius={8} />
            </View>
          </View>
        </View>
      ))}

      {/* Summary Skeleton */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <View className="space-y-3 mb-4">
          <View className="flex-row justify-between">
            <Skeleton width={80} height={16} />
            <Skeleton width={40} height={16} />
          </View>
          <View className="flex-row justify-between">
            <Skeleton width={60} height={24} />
            <Skeleton width={120} height={24} />
          </View>
        </View>
        <Skeleton width="100%" height={56} borderRadius={12} />
      </View>
    </View>
  );
}
