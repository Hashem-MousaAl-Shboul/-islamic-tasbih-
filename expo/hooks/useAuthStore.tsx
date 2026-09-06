import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import createContextHook from '@nkzw/create-context-hook';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { firebaseAuth, firestore, isFirebaseConfigured } from '@/utils/firebase';

WebBrowser.maybeCompleteAuthSession();

const extra = Constants.expoConfig?.extra;
const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  extra?.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
  extra?.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const googleClientIds = {
  expoClientId:
    process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ||
    extra?.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
  iosClientId:
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId:
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    extra?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};

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
  logout: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: { name: string; photoURL?: string | null }) => Promise<void>;
  uploadProfilePhoto: (uri: string) => Promise<string>;
  deleteProfilePhoto: () => Promise<void>;
};

function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';

  const messages: Record<string, string> = {
    'auth/invalid-credential': 'بيانات تسجيل الدخول غير صحيحة.',
    'auth/wrong-password': 'بيانات تسجيل الدخول غير صحيحة.',
    'auth/user-not-found': 'بيانات تسجيل الدخول غير صحيحة.',
    'auth/invalid-email': 'يرجى إدخال بريد إلكتروني صحيح.',
    'auth/email-already-in-use': 'هذا البريد الإلكتروني مستخدم بالفعل.',
    'auth/weak-password': 'كلمة المرور ضعيفة. يرجى اختيار كلمة مرور أقوى.',
    'auth/password-does-not-meet-requirements': 'كلمة المرور لا تستوفي المتطلبات المطلوبة.',
    'auth/user-disabled': 'هذا الحساب تم تعطيله. يرجى التواصل مع الدعم.',
    'auth/too-many-requests': 'تم إجراء محاولات كثيرة. يرجى الانتظار ثم المحاولة مرة أخرى.',
    'auth/network-request-failed': 'تعذر الاتصال بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.',
    'auth/operation-not-allowed': 'طريقة تسجيل الدخول هذه غير مفعلة حاليًا.',
    'auth/account-exists-with-different-credential':
      'يوجد حساب بالفعل باستخدام طريقة تسجيل دخول مختلفة لهذا البريد الإلكتروني.',
    'auth/popup-closed-by-user': 'تم إلغاء تسجيل الدخول.',
    'auth/cancelled-popup-request': 'تم إلغاء تسجيل الدخول.',
    'auth/popup-blocked': 'تم منع نافذة تسجيل الدخول. يرجى السماح بالنوافذ المنبثقة والمحاولة مرة أخرى.',
    'auth/credential-already-in-use': 'بيانات تسجيل الدخول هذه مرتبطة بحساب آخر.',
    'auth/requires-recent-login': 'لأمان حسابك، يرجى تسجيل الدخول مرة أخرى ثم المحاولة.',
    'auth/invalid-verification-code': 'رمز التحقق غير صحيح.',
    'auth/invalid-verification-id': 'رمز التحقق غير صالح. يرجى طلب رمز جديد.',
    'auth/missing-email': 'يرجى إدخال بريدك الإلكتروني.',
    'auth/missing-password': 'يرجى إدخال كلمة المرور.',
    'auth/user-token-expired': 'انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.',
    'auth/invalid-user-token': 'انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.',
  };

  if (messages[code]) return messages[code];

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String((error as { message?: unknown }).message || '');
    if (message && !message.startsWith('Firebase:')) return message;
  }

  return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
}

function providerName(user: User): string {
  return user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email';
}

function createProfile(firebaseUser: User, name?: string): AuthProfile {
  return {
    uid: firebaseUser.uid,
    name:
      name?.trim() ||
      firebaseUser.displayName?.trim() ||
      firebaseUser.email?.split('@')[0] ||
      'User',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || null,
    provider: providerName(firebaseUser),
  };
}

async function uploadImageToCloudinary(uri: string, userId: string): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('إعدادات رفع الصور غير مكتملة.');
  }

  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: `profile_${userId}_${Date.now()}.jpg`,
  } as never);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'sabbah/profile-images');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );
  const data: { secure_url?: string; error?: { message?: string } } = await response.json();

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'تعذر رفع الصورة. يرجى المحاولة مرة أخرى.');
  }
  return data.secure_url;
}

