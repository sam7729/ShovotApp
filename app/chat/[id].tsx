import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ChatBubble from '../../components/ChatBubble';
import { mockConversations, mockMessages, CURRENT_USER_ID } from '../../data/mockData';
import { Message } from '../../types';
import { formatPrice } from '../../lib/formatPrice';

function getOtherUser(conv: typeof mockConversations[0]) {
  return conv.buyer_id === CURRENT_USER_ID ? conv.seller : conv.buyer;
}

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === 'dark';
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages[id] ?? []);
  const listRef = useRef<FlatList>(null);

  const conversation = mockConversations.find(c => c.id === id);
  const otherUser = conversation ? getOtherUser(conversation) : null;
  const listing = conversation?.listing;

  const bg = isDark ? '#000000' : '#F9FAFB';
  const headerBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const inputBg = isDark ? '#2C2C2E' : '#F3F4F6';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';
  const listingCardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const listingImageBg = isDark ? '#2C2C2E' : '#E5E7EB';

  function sendMessage() {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msg: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: id,
      sender_id: CURRENT_USER_ID,
      content: text.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={[styles.headerAvatar, { backgroundColor: '#2563EB' }]}>
            <Text style={styles.headerAvatarText}>
              {otherUser?.name?.split(' ').map(p => p[0]).join('').toUpperCase() ?? '?'}
            </Text>
          </View>
          <View>
            <Text style={[styles.headerName, { color: textColor }]}>
              {otherUser?.name ?? 'Chat'}
            </Text>
            <Text style={[styles.headerSub, { color: subColor }]}>Usually replies quickly</Text>
          </View>
        </View>
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
                <View style={[styles.listingImage, { backgroundColor: listingImageBg }]}>
                  <Ionicons name="image-outline" size={20} color={isDark ? '#3A3A3C' : '#D1D5DB'} />
                </View>
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
            <ChatBubble message={item} isOwn={item.sender_id === CURRENT_USER_ID} />
          )}
          showsVerticalScrollIndicator={false}
        />

        {/* Input bar */}
        <View style={[styles.inputBar, { backgroundColor: headerBg, borderTopColor: borderColor }]}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="attach-outline" size={22} color={subColor} />
          </TouchableOpacity>
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
  attachBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
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
});
