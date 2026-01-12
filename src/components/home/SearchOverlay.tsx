import React from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useSearch } from '@/hooks/useSearch';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'expo-router';
import { PopularSearches } from '@/components/search/PopularSearches';
import { TrendingProductsGrid } from '@/components/search/TrendingProductsGrid';

interface SearchOverlayProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
}

export function SearchOverlay({ query, onQueryChange, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const { searches, removeSearch, clearSearches } = useRecentSearches();
  const { 
    products, 
    isLoading, 
    error, 
    debouncedQuery,
    refetch,
    loadMore,
    hasMore,
    isLoadingMore,
    page
  } = useSearch(query);

  const handleProductPress = (id: string) => {
    router.push(`/product/${id}`);
    onClose();
  };

  const handleHistoryPress = (term: string) => {
    onQueryChange(term);
  };

  console.log('[SearchOverlay] query:', `'${query}'`, 'length:', query.length);

  if (query.length === 0) {
    console.log('[SearchOverlay] Rendering Empty state UI');
    return (
      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        {searches.length > 0 && (
          <View className="p-4 border-b border-gray-50">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-dark font-black uppercase text-xs tracking-widest">Вы недавно искали</Text>
              <Pressable onPress={clearSearches}>
                <Text className="text-gray-400 text-xs font-bold uppercase">Очистить</Text>
              </Pressable>
            </View>
            <View>
              {searches.map((item, index) => (
                <Pressable 
                  key={index} 
                  onPress={() => handleHistoryPress(item)}
                  className="flex-row items-center py-3 border-b border-gray-50 last:border-0"
                >
                  <Ionicons name="time-outline" size={20} color="#999" />
                  <Text className="flex-1 text-dark text-base ml-3">{item}</Text>
                  <Pressable onPress={() => removeSearch(item)} className="p-1">
                    <Ionicons name="close" size={18} color="#D1D5DB" />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <PopularSearches onSelect={onQueryChange} />

        <TrendingProductsGrid onItemPress={handleProductPress} />
      </ScrollView>
    );
  }

  if (isLoading && products.length === 0) {
    return (
      <View className="flex-1 bg-white p-4 flex-row flex-wrap justify-between">
        {[...Array(4)].map((_, i) => (
          <View key={i} style={{ width: '48%', marginBottom: 16 }}>
             <Skeleton height={160} width="100%" />
             <View className="mt-2 space-y-2">
                <Skeleton height={12} width="80%" />
                <Skeleton height={12} width="40%" />
             </View>
          </View>
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-gray-500 mt-2 text-center">Ошибка загрузки</Text>
      </View>
    );
  }

  if (products.length === 0 && debouncedQuery.length > 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Ionicons name="search-outline" size={64} color="#D1D5DB" />
        <Text className="text-dark font-black uppercase text-lg mt-4">Ничего не найдено</Text>
        <Text className="text-gray-500 text-center mt-2">
          Попробуйте изменить запрос
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlashList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{ padding: 8, paddingBottom: 40 }}
        ListFooterComponent={() => {
          if (!hasMore && products.length > 0) {
            return (
              <View className="py-8 items-center">
                <Text className="text-gray-400 text-sm">Все результаты загружены</Text>
              </View>
            );
          }
          if (isLoadingMore) {
            return (
              <View className="py-8 items-center">
                <ActivityIndicator size="small" color="#DC2626" />
                <Text className="text-gray-400 text-sm mt-2">Загрузка...</Text>
              </View>
            );
          }
          return null;
        }}
        renderItem={({ item }) => (
          <View style={{ flex: 1, paddingHorizontal: 4, paddingBottom: 8 }}>
            <ProductCard
              product={item}
              searchQuery={debouncedQuery}
              onPress={() => handleProductPress(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
}