export const [AuthProvider, useAuthStore] = createContextHook<AuthStore>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persistProfile = useCallback(async (firebaseUser: User, name?: string) => {
    const userRef = doc(firestore, 'users', firebaseUser.uid);
    const existing = await getDoc(userRef);
    const userProfile = createProfile(firebaseUser, name);
    await setDoc(
      userRef,
      {
        ...userProfile,
        ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    setProfile(userProfile);
    return userProfile;
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      if (!active) return;
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setIsLoading(false);
        return;
      }
      try {
        await persistProfile(nextUser);
      } catch (cause) {
        console.error('[Auth] Profile hydration failed:', cause);
        if (active) setProfile(createProfile(nextUser));
      } finally {
        if (active) setIsLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [persistProfile]);

  const run = useCallback(async (action: () => Promise<void>) => {
    if (!isFirebaseConfigured) {
      const message = 'خدمة تسجيل الدخول غير متاحة حاليًا. يرجى المحاولة لاحقًا.';
      setError(message);
      throw new Error(message);
    }
    setError(null);
    try {
      await action();
    } catch (cause) {
      const message = getAuthErrorMessage(cause);
      console.error('[Auth] Error:', cause);
      setError(message);
      throw new Error(message);
    }
  }, []);

  // This explicitly requests the token Firebase needs for GoogleAuthProvider.credential().
  const [googleRequest, , promptAsync] = Google.useIdTokenAuthRequest(googleClientIds);

  const signInWithGoogle = useCallback(
    () =>
      run(async () => {
        if (!googleRequest) {
          throw new Error('إعداد Google غير مكتمل أو لم يصبح جاهزًا بعد.');
        }
        const result = await promptAsync();
        if (result.type === 'dismiss' || result.type === 'cancel') return;
        if (result.type !== 'success') {
          throw new Error('تعذر تسجيل الدخول باستخدام Google. يرجى المحاولة مرة أخرى.');
        }
        const idToken = result.params.id_token;
        if (!idToken) {
          throw new Error('لم تُرجع Google رمز الهوية المطلوب.');
        }
        const signedIn = await signInWithCredential(
          firebaseAuth,
          GoogleAuthProvider.credential(idToken)
        );
        await persistProfile(signedIn.user);
      }),
    [googleRequest, persistProfile, promptAsync, run]
  );

  const logout = useCallback(
    () => run(async () => {
      await signOut(firebaseAuth);
      setUser(null);
      setProfile(null);
    }),
    [run]
  );

  const updateProfile = useCallback(async (data: { name: string; photoURL?: string | null }) => {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) throw new Error('لم يتم تسجيل الدخول. يرجى تسجيل الدخول أولًا.');
    await run(async () => {
      const displayName = data.name.trim();
      if (!displayName) throw new Error('يرجى إدخال الاسم.');
      await firebaseUpdateProfile(currentUser, {
        displayName,
        ...(data.photoURL !== undefined ? { photoURL: data.photoURL } : {}),
      });
      await currentUser.reload();
      if (firebaseAuth.currentUser) await persistProfile(firebaseAuth.currentUser, displayName);
    });
  }, [persistProfile, run]);

  const uploadProfilePhoto = useCallback(async (uri: string): Promise<string> => {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) throw new Error('لم يتم تسجيل الدخول. يرجى تسجيل الدخول أولًا.');
    let imageUrl = '';
    await run(async () => {
      imageUrl = await uploadImageToCloudinary(uri, currentUser.uid);
      await firebaseUpdateProfile(currentUser, { photoURL: imageUrl });
      await currentUser.reload();
      if (firebaseAuth.currentUser) await persistProfile(firebaseAuth.currentUser);
    });
    return imageUrl;
  }, [persistProfile, run]);

  const deleteProfilePhoto = useCallback(async () => {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) throw new Error('لم يتم تسجيل الدخول. يرجى تسجيل الدخول أولًا.');
    await run(async () => {
      await firebaseUpdateProfile(currentUser, { photoURL: null });
      await currentUser.reload();
      if (firebaseAuth.currentUser) await persistProfile(firebaseAuth.currentUser);
    });
  }, [persistProfile, run]);

  const clearError = useCallback(() => setError(null), []);
  return useMemo(() => ({
    user, profile, isLoading, error, isConfigured: isFirebaseConfigured,
    signInWithGoogle, logout, clearError, updateProfile, uploadProfilePhoto, deleteProfilePhoto,
  }), [user, profile, isLoading, error, signInWithGoogle, logout, clearError, updateProfile, uploadProfilePhoto, deleteProfilePhoto]);
});
