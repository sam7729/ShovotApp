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

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const isDark = useColorScheme() === 'dark';

  const bg = isDark ? '#000000' : '#FFFFFF';
  const cardBg = isDark ? '#1C1C1E' : '#F9FAFB';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const inputBg = isDark ? '#2C2C2E' : '#FFFFFF';
  const borderColor = isDark ? '#3A3A3C' : '#E5E7EB';
  const prefixBg = isDark ? '#3A3A3C' : '#F3F4F6';

  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (phone.length < 9) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setLoading(true);
    const phoneNumber = `+998${phone}`;
    
    // First try the real Supabase Auth
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });
    
    setLoading(false);
    
    // If Supabase complains about the phone provider (common without paid Twilio),
    // let the user proceed to the verify screen anyway so they can use test numbers
    // that are predefined in the Supabase dashboard
    if (error) {
      if (error.message.includes('unsupported') || error.message.includes('provider')) {
        console.warn('Real SMS failed, proceeding for test number verification.');
        router.push({ pathname: '/verify', params: { phone: phoneNumber } });
      } else {
        Alert.alert('Error', error.message);
      }
    } else {
      router.push({ pathname: '/verify', params: { phone: phoneNumber } });
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
          {/* Hero */}
          <View style={styles.hero}>
            <LinearGradient
              colors={['#2563EB', '#1D4ED8']}
              style={styles.logoCircle}
            >
              <Text style={styles.logoLetter}>S</Text>
            </LinearGradient>
            <Text style={[styles.appName, { color: textColor }]}>Shovot</Text>
            <Text style={[styles.tagline, { color: subColor }]}>
              Buy and sell anything in Uzbekistan
            </Text>
          </View>

          {/* Form */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.label, { color: textColor }]}>Phone number</Text>
            <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor }]}>
              <View style={[styles.prefix, { backgroundColor: prefixBg }]}>
                <Text style={[styles.prefixText, { color: textColor }]}>🇺🇿 +998</Text>
              </View>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="90 123 45 67"
                placeholderTextColor={subColor}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={12}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { opacity: phone.length >= 9 ? 1 : 0.5 }]}
              onPress={handleSend}
              disabled={phone.length < 9}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2563EB', '#1D4ED8']}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Send SMS code</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={[styles.terms, { color: subColor }]}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoLetter: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  prefix: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: 'transparent',
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
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
  terms: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
  link: {
    color: '#2563EB',
    fontWeight: '500',
  },
});
