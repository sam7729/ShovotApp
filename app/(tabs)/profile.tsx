import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Profile } from '../../types';

export default function ProfileScreen() {
  const isDark = useColorScheme() === 'dark';
  const { signOut, userId } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
    setLoading(false);
  }, [userId]);

  const fetchCounts = useCallback(async () => {
    if (!userId) return;
    // Active listings count
    const { count: active } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');
    setActiveCount(active || 0);

    // Sold listings count
    const { count: sold } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'sold');
    setSoldCount(sold || 0);

    // Saved items count
    const { count: savedItems } = await supabase
      .from('saved_listings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    setSavedCount(savedItems || 0);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchCounts();
    }, [fetchProfile, fetchCounts])
  );

  const bg = isDark ? '#000000' : '#F9FAFB';
  const headerBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#F3F4F6';

  async function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  }

  function handleMenuPress(id: string) {
    switch (id) {
      case 'listings':
        router.push('/profile/my-listings');
        break;
      case 'saved':
        router.push('/profile/saved');
        break;
      case 'purchases':
        router.push('/profile/purchases');
        break;
      case 'settings':
        router.push('/profile/settings');
        break;
    }
  }

  if (loading || !profile) {
    return (
      <View style={[styles.safe, { backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const MENU_ITEMS = [
    { id: 'listings', label: 'My listings', icon: 'list-outline' as const, count: activeCount },
    { id: 'saved', label: 'Saved items', icon: 'heart-outline' as const, count: savedCount },
    { id: 'purchases', label: 'Purchase history', icon: 'receipt-outline' as const },
    { id: 'settings', label: 'Settings', icon: 'settings-outline' as const },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: cardBg }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profile.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: textColor }]}>{profile.name}</Text>
            <Text style={[styles.joinDate, { color: subColor }]}>Member since {joinDate}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={subColor} />
              <Text style={[styles.location, { color: subColor }]}>{profile.city}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/profile/edit')}>
            <Ionicons name="pencil-outline" size={18} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: cardBg }]}>
          {[
            { label: 'Active', value: String(activeCount) },
            { label: 'Sold', value: String(soldCount) },
            { label: 'Saved', value: String(savedCount) },
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

        {/* Menu */}
        <View style={[styles.menuCard, { backgroundColor: cardBg }]}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                i < MENU_ITEMS.length - 1 && { borderBottomColor: borderColor, borderBottomWidth: 1 },
              ]}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item.id)}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name={item.icon} size={18} color="#2563EB" />
              </View>
              <Text style={[styles.menuLabel, { color: textColor }]}>{item.label}</Text>
              <View style={{ flex: 1 }} />
              {item.count !== undefined && item.count > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{item.count}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color={subColor} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.menuCard, styles.logoutCard, { backgroundColor: cardBg }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: subColor }]}>Shovot v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  profileInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 18, fontWeight: '700' },
  joinDate: { fontSize: 13 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  location: { fontSize: 12 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, height: '100%' },
  menuCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '500' },
  countBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 12, paddingVertical: 20 },
});
