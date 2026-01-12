import { View, Text, ActivityIndicator } from 'react-native';
import { useTrendingProducts } from '@/hooks/useTrendingProducts';
import { ProductCard } from '@/components/product-card';
import { Ionicons } from '@expo/vector-icons';

interface TrendingProductsGridProps {
  onItemPress: (id: string) => void;
}

export function TrendingProductsGrid({ onItemPress }: TrendingProductsGridProps) {
  const { data: products, isLoading } = useTrendingProducts();

  console.log('[TrendingProductsGrid] State:', { count: products?.length, isLoading });

  if (isLoading) {
    return (
      <View className="p-8 items-center">
        <ActivityIndicator size="small" color="#DC2626" />
        <Text className="text-gray-400 mt-2">Загрузка рекомендаций...</Text>
      </View>
    );
  }

  if (!products || products.length === 0) {
    console.log('[TrendingProductsGrid] Empty');
    return null;
  }

  return (
    <View className="px-2 pt-2 pb-8">
      <View className="flex-row items-center px-2 mb-3 mt-2">
         <Ionicons name="flame" size={18} color="#D97706" style={{ marginRight: 6 }} />
         <Text className="text-lg font-bold text-gray-900">Рекомендуем вам</Text>
      </View>
      
      <View className="flex-row flex-wrap">
        {products.map((product) => (
          <View key={product.id} style={{ width: '50%', padding: 4 }}>
             <ProductCard 
                product={product} 
                onPress={() => onItemPress(product.id)} 
             />
          </View>
        ))}
      </View>
    </View>
  );
}
