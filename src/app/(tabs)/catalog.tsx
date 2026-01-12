import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCategory } from '@/services/category.service';
import { Image } from 'expo-image';
import { useState } from 'react';

interface CategoryItemProps {
  category: ProductCategory;
  level?: number;
  onPress: (handle: string) => void;
}

function CategoryItem({ category, level = 0, onPress }: CategoryItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.category_children && category.category_children.length > 0;
  const iconUrl = category.metadata?.icon_url;

  return (
    <View>
      <Pressable
        onPress={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          } else {
            onPress(category.handle);
          }
        }}
        className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 active:bg-gray-50"
        style={{ paddingLeft: 16 + level * 20 }}
        accessibilityRole="button"
        accessibilityLabel={`Открыть категорию ${category.name}`}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4 overflow-hidden">
            {iconUrl ? (
              <Image
                source={{ uri: iconUrl }}
                style={{ width: 28, height: 28 }}
                contentFit="contain"
              />
            ) : (
              <Ionicons name="grid-outline" size={22} color="#DC2626" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 text-base font-bold">{category.name}</Text>
            {hasChildren && (
              <Text className="text-gray-400 text-xs mt-0.5">
                {category.category_children!.length} подкатегори{category.category_children!.length === 1 ? 'я' : category.category_children!.length < 5 ? 'и' : 'й'}
              </Text>
            )}
          </View>
        </View>
        {hasChildren ? (
          <Ionicons name={expanded ? "chevron-down" : "chevron-forward"} size={20} color="#9CA3AF" />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        )}
      </Pressable>

      {expanded && hasChildren && (
        <View className="bg-gray-50">
          {category.category_children!.map((child) => (
            <CategoryItem 
              key={child.id} 
              category={child} 
              level={level + 1} 
              onPress={onPress} 
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function CatalogScreen() {
  const router = useRouter();
  const { data: categories, isLoading, error, refetch } = useCategories();

  const handleCategoryPress = (categoryHandle: string) => {
    router.push(`/catalog/${categoryHandle}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="px-4 py-4 border-b border-gray-100 flex-row items-center bg-white justify-between">
           <Text className="text-dark text-2xl font-black uppercase tracking-tight">Каталог</Text>
           <Ionicons name="search" size={24} color="#1F2937" />
        </View>
        <View className="p-4 space-y-4">
          {[...Array(8)].map((_, i) => (
            <View key={i} className="flex-row items-center py-4 border-b border-gray-100">
               <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 16 }} />
               <Skeleton width="60%" height={20} />
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6" edges={['top']}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-xl font-bold mt-4 text-center">Ошибка загрузки</Text>
        <Text className="text-gray-500 text-center mt-2 mb-6">{error instanceof Error ? error.message : String(error)}</Text>
        <Pressable 
          onPress={() => refetch()}
          className="bg-primary px-8 py-3 rounded-md"
        >
          <Text className="text-white font-bold">Попробовать снова</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-4 py-4 border-b border-gray-100 flex-row items-center bg-white justify-between">
         <Text className="text-dark text-2xl font-black uppercase tracking-tight">Каталог</Text>
         <Pressable onPress={() => router.push('/search')}>
            <Ionicons name="search" size={24} color="#1F2937" />
         </Pressable>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={() => (
           <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-gray-500">Категории не найдены</Text>
           </View>
        )}
        renderItem={({ item }) => (
          <CategoryItem 
            category={item} 
            onPress={handleCategoryPress} 
          />
        )}
      />
    </SafeAreaView>
  );
}
