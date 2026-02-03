import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import createContextHook from '@nkzw/create-context-hook';

WebBrowser.maybeCompleteAuthSession();

const AUTH_KEY = 'user_auth_data';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
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

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  });

  const saveAuthData = useCallback(async (userData: User) => {
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      setUser(userData);
      console.log('[Auth] User data saved successfully');
    } catch (error) {
      console.error('[Auth] Error saving auth data:', error);
    }
  }, []);

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

  const fetchGoogleUserInfo = useCallback(async (accessToken: string) => {
    try {
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const userInfo = await userInfoResponse.json();
      
      const userData: User = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        accessToken,
      };
      
      await saveAuthData(userData);
    } catch (error) {
      console.error('[Auth] Error fetching user info:', error);
    }
  }, [saveAuthData]);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    await loadAuthData();
    setIsLoading(false);
  }, [loadAuthData]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchGoogleUserInfo(authentication.accessToken);
      }
    }
  }, [response, fetchGoogleUserInfo]);

  const signInWithGoogle = useCallback(async () => {
    try {
      console.log('[Auth] Starting Google Sign-In');
      await promptAsync();
    } catch (error) {
      console.error('[Auth] Error during Google Sign-In:', error);
    }
  }, [promptAsync]);

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
