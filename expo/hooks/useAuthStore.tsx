import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';

import createContextHook from '@nkzw/create-context-hook';

import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import type { Session, User } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

const extra = Constants.expoConfig?.extra;

const DEFAULT_GOOGLE_WEB_CLIENT_ID =
  '876532173264-rb5a1kr14oq3k7us1bevpcsd58umhjhl.apps.googleusercontent.com';

const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  DEFAULT_GOOGLE_WEB_CLIENT_ID;

export type AuthProfile = {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
  provider: string;
};

type AuthStore = {
  user: User | null;
  profile: AuthProfile | null;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;

  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;

  updateProfile: (data: {
    name: string;
    photoURL?: string | null;
  }) => Promise<void>;

  uploadProfilePhoto: (uri: string) => Promise<string>;
  deleteProfilePhoto: () => Promise<void>;
};

function getAuthErrorMessage(
  error: unknown,
  fallback = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
): string {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message || '')
      : '';

  if (message.includes('Invalid login credentials')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  }
  if (message.includes('User already registered')) {
    return 'هذا البريد الإلكتروني مستخدم بالفعل. جرّب تسجيل الدخول أو استخدم بريدًا آخر.';
  }
  if (message.includes('Email not confirmed')) {
    return 'يرجى تأكيد بريدك الإلكتروني أولاً.';
  }
  if (message.includes('Password should be at least')) {
    return 'كلمة المرور يجب أن لا تقل عن 6 أحرف.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'تم إجراء محاولات كثيرة. يرجى الانتظار قليلًا ثم المحاولة مرة أخرى.';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'تعذر الاتصال بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.';
  }

  if (message && !message.startsWith('AuthApiError')) {
    return message;
  }

  return fallback;
}

function createProfileFromUser(supaUser: User): AuthProfile {
  const meta = supaUser.user_metadata || {};
  const provider = supaUser.app_metadata?.provider || 'email';

  return {
    uid: supaUser.id,
    name:
      meta.full_name ||
      meta.name ||
      meta.display_name ||
      supaUser.email?.split('@')[0] ||
      'User',
    email: supaUser.email || '',
    photoURL: meta.avatar_url || meta.picture || null,
    provider: provider === 'google' ? 'Google' : 'Email',
  };
}

const GUEST_STORAGE_KEY = '@sabbah_guest_user';

const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  extra?.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
  extra?.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

async function uploadImageToCloudinary(uri: string, userId: string): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary cloud name is not configured.');
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary upload preset is not configured.');
  }

  if (!uri) {
    throw new Error('No image URI was provided.');
  }

  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: `profile_${userId}_${Date.now()}.jpg`,
  } as any);

  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'sabbah/profile-images');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error('Cloudinary returned an invalid response.');
  }

  if (!response.ok) {
    console.error('[Cloudinary] Upload failed:', data);
    throw new Error(data?.error?.message || `Cloudinary upload failed with status ${response.status}.`);
  }

  if (!data?.secure_url) {
    console.error('[Cloudinary] Missing secure_url:', data);
    throw new Error('Cloudinary did not return an image URL.');
  }

  return data.secure_url;
}

