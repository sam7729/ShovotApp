import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURRENT_USER } from '../../data/mockData';

const AUTH_KEY = '@shovot_auth';

const MENU_ITEMS = [
  { id: 'listings', label: 'My listings', icon: 'list-outline' as const, count: 3 },
  { id: 'saved', label: 'Saved items', icon: 'heart-outline' as const, count: 7 },
  { id: 'purchases', label: 'Purchase history', icon: 'receipt-outline' as const },
  { id: 'settings', label: 'Settings', icon: 'settings-outline' as const },
  { id: 'language', label: 'Language', icon: 'language-outline' as const, value: "O'zbek" },
];

export default function ProfileScreen() {
  const isDark = useColorScheme() === 'dark';

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
          await AsyncStorage.removeItem(AUTH_KEY);
          router.replace('/login');
        },
      },
    ]);
  }

  const joinDate = new Date(CURRENT_USER.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

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
              {CURRENT_USER.name.split(' ').map(p => p[0]).join('').toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: textColor }]}>{CURRENT_USER.name}</Text>
            <Text style={[styles.joinDate, { color: subColor }]}>Member since {joinDate}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={subColor} />
              <Text style={[styles.location, { color: subColor }]}>{CURRENT_USER.city}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil-outline" size={18} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: cardBg }]}>
          {[
            { label: 'Listings', value: '3' },
            { label: 'Rating', value: '4.8 ⭐' },
            { label: 'Sold', value: '12' },
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
            >
              <View style={[styles.menuIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name={item.icon} size={18} color="#2563EB" />
              </View>
              <Text style={[styles.menuLabel, { color: textColor }]}>{item.label}</Text>
              <View style={{ flex: 1 }} />
              {item.count !== undefined && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{item.count}</Text>
                </View>
              )}
              {item.value && (
                <Text style={[styles.menuValue, { color: subColor }]}>{item.value}</Text>
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
  menuValue: { fontSize: 14 },
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
