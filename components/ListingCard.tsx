import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Listing } from '../types';
import { formatPrice } from '../lib/formatPrice';
import { timeAgo } from '../lib/timeAgo';

interface Props {
  listing: Listing;
  onSave?: (id: string) => void;
  saved?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function ListingCard({ listing, onSave, saved }: Props) {
  const isDark = useColorScheme() === 'dark';

  const cardColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const imageColor = isDark ? '#2C2C2E' : '#F3F4F6';

  const imageUrl = listing.images && listing.images.length > 0 ? listing.images[0] : null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardColor }]}
      onPress={() => router.push(`/listing/${listing.id}`)}
      activeOpacity={0.85}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: imageColor }]}>
          <Ionicons name="image-outline" size={32} color={isDark ? '#3A3A3C' : '#D1D5DB'} />
        </View>
      )}
      {onSave && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSave(listing.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={20}
            color={saved ? '#EF4444' : '#FFFFFF'}
          />
        </TouchableOpacity>
      )}
      <View style={styles.info}>
        <Text style={[styles.price, { color: textColor }]} numberOfLines={1}>
          {formatPrice(listing.price)}
        </Text>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={[styles.meta, { color: subColor }]} numberOfLines={1}>
          {listing.city} • {timeAgo(listing.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: cardWidth * 0.85,
  },
  imagePlaceholder: {
    height: cardWidth * 0.85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    padding: 4,
  },
  info: {
    padding: 10,
    gap: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 2,
  },
  meta: {
    fontSize: 11,
    marginTop: 4,
  },
});

