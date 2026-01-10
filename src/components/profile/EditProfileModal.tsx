import React, { useState, useEffect } from 'react';
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
  Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth-store';

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isVisible, onClose }: EditProfileModalProps) {
  const { customer, updateProfile, loading } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && customer) {
      setFirstName(customer.first_name || '');
      setLastName(customer.last_name || '');
      setError(null);
    }
  }, [isVisible, customer]);

  const handleSave = async () => {
    if (!firstName.trim()) {
      setError('Имя не может быть пустым');
      return;
    }
    
    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка обновления профиля');
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/40 justify-center px-6">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="bg-white rounded-3xl p-6 shadow-xl"
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900">Редактировать профиль</Text>
                <Pressable onPress={onClose} className="p-1">
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </Pressable>
              </View>

              <View className="space-y-4">
                <View>
                  <Text className="text-gray-500 text-sm mb-2 ml-1">Имя</Text>
                  <TextInput
                    className="bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100 text-gray-900 text-base"
                    placeholder="Ваше имя"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoFocus
                  />
                </View>

                <View className="mt-4">
                  <Text className="text-gray-500 text-sm mb-2 ml-1">Фамилия (необязательно)</Text>
                  <TextInput
                    className="bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100 text-gray-900 text-base"
                    placeholder="Ваша фамилия"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
              
              {error && (
                <Text className="text-red-500 mt-4 text-center text-sm">{error}</Text>
              )}

              <Pressable
                className={`mt-8 rounded-2xl py-4 items-center ${loading ? 'bg-gray-400' : 'bg-primary shadow-sm'}`}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base">Сохранить</Text>
                )}
              </Pressable>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
