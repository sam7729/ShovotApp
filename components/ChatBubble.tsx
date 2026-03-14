import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../types';
import { timeAgo } from '../lib/timeAgo';

interface Props {
  message: Message;
  isOwn: boolean;
  onLongPress?: (message: Message) => void;
}

export default function ChatBubble({ message, isOwn, onLongPress }: Props) {
  const isDark = useColorScheme() === 'dark';

  const bubbleBg = isOwn ? '#2563EB' : isDark ? '#2C2C2E' : '#F3F4F6';
  const textColor = isOwn ? '#FFFFFF' : isDark ? '#FFFFFF' : '#111827';
  const timeColor = isDark ? '#8E8E93' : '#9CA3AF';

  // Status: delivered = single check, read = double check
  const status = (message as any).status;
  const statusIcon = status === 'read' ? 'checkmark-done' : 'checkmark';
  const statusColor = status === 'read' ? '#60A5FA' : isOwn ? 'rgba(255,255,255,0.5)' : timeColor;

  // Reaction
  const reaction = (message as any).reaction;

  return (
    <View style={[styles.row, isOwn ? styles.rowRight : styles.rowLeft]}>
      <TouchableOpacity
        style={[
          styles.bubble,
          { backgroundColor: bubbleBg },
          isOwn ? styles.bubbleRight : styles.bubbleLeft,
        ]}
        activeOpacity={0.8}
        onLongPress={() => onLongPress?.(message)}
        delayLongPress={300}
      >
        <Text style={[styles.text, { color: textColor }]}>{message.content}</Text>
        <View style={styles.meta}>
          <Text style={[styles.time, { color: isOwn ? 'rgba(255,255,255,0.6)' : timeColor }]}>
            {timeAgo(message.created_at)}
          </Text>
          {isOwn && (
            <Ionicons name={statusIcon} size={14} color={statusColor} style={{ marginLeft: 4 }} />
          )}
        </View>
      </TouchableOpacity>
      {reaction ? (
        <View style={[styles.reactionBubble, isOwn ? styles.reactionRight : styles.reactionLeft]}>
          <Text style={styles.reactionText}>{reaction}</Text>
        </View>
      ) : null}
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
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  time: {
    fontSize: 11,
  },
  reactionBubble: {
    position: 'relative',
    marginTop: -8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  reactionLeft: {
    alignSelf: 'flex-start',
    marginLeft: 12,
  },
  reactionRight: {
    alignSelf: 'flex-end',
    marginRight: 12,
  },
  reactionText: {
    fontSize: 16,
  },
});
