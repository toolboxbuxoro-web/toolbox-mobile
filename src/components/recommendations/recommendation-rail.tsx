import { View, Text, Pressable, ScrollView } from 'react-native';
import { ProductCard } from '../product-card';
import { Product } from '@/types/product';
import { useFavoritesStore } from '@/store/favorites-store';
import { Skeleton } from '../ui/skeleton';

interface RecommendationRailProps {
  title: string;
  products: Product[];
  isLoading: boolean;
  renderItem?: (product: Product) => React.ReactNode;
}

export function RecommendationRail({ title, products, isLoading, renderItem }: RecommendationRailProps) {
  if (isLoading) {
    return (
      <View className="mb-6 px-4">
        <Skeleton height={20} width={150} style={{ marginBottom: 16 }} />
        <View className="flex-row">
          {[1, 2, 3].map((i) => (
            <View key={i} className="mr-4 w-[140px]">
              <Skeleton height={180} width={140} borderRadius={12} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (products.length === 0) return null;

  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between px-4 mb-4">
        <Text className="text-dark font-black uppercase text-base tracking-wider border-l-4 border-primary pl-3">
          {title}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {products.map((product) => (
          <View key={product.id} className="mr-3">
            {renderItem ? (
              renderItem(product)
            ) : (
              <View style={{ width: 154 }}>
                <ProductCard product={product} />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
