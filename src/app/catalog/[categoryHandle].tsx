import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProductCard } from '../../components/product-card';
import { useCategoryByHandle } from '@/hooks/useCategories';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { useMemo, useCallback } from 'react';

export default function CategoryProductsScreen() {
  const { categoryHandle } = useLocalSearchParams<{ categoryHandle: string }>();
  const router = useRouter();
  
  // 1. Fetch Category details (for the header title)
  const { data: category, isLoading: isLoadingCategory } = useCategoryByHandle(categoryHandle!);
  
  // 2. Fetch Products with infinite scroll
  const { 
    data,
    isLoading: isLoadingProducts, 
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error, 
    refetch 
  } = useInfiniteProducts({ 
    categoryId: category?.id,
    enabled: !!category?.id 
  });
  
  const products = useMemo(() => data?.pages.flat() ?? [], [data]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  const categoryTitle = category?.name || 'Загрузка...';

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: categoryTitle.toUpperCase(),
          headerStyle: { backgroundColor: '#111827' }, 
          headerTintColor: '#FFFFFF', 
          headerTitleStyle: { fontWeight: '900', fontSize: 16 },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          ),
          headerRight: () => (
             <Pressable>
                <Ionicons name="options-outline" size={24} color="#FFFFFF" />
             </Pressable>
          ),
          headerShadowVisible: false,
        }} 
      />
      
      {/* Search / Filter Bar */}
      <View className="bg-dark px-4 pb-4">
         <Text className="text-gray-400 text-xs uppercase tracking-widest font-bold">
            Найдено {products ? products.length : 0} товаров
         </Text>
      </View>

      {(isLoadingCategory || (isLoadingProducts && products.length === 0)) ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#333" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-4">
            <Text className="text-red-500 text-center mb-4">Не удалось загрузить товары</Text>
            <Pressable onPress={() => router.replace('/(tabs)/catalog')} className="bg-primary px-4 py-2 rounded-sm">
                <Text className="text-white font-bold">Вернуться</Text>
            </Pressable>
        </View>
      ) : (
        <FlashList
            data={products}
            numColumns={2}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 4, paddingTop: 8, paddingBottom: 40 }}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            refreshing={isLoadingProducts && products.length > 0}
            onRefresh={refetch}
            ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center pt-24 opactiy-50">
                <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4 border-2 border-gray-300 border-dashed">
                <Ionicons name="construct-outline" size={48} color="#9ca3af" />
                </View>
                <Text className="text-dark text-xl font-black uppercase tracking-wide">Список пуст</Text>
                <Text className="text-gray-500 text-sm mt-2 text-center px-10">
                    В этой категории пока нет товаров.
                </Text>
            </View>
            )}
            ListFooterComponent={() => (
              <View className="py-6 items-center">
                {isFetchingNextPage ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : !hasNextPage && products.length > 0 ? (
                  <Text className="text-gray-400 text-xs uppercase font-bold tracking-widest">
                    Все товары загружены
                  </Text>
                ) : null}
              </View>
            )}
            renderItem={({ item }) => (
            <View style={{ flex: 1, paddingHorizontal: 4, paddingBottom: 8 }}>
                <ProductCard
                    product={item}
                    onPress={() => handleProductPress(item.id)}
                />
            </View>
            )}
        />
      )}
    </View>
  );
}
