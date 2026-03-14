import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Profile, Listing } from '../../../types';
import ListingCard from '../../../components/ListingCard';

export default function SellerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === 'dark';
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [soldCount, setSoldCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const bg = isDark ? '#000000' : '#F9FAFB';
  const headerBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#F3F4F6';

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        if (profileData) setProfile(profileData);

        // Fetch active listings
        const { data: listingsData } = await supabase
          .from('listings')
          .select('*, seller:profiles(*)')
          .eq('user_id', id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        if (listingsData) setListings(listingsData as any);

        // Count sold items
        const { count } = await supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', id)
          .eq('status', 'sold');
        setSoldCount(count || 0);

        setLoading(false);
      }
      fetchData();
    }, [id])
  );

  if (loading) {
    return (
      <View style={[styles.safe, { backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: subColor }}>Profile not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
            <Text style={{ color: '#2563EB', fontWeight: '600' }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const initials = profile.name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Seller Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: cardBg }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.userName, { color: textColor }]}>{profile.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={subColor} />
            <Text style={[styles.location, { color: subColor }]}>{profile.city}</Text>
          </View>
          <Text style={[styles.joinDate, { color: subColor }]}>Member since {joinDate}</Text>
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: cardBg }]}>
          {[
            { label: 'Rating', value: '⭐ 4.8' },
            { label: 'Active', value: String(listings.length) },
            { label: 'Sold', value: String(soldCount) },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: textColor }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: subColor }]}>{stat.label}</Text>
              </View>
              {i < 2 && <View style={[styles.statDivider, { backgroundColor: borderColor }]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Active Listings */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Active Listings</Text>
        {listings.length === 0 ? (
          <View style={styles.emptySection}>
            <Ionicons name="list-outline" size={32} color={subColor} />
            <Text style={[styles.emptyText, { color: subColor }]}>No active listings</Text>
          </View>
        ) : (
          <View style={styles.listingsGrid}>
            {listings.map((item, index) => (
              <View key={item.id} style={index % 2 === 0 ? styles.cardLeft : styles.cardRight}>
                <ListingCard listing={item} />
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  profileCard: {
    alignItems: 'center',
    margin: 16,
    padding: 24,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: { color: '#FFFFFF', fontSize: 32, fontWeight: '700' },
  userName: { fontSize: 22, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: 14 },
  joinDate: { fontSize: 13 },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, height: '100%' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: { fontSize: 14 },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  cardLeft: { width: '47%' },
  cardRight: { width: '47%' },
});
