import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ChatBubble from '../../components/ChatBubble';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Message } from '../../types';
import { formatPrice } from '../../lib/formatPrice';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === 'dark';
  const { userId } = useAuth();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reactionTarget, setReactionTarget] = useState<Message | null>(null);
  const listRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      fetchConversation();
      markAsRead();

      const channel = supabase
        .channel(`chat-${id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setMessages(prev => [...prev, payload.new as Message]);
              setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
              // Mark incoming messages as read
              if ((payload.new as any).sender_id !== userId) {
                supabase.from('messages').update({ status: 'read' }).eq('id', (payload.new as any).id).then(() => {});
              }
            } else if (payload.eventType === 'UPDATE') {
              setMessages(prev => prev.map(m => m.id === (payload.new as any).id ? { ...m, ...payload.new } as Message : m));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [id, userId])
  );

  async function fetchConversation() {
    const { data } = await supabase
      .from('conversations')
      .select('*, buyer:profiles!conversations_buyer_id_fkey(*), seller:profiles!conversations_seller_id_fkey(*), listing:listings(*), messages(*)')
      .eq('id', id)
      .single();

    if (data) {
      setConversation(data);
      const sorted = data.messages?.sort((a: any, b: any) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      setMessages(sorted || []);
    }
    setLoading(false);
  }

  async function markAsRead() {
    if (!userId) return;
    await supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('conversation_id', id)
      .neq('sender_id', userId)
      .neq('status', 'read');
  }

  const otherUser = conversation?.buyer_id === userId ? conversation?.seller : conversation?.buyer;
  const listing = conversation?.listing;

  const bg = isDark ? '#000000' : '#F9FAFB';
  const headerBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const inputBg = isDark ? '#2C2C2E' : '#F3F4F6';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';
  const listingCardBg = isDark ? '#1C1C1E' : '#FFFFFF';

  async function sendMessage() {
    if (!text.trim() || !userId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const content = text.trim();
    setText('');

    await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: userId,
      content,
      status: 'delivered',
    });
  }

  async function reactToMessage(msg: Message, emoji: string) {
    setReactionTarget(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Toggle reaction: if same emoji, remove it
    const currentReaction = (msg as any).reaction;
    const newReaction = currentReaction === emoji ? null : emoji;

    await supabase
      .from('messages')
      .update({ reaction: newReaction })
      .eq('id', msg.id);
  }

  function handleLongPress(msg: Message) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setReactionTarget(msg);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerContent}
          onPress={() => otherUser && router.push(`/profile/seller/${otherUser.id}`)}
          activeOpacity={0.7}
        >
          <View style={[styles.headerAvatar, { backgroundColor: '#2563EB' }]}>
            <Text style={styles.headerAvatarText}>
              {otherUser?.name?.split(' ').map((p: string) => p[0]).join('').toUpperCase() ?? '?'}
            </Text>
          </View>
          <View>
            <Text style={[styles.headerName, { color: textColor }]}>
              {otherUser?.name ?? 'Chat'}
            </Text>
            <Text style={[styles.headerSub, { color: subColor }]}>Tap to view profile</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          style={{ backgroundColor: bg }}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListHeaderComponent={
            listing ? (
              <TouchableOpacity
                style={[styles.listingCard, { backgroundColor: listingCardBg, borderColor }]}
                onPress={() => router.push(`/listing/${listing.id}`)}
                activeOpacity={0.8}
              >
                {listing.images?.[0] ? (
                  <Image source={{ uri: listing.images[0] }} style={styles.listingImage} />
                ) : (
                  <View style={[styles.listingImagePlaceholder, { backgroundColor: isDark ? '#2C2C2E' : '#E5E7EB' }]}>
                    <Ionicons name="image-outline" size={20} color={subColor} />
                  </View>
                )}
                <View style={styles.listingInfo}>
                  <Text style={[styles.listingTitle, { color: textColor }]} numberOfLines={1}>
                    {listing.title}
                  </Text>
                  <Text style={[styles.listingPrice, { color: '#2563EB' }]}>
                    {formatPrice(listing.price)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={subColor} />
              </TouchableOpacity>
            ) : null
          }
          renderItem={({ item }) => (
            <ChatBubble message={item} isOwn={item.sender_id === userId} onLongPress={handleLongPress} />
          )}
          showsVerticalScrollIndicator={false}
        />

        {/* Input bar */}
        <View style={[styles.inputBar, { backgroundColor: headerBg, borderTopColor: borderColor }]}>
          <View style={[styles.inputWrap, { backgroundColor: inputBg }]}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Type a message..."
              placeholderTextColor={subColor}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={1000}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, { opacity: text.trim() ? 1 : 0.4 }]}
            onPress={sendMessage}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Reaction Modal */}
      <Modal visible={!!reactionTarget} transparent animationType="fade">
        <TouchableOpacity
          style={styles.reactionOverlay}
          activeOpacity={1}
          onPress={() => setReactionTarget(null)}
        >
          <View style={[styles.reactionBar, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
            {REACTIONS.map(emoji => (
              <TouchableOpacity
                key={emoji}
                style={styles.reactionBtn}
                onPress={() => reactionTarget && reactToMessage(reactionTarget, emoji)}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: { width: 36, alignItems: 'center' },
  headerContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  headerName: { fontSize: 15, fontWeight: '600' },
  headerSub: { fontSize: 11 },
  messagesList: { paddingTop: 8, paddingBottom: 12 },
  listingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  listingImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  listingImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listingInfo: { flex: 1, gap: 2 },
  listingTitle: { fontSize: 13, fontWeight: '500' },
  listingPrice: { fontSize: 14, fontWeight: '700' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
  },
  input: { fontSize: 15, lineHeight: 20 },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  reactionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionBar: {
    flexDirection: 'row',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  reactionBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: { fontSize: 24 },
});
