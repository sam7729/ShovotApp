import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // If a session exists on mount, check if they have a profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();

          if (isMounted) {
            setChecking(false);
            if (profile) {
              // Returning user with a complete profile → go straight to home
              setTimeout(() => router.replace('/(tabs)/home'), 100);
            } else {
              // Session exists but no profile yet (incomplete signup).
              // Sign out to clear stale session; user must start fresh from login.
              await supabase.auth.signOut();
              setTimeout(() => router.replace('/login'), 100);
            }
          }
        } else {
           // No session, go to login
           if (isMounted) {
             setChecking(false);
             setTimeout(() => router.replace('/login'), 100);
           }
        }
      } catch {
        if (isMounted) {
          setChecking(false);
          setTimeout(() => router.replace('/login'), 100);
        }
      }
    })();

    // Listen to auth changes throughout app lifecycle
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        // Only force route changes on explicit sign out to not interrupt the onboarding flow during initial signup/sign in.
        if (event === 'SIGNED_OUT') {
          router.replace('/login');
        }
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="listing/[id]" />
        <Stack.Screen name="listing/edit/[id]" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/my-listings" />
        <Stack.Screen name="profile/saved" />
        <Stack.Screen name="profile/purchases" />
        <Stack.Screen name="profile/settings" />
        <Stack.Screen name="profile/seller/[id]" />
        <Stack.Screen name="chat/[id]" />
      </Stack>
    </>
  );
}
