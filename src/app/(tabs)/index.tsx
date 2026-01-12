import React, { useState, useCallback, useMemo } from 'react';
import { View, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { HOME_PAGE_CONFIG } from '@/types/mobile';
import { useQueryClient } from '@tanstack/react-query';
import { HomeHeader, SectionRenderer } from '@/components/home';
import { SearchOverlay } from '@/components/home/SearchOverlay';
import { MainFeedHeader } from '@/components/home/MainFeedHeader';
import { ProductCard } from '@/components/product-card';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { track } from '@/lib/analytics/track';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useRecommendations } from '@/hooks/useRecommendations';
import { RecommendationRail } from '@/components/recommendations/recommendation-rail';

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { recentlyViewedProducts } = useRecommendations();

  const { 
    data, 
    isLoading, 
    isFetchingNextPage, 
    hasNextPage, 
    fetchNextPage, 
    refetch: refreshQuery
  } = useInfiniteProducts();
  
  const products = useMemo(() => data?.pages.flat() ?? [], [data]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    track('screen_view', { screen: 'home' });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['products', 'infinite'] });
    await refreshQuery();
    setRefreshing(false);
  }, [queryClient, refreshQuery]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <HomeHeader 
        searchPlaceholder="Шуруповёрт, дрель, перчатки…" 
        isSearchActive={isSearchActive}
        onSearchActivate={() => {
          setIsSearchActive(true);
          track('section_click', { section_type: 'search_bar', action: 'activate' });
        }}
        onSearchDeactivate={() => {
          setIsSearchActive(false);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <View style={{ flex: 1, position: 'relative' }}>
        {isSearchActive && (
          <View style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 50, 
            backgroundColor: '#fff' 
          }}>
            <SearchOverlay 
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onClose={() => setIsSearchActive(false)}
            />
          </View>
        )}
      
        <FlashList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 100, backgroundColor: '#fff' }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" />
          }
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          
          ListHeaderComponent={
            <View>
              {HOME_PAGE_CONFIG.map((item, index) => (
                <SectionRenderer key={item.id} section={item as any} index={index} />
              ))}
              
              <RecommendationRail 
                title="Вы смотрели" 
                products={recentlyViewedProducts} 
                isLoading={false} 
              />

              <MainFeedHeader />
            </View>
          }

          ListFooterComponent={
            <View className="py-10 items-center">
              {isFetchingNextPage ? (
                <>
                  <ActivityIndicator size="small" color="#DC2626" />
                  <Text className="text-gray-400 text-xs mt-2 uppercase font-bold tracking-widest">
                    Загрузка инструментов...
                  </Text>
                </>
              ) : !hasNextPage && products.length > 0 ? (
                <Text className="text-gray-400 text-xs uppercase font-bold tracking-widest">
                  Вы просмотрели весь каталог
                </Text>
              ) : null}
            </View>
          }

          renderItem={({ item }) => (
            <View style={{ flex: 1, paddingHorizontal: 4, paddingBottom: 8 }}>
              <ProductCard 
                product={item} 
                onPress={() => router.push(`/product/${item.id}`)}
              />
            </View>
          )}
        />
      </View>
    </View>
  );
}

