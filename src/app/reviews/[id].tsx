import React, { useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProductReviews } from '@/hooks/useProductReviews';

const RatingBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <View className="flex-row items-center mb-1.5">
      <View className="flex-row items-center w-8">
        <Text className="text-gray-500 text-xs font-bold mr-1">{star}</Text>
        <Ionicons name="star" size={10} color="#F59E0B" />
      </View>
      <View className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden mx-2">
        <View 
          className="h-full bg-yellow-400 rounded-full" 
          style={{ width: `${percentage}%` }} 
        />
      </View>
      <Text className="text-gray-400 text-[10px] w-6 text-right font-medium">{count}</Text>
    </View>
  );
};

const ReviewItem = React.memo(({ review }: { review: any }) => (
  <View className="p-5 border-b border-gray-50 bg-white">
    <View className="flex-row justify-between items-center mb-2">
      <View className="flex-row items-center">
        <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-2 border border-gray-200">
           <Text className="text-gray-500 font-bold text-xs">П</Text>
        </View>
        <Text className="font-bold text-dark text-sm">Покупатель</Text>
      </View>
      <Text className="text-gray-400 text-[10px]">
        {new Date(review.created_at).toLocaleDateString()}
      </Text>
    </View>
    <View className="flex-row mb-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons 
          key={s} 
          name={s <= review.rating ? "star" : "star-outline"} 
          size={12} 
          color="#F59E0B" 
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
    <Text className="text-gray-700 leading-5 text-[15px]">{review.comment}</Text>
  </View>
));

export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, refetch } = useProductReviews(id);
  const router = useRouter();

  const reviews = data?.reviews || [];
  const total = data?.total || 0;
  const avgRating = data?.average_rating || 0;
  const distribution = data?.distribution || {};

  const ListHeader = useMemo(() => (
    <View className="bg-white p-5 mb-2">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-5xl font-black text-dark">{avgRating.toFixed(1)}</Text>
          <View className="flex-row mt-1 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons 
                key={s} 
                name={s <= Math.round(avgRating) ? "star" : "star-outline"} 
                size={16} 
                color="#F59E0B" 
              />
            ))}
          </View>
          <Text className="text-gray-500 text-xs font-bold uppercase">{total} отзывов</Text>
        </View>
        
        <View className="flex-1 ml-10">
          <RatingBar star={5} count={distribution[5] || 0} total={total} />
          <RatingBar star={4} count={distribution[4] || 0} total={total} />
          <RatingBar star={3} count={distribution[3] || 0} total={total} />
          <RatingBar star={2} count={distribution[2] || 0} total={total} />
          <RatingBar star={1} count={distribution[1] || 0} total={total} />
        </View>
      </View>
    </View>
  ), [avgRating, total, distribution]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReviewItem review={item} />}
        ListHeaderComponent={ListHeader}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20 px-10">
            <Ionicons name="chatbubble-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-400 text-center mt-4 text-lg font-medium">
              На этот товар пока никто не оставил отзыв
            </Text>
          </View>
        }
      />
    </View>
  );
}