export const [AuthProvider, useAuthStore] = createContextHook<AuthStore>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Persist profile to Supabase profiles table
  const persistProfile = useCallback(
    async (supaUser: User, name?: string): Promise<AuthProfile> => {
      const userProfile = createProfileFromUser(supaUser);
      if (name) userProfile.name = name;

      try {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: supaUser.id,
              name: userProfile.name,
              email: userProfile.email,
              photo_url: userProfile.photoURL,
              provider: userProfile.provider,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );

        if (upsertError) {
          console.warn('[Auth] Profile upsert warning:', upsertError.message);
        }
      } catch (e) {
        console.warn('[Auth] Profile persist failed (non-fatal):', e);
      }

      setProfile(userProfile);
      return userProfile;
    },
    []
  );

  // Listen for auth state changes
  useEffect(() => {
    let active = true;

    // Check guest user first
    const checkGuest = async () => {
      try {
        const savedGuest = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
        if (savedGuest && active) {
          const parsed = JSON.parse(savedGuest);
          setProfile(parsed);
          setUser({ id: parsed.uid, email: parsed.email } as any);
          setIsLoading(false);
          return true;
        }
      } catch (e) {
        console.error('[Auth] Error checking guest storage:', e);
      }
      return false;
    };

    const init = async () => {
      const isGuest = await checkGuest();

      // Get initial session
      if (!isGuest) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && active) {
          setUser(session.user);
          try {
            await persistProfile(session.user);
          } catch {
            if (active) setProfile(createProfileFromUser(session.user));
          }
        }
        if (active) setIsLoading(false);
      }
    };

    init();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!active) return;

        if (event === 'SIGNED_IN' && session?.user) {
          await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
          setUser(session.user);
          try {
            await persistProfile(session.user);
          } catch {
            if (active) setProfile(createProfileFromUser(session.user));
          }
          if (active) setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          const savedGuest = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
          if (!savedGuest && active) {
            setUser(null);
            setProfile(null);
          }
          if (active) setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
        }
      }
    );

    // Subscribe to incoming deep links for OAuth callbacks
    const handleDeepLink = async (url: string) => {
      if (!url) return;
      console.log('[Auth] Deep link received:', url);
      try {
        const parsedUrl = new URL(url);
        const fragment = parsedUrl.hash?.substring(1);
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken) {
            console.log('[Auth] Extracting session from deep link...');
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            if (sessionError) console.warn('[Auth] Session set warning:', sessionError);
            else console.log('[Auth] Session set successfully via deep link!');
          }
        }
      } catch (err) {
        console.warn('[Auth] Error parsing deep link:', err);
      }
    };

    const linkSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Check initial URL if app was opened from cold start via deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
      linkSubscription.remove();
    };
  }, [persistProfile]);

  // ─── Google Sign-In ──────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        // Demo mode
        const demoProfile: AuthProfile = {
          uid: 'google_demo_' + Date.now(),
          name: 'مستخدم Google',
          email: 'user@google.com',
          photoURL: null,
          provider: 'Google',
        };
        await AsyncStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(demoProfile));
        setProfile(demoProfile);
        setUser({ id: demoProfile.uid, email: demoProfile.email } as any);
        return;
      }

      // WebBrowser OAuth Flow (Universal for Expo Go, Standalone APK & Web)
      const redirectUrl = makeRedirectUri({
        scheme: 'sabbah',
      });

      console.log('--------------------------------------------------');
      console.log('[Auth] 1. Google Sign-In Started (WebBrowser)');
      console.log('[Auth] 2. Generated Redirect URL:', redirectUrl);

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (oauthError) {
        console.error('[Auth] OAuth initiation error:', oauthError);
        throw oauthError;
      }

      if (!data?.url) {
        console.error('[Auth] Missing OAuth URL from Supabase');
        throw new Error('تعذر بدء تسجيل الدخول بواسطة Google.');
      }

      console.log('[Auth] 3. Supabase Auth URL:', data.url);
      console.log('[Auth] 4. Opening WebBrowser...');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      console.log('[Auth] 5. WebBrowser Result:', JSON.stringify(result, null, 2));

      if (result.type === 'success' && result.url) {
        console.log('[Auth] 6. Success URL received:', result.url);
        const url = new URL(result.url);

        // Try fragment first (implicit flow)
        let accessToken = '';
        let refreshToken = '';

        const fragment = url.hash?.substring(1);
        if (fragment) {
          const params = new URLSearchParams(fragment);
          accessToken = params.get('access_token') || '';
          refreshToken = params.get('refresh_token') || '';
        }

        // Try query params (PKCE flow)
        if (!accessToken) {
          const code = url.searchParams.get('code');
          if (code) {
            console.log('[Auth] Exchanging code for session...');
            const { data: sessionData, error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) throw exchangeError;
            console.log('[Auth] Session created successfully via code exchange');
            return;
          }
        }

        if (accessToken) {
          console.log('[Auth] Setting session via access token...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
          console.log('[Auth] Session set successfully via access token');
        }
      } else {
        console.warn('[Auth] WebBrowser did not return success. Result type:', result.type);
      }
    } catch (e: any) {
      const message = getAuthErrorMessage(e);
      console.error('[Auth] Google sign-in catch block:', e);
      setError(message);
      throw new Error(message);
    }
  }, []);

  // ─── Email Sign-In ───────────────────────────────────────
  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        if (!cleanEmail || !cleanPassword) {
          throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
        }

        if (!isSupabaseConfigured) {
          const demoProfile: AuthProfile = {
            uid: 'user_' + Date.now(),
            name: cleanEmail.split('@')[0] || 'مستخدم',
            email: cleanEmail,
            photoURL: null,
            provider: 'Email',
          };
          await AsyncStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(demoProfile));
          setProfile(demoProfile);
          setUser({ id: demoProfile.uid, email: demoProfile.email } as any);
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (signInError) throw signInError;
      } catch (e: any) {
        const message = getAuthErrorMessage(e);
        console.error('[Auth] Email sign-in error:', e);
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  // ─── Email Sign-Up ───────────────────────────────────────
  const signUpWithEmail = useCallback(
    async (email: string, password: string, name: string) => {
      setError(null);
      try {
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();
        const cleanName = name.trim();

        if (!cleanEmail || !cleanPassword || !cleanName) {
          throw new Error('يرجى ملء جميع الحقول المطلوبة.');
        }

        if (cleanPassword.length < 6) {
          throw new Error('كلمة المرور يجب أن لا تقل عن 6 أحرف.');
        }

        if (!isSupabaseConfigured) {
          const demoProfile: AuthProfile = {
            uid: 'user_' + Date.now(),
            name: cleanName,
            email: cleanEmail,
            photoURL: null,
            provider: 'Email',
          };
          await AsyncStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(demoProfile));
          setProfile(demoProfile);
          setUser({ id: demoProfile.uid, email: demoProfile.email } as any);
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanName,
              display_name: cleanName,
            },
          },
        });

        if (signUpError) throw signUpError;
      } catch (e: any) {
        const message = getAuthErrorMessage(e);
        console.error('[Auth] Email sign-up error:', e);
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  // ─── Continue as Guest ───────────────────────────────────
  const continueAsGuest = useCallback(async () => {
    setError(null);
    try {
      const guestProfile: AuthProfile = {
        uid: 'guest_user',
        name: 'زائر',
        email: '',
        photoURL: null,
        provider: 'Guest',
      };
      await AsyncStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestProfile));
      setProfile(guestProfile);
      setUser({ id: 'guest_user', email: null } as any);
    } catch (e: any) {
      setError('حدث خطأ أثناء الدخول كزائر.');
    }
  }, []);

  // ─── Logout ──────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
      await supabase.auth.signOut();
    } catch (e) {
      console.error('[Auth] Logout error:', e);
    } finally {
      setUser(null);
      setProfile(null);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ─── Update Profile ──────────────────────────────────────
  const updateProfile = useCallback(
    async (data: { name: string; photoURL?: string | null }) => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        const message = 'لم يتم تسجيل الدخول. يرجى تسجيل الدخول أولًا.';
        setError(message);
        throw new Error(message);
      }

      setError(null);
      try {
        const cleanName = data.name.trim();
        if (!cleanName) {
          throw new Error('يرجى إدخال الاسم.');
        }

        // Update Supabase auth metadata
        const updateData: Record<string, any> = {
          full_name: cleanName,
          display_name: cleanName,
        };
        if (data.photoURL !== undefined) {
          updateData.avatar_url = data.photoURL;
        }

        const { error: updateError } = await supabase.auth.updateUser({
          data: updateData,
        });
        if (updateError) throw updateError;

        // Update profiles table
        const profileUpdate: Record<string, any> = {
          name: cleanName,
          updated_at: new Date().toISOString(),
        };
        if (data.photoURL !== undefined) {
          profileUpdate.photo_url = data.photoURL;
        }

        await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', currentUser.id);

        // Refresh local state
        const { data: { user: refreshedUser } } = await supabase.auth.getUser();
        if (refreshedUser) {
          await persistProfile(refreshedUser, cleanName);
        }
      } catch (e: any) {
        const message = getAuthErrorMessage(e);
        setError(message);
        throw new Error(message);
      }
    },
    [persistProfile]
  );

  // ─── Upload Profile Photo ────────────────────────────────
  const uploadProfilePhoto = useCallback(
    async (uri: string): Promise<string> => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        const message = 'لم يتم تسجيل الدخول. يرجى تسجيل الدخول أولًا.';
        setError(message);
        throw new Error(message);
      }

      if (!uri) {
        const message = 'يرجى اختيار صورة أولًا.';
        setError(message);
        throw new Error(message);
      }

      try {
        const imageUrl = await uploadImageToCloudinary(uri, currentUser.id);

        await supabase.auth.updateUser({
          data: { avatar_url: imageUrl },
        });

        await supabase
          .from('profiles')
          .update({
            photo_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentUser.id);

        const { data: { user: refreshedUser } } = await supabase.auth.getUser();
        if (refreshedUser) {
          await persistProfile(refreshedUser);
        }

        setError(null);
        return imageUrl;
      } catch (error: any) {
        console.error('[Auth] Profile photo upload error:', error);
        const message = error?.message || 'تعذر رفع الصورة. يرجى المحاولة مرة أخرى.';
        setError(message);
        throw new Error(message);
      }
    },
    [persistProfile]
  );

  // ─── Delete Profile Photo ────────────────────────────────
  const deleteProfilePhoto = useCallback(async (): Promise<void> => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      const message = 'لم يتم تسجيل الدخول. يرجى تسجيل الدخول أولًا.';
      setError(message);
      throw new Error(message);
    }

    try {
      await supabase.auth.updateUser({
        data: { avatar_url: null },
      });

      await supabase
        .from('profiles')
        .update({
          photo_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      const { data: { user: refreshedUser } } = await supabase.auth.getUser();
      if (refreshedUser) {
        await persistProfile(refreshedUser);
      }

      setError(null);
    } catch (error: any) {
      console.error('[Auth] Delete profile photo error:', error);
      const message = error?.message || 'تعذر حذف صورة الملف الشخصي. يرجى المحاولة مرة أخرى.';
      setError(message);
      throw new Error(message);
    }
  }, [persistProfile]);

  return useMemo(
    () => ({
      user,
      profile,
      isLoading,
      error,
      isConfigured: isSupabaseConfigured,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      continueAsGuest,
      logout,
      clearError,
      updateProfile,
      uploadProfilePhoto,
      deleteProfilePhoto,
    }),
    [
      user,
      profile,
      isLoading,
      error,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      continueAsGuest,
      logout,
      clearError,
      updateProfile,
      uploadProfilePhoto,
      deleteProfilePhoto,
    ]
  );
});