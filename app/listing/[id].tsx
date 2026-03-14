import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  useColorScheme,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { formatPrice } from '../../lib/formatPrice';
import { timeAgo } from '../../lib/timeAgo';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Listing } from '../../types';

const { width } = Dimensions.get('window');

const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  like_new: 'Like new',
  good: 'Good',
  fair: 'Fair',
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === 'dark';
  const { userId } = useAuth();
  const [saved, setSaved] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListing() {
      const { data } = await supabase
        .from('listings')
        .select('*, seller:profiles(*)')
        .eq('id', id)
        .single();
        
      if (data) {
        setListing(data as any);
      }
      setLoading(false);
    }

    async function checkSaved() {
      if (!userId) return;
      const { data } = await supabase
        .from('saved_listings')
        .select('id')
        .eq('user_id', userId)
        .eq('listing_id', id)
        .maybeSingle();
      if (data) setSaved(true);
    }

    fetchListing();
    checkSaved();
  }, [id, userId]);

  const bg = isDark ? '#000000' : '#F9FAFB';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const borderColor = isDark ? '#2C2C2E' : '#F3F4F6';
  const imageBg = isDark ? '#2C2C2E' : '#E5E7EB';

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <View style={styles.notFound}>
          <Ionicons name="search-outline" size={48} color={subColor} />
          <Text style={[styles.notFoundText, { color: textColor }]}>Listing not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn2}>
            <Text style={styles.backBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  async function handleMessage() {
    if (!listing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!userId) {
      Alert.alert('Error', 'Please log in to message the seller.');
      return;
    }

    try {
      // Check if conversation already exists
      const { data: existingConvs } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing.id)
        .eq('buyer_id', userId)
        .maybeSingle();

      if (existingConvs) {
         router.push(`/chat/${existingConvs.id}`);
         return;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing.id,
          buyer_id: userId,
          seller_id: listing.user_id,
        })
        .select()
        .single();

      if (error) throw error;
      if (newConv) {
        router.push(`/chat/${newConv.id}`);
      }
    } catch (e: any) {
      Alert.alert('Error', 'Could not start conversation.');
    }
  }

  async function toggleSave() {
    if (!userId || !listing) return;
    const wasSaved = saved;
    setSaved(!wasSaved);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (wasSaved) {
      await supabase
        .from('saved_listings')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listing.id);
    } else {
      await supabase
        .from('saved_listings')
        .insert({ user_id: userId, listing_id: listing.id });
    }
  }

  const joinDate = listing?.seller?.created_at
    ? new Date(listing.seller.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  const imageCount = Math.max(1, (listing?.images?.length ?? 0));

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* Image carousel */}
        <View style={[styles.imageArea, { backgroundColor: imageBg }]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setImageIndex(idx);
            }}
            scrollEventThrottle={16}
          >
            {listing.images && listing.images.length > 0 ? (
              listing.images.map((uri: string, i: number) => (
                <Image key={i} source={{ uri }} style={[styles.imagePage, { backgroundColor: imageBg }]} />
              ))
            ) : (
              <View style={[styles.imagePage, { backgroundColor: imageBg }]}>
                <Ionicons name="image-outline" size={64} color={isDark ? '#3A3A3C' : '#D1D5DB'} />
              </View>
            )}
          </ScrollView>

          {/* Back button */}
          <TouchableOpacity style={styles.backOverlay} onPress={() => router.back()}>
            <View style={styles.backCircle}>
              <Ionicons name="arrow-back" size={20} color="#111827" />
            </View>
          </TouchableOpacity>

          {/* Dot indicators */}
          {imageCount > 1 && (
            <View style={styles.dots}>
              {Array.from({ length: imageCount }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === imageIndex ? '#FFFFFF' : 'rgba(255,255,255,0.5)' },
                    i === imageIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Main content */}
        <View style={[styles.content, { backgroundColor: cardBg }]}>
          <Text style={[styles.price, { color: '#2563EB' }]}>{formatPrice(listing.price)}</Text>
          <Text style={[styles.title, { color: textColor }]}>{listing.title}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={subColor} />
            <Text style={[styles.meta, { color: subColor }]}>
              {listing.city} • {timeAgo(listing.created_at)}
            </Text>
          </View>

          {/* Condition + delivery chips */}
          <View style={styles.chips}>
            {listing.condition && (
              <View style={[styles.chip, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="star-outline" size={12} color="#2563EB" />
                <Text style={[styles.chipText, { color: '#1D4ED8' }]}>
                  {CONDITION_LABELS[listing.condition]}
                </Text>
              </View>
            )}
            {listing.delivery_options?.map(d => (
              <View key={d} style={[styles.chip, { backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6' }]}>
                <Ionicons
                  name={d === 'meetup' ? 'people-outline' : 'cube-outline'}
                  size={12}
                  color={subColor}
                />
                <Text style={[styles.chipText, { color: subColor }]}>
                  {d === 'meetup' ? 'Meet up' : 'Shipping'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Description</Text>
          <Text style={[styles.description, { color: isDark ? '#EBEBF5' : '#374151' }]}>
            {listing.description}
          </Text>
        </View>

        {/* Seller card */}
        {listing.seller && (
          <TouchableOpacity
            style={[styles.section, { backgroundColor: cardBg, borderTopColor: borderColor }]}
            onPress={() => router.push(`/profile/seller/${listing.user_id}`)}
            activeOpacity={0.7}
          >
            <Text style={[styles.sectionTitle, { color: textColor }]}>Seller</Text>
            <View style={styles.sellerCard}>
              <View style={[styles.sellerAvatar, { backgroundColor: '#2563EB' }]}>
                <Text style={styles.sellerAvatarText}>
                  {listing.seller.name.split(' ').map(p => p[0]).join('').toUpperCase()}
                </Text>
              </View>
              <View style={styles.sellerInfo}>
                <Text style={[styles.sellerName, { color: textColor }]}>{listing.seller.name}</Text>
                <View style={styles.sellerMeta}>
                  <Text style={[styles.sellerMetaText, { color: subColor }]}>⭐ 4.8</Text>
                  <Text style={[styles.sellerMetaText, { color: subColor }]}>• Since {joinDate}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={subColor} />
            </View>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.actionBar, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
        <View style={styles.actionBarInner}>
          <TouchableOpacity
            style={[styles.saveBtn, { borderColor: saved ? '#EF4444' : borderColor }]}
            onPress={toggleSave}
          >
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={22}
              color={saved ? '#EF4444' : subColor}
            />
          </TouchableOpacity>

          {listing.user_id !== userId && (
            <TouchableOpacity
              style={styles.messageBtn}
              onPress={handleMessage}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.messageBtnGrad}>
                <Ionicons name="chatbubble-outline" size={18} color="#FFFFFF" />
                <Text style={styles.messageBtnText}>Message seller</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {listing.user_id === userId && (
            <TouchableOpacity style={styles.messageBtn} activeOpacity={0.85} onPress={() => router.push(`/listing/edit/${listing.id}`)}>
              <LinearGradient colors={['#6B7280', '#4B5563']} style={styles.messageBtnGrad}>
                <Ionicons name="pencil-outline" size={18} color="#FFFFFF" />
                <Text style={styles.messageBtnText}>Edit listing</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  imageArea: { width, height: width * 0.85, position: 'relative' },
  imagePage: {
    width,
    height: width * 0.85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backOverlay: { position: 'absolute', top: 52, left: 16 },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: { width: 18 },
  content: { padding: 20, gap: 6 },
  price: { fontSize: 28, fontWeight: '800' },
  title: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  meta: { fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: { fontSize: 12, fontWeight: '500' },
  section: { padding: 20, borderTopWidth: 8, gap: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  description: { fontSize: 15, lineHeight: 22 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  sellerInfo: { flex: 1, gap: 3 },
  sellerName: { fontSize: 16, fontWeight: '600' },
  sellerMeta: { flexDirection: 'row', gap: 4 },
  sellerMetaText: { fontSize: 12 },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  actionBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  saveBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  messageBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  messageBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 18, fontWeight: '600' },
  backBtn2: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563EB',
    borderRadius: 12,
  },
  backBtnText: { color: '#FFFFFF', fontWeight: '600' },
});
