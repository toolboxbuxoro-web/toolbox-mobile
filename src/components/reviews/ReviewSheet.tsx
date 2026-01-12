import { View, Text, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useCallback, useRef, useMemo, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSubmitReview } from '@/hooks/useSubmitReview';
import { useAuthStore } from '@/store/auth-store';

interface ReviewSheetProps {
  productId: string;
  isVisible: boolean;
  onClose: () => void;
}

export function ReviewSheet({ productId, isVisible, onClose }: ReviewSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['60%'], []);
  const { status } = useAuthStore();
  const { mutate: submitReview, isPending } = useSubmitReview();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

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
        Alert.alert("Успешно", "Спасибо за ваш отзыв! Он появится на странице товара после обработки.");
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
      <BottomSheetView className="flex-1 px-4 pt-2">
        <Text className="text-xl font-bold text-center mb-6">Оставить отзыв</Text>
        
        {/* Rating Selector */}
        <View className="flex-row justify-center mb-6 space-x-2">
           {[1, 2, 3, 4, 5].map((star) => (
             <Pressable key={star} onPress={() => setRating(star)}>
               <Ionicons 
                 name={star <= rating ? "star" : "star-outline"} 
                 size={40} 
                 color="#FFC107" // Amber
               />
             </Pressable>
           ))}
        </View>

        {/* Comment Input */}
        <Text className="font-medium mb-2 text-gray-700">Комментарий</Text>
        <TextInput
          className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-3 text-base mb-6"
          multiline
          textAlignVertical="top"
          placeholder="Расскажите о товаре: плюсы, минусы..."
          value={comment}
          onChangeText={setComment}
          autoCorrect={false} 
        />

        {/* Submit Button */}
        <Pressable 
          onPress={handleSubmit}
          disabled={isPending}
          className={`w-full py-4 rounded-xl items-center justify-center ${isPending ? 'bg-gray-200' : 'bg-red-600'}`}
        >
          {isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
             <Text className="text-white font-bold text-lg">Отправить отзыв</Text>
          )}
        </Pressable>

      </BottomSheetView>
    </BottomSheetModal>
  );
}

// Helper to make useState visible
import { useState } from 'react';
