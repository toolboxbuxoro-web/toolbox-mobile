import React from 'react';
import { View, Text } from 'react-native';

export function MainFeedHeader() {
  return (
    <View className="px-5 pt-8 pb-4">
      <View className="flex-row items-center">
        <View className="h-6 w-1.5 bg-primary mr-3 rounded-full" />
        <Text className="text-lg font-black uppercase text-dark tracking-tight">
          Все товары
        </Text>
      </View>
      <Text className="text-gray-400 text-xs mt-1 uppercase font-bold tracking-widest ml-4.5">
          Полный ассортимент Toolbox
      </Text>
    </View>
  );
}
