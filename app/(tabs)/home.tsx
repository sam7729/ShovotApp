import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  TextInput,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import ListingCard from '../../components/ListingCard';
import CategoryPill from '../../components/CategoryPill';
import { Listing } from '../../types';

const CATEGORIES = [
  { label: 'Electronics', icon: 'phone-portrait-outline' as const },
  { label: 'Cars', icon: 'car-outline' as const },
  { label: 'Home', icon: 'home-outline' as const },
  { label: 'Fashion', icon: 'shirt-outline' as const },
  { label: 'Sports', icon: 'football-outline' as const },
  { label: 'Kids', icon: 'happy-outline' as const },
  { label: 'Jobs', icon: 'briefcase-outline' as const },
  { label: 'More', icon: 'grid-outline' as const },
];

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const bg = isDark ? '#000000' : '#F9FAFB';
  const headerBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const inputBg = isDark ? '#2C2C2E' : '#F3F4F6';

  const fetchListings = useCallback(async () => {
    setRefreshing(true);
    const { data } = await supabase
      .from('listings')
      .select('*, seller:profiles(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (data) setListings(data as any);
    setRefreshing(false);
  }, []);

  // Fetch user's saved listing IDs
  const fetchSaved = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', session.user.id);
    if (data) {
      setSaved(new Set(data.map((r: any) => r.listing_id)));
    }
  }, []);

  React.useEffect(() => {
    fetchListings();
    fetchSaved();
  }, [fetchListings, fetchSaved]);

  const onRefresh = () => {
    fetchListings();
    fetchSaved();
  };

  async function toggleSave(id: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const isSaved = saved.has(id);
    
    // Optimistic update
    setSaved(prev => {
      const next = new Set(prev);
      isSaved ? next.delete(id) : next.add(id);
      return next;
    });

    if (isSaved) {
      await supabase
        .from('saved_listings')
        .delete()
        .eq('user_id', session.user.id)
        .eq('listing_id', id);
    } else {
      await supabase
        .from('saved_listings')
        .insert({ user_id: session.user.id, listing_id: id });
    }
  }

  const filtered = selectedCategory
    ? listings.filter(l => l.category === selectedCategory)
    : listings;

  const renderItem = ({ item, index }: { item: Listing; index: number }) => (
    <View style={index % 2 === 0 ? styles.cardLeft : styles.cardRight}>
      <ListingCard listing={item} onSave={toggleSave} saved={saved.has(item.id)} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: headerBg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Text style={[styles.logo, { color: '#2563EB' }]}>Shovot</Text>
        <TouchableOpacity style={styles.cityBtn}>
          <Ionicons name="location-outline" size={16} color={subColor} />
          <Text style={[styles.city, { color: subColor }]}>Tashkent</Text>
          <Ionicons name="chevron-down" size={14} color={subColor} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={[styles.searchWrap, { backgroundColor: headerBg }]}>
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: inputBg }]}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={18} color={subColor} style={{ marginRight: 8 }} />
          <Text style={[styles.searchPlaceholder, { color: subColor }]}>
            Search items, brands...
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { backgroundColor: bg }]}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
        }
        ListHeaderComponent={
          <View style={{ backgroundColor: bg }}>
            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categories}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
            >
              {CATEGORIES.map(c => (
                <CategoryPill
                  key={c.label}
                  label={c.label}
                  icon={c.icon}
                  selected={selectedCategory === c.label}
                  onPress={() =>
                    setSelectedCategory(prev => (prev === c.label ? null : c.label))
                  }
                />
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Recent listings</Text>
              <Text style={[styles.sectionCount, { color: subColor }]}>
                {filtered.length} items
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={subColor} />
            <Text style={[styles.emptyText, { color: subColor }]}>No listings found</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
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
    paddingTop: 4,
    paddingBottom: 4,
  },
  logo: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  cityBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  city: { fontSize: 13, fontWeight: '500' },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchPlaceholder: { fontSize: 15 },
  categories: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionCount: { fontSize: 13 },
  list: { paddingBottom: 100 },
  row: { paddingHorizontal: 16, gap: 16, marginBottom: 16 },
  cardLeft: {},
  cardRight: {},
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
});
