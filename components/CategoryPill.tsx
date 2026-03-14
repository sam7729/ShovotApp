import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  selected?: boolean;
}

export default function CategoryPill({ label, icon, onPress, selected }: Props) {
  const isDark = useColorScheme() === 'dark';

  const bg = selected
    ? '#2563EB'
    : isDark
    ? '#2C2C2E'
    : '#F3F4F6';
  const textColor = selected ? '#FFFFFF' : isDark ? '#EBEBF5' : '#374151';
  const iconColor = selected ? '#FFFFFF' : '#2563EB';

  return (
    <TouchableOpacity
      style={[styles.pill, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: selected ? 'rgba(255,255,255,0.2)' : '#DBEAFE' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginRight: 8,
    gap: 6,
    minWidth: 70,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
