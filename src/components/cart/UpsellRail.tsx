import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types/product';
import { formatMoney } from '@/lib/formatters/money';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { AuthSheet } from '@/components/auth/AuthSheet';

interface UpsellRailProps {
  products: Product[];
  isLoading: boolean;
}

export function UpsellRail({ products, isLoading }: UpsellRailProps) {
  console.log('[UpsellRail] Rendering with products:', products?.length, 'Loading:', isLoading);
  
  if (isLoading) {
    console.log('[UpsellRail] Showing skeleton');
    return <UpsellSkeleton />;
  }
  
  if (!products || products.length === 0) {
    console.log('[UpsellRail] Result is empty, returning null');
    return null;
  }

  return (
    <View style={{ marginBottom: 24, marginTop: 8, borderColor: 'red', borderWidth: 2, padding: 4 }}>
      <View className="flex-row items-center px-4 mb-3">
         <Ionicons name="sparkles" size={18} color="#D97706" style={{ marginRight: 6 }} />
         <Text className="text-lg font-bold text-gray-900">С этим часто покупают</Text>
      </View>
      <View style={{ minHeight: 160 }}>
        <FlashList
          data={products}
          horizontal
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={140}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item }) => <UpsellCard product={item} />}
        />
      </View>
    </View>
  );
}

function UpsellCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const { status } = useAuthStore();
  
  // Logic: Use first variant (simplified for upsell)
  const variant = product.variants?.[0];
  const price = variant?.prices?.[0]?.amount || 0;
  
  const handleAdd = async (e: any) => {
    e.stopPropagation();
    
    if (!variant) return;

    if (status !== 'authorized') {
      setIsAuthVisible(true);
      return;
    }

    setIsAdding(true);
    try {
      await addItem(variant.id, 1);
      // Success feedback could be a toast, but button loading state is good for now
    } catch (err) {
      console.error('Upsell add error', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
    <Pressable 
      onPress={() => router.push(`/product/${product.id}`)}
      className="w-[140px] bg-white rounded-xl p-2 border border-gray-100 shadow-sm"
    >
      <View className="w-full h-[100px] mb-2 bg-gray-50 rounded-lg overflow-hidden">
        <Image
          source={{ uri: product.thumbnail }}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          transition={200}
        />
      </View>
      
      <Text numberOfLines={2} className="text-xs font-medium text-gray-700 h-[32px] mb-1 leading-4">
        {product.title}
      </Text>
      
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-dark">
          {formatMoney(price)}
        </Text>
        
        <Pressable 
          onPress={handleAdd}
          disabled={isAdding || !variant}
          className="w-7 h-7 bg-gray-100 rounded-full items-center justify-center active:bg-primary active:scale-95 transition-all"
        >
           {isAdding ? (
             <ActivityIndicator size={10} color="#374151" />
           ) : (
             <Ionicons name="add" size={18} color="#374151" />
           )}
        </Pressable>
      </View>
    </Pressable>
    <AuthSheet 
        isVisible={isAuthVisible} 
        onClose={() => setIsAuthVisible(false)} 
    />
    </>
  );
}

function UpsellSkeleton() {
  return (
    <View className="mb-6 px-4">
       <View className="w-40 h-6 bg-gray-200 rounded mb-3" />
       <View className="flex-row gap-3">
          {[1,2,3].map(i => (
             <View key={i} className="w-[140px] h-[160px] bg-gray-200 rounded-xl" />
          ))}
       </View>
    </View>
  );
}
