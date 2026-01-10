import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  Pressable, 
  TextInput, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  StyleSheet,
  Animated,
  Easing 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth-store';

interface AuthSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

export function AuthSheet({ isVisible, onClose }: AuthSheetProps) {
  const { requestOtp, verifyOtp, status } = useAuthStore();
  const loading = status === 'loading';
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const otpInputRef = useRef<TextInput>(null);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  // Track internal visibility to handle exit animation
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Reset to initial state before animating in
      fadeAnim.setValue(0);
      slideAnim.setValue(300);
      
      // Entry animation with slight delay to ensure modal is rendered
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.bezier(0.33, 1, 0.68, 1), // Uzum-style fast/smooth easing
          }),
        ]).start();
      });
    } else if (shouldRender) {
      // Exit animation only if modal is currently rendered
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.quad),
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.quad),
        }),
      ]).start(() => setShouldRender(false));
    }
  }, [isVisible, fadeAnim, slideAnim]);

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpInputRef.current?.focus(), 100);
      setResendTimer(60);
    }
  }, [step]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRequestOtp = async () => {
    // Clean phone before validation (remove spaces)
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length < 9) {
      setError('Введите корректный номер телефона');
      return;
    }
    setError(null);
    try {
      await requestOtp(cleanPhone);
      setStep('otp');
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || 'Ошибка запроса кода');
    }
  };

  const handleVerifyOtp = async (code: string) => {
    setOtp(code);
    if (code.length === 6) {
      setError(null);
      const cleanPhone = phone.replace(/\s/g, '');
      try {
        await verifyOtp(cleanPhone, code);
        onClose();
        reset();
      } catch (err: any) {
        setError(err.message || 'Неверный код');
        setOtp('');
      }
    }
  };

  const reset = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setError(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  return (
    <Modal
      visible={shouldRender}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View 
          className="flex-1 bg-black/50 justify-end"
          style={{ opacity: fadeAnim }}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View 
              style={{
                transform: [{ translateY: slideAnim }]
              }}
            >
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="bg-white rounded-t-3xl p-6"
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900">
                  {step === 'phone' ? 'Вход или регистрация' : 'Подтверждение'}
                </Text>
                <Pressable onPress={handleClose} className="p-2">
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </Pressable>
              </View>

              {step === 'phone' ? (
                <View>
                  <Text className="text-gray-500 mb-4">
                    Введите номер телефона, чтобы войти или зарегистрироваться
                  </Text>
                  <View style={styles.phoneInputContainer}>
                    <Text style={styles.phonePrefix}>+998</Text>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="90 123 45 67"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={(val) => {
                        // Format: XX XXX XX XX
                        const digits = val.replace(/\D/g, '').slice(0, 9);
                        let formatted = '';
                        if (digits.length > 0) formatted += digits.slice(0, 2);
                        if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
                        if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
                        if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
                        setPhone(formatted);
                        setError(null);
                      }}
                      autoFocus
                      maxLength={12}
                    />
                  </View>
                  
                  {error && <Text className="text-red-500 mt-2 text-sm">{error}</Text>}

                  <Pressable
                    className={`mt-6 rounded-xl py-4 items-center ${phone.length >= 9 ? 'bg-primary' : 'bg-gray-300'}`}
                    onPress={handleRequestOtp}
                    disabled={phone.length < 9 || loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold text-base">Получить код</Text>
                    )}
                  </Pressable>
                </View>
              ) : (
                <View>
                  <Text className="text-gray-500 mb-4">
                    Мы отправили СМС с кодом на номер +998 {phone}
                  </Text>
                  
                  <View className="flex-row justify-center mb-4">
                    <TextInput
                      ref={otpInputRef}
                      className="bg-gray-100 rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-[10px] w-full border border-gray-200"
                      placeholder="000000"
                      keyboardType="number-pad"
                      value={otp}
                      onChangeText={handleVerifyOtp}
                      maxLength={6}
                      autoFocus
                    />
                  </View>

                  {error && <Text className="text-red-500 mb-4 text-center text-sm">{error}</Text>}

                  <Pressable 
                    onPress={() => setStep('phone')}
                    className="py-2 mb-2"
                  >
                    <Text className="text-primary text-center font-medium">
                      Изменить номер телефона
                    </Text>
                  </Pressable>

                  {resendTimer > 0 ? (
                    <Text className="text-gray-400 text-center text-sm">
                      Отправить код повторно через {resendTimer} сек
                    </Text>
                  ) : (
                    <Pressable onPress={handleRequestOtp}>
                      <Text className="text-primary text-center font-bold text-sm">
                        Отправить код повторно
                      </Text>
                    </Pressable>
                  )}

                  {loading && (
                    <View className="mt-4 items-center">
                      <ActivityIndicator color="#DC2626" />
                    </View>
                  )}
                </View>
              )}
              
              <View className="h-8" />
            </KeyboardAvoidingView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  phonePrefix: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
