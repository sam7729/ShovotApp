import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  useColorScheme,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { formatPrice } from '../../lib/formatPrice';
import { timeAgo } from '../../lib/timeAgo';

interface Purchase {
  id: string;
  price: number;
  created_at: string;
  listing: {
    id: string;
    title: string;
    images: string[];
    city: string;
  };
  seller: {
    name: string;
  };
}

export default function PurchasesScreen() {
  const isDark = useColorScheme() === 'dark';
  const { userId } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const bg = isDark ? '#000000' : '#F9FAFB';
  const headerBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';

  useFocusEffect(
    useCallback(() => {
      async function fetchPurchases() {
        if (!userId) return;
        setLoading(true);
        const { data } = await supabase
          .from('purchases')
          .select('*, listing:listings(id, title, images, city), seller:profiles!purchases_seller_id_fkey(name)')
          .eq('buyer_id', userId)
          .order('created_at', { ascending: false });

        if (data) setPurchases(data as any);
        setLoading(false);
      }
      fetchPurchases();
    }, [userId])
  );

  const renderItem = ({ item }: { item: Purchase }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg }]}
      onPress={() => item.listing && router.push(`/listing/${item.listing.id}`)}
      activeOpacity={0.85}
    >
      {item.listing?.images?.[0] ? (
        <Image source={{ uri: item.listing.images[0] }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumbPlaceholder, { backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6' }]}>
          <Ionicons name="image-outline" size={24} color={subColor} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
          {item.listing?.title || 'Item'}
        </Text>
        <Text style={[styles.price, { color: '#2563EB' }]}>{formatPrice(item.price)}</Text>
        <Text style={[styles.meta, { color: subColor }]}>
          From {item.seller?.name || 'Unknown'} • {timeAgo(item.created_at)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={subColor} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Purchase History</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : purchases.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="receipt-outline" size={48} color={subColor} />
          <Text style={[styles.emptyText, { color: subColor }]}>No purchases yet</Text>
          <Text style={[styles.emptyHint, { color: subColor }]}>
            Items you buy will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '500' },
  emptyHint: { fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  thumb: { width: 64, height: 64, borderRadius: 12 },
  thumbPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '600' },
  price: { fontSize: 15, fontWeight: '700' },
  meta: { fontSize: 11 },
});
