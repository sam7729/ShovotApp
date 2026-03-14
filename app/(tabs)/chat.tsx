import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Conversation, Message } from '../../types';
import { timeAgo } from '../../lib/timeAgo';

function getOtherUser(conv: Conversation, myId: string) {
  return conv.buyer_id === myId ? conv.seller : conv.buyer;
}

function getInitials(name: string = '') {
  return name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626'];

export default function ChatScreen() {
  const isDark = useColorScheme() === 'dark';
  const { userId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    fetchConvs();

    // Subscribe to messages changes to update the inbox
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          fetchConvs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function fetchConvs() {
    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        buyer:profiles!conversations_buyer_id_fkey(*),
        seller:profiles!conversations_seller_id_fkey(*),
        listing:listings(*),
        messages(*)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (data) {
      const mapped = data.map((conv: any) => {
        const sortedMsgs = conv.messages?.sort(
          (a: Message, b: Message) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return {
          ...conv,
          last_message: sortedMsgs?.[0] || null,
        };
      });
      setConversations(mapped);
    }
    setLoading(false);
  }

  const bg = isDark ? '#000000' : '#F9FAFB';
  const headerBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const dividerColor = isDark ? '#2C2C2E' : '#F3F4F6';

  function renderItem({ item }: { item: Conversation }) {
    if (!userId) return null;
    const other = getOtherUser(item, userId);
    const avatarColor = AVATAR_COLORS[item.id.charCodeAt(item.id.length - 1) % AVATAR_COLORS.length] || '#2563EB';

    return (
      <TouchableOpacity
        style={[styles.item, { backgroundColor: cardBg, borderBottomColor: dividerColor }]}
        onPress={() => router.push(`/chat/${item.id}`)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{getInitials(other?.name)}</Text>
          {(item.unread_count ?? 0) > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread_count}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
              {other?.name ?? 'Unknown'}
            </Text>
            <Text style={[styles.time, { color: subColor }]}>
              {item.last_message ? timeAgo(item.last_message.created_at) : ''}
            </Text>
          </View>
          <Text style={[styles.listingName, { color: '#2563EB' }]} numberOfLines={1}>
            {item.listing?.title}
          </Text>
          <Text style={[styles.preview, { color: subColor, fontWeight: (item.unread_count ?? 0) > 0 ? '600' : '400' }]} numberOfLines={1}>
            {item.last_message?.content ?? 'No messages yet'}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color={subColor} />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Messages</Text>
        {loading && <ActivityIndicator />}
      </View>

      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={{ backgroundColor: bg }}
        contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={56} color={subColor} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>No messages yet</Text>
            <Text style={[styles.emptyText, { color: subColor }]}>
              Start a conversation by messaging a seller
            </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  content: { flex: 1, gap: 2 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '600', flex: 1 },
  time: { fontSize: 12 },
  listingName: { fontSize: 12, fontWeight: '500' },
  preview: { fontSize: 13 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});
