import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function OnboardingScreen() {
  const isDark = useColorScheme() === 'dark';
  const { userId } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const bg = isDark ? '#000000' : '#FFFFFF';
  const cardBg = isDark ? '#1C1C1E' : '#F9FAFB';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const inputBg = isDark ? '#2C2C2E' : '#FFFFFF';
  const borderColor = isDark ? '#3A3A3C' : '#E5E7EB';

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0 && address.trim().length > 0;

  async function handleSave() {
    if (!isValid || !userId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        name: `${firstName.trim()} ${lastName.trim()}`,
        city: address.trim(),
        email: email.trim() || null,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/home');
      
    } catch (e: any) {
      Alert.alert('Error completing profile', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Complete Profile</Text>
            <Text style={[styles.subtitle, { color: subColor }]}>
              Tell us a bit about yourself to get started on Shovot.
            </Text>
          </View>

          {/* Form */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>First Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                placeholder="John"
                placeholderTextColor={subColor}
                value={firstName}
                onChangeText={setFirstName}
                autoFocus
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Last Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                placeholder="Doe"
                placeholderTextColor={subColor}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
            
            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Address / City *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                placeholder="Tashkent"
                placeholderTextColor={subColor}
                value={address}
                onChangeText={setAddress}
              />
            </View>
            
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Email (Optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                placeholder="john.doe@example.com"
                placeholderTextColor={subColor}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.button, { opacity: isValid ? 1 : 0.5 }]}
              onPress={handleSave}
              disabled={!isValid || loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2563EB', '#1D4ED8']}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Finish Setup</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
