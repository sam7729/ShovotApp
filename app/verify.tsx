import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

const AUTH_KEY = '@shovot_auth';

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const isDark = useColorScheme() === 'dark';

  const bg = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const inputBg = isDark ? '#1C1C1E' : '#F9FAFB';
  const borderColor = isDark ? '#3A3A3C' : '#E5E7EB';
  const activeBorder = '#2563EB';

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleDigit(text: string, index: number) {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError('');
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (index === 5 && digit) {
      verifyOtp([...next.slice(0, 5), digit]);
    }
  }

  function handleBackspace(index: number) {
    if (!otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = '';
      setOtp(next);
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function verifyOtp(digits: string[]) {
    const code = digits.join('');
    if (code.length !== 6) return;
    
    setLoading(true);
    const { data: { session }, error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms',
    });

    if (verifyError || !session) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(verifyError?.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    // Checking if user profile exists
    if (session.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();
        
      if (!profile) {
        // First-time user, route to onboarding
        setLoading(false);
        router.replace('/onboarding');
        return;
      }
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(false);
    router.replace('/(tabs)/home');
  }

  function handleVerify() {
    verifyOtp(otp);
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="chatbubble-ellipses" size={32} color="#2563EB" />
            </View>
            <Text style={[styles.title, { color: textColor }]}>Enter the code</Text>
            <Text style={[styles.sub, { color: subColor }]}>
              We sent a 6-digit code to{'\n'}
              <Text style={{ color: textColor, fontWeight: '600' }}>{phone}</Text>
            </Text>
          </View>

          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={r => { inputRefs.current[i] = r; }}
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: inputBg,
                    borderColor: digit ? activeBorder : borderColor,
                    color: textColor,
                  },
                ]}
                value={digit}
                onChangeText={t => handleDigit(t, i)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') handleBackspace(i);
                }}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                autoFocus={i === 0}
              />
            ))}
          </View>

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, { opacity: otp.every(d => d) ? 1 : 0.5 }]}
            onPress={handleVerify}
            disabled={!otp.every(d => d) || loading}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.btnGrad}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>Verify</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            {countdown > 0 ? (
              <Text style={[styles.resendText, { color: subColor }]}>
                Resend code in {fmt(countdown)}
              </Text>
            ) : (
              <TouchableOpacity onPress={() => setCountdown(60)}>
                <Text style={styles.resendLink}>Resend code</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  back: { marginBottom: 32, width: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  sub: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  hint: { fontSize: 13, marginTop: 8, fontWeight: '500' },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '700',
  },
  error: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  button: { borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  btnGrad: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resendRow: { alignItems: 'center' },
  resendText: { fontSize: 14 },
  resendLink: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
});
