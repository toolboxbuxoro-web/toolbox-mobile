import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { HomeBanner } from '../../types/mobile';
import { track } from '../../lib/analytics/track';
import { BannerSliderSkeleton } from './skeletons';
import { LazySection } from './LazySection';
import { useBanners } from '../../hooks/useBanners';
import { SectionError } from './SectionError';

const { width } = Dimensions.get('window');
const AUTO_SCROLL_INTERVAL = 4000;

interface BannerSliderProps {
  id?: string;
  position?: number;
  experiment?: { name: string; variant: string } | null;
}

export function BannerSlider({ id, position, experiment }: BannerSliderProps) {
  const router = useRouter();
  const { data: banners, isLoading, isError, refetch } = useBanners();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoScroll = useCallback(() => {
    if (!banners || banners.length <= 1) return;
    
    stopAutoScroll();
    autoScrollRef.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % banners.length;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }, AUTO_SCROLL_INTERVAL);
  }, [banners, activeIndex]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    if (index !== activeIndex && index >= 0 && index < (banners?.length || 0)) {
      setActiveIndex(index);
    }
  };

  const handleImpression = () => {
    track('section_impression', {
      section_id: id,
      section_type: 'banner_slider',
      position,
      experiment_context: experiment ? [experiment] : [],
    });
  };

  const handlePress = (banner: HomeBanner) => {
    track('section_click', {
      section_id: id,
      section_type: 'banner_slider',
      experiment_context: experiment ? [experiment] : [],
    });
    if (banner.action) router.push(banner.action as any);
  };

  if (isLoading) {
    return <BannerSliderSkeleton />;
  }

  // Banners are optional content - hide section on error or empty data
  if (isError || !banners || banners.length === 0) {
    return null;
  }

  return (
    <LazySection height={220} skeleton={<BannerSliderSkeleton />} onImpression={handleImpression}>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={stopAutoScroll}
          onScrollEndDrag={startAutoScroll}
        >
          {banners.map((banner) => (
            <Pressable
              key={banner.id}
              onPress={() => handlePress(banner)}
              style={{ width }}
            >
              <View style={styles.bannerWrapper}>
                <Image
                  source={{ uri: banner.image }}
                  contentFit="cover"
                  style={StyleSheet.absoluteFill}
                  transition={300}
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.gradient}
                >
                  <View style={styles.textContainer}>
                    <Text style={styles.bannerTitle} numberOfLines={2}>
                      {banner.title.ru}
                    </Text>
                    <View style={styles.button}>
                      <Text style={styles.buttonText}>Смотреть</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </Pressable>
          ))}
        </ScrollView>
        
        {/* Pagination Dots */}
        {banners.length > 1 && (
          <View style={styles.pagination}>
            {banners.map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  i === activeIndex && styles.dotActive
                ]} 
              />
            ))}
          </View>
        )}
      </View>
    </LazySection>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    position: 'relative',
  },
  bannerWrapper: {
    marginHorizontal: 12,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1F2937',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: 'center',
  },
  textContainer: {
    maxWidth: '65%',
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
    lineHeight: 26,
  },
  button: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 24,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#fff',
  },
});

