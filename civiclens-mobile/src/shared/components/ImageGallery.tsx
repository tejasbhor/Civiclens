import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMediaUrl } from '@shared/utils/mediaUtils';

const { width, height } = Dimensions.get('window');

interface MediaItem {
  id: number | string;
  file_url: string;
  file_type?: string;
  upload_source?: string;
  caption?: string;
}

interface ImageGalleryProps {
  media: MediaItem[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ media }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  if (!media || media.length === 0) return null;

  const handleThumbnailPress = (index: number) => {
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'citizen_submission':
        return 'Reported';
      case 'officer_before_photo':
        return 'Before Work';
      case 'officer_after_photo':
        return 'Completed';
      default:
        return 'Image';
    }
  };

  const getSourceColor = (source?: string) => {
    switch (source) {
      case 'citizen_submission':
        return '#2196F3';
      case 'officer_before_photo':
        return '#FF9800';
      case 'officer_after_photo':
        return '#4CAF50';
      default:
        return '#64748B';
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Swiper */}
      <View style={styles.mainContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(index);
          }}
        >
          {media.map((item, index) => (
            <TouchableOpacity
              key={`${item.id}-${index}`}
              activeOpacity={0.9}
              onPress={() => setFullscreenImage(getMediaUrl(item.file_url))}
              style={styles.imageWrapper}
            >
              <Image
                source={{ uri: getMediaUrl(item.file_url) }}
                style={styles.mainImage}
                resizeMode="cover"
              />
              <View style={styles.badgeContainer}>
                <View style={[styles.badge, { backgroundColor: getSourceColor(item.upload_source) }]}>
                  <Text style={styles.badgeText}>{getSourceLabel(item.upload_source)}</Text>
                </View>
              </View>
              {item.caption && (
                <View style={styles.captionContainer}>
                  <Text style={styles.captionText} numberOfLines={2}>
                    {item.caption}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.indicatorContainer}>
          <Text style={styles.indicatorText}>
            {activeIndex + 1} / {media.length}
          </Text>
        </View>
      </View>

      {/* Thumbnails Row */}
      {media.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailList}
        >
          {media.map((item, index) => (
            <TouchableOpacity
              key={`thumb-${item.id}-${index}`}
              onPress={() => handleThumbnailPress(index)}
              style={[
                styles.thumbnailWrapper,
                activeIndex === index && styles.activeThumbnail,
              ]}
            >
              <Image
                source={{ uri: getMediaUrl(item.file_url) }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
              <View style={[styles.thumbnailDot, { backgroundColor: getSourceColor(item.upload_source) }]} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Fullscreen Viewer Modal */}
      <Modal
        visible={!!fullscreenImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullscreenImage(null)}
      >
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFullscreenImage(null)}
            >
              <Ionicons name="close" size={30} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.modalTitleContainer}>
               <Text style={styles.modalTitle}>
                 {getSourceLabel(media[activeIndex].upload_source)} Image
               </Text>
               <Text style={styles.modalSubtitle}>
                 {activeIndex + 1} of {media.length}
               </Text>
            </View>
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={() => {/* Add download logic if needed */}}
            >
              <Ionicons name="download-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Image Content */}
          <ScrollView
            maximumZoomScale={3}
            minimumZoomScale={1}
            contentContainerStyle={styles.modalImageContainer}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            {fullscreenImage && (
              <Image
                source={{ uri: fullscreenImage }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            )}
          </ScrollView>

          {/* Footer Info */}
          {media[activeIndex].caption && (
            <View style={styles.modalFooter}>
              <Text style={styles.modalCaption}>{media[activeIndex].caption}</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  mainContainer: {
    height: 300,
    position: 'relative',
  },
  imageWrapper: {
    width,
    height: 300,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    paddingBottom: 24,
  },
  captionText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicatorText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailList: {
    padding: 16,
    gap: 12,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  activeThumbnail: {
    borderColor: '#1976D2',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  thumbnailDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 100,
  },
  modalTitleContainer: {
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width,
    height: height * 0.7,
  },
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 48,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCaption: {
    color: '#FFF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
