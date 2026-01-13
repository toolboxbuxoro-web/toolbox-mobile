import { View, Text, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSubmitReview } from '@/hooks/useSubmitReview';
import { useCanReview } from '@/hooks/useCanReview';
import { useAuthStore } from '@/store/auth-store';

interface ReviewSheetProps {
  productId: string;
  isVisible: boolean;
  onClose: () => void;
}

export function ReviewSheet({ productId, isVisible, onClose }: ReviewSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['65%'], []);
  const { status } = useAuthStore();
  const { mutate: submitReview, isPending } = useSubmitReview();
  const { data: eligibility, isLoading: isCheckingEligibility } = useCanReview(productId);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const canReview = eligibility?.can_review ?? false;

  // Handle visibility via ref
  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
       onClose();
    }
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const handleSubmit = () => {
    if (rating < 1) {
      Alert.alert("Ошибка", "Пожалуйста, выберите оценку");
      return;
    }

    submitReview({ productId, rating, comment }, {
      onSuccess: () => {
        setComment('');
        setRating(5);
        bottomSheetRef.current?.dismiss();
        Alert.alert(
          "Отзыв отправлен", 
          "Спасибо за ваше мнение! Ваш отзыв отправлен на модерацию и появится после проверки."
        );
        onClose();
      },
      onError: (err: any) => {
        console.error("Review submit error", err);
        const message = err.message || "Не удалось отправить отзыв";
        Alert.alert("Ошибка", message);
      }
    });
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
    >
      <BottomSheetView className="flex-1 px-5 pt-2">
        <Text className="text-xl font-bold text-center mb-6">Оставить отзыв</Text>
        
        {isCheckingEligibility ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#DC2626" />
            <Text className="text-gray-400 mt-2">Проверка возможности...</Text>
          </View>
        ) : !canReview ? (
          <View className="flex-1 items-center justify-center px-10">
            <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
            </View>
            <Text className="text-dark font-bold text-lg text-center mb-2">
              Недостаточно прав
            </Text>
            <Text className="text-gray-500 text-center leading-5">
              {eligibility?.reason === 'already_reviewed' 
                ? 'Вы уже оставляли отзыв на этот товар.' 
                : 'Отзыв можно оставить только после покупки этого товара.'}
            </Text>
          </View>
        ) : (
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            className="flex-1"
          >
            {/* Rating Selector */}
            <View className="flex-row justify-center mb-8 gap-x-3">
               {[1, 2, 3, 4, 5].map((star) => (
                 <Pressable key={star} onPress={() => setRating(star)}>
                   <Ionicons 
                     name={star <= rating ? "star" : "star-outline"} 
                     size={44} 
                     color="#FFC107"
                   />
                 </Pressable>
               ))}
            </View>

            {/* Comment Input */}
            <Text className="font-bold mb-2 text-dark text-sm uppercase tracking-wide">Ваш комментарий</Text>
            <TextInput
              className="w-full h-36 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-dark text-base mb-8 shadow-inner"
              multiline
              textAlignVertical="top"
              placeholder="Расскажите о товаре: что понравилось, а что нет?"
              placeholderTextColor="#9CA3AF"
              value={comment}
              onChangeText={setComment}
              autoCorrect={true} 
            />

            {/* Submit Button */}
            <Pressable 
              onPress={handleSubmit}
              disabled={isPending}
              className={`w-full py-4.5 rounded-2xl items-center justify-center shadow-lg ${isPending ? 'bg-gray-200 shadow-none' : 'bg-red-600 shadow-red-200'}`}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                 <Text className="text-white font-black uppercase text-base tracking-widest">
                   Отправить отзыв
                 </Text>
              )}
            </Pressable>
          </KeyboardAvoidingView>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
