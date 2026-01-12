import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BTS_REGIONS, BtsRegion, BtsPoint, getBtsPointsByRegion } from '../../lib/bts';
import { useBtsLocationStore } from '../../store/bts-location-store';

interface LocationSheetProps {
  visible: boolean;
  onClose: () => void;
}

type Step = 'region' | 'point';

/**
 * Bottom sheet for selecting BTS pickup location (Uzum/Ozon style)
 */
export function LocationSheet({ visible, onClose }: LocationSheetProps) {
  const { selectLocation, regionId: savedRegionId } = useBtsLocationStore();
  const [step, setStep] = useState<Step>('region');
  const [selectedRegion, setSelectedRegion] = useState<BtsRegion | null>(null);

  const handleSelectRegion = (region: BtsRegion) => {
    setSelectedRegion(region);
    setStep('point');
  };

  const handleSelectPoint = (point: BtsPoint) => {
    if (selectedRegion) {
      selectLocation(selectedRegion.id, point.id);
      handleClose();
    }
  };

  const handleBack = () => {
    setStep('region');
    setSelectedRegion(null);
  };

  const handleClose = () => {
    setStep('region');
    setSelectedRegion(null);
    onClose();
  };

  const renderRegionItem = ({ item }: { item: BtsRegion }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => handleSelectRegion(item)}
      activeOpacity={0.7}
    >
      <View style={styles.listItemContent}>
        <Ionicons name="location-outline" size={24} color="#DC2626" />
        <View style={styles.listItemText}>
          <Text style={styles.listItemTitle}>{item.nameRu}</Text>
          <Text style={styles.listItemSubtitle}>{item.points.length} пунктов выдачи</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  const renderPointItem = ({ item }: { item: BtsPoint }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => handleSelectPoint(item)}
      activeOpacity={0.7}
    >
      <View style={styles.listItemContent}>
        <Ionicons name="business-outline" size={24} color="#DC2626" />
        <View style={styles.listItemText}>
          <Text style={styles.listItemTitle}>{item.name}</Text>
          <Text style={styles.listItemSubtitle}>{item.address}</Text>
        </View>
      </View>
      <Ionicons name="checkmark-circle-outline" size={22} color="#4CAF50" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {step === 'point' ? (
            <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerButton} />
          )}
          
          <Text style={styles.headerTitle}>
            {step === 'region' ? 'Выберите город' : selectedRegion?.nameRu}
          </Text>
          
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {step === 'region' ? (
          <FlatList
            data={BTS_REGIONS}
            keyExtractor={(item) => item.id}
            renderItem={renderRegionItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={selectedRegion ? getBtsPointsByRegion(selectedRegion.id) : []}
            keyExtractor={(item) => item.id}
            renderItem={renderPointItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.pointsHeader}>
                <Ionicons name="cube-outline" size={20} color="#666" />
                <Text style={styles.pointsHeaderText}>
                  BTS Express — пункты выдачи
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  listContent: {
    paddingBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemText: {
    marginLeft: 14,
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
  },
  pointsHeaderText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
});
