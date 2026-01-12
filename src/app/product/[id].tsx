import { View, Text, ScrollView, Pressable, Dimensions, FlatList, ActivityIndicator, Modal, PanResponder, Animated as RNAnimated } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState, useEffect, useRef, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavoritesStore } from '@/store/favorites-store';
import { useCart } from '@/hooks/useCart';
import { useProduct } from '@/hooks/useProduct';
import { Product } from '@/types/product';
import { Alert } from 'react-native';
import { ProductCard } from '@/components/product-card'; 
import { Skeleton } from '@/components/ui/skeleton'; 
import { formatMoney } from '@/lib/formatters/money';
import { useAuthStore } from '@/store/auth-store';
import { AuthSheet } from '@/components/auth/AuthSheet';
import { useRecentlyViewedStore } from '@/store/recently-viewed-store';
import { useRecommendations } from '@/hooks/useRecommendations';
import { RecommendationRail } from '@/components/recommendations/recommendation-rail';
import { BoughtTogetherCard } from '@/components/recommendations/BoughtTogetherCard';
import { ReviewSheet } from '@/components/reviews/ReviewSheet';
import { useProductReviews } from '@/hooks/useProductReviews';
import { GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// --- COMPONENTS ---
interface ImageGalleryModalProps {
  isVisible: boolean;
  images: string[];
  initialIndex: number;
  onClose: (index: number) => void;
}

function ImageGalleryModal({ isVisible, images, initialIndex, onClose }: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Reanimated Shared Values
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isVisible) {
      setCurrentIndex(initialIndex);
      translateY.value = 0;
      opacity.value = 1;
    }
  }, [isVisible, initialIndex]);

  const close = () => {
    onClose(currentIndex);
  };

  // Gesture
  const panGesture = useMemo(() => Gesture.Pan()
    .onChange((event) => {
      // Create a resistance effect if dragging up (negative dy)
      // Allow unrestricted dragging down
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        const newOpacity = 1 - (event.translationY / (SCREEN_HEIGHT * 0.5));
        opacity.value = Math.max(0, Math.min(1, newOpacity));
      } else {
        // Resistance when pulling up
        translateY.value = event.translationY * 0.2;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 80 || event.velocityY > 600) {
        // Just close immediately, exactly like the close button
        runOnJS(close)();
      } else {
        // Reset
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        opacity.value = withSpring(1);
      }
    }), [close, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={() => onClose(currentIndex)}>
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ flex: 1, backgroundColor: 'black' }, animatedStyle]}>
            <SafeAreaView className="flex-1">
              {/* Header */}
              <View className="flex-row justify-between items-center px-6 pt-12 pb-4 z-10 absolute top-0 left-0 right-0">
                <View className="bg-black/40 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md">
                  <Text className="text-white font-bold text-base">{currentIndex + 1} / {images.length}</Text>
                </View>
                <Pressable 
                  onPress={() => onClose(currentIndex)} 
                  className="bg-black/40 p-3 rounded-full border border-white/20 active:bg-white/20 backdrop-blur-md"
                   hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={28} color="white" />
                </Pressable>
              </View>
              
              <View className="flex-1 justify-center">
                <FlatList
                  data={images}
                  horizontal
                  pagingEnabled
                  initialScrollIndex={initialIndex}
                  getItemLayout={(_, index) => ({
                      length: SCREEN_WIDTH,
                      offset: SCREEN_WIDTH * index,
                      index,
                  })}
                  decelerationRate="fast"
                  snapToInterval={SCREEN_WIDTH}
                  snapToAlignment="start"
                  showsHorizontalScrollIndicator={false}
                  onScroll={(ev) => {
                      const index = Math.round(ev.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                      if (index !== currentIndex && index >= 0 && index < images.length) {
                        setCurrentIndex(index);
                      }
                  }}
                  renderItem={({ item }) => (
                      <View style={{ width: SCREEN_WIDTH, height: '100%', justifyContent: 'center' }}>
                      <Image
                          source={{ uri: item }}
                          style={{ width: '100%', height: '80%' }}
                          contentFit="contain"
                      />
                      </View>
                  )}
                  />
              </View>
            </SafeAreaView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View className="flex-row items-center mb-2">
      <View className="w-5 h-5 rounded-full bg-green-100 items-center justify-center mr-2">
        <Ionicons name="checkmark" size={12} color="#166534" />
      </View>
      <Text className="text-gray-700 font-medium text-sm">{text}</Text>
    </View>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-100">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-dark font-medium text-sm">{value}</Text>
    </View>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View className="border-t border-gray-200">
      <Pressable 
        onPress={() => setExpanded(!expanded)}
        className="flex-row justify-between items-center py-4 px-4 bg-white active:bg-gray-50"
        accessibilityRole="button"
        accessibilityLabel={`Развернуть ${title}`}
      >
        <Text className="text-dark font-bold uppercase text-sm">{title}</Text>
        <Ionicons name={expanded ? 'remove' : 'add'} size={20} color="#374151" />
      </Pressable>
      {expanded && <View className="px-4 pb-4">{children}</View>}
    </View>
  );
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Use the hook for data
  const { data: product, isLoading, error, refetch } = useProduct(id);
  
  const [activeImage, setActiveImage] = useState(0);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const router = useRouter();
  const [flatListRef, setFlatListRef] = useState<FlatList | null>(null);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);

  // Variant & Quantity State
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const { status } = useAuthStore();
  
  // Recommendations
  const { addToRecentlyViewed } = useRecentlyViewedStore();
  const { 
    similarProducts, 
    boughtTogetherProducts, 
    recentlyViewedProducts, 
    isLoading: isRecsLoading 
  } = useRecommendations(product || undefined);

  // Reviews (P0)
  const { data: reviewsData } = useProductReviews(id);
  const reviews = reviewsData?.reviews || [];
  const reviewsCount = reviewsData?.count || 0;
  const avgRating = reviewsData?.avg_rating || 0;
  const [isReviewSheetVisible, setIsReviewSheetVisible] = useState(false);

  // Track Recent View
  useEffect(() => {
    if (id) {
      addToRecentlyViewed(id);
    }
  }, [id, addToRecentlyViewed]);

  // CRITICAL: Always auto-select first variant to prevent undefined variant bugs
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product, selectedVariantId]);

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariantId]);
  
  // Store
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const isFav = product ? isFavorite(product.id) : false;

  // Formatting

  const handleToggleFavorite = () => {
    if (!product) return;
    toggleFavorite(product);
  };

  // --- Derived data (Safe) ---
  const selectedVariant = product?.variants?.find(v => v.id === selectedVariantId);
  const getPrice = (variant: any) => {
    // Medusa 2.0 prioritized source: calculated_price
    if (variant?.calculated_price) {
      return variant.calculated_price.calculated_amount;
    }
    const uzsPrice = variant?.prices?.find((p: any) => p.currency_code?.toLowerCase() === 'uzs');
    return uzsPrice?.amount || variant?.prices?.[0]?.amount || 0;
  };

  const getComparePrice = (variant: any) => {
    if (variant?.calculated_price?.compare_at_amount) {
      return variant.calculated_price.compare_at_amount;
    }
    return undefined;
  };
  
  const price = selectedVariant ? getPrice(selectedVariant) : (product?.variants ? getPrice(product.variants[0]) : 0);
  const oldPrice = selectedVariant ? getComparePrice(selectedVariant) : (product?.variants ? getComparePrice(product.variants[0]) : undefined); 
  const images = product?.images?.map(img => img.url) || [];
  if (product?.thumbnail && !images.includes(product.thumbnail)) {
      images.unshift(product.thumbnail);
  }
  
  const features = product?.metadata?.features as string[] || [];
  const specs = product?.metadata?.specs as {key:string, value:string}[] || [];
  const tags = product?.metadata?.tags as string[] || [];
  const visibleSpecs = showAllSpecs ? specs : specs.slice(0, 4);
  const showVariants = product?.variants && product.variants.length > 1;

  const canBackorder = selectedVariant?.allow_backorder ?? false;
  const manageInventory = selectedVariant?.manage_inventory ?? false;
  const inventoryQuantity = selectedVariant?.inventory_quantity ?? 0;
  let maxQuantity = 100;
  if (manageInventory && !canBackorder) {
    maxQuantity = Math.max(0, inventoryQuantity);
  }
  const inStock = selectedVariant && (!manageInventory || inventoryQuantity > 0 || canBackorder); 
  const isOutOfStock = !inStock || !selectedVariant;
  
  /* --- CART LOGIC --- */
  // Find if current variant is in cart
  const { cart, addItem, updateItem, removeItem } = useCart();
  const cartItem = cart?.items?.find(item => item.variant_id === selectedVariantId);
  const isInCart = !!cartItem;

  // Sync local quantity with cart quantity when variant changes or cart updates
  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
    } else {
      setQuantity(1); // Default for new items
    }
  }, [cartItem, selectedVariantId]);

  const handleIncrease = async () => {
    const newQty = quantity + 1;
    if (newQty > maxQuantity) return;

    setQuantity(newQty); // Optimistic update
    if (isInCart && cartItem) {
      try {
        await updateItem(cartItem.id, newQty);
      } catch (err) {
        setQuantity(quantity); // Revert on error
        console.error('Update item error', err);
      }
    }
  };

  const handleDecrease = async () => {
    const newQty = quantity - 1;
    
    // If item is in cart and quantity becomes 0 -> remove interaction
    if (isInCart && cartItem && newQty < 1) {
       try {
         await removeItem(cartItem.id);
         setQuantity(1); 
       } catch(err) {
         console.error('Remove item error', err);
       }
       return;
    }

    if (newQty < 1) return; // For local state, don't go below 1

    setQuantity(newQty); // Optimistic update
    if (isInCart && cartItem) {
      try {
        await updateItem(cartItem.id, newQty);
      } catch (err) {
        setQuantity(quantity); // Revert on error
        console.error('Update item error', err);
      }
    }
  };

  const handleMainAction = async () => {
    // 1. Validation
    if (!selectedVariantId) {
        Alert.alert("Внимание", "Пожалуйста, выберите вариант товара");
        return;
    }
    
    // 2. If already in cart -> Navigate
    if (isInCart) {
        router.push('/(tabs)/cart');
        return;
    }

    // 3. If adding...
    if (isAdding || isOutOfStock) return;
    if (status !== 'authorized') {
      setIsAuthVisible(true);
      return;
    }

    setIsAdding(true);
    try {
      await addItem(selectedVariantId, quantity);
      // Success! Button will automatically switch to "Go to Cart" via isInCart
    } catch (err) {
      console.error('[ProductScreen] Add to cart error:', err);
      Alert.alert("Ошибка", "Не удалось добавить товар в корзину");
    } finally {
      setIsAdding(false);
    }
  };

  /* --- RENDER --- */
  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{ 
          title: '',
          headerShown: true,
          headerTransparent: true, 
          headerTintColor: '#111827',
          headerRight: () => (
            <Pressable 
                onPress={handleToggleFavorite}
                className="bg-white/90 p-2.5 rounded-full shadow-sm"
                accessibilityLabel="В избранное"
            >
                <Ionicons 
                    name={isFav ? "heart" : "heart-outline"} 
                    size={26} 
                    color={isFav ? "#DC2626" : "#111827"} 
                />
            </Pressable>
          ),
          headerLeft: (props) => props.canGoBack ? (
            <Pressable onPress={() => router.back()} className="bg-white/90 p-2 rounded-full shadow-sm ml-2" accessibilityLabel="Назад">
                <Ionicons name="arrow-back" size={24} color="#111827" />
            </Pressable>
          ) : null
        }} 
      />

      {isLoading ? (
        <View className="flex-1 bg-white">
            <SafeAreaView edges={['top']} className="flex-1">
                <Skeleton height={SCREEN_WIDTH} width={SCREEN_WIDTH} borderRadius={0} />
                <View className="p-4 space-y-4">
                    <Skeleton height={24} width="70%" />
                    <Skeleton height={20} width="40%" />
                     <View className="flex-row justify-between mt-4">
                        <Skeleton height={30} width="40%" />
                        <Skeleton height={30} width="30%" />
                    </View>
                     <View className="mt-8 space-y-2">
                        <Skeleton height={14} width="100%" />
                        <Skeleton height={14} width="90%" />
                        <Skeleton height={14} width="95%" />
                     </View>
                </View>
            </SafeAreaView>
             <View className="p-4 border-t border-gray-100 flex-row gap-4">
                 <Skeleton height={50} width={50} />
                 <Skeleton height={50} style={{ flex: 1 }} />
             </View>
        </View>
      ) : error || !product ? (
          <View className="flex-1 bg-white items-center justify-center px-6">
              <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
              <Text className="text-xl font-bold mt-4 text-center">Ошибка загрузки</Text>
              <Text className="text-gray-500 text-center mt-2 mb-6">{error instanceof Error ? error.message : (error || 'Товар не найден')}</Text>
              <Pressable onPress={() => refetch()} className="bg-primary px-6 py-3 rounded-md">
                   <Text className="text-white font-bold">Повторить</Text>
              </Pressable>
          </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
            {/* 1. GALLERY */}
            <View className="bg-white relative mb-4" style={{ height: SCREEN_WIDTH }}>
              <FlatList
                ref={(ref) => setFlatListRef(ref)}
                data={images}
                keyExtractor={(item, index) => `gallery-${index}`}
                horizontal
                pagingEnabled={false}
                nestedScrollEnabled={true}
                scrollEventThrottle={16}
                decelerationRate={0.9}
                snapToInterval={SCREEN_WIDTH}
                snapToAlignment="start"
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(ev) => {
                  const index = Math.round(ev.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                  setActiveImage(index);
                }}
                renderItem={({ item }) => (
                  <Pressable 
                    onPress={() => setIsGalleryVisible(true)}
                    style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                  >
                    <Image
                      source={{ uri: item }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="contain"
                    />
                  </Pressable>
                )}
              />
              <View className="flex-row justify-center absolute bottom-4 w-full">
                {images.map((_, idx) => (
                  <View
                    key={idx}
                    className={`w-2 h-2 rounded-full mx-1 ${
                      activeImage === idx ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </View>
            </View>

            {/* 2. MAIN META */}
            <View className="bg-white px-4 py-6 mb-4">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-primary font-black uppercase text-xs tracking-widest mb-2">
                  {product.handle}
                </Text>
                {selectedVariant && (
                    <View className="bg-gray-100 px-2 py-1 rounded-sm">
                        <Text className="text-gray-500 text-[10px] font-bold">SKU: {selectedVariant.id.slice(0, 8)}</Text>
                    </View>
                )}
              </View>
              
              <Text className="text-dark text-2xl font-black uppercase leading-8 mb-3">
                {product.title}
              </Text>

              <View className="flex-row items-center mb-6">
                <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-sm mr-3">
                    <Ionicons name="star" size={14} color="#D97706" />
                    <Text className="text-yellow-800 font-bold ml-1 text-xs">{(product.metadata?.rating as string) || '5.0'}</Text>
                </View>
                <Text className="text-gray-500 text-sm font-medium underline">
                  {(product.metadata?.reviewsCount as string) || '0'} отзывов
                </Text>
              </View>

              {showVariants && (
                <View className="mb-6">
                   <Text className="text-dark font-bold text-sm mb-3">Варианты:</Text> 
                   <View className="flex-row flex-wrap gap-2">
                      {product.variants.map((v) => {
                        const isSelected = v.id === selectedVariantId;
                        return (
                            <Pressable 
                                key={v.id}
                                onPress={() => setSelectedVariantId(v.id)}
                                className={`px-4 py-2 rounded-lg border ${isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
                            >
                                <Text className={`font-semibold text-xs ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                    {v.title}
                                </Text>
                            </Pressable>
                        )
                      })}
                   </View>
                </View>
              )}

              {features.length > 0 && (
                <View className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                    {features.map((feat, idx) => (
                    <FeatureItem key={idx} text={feat} />
                    ))}
                </View>
              )}

              <View className="mt-4 pt-4 border-t border-gray-100">
                 <View className="flex-row items-start">
                    <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
                       <Ionicons name="car-outline" size={18} color="#2563EB" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-dark font-bold text-sm mb-0.5">
                            Доставка: {(product.metadata?.delivery as any)?.city || 'Бухара'}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                             {(product.metadata?.delivery as any)?.time || '1–2 дня'} · <Text className="text-green-600 font-medium">{(product.metadata?.delivery as any)?.cost || 'Бесплатно'}</Text>
                        </Text>
                    </View>
                 </View>
              </View>
            </View>

            <View className="bg-white px-4 py-6 mb-4">
                <Text className="text-dark text-lg font-black uppercase mb-4 border-l-4 border-primary pl-3">
                    Описание
                </Text>
                {tags.length > 0 && (
                    <View className="flex-row flex-wrap mb-4">
                        {tags.map((tag, idx) => (
                            <View key={idx} className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full mr-2 mb-2">
                                <Text className="text-gray-700 text-xs font-semibold">{tag}</Text>
                            </View>
                        ))}
                    </View>
                )}
                <Text className="text-gray-600 leading-6 text-sm">
                    {product.description}
                </Text>
            </View>

            {specs.length > 0 && (
                <View className="bg-white px-4 py-6 mb-4">
                    <Text className="text-dark text-lg font-black uppercase mb-4 border-l-4 border-primary pl-3">
                        Характеристики
                    </Text>
                    <View className="mb-4">
                        {visibleSpecs.map((spec, idx) => (
                            <SpecRow key={idx} label={spec.key} value={spec.value} />
                        ))}
                    </View>
                    {specs.length > 4 && (
                        <Pressable 
                            onPress={() => setShowAllSpecs(!showAllSpecs)}
                            className="border border-gray-300 py-3 rounded-sm items-center active:bg-gray-50"
                        >
                            <Text className="text-dark font-bold text-xs uppercase">
                                {showAllSpecs ? 'Скрыть характеристики' : 'Все характеристики'}
                            </Text>
                        </Pressable>
                    )}
                </View>
            )}

            <View className="bg-white mb-4">
                 <Accordion title="Информация о доставке">
                    <Text className="text-gray-600 text-sm">Бесплатная доставка при заказе от {formatMoney(500000)}.</Text>
                 </Accordion>
                 <Accordion title="Гарантия и возврат">
                    <Text className="text-gray-600 text-sm">Гарантия 1 год. Возврат в течение 10 дней.</Text>
                 </Accordion>
            </View>

            {/* REVIEWS SECTION (P0) */}
            <View className="px-5 py-6 bg-white mb-4 border-t border-b border-gray-100">
              <Text className="text-dark font-black uppercase text-base tracking-wider border-l-4 border-primary pl-3 mb-4">
                Отзывы
              </Text>

              {/* Summary */}
              <View className="flex-row items-center mb-6">
                <Text className="text-4xl font-bold text-dark mr-3">{avgRating.toFixed(1)}</Text>
                <View>
                  <View className="flex-row mb-1">
                     {[1, 2, 3, 4, 5].map((star) => (
                       <Ionicons 
                         key={star}
                         name={star <= Math.round(avgRating) ? "star" : "star-outline"} 
                         size={16} 
                         color="#F59E0B" 
                       />
                     ))}
                  </View>
                  <Text className="text-gray-500 text-xs font-bold uppercase">{reviewsCount} оценок</Text>
                </View>
              </View>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <View className="py-6 items-center bg-gray-50 rounded-xl mb-4">
                   <Ionicons name="chatbubble-outline" size={32} color="#9CA3AF" />
                   <Text className="text-gray-500 mt-2 text-center text-sm">
                     Отзывов пока нет. Будьте первым!
                   </Text>
                </View>
              ) : (
                <View className="mb-4">
                  {reviews.slice(0, 3).map((review) => (
                    <View key={review.id} className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0">
                      <View className="flex-row justify-between items-start mb-1.5">
                        <View className="flex-row">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Ionicons key={s} name={s <= review.rating ? "star" : "star-outline"} size={12} color="#F59E0B" />
                          ))}
                        </View>
                        <Text className="text-gray-400 text-[10px]">{new Date(review.created_at).toLocaleDateString()}</Text>
                      </View>
                      <Text className="text-sm text-gray-800 leading-5">{review.comment}</Text>
                    </View>
                  ))}
                  {reviews.length > 3 && (
                    <Pressable className="py-2 items-center">
                      <Text className="text-primary font-bold text-xs uppercase">Читать все отзывы ({reviewsCount})</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* Add Review Button */}
              <Pressable 
                onPress={() => setIsReviewSheetVisible(true)}
                className="w-full bg-gray-100 active:bg-gray-200 py-3.5 rounded-xl items-center flex-row justify-center"
              >
                 <Ionicons name="pencil" size={16} color="#4B5563" style={{ marginRight: 8 }} />
                 <Text className="text-gray-800 font-bold uppercase text-xs tracking-wide">
                   Написать отзыв
                 </Text>
              </Pressable>
            </View>

            {/* RECOMMENDATIONS (P0 Upgrade) */}
            <RecommendationRail 
              title="С этим часто покупают" 
              products={boughtTogetherProducts} 
              isLoading={isRecsLoading && boughtTogetherProducts.length === 0} 
              renderItem={(p: Product) => <BoughtTogetherCard product={p} />}
            />

            <RecommendationRail 
              title="Похожие товары" 
              products={similarProducts} 
              isLoading={isRecsLoading && similarProducts.length === 0} 
            />
            
            <RecommendationRail 
              title="Вы смотрели" 
              products={recentlyViewedProducts} 
              isLoading={isRecsLoading && recentlyViewedProducts.length === 0} 
            />

          </ScrollView>

          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl">
            <SafeAreaView edges={['bottom']} className="px-4 py-4">
              <View className="flex-row items-center justify-between gap-4">
                {/* Left Side: Price OR Counter (If in cart) */}
                <View className="flex-1">
                  {!isInCart ? (
                    <View className="justify-center">
                      {oldPrice && (
                        <Text className="text-gray-400 text-xs line-through font-medium mb-0.5">
                          {formatMoney(oldPrice)}
                        </Text>
                      )}
                      <Text className="text-dark text-xl font-black">
                        {formatMoney(price)}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Text className={`font-bold text-[10px] ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                          {inStock 
                            ? (canBackorder ? 'Предзаказ' : 'В наличии')
                            : 'Нет в наличии'}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    /* Cart Counter (When in cart) */
                    <View className="flex-row items-center bg-gray-100 rounded-xl h-[52px] border border-gray-200">
                      <Pressable 
                        onPress={handleDecrease}
                        disabled={isOutOfStock} 
                        className="w-[44px] h-full items-center justify-center active:bg-gray-200 rounded-l-xl"
                      >
                        <Ionicons name="remove" size={20} color="#374151" />
                      </Pressable>
                      
                      <View className="flex-1 items-center justify-center">
                        <Text className="font-bold text-dark text-lg" style={{ lineHeight: 22 }}>{quantity}</Text>
                        <Text className="text-[9px] text-gray-400 uppercase font-black" style={{ marginTop: -2 }}>шт</Text>
                      </View>

                      <Pressable 
                        onPress={handleIncrease}
                        disabled={quantity >= maxQuantity || isOutOfStock}
                        className={`w-[44px] h-full items-center justify-center ${quantity >= maxQuantity ? 'opacity-30' : 'active:bg-gray-200'} rounded-r-xl`}
                      >
                        <Ionicons name="add" size={20} color="#374151" />
                      </Pressable>
                    </View>
                  )}
                </View>

                {/* Right Side: Action Button (Add OR Go To Cart) */}
                <View className="flex-[1.4]">
                  <Pressable 
                    onPress={handleMainAction}
                    disabled={(!selectedVariantId || isOutOfStock || isAdding) && !isInCart}
                    className={`flex-1 rounded-xl h-[52px] px-2 justify-center items-center shadow-sm ${
                      isInCart 
                        ? 'bg-primary/5 border-2 border-primary' 
                        : (!selectedVariantId || isOutOfStock || isAdding) 
                          ? 'bg-gray-300 shadow-none' 
                          : 'bg-primary active:bg-primary/90'
                    }`}
                  >
                    {isAdding ? (
                      <ActivityIndicator color={isInCart ? "#DC2626" : "white"} size="small" />
                    ) : (
                      <View className="flex-row items-center justify-center">
                         {isInCart && (
                            <Ionicons name="cart-outline" size={18} color="#DC2626" style={{ marginRight: 6 }} />
                         )}
                         <Text className={`font-black uppercase tracking-wider text-xs text-center ${isInCart ? 'text-primary' : 'text-white'}`}>
                            {isInCart ? 'Перейти в корзину' : 
                              (!selectedVariantId 
                                ? 'Выбор...' 
                                : isOutOfStock 
                                  ? 'Нет в наличии' 
                                  : 'В корзину')
                            }
                         </Text>
                         {!isInCart && !isOutOfStock && selectedVariantId && (
                             <Ionicons name="chevron-forward" size={14} color="white" style={{ marginLeft: 4 }} />
                         )}
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
            </SafeAreaView>
          </View>

          <ReviewSheet
            isVisible={isReviewSheetVisible}
            onClose={() => setIsReviewSheetVisible(false)}
            productId={id || ''}
          />

          <AuthSheet 
            isVisible={isAuthVisible} 
            onClose={() => setIsAuthVisible(false)} 
          />

          <ImageGalleryModal
            isVisible={isGalleryVisible}
            images={images}
            initialIndex={activeImage}
            onClose={(newIndex) => {
              setIsGalleryVisible(false);
              setActiveImage(newIndex);
              flatListRef?.scrollToIndex({ index: newIndex, animated: false });
            }}
          />
        </>
      )}
    </View>
  );
}
