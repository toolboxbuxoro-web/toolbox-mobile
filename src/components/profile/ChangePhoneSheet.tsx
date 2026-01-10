import React, { useState, useEffect, useRef } from 'react';
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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth-store';
import { authService } from '../../services/auth.service';

interface ChangePhoneSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

export function ChangePhoneSheet({ isVisible, onClose }: ChangePhoneSheetProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const { updateProfile } = useAuthStore();

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
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length < 9) {
      setError('Введите корректный номер телефона');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await authService.requestOtp(cleanPhone);
      setStep('otp');
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || 'Ошибка при отправке кода');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndUpdate = async (code: string) => {
    if (code.length !== 6) return;
    
    setLoading(true);
    setError(null);
    const cleanPhone = phone.replace(/\s/g, '');
    
    try {
      // 1. Verify OTP using existing verifyOtp (checks backend)
      // Note: This will also refresh the token but we primarily need it to verify the code
      await authService.verifyOtp(cleanPhone, code);
      
      // 2. Update the logged-in user's profile with the new phone
      await updateProfile({ phone: `+998${cleanPhone}` });
      
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Неверный код или ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after a delay to avoid flicker
    setTimeout(() => {
      setStep('phone');
      setPhone('');
      setOtp('');
      setError(null);
    }, 300);
  };

  const renderPhoneStep = () => (
    <View>
      <Text style={styles.subtitle}>
        Введите новый номер телефона. Мы отправим код подтверждения.
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
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.button, phone.length < 12 && styles.buttonDisabled]}
        onPress={handleRequestOtp}
        disabled={phone.length < 12 || loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Получить код</Text>}
      </Pressable>
    </View>
  );

  const renderOtpStep = () => (
    <View>
      <Text style={styles.subtitle}>
        Код отправлен на номер +998 {phone}
      </Text>
      
      <View style={styles.otpContainer}>
        <TextInput
          style={styles.otpInput}
          placeholder="000000"
          placeholderTextColor="#D1D5DB"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(val) => {
            setOtp(val);
            if (val.length === 6) handleVerifyAndUpdate(val);
          }}
          autoFocus
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.resendContainer}>
        {resendTimer > 0 ? (
          <Text style={styles.resendText}>
            Отправить повторно через {resendTimer} сек
          </Text>
        ) : (
          <Pressable onPress={handleRequestOtp}>
            <Text style={styles.resendAction}>Отправить код повторно</Text>
          </Pressable>
        )}
      </View>

      <Pressable 
        style={styles.backButton}
        onPress={() => setStep('phone')}
      >
        <Text style={styles.backButtonText}>Сменить номер</Text>
      </Pressable>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={80} color="#10B981" />
      </View>
      <Text style={styles.successTitle}>Успешно!</Text>
      <Text style={styles.successSubtitle}>
        Ваш номер телефона успешно изменён на +998 {phone}
      </Text>
      <Pressable style={styles.button} onPress={handleClose}>
        <Text style={styles.buttonText}>Понятно</Text>
      </Pressable>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.sheet}
            >
              <View style={styles.header}>
                <Text style={styles.title}>
                  {step === 'success' ? '' : 'Смена номера'}
                </Text>
                <Pressable onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </Pressable>
              </View>

              {step === 'phone' && renderPhoneStep()}
              {step === 'otp' && renderOtpStep()}
              {step === 'success' && renderSuccessStep()}
              
              <View style={{ height: 20 }} />
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 320,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
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
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  otpInput: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 8,
    textAlign: 'center',
    width: '100%',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  resendAction: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  }
});
