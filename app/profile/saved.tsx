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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import ListingCard from '../../components/ListingCard';
import { Listing } from '../../types';

export default function SavedItemsScreen() {
  const isDark = useColorScheme() === 'dark';
  const { userId } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const bg = isDark ? '#000000' : '#F9FAFB';
  const headerBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';

  useFocusEffect(
    useCallback(() => {
      async function fetchSaved() {
        if (!userId) return;
        setLoading(true);
        const { data } = await supabase
          .from('saved_listings')
          .select('listing_id, listing:listings(*, seller:profiles(*))')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (data) {
          const items = data
            .map((row: any) => row.listing)
            .filter(Boolean);
          setListings(items);
        }
        setLoading(false);
      }
      fetchSaved();
    }, [userId])
  );

  const renderItem = ({ item, index }: { item: Listing; index: number }) => (
    <View style={index % 2 === 0 ? styles.cardLeft : styles.cardRight}>
      <ListingCard listing={item} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Saved Items</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={48} color={subColor} />
          <Text style={[styles.emptyText, { color: subColor }]}>No saved items yet</Text>
          <Text style={[styles.emptyHint, { color: subColor }]}>
            Tap the heart on any listing to save it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          numColumns={2}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
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
  list: { paddingHorizontal: 16, paddingTop: 12 },
  row: { gap: 12, marginBottom: 12 },
  cardLeft: { flex: 1 },
  cardRight: { flex: 1 },
});
