import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types/product';
import { formatMoney } from '@/lib/formatters/money';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { AuthSheet } from '@/components/auth/AuthSheet';

interface BoughtTogetherCardProps {
  product: Product;
}

export function BoughtTogetherCard({ product }: BoughtTogetherCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const { status } = useAuthStore();
  
  // Logic: Use first variant (simplified for bought together)
  const variant = product.variants?.[0];
  const price = variant?.calculated_price?.calculated_amount || variant?.prices?.[0]?.amount || 0;
  
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
    } catch (err) {
      console.error('BoughtTogether add error', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <Pressable 
        onPress={() => router.push(`/product/${product.id}`)}
        className="w-[120px] bg-white rounded-xl p-2 border border-gray-100 shadow-sm"
      >
        <View className="w-full h-[80px] mb-2 bg-gray-50 rounded-lg overflow-hidden">
          <Image
            source={{ uri: product.thumbnail }}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
            transition={200}
          />
        </View>
        
        <Text numberOfLines={2} className="text-[10px] font-medium text-gray-700 h-[28px] mb-1 leading-3">
          {product.title}
        </Text>
        
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold text-dark">
            {formatMoney(price)}
          </Text>
          
          <Pressable 
            onPress={handleAdd}
            disabled={isAdding || !variant}
            className="w-6 h-6 bg-primary/10 rounded-full items-center justify-center active:bg-primary active:scale-95 transition-all"
          >
             {isAdding ? (
               <ActivityIndicator size={10} color="#DC2626" />
             ) : (
               <Ionicons name="add" size={16} color="#DC2626" />
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
