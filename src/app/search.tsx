import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, Keyboard } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { useSearch } from '@/hooks/useSearch';
import { FilterSheet } from '@/components/search/FilterSheet';
import { ActiveFiltersBar } from '@/components/search/ActiveFiltersBar';
import { SearchSuggestions } from '@/components/search/SearchSuggestions';
import { PopularSearches } from '@/components/search/PopularSearches';
import { TrendingProductsGrid } from '@/components/search/TrendingProductsGrid';
import { SortBottomSheet } from '@/components/search/SortBottomSheet';
import { SortOption, SORT_OPTIONS_CONFIG } from '@/types/search';
import { track } from '@/lib/analytics/track';
import BottomSheet from '@gorhom/bottom-sheet';

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const filterSheetRef = useRef<BottomSheet>(null);
  const sortSheetRef = useRef<BottomSheet>(null);
  
  // Local state to track if search was actually "submitted"
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { 
    query, setQuery, debouncedQuery, products, isLoading, error, 
    activeFilterCount, refetch, loadMore, hasMore, isLoadingMore, page,
    sortBy, setSort
  } = useSearch();
  
  const { searches, clearSearches, removeSearch, addSearch } = useRecentSearches();

  useEffect(() => {
    track('screen_view', { screen: 'search' });
  }, []);

  const handleProductPress = (id: string) => {
    router.push(`/product/${id}`);
  };

  const handleSearchSubmit = (text: string) => {
    if (text.trim().length > 0) {
      addSearch(text.trim());
      setIsSubmitted(true);
      Keyboard.dismiss();

      // Track as separate async trigger to avoid blocking UI
      setTimeout(() => {
        track('search_performed', { 
            query: text, 
            source: 'manual',
            results_count: products.length 
        });
        if (products.length === 0 && !isLoading) {
            track('search_no_results', { query: text });
        }
      }, 500);
    }
  };

  const handleSuggestionSelect = (term: string) => {
    setQuery(term);
    track('section_click', { section_type: 'search_suggestion', term });
    handleSearchSubmit(term);
  };

  const handleHistoryPress = (term: string) => {
    setQuery(term);
    track('section_click', { section_type: 'search_history', term });
    handleSearchSubmit(term);
  };

  const clearSearch = () => {
    setQuery('');
    setIsSubmitted(false);
    inputRef.current?.focus();
  };

  const openFilters = () => {
    filterSheetRef.current?.expand();
  };

  const openSort = () => {
    sortSheetRef.current?.expand();
  };

  // Reset isSubmitted when query is cleared via typing
  useEffect(() => {
    if (query.length === 0) {
      setIsSubmitted(false);
    }
  }, [query]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header / Search Input */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            ref={inputRef}
            className="flex-1 ml-2 text-dark font-medium h-8"
            placeholder="Поиск инструментов..."
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (isSubmitted) setIsSubmitted(false);
            }}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={(e) => handleSearchSubmit(e.nativeEvent.text)}
          />
          {query.length > 0 && (
            <Pressable onPress={clearSearch}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        <Pressable 
          onPress={openFilters}
          className="ml-3 p-2 bg-gray-100 rounded-xl relative active:bg-gray-200"
        >
          <Ionicons name="options-outline" size={22} color="#1F2937" />
          {activeFilterCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-primary w-5 h-5 rounded-full items-center justify-center border-2 border-white">
              <Text className="text-white text-[10px] font-black">{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ActiveFiltersBar />

      {/* Content */}
      <View className="flex-1 bg-gray-50">
        {/* State: Initial (Empty Query) */}
        {!isSubmitted && query.length === 0 && (
           <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
             {searches.length > 0 && (
               <View className="p-4">
                  <View className="flex-row justify-between items-center mb-4">
                     <Text className="text-dark font-black uppercase text-xs tracking-widest">История поиска</Text>
                     <Pressable onPress={clearSearches}>
                        <Text className="text-primary text-xs font-bold uppercase">Очистить</Text>
                     </Pressable>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                     {searches.map((item, index) => (
                        <Pressable 
                           key={index} 
                           onPress={() => handleHistoryPress(item)}
                           className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full flex-row items-center"
                        >
                           <Text className="text-gray-700 text-sm mr-2">{item}</Text>
                           <Pressable onPress={() => removeSearch(item)}>
                              <Ionicons name="close" size={14} color="#9CA3AF" />
                           </Pressable>
                        </Pressable>
                     ))}
                  </View>
               </View>
             )}
             
             <PopularSearches onSelect={handleSuggestionSelect} />

             <TrendingProductsGrid onItemPress={handleProductPress} />
           </ScrollView>
        )}

        {/* State: Suggestions while typing */}
        {!isSubmitted && query.length >= 2 && (
          <SearchSuggestions 
            query={query}
            recentSearches={searches}
            onSelect={handleSuggestionSelect}
            onRemoveRecent={removeSearch}
          />
        )}

        {/* State: Results (only when submitted or loading for submitted) */}
        {isSubmitted && (
          <>
            {isLoading && page === 1 ? (
              <View className="p-4 flex-row flex-wrap justify-between">
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
            ) : error ? (
              <View className="flex-1 items-center justify-center p-6 text-center">
                <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                <Text className="text-gray-500 mt-2 text-center">
                  Произошла ошибка при загрузке результатов.
                  {error instanceof Error ? error.message : String(error)}
                </Text>
                <Pressable onPress={() => refetch()} className="mt-4 bg-primary px-4 py-2 rounded-lg">
                  <Text className="text-white font-bold">Повторить</Text>
                </Pressable>
              </View>
            ) : products.length === 0 ? (
              <View className="flex-1 items-center justify-center p-6">
                <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                <Text className="text-dark font-black uppercase text-lg mt-4">Ничего не найдено</Text>
                <Text className="text-gray-500 text-center mt-2">
                  Попробуйте изменить запрос или сбросить фильтры
                </Text>
              </View>
            ) : (
              <>
                <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                  <Text className="text-gray-500 text-sm font-medium">
                    Найдено {products.length} товаров
                  </Text>
                  <Pressable 
                    onPress={openSort}
                    className="flex-row items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
                  >
                    <Ionicons name="swap-vertical" size={16} color="#4B5563" />
                    <Text className="ml-2 text-gray-700 font-bold text-xs uppercase">
                      {SORT_OPTIONS_CONFIG[sortBy].label}
                    </Text>
                  </Pressable>
                </View>

                <FlashList
                  data={products}
                  numColumns={2}
                  keyExtractor={(item) => item.id}
                  onRefresh={refetch}
                  refreshing={isLoading && products.length > 0}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.3}
                  contentContainerStyle={{ padding: 8, paddingBottom: 100 }}
                  ListEmptyComponent={() => {
                    if (isLoading) return null;
                    return (
                      <View className="flex-1 items-center justify-center p-6">
                        <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                        <Text className="text-dark font-black uppercase text-lg mt-4">Ничего не найдено</Text>
                      </View>
                    );
                  }}
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
              </>
            )}
          </>
        )}
      </View>

      <FilterSheet 
        sheetRef={filterSheetRef} 
        onApply={() => {
          setIsSubmitted(true);
          Keyboard.dismiss();
        }} 
      />

      <SortBottomSheet
        sheetRef={sortSheetRef}
        currentSort={sortBy}
        onSelect={setSort}
      />
    </SafeAreaView>
  );
}
