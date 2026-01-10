import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth-store';
import { useRouter } from 'expo-router';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
  badge?: string | number;
}

function MenuItem({ icon, label, onPress, showChevron = true, danger, badge }: MenuItemProps) {
  return (
    <Pressable 
      onPress={onPress}
      className="flex-row items-center py-4 px-4 bg-white active:bg-gray-50"
      android_ripple={{ color: '#E5E7EB' }}
    >
      <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${danger ? 'bg-red-50' : 'bg-gray-100'}`}>
        <Ionicons name={icon} size={20} color={danger ? "#EF4444" : "#374151"} />
      </View>
      
      <Text className={`flex-1 text-base font-medium ${danger ? 'text-red-500' : 'text-gray-900'}`}>
        {label}
      </Text>
      
      {badge !== undefined && (
        <View className="bg-primary rounded-full px-2 py-0.5 mr-2">
          <Text className="text-white text-xs font-bold">{badge}</Text>
        </View>
      )}
      
      {showChevron && (
        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      )}
    </Pressable>
  );
}

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <View className="mt-4">
      <Text className="px-5 mb-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
        {title}
      </Text>
      <View className="mx-4 bg-white rounded-2xl overflow-hidden shadow-sm">
        {children}
      </View>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-gray-100 ml-16" />;
}

interface ProfileMenuProps {
  onPhoneChange: () => void;
}

export function ProfileMenu({ onPhoneChange }: ProfileMenuProps) {
  const { status, logout } = useAuthStore();
  const router = useRouter();
  const isAuthorized = status === 'authorized';

  const handleLogout = async () => {
    Alert.alert(
      "Выход",
      "Вы уверены, что хотите выйти из профиля?",
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Выйти", 
          style: "destructive",
          onPress: async () => await logout()
        }
      ]
    );
  };

  return (
    <View className="pb-8">
      {isAuthorized && (
        <ProfileSection title="Мой аккаунт">
          <MenuItem 
            icon="receipt-outline" 
            label="Мои заказы" 
            onPress={() => router.push('/orders')} 
          />
          <Divider />
          <MenuItem 
            icon="phone-portrait-outline" 
            label="Сменить номер" 
            onPress={onPhoneChange} 
          />
          <Divider />
          <MenuItem 
            icon="log-out-outline" 
            label="Выйти" 
            onPress={handleLogout}
            danger
            showChevron={false}
          />
        </ProfileSection>
      )}
    </View>
  );
}
