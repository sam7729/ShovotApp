import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@shovot_auth';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    isLoading: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const userId = await AsyncStorage.getItem(AUTH_KEY);
      setState({
        isAuthenticated: !!userId,
        userId,
        isLoading: false,
      });
    } catch {
      setState({ isAuthenticated: false, userId: null, isLoading: false });
    }
  }

  async function signIn(userId: string) {
    await AsyncStorage.setItem(AUTH_KEY, userId);
    setState({ isAuthenticated: true, userId, isLoading: false });
  }

  async function signOut() {
    await AsyncStorage.removeItem(AUTH_KEY);
    setState({ isAuthenticated: false, userId: null, isLoading: false });
  }

  return { ...state, signIn, signOut };
}
