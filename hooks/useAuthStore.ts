import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

const AUTH_KEY = 'user_auth_data';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface UseAuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook((): UseAuthStore => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAuthData = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem(AUTH_KEY);
      if (storedData) {
        const userData = JSON.parse(storedData);
        setUser(userData);
        console.log('[Auth] User data loaded successfully');
        return userData;
      }
    } catch (error) {
      console.error('[Auth] Error loading auth data:', error);
    }
    return null;
  }, []);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    await loadAuthData();
    setIsLoading(false);
  }, [loadAuthData]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const signInWithGoogle = useCallback(async () => {
    try {
      console.log('[Auth] Google Sign-In not configured yet');
      const guestUser: User = {
        id: 'guest-' + Date.now().toString(),
        email: 'guest@app.local',
        name: 'مستخدم',
      };
      setUser(guestUser);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(guestUser));
      console.log('[Auth] Signed in as guest');
    } catch (error) {
      console.error('[Auth] Error during Sign-In:', error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      setUser(null);
      console.log('[Auth] User signed out successfully');
    } catch (error) {
      console.error('[Auth] Error during sign out:', error);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut,
    checkAuthStatus,
  };
});
