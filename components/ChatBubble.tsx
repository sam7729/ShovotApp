import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Message } from '../types';
import { timeAgo } from '../lib/timeAgo';

interface Props {
  message: Message;
  isOwn: boolean;
}

export default function ChatBubble({ message, isOwn }: Props) {
  const isDark = useColorScheme() === 'dark';

  const bubbleBg = isOwn ? '#2563EB' : isDark ? '#2C2C2E' : '#F3F4F6';
  const textColor = isOwn ? '#FFFFFF' : isDark ? '#FFFFFF' : '#111827';
  const timeColor = isDark ? '#8E8E93' : '#9CA3AF';

  return (
    <View style={[styles.row, isOwn ? styles.rowRight : styles.rowLeft]}>
      <View
        style={[
          styles.bubble,
          { backgroundColor: bubbleBg },
          isOwn ? styles.bubbleRight : styles.bubbleLeft,
        ]}
      >
        <Text style={[styles.text, { color: textColor }]}>{message.content}</Text>
        <Text style={[styles.time, { color: isOwn ? 'rgba(255,255,255,0.6)' : timeColor }]}>
          {timeAgo(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 3,
    paddingHorizontal: 16,
  },
  rowLeft: {
    alignItems: 'flex-start',
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 4,
  },
  bubbleLeft: {
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
});
