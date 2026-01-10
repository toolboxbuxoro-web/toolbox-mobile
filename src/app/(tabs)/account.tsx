import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ProfileMenu } from '../../components/profile/ProfileMenu';
import { AuthSheet } from '../../components/auth/AuthSheet';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { ChangePhoneSheet } from '../../components/profile/ChangePhoneSheet';

export default function AccountScreen() {
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isChangePhoneVisible, setIsChangePhoneVisible] = useState(false);

  const handleLogin = () => setIsAuthVisible(true);
  const handleEdit = () => setIsEditVisible(true);
  const handleChangePhone = () => setIsChangePhoneVisible(true);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <ProfileHeader 
          onLoginPress={handleLogin} 
          onEditPress={handleEdit}
        />
        
        <ProfileMenu onPhoneChange={handleChangePhone} />
      </ScrollView>

      <AuthSheet 
        isVisible={isAuthVisible} 
        onClose={() => setIsAuthVisible(false)} 
      />

      <EditProfileModal 
        isVisible={isEditVisible} 
        onClose={() => setIsEditVisible(false)} 
      />

      <ChangePhoneSheet 
        isVisible={isChangePhoneVisible}
        onClose={() => setIsChangePhoneVisible(false)}
      />
    </View>
  );
}
