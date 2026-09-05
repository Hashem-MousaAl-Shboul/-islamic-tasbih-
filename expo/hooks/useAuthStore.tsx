import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import createContextHook from '@nkzw/create-context-hook';

import {
  firebaseAuth,
  firestore,
  isFirebaseConfigured,
} from '@/utils/firebase';

WebBrowser.maybeCompleteAuthSession();

const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

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

  updateProfile: (data: {
    name: string;
    photoURL?: string | null;
  }) => Promise<void>;

  uploadProfilePhoto: (
    uri: string
  ) => Promise<string>;

  deleteProfilePhoto: () => Promise<void>;
};

function getAuthErrorMessage(
  error: unknown,
  fallback = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error
      ? String(
          (error as { code?: unknown }).code || ''
        )
      : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';

    case 'auth/invalid-email':
      return 'يرجى إدخال بريد إلكتروني صحيح.';

    case 'auth/email-already-in-use':
      return 'هذا البريد الإلكتروني مستخدم بالفعل. جرّب تسجيل الدخول أو استخدم بريدًا آخر.';

    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة. يرجى اختيار كلمة مرور أقوى.';

    case 'auth/password-does-not-meet-requirements':
      return 'كلمة المرور لا تستوفي المتطلبات المطلوبة.';

    case 'auth/user-disabled':
      return 'هذا الحساب تم تعطيله. يرجى التواصل مع الدعم.';

    case 'auth/too-many-requests':
      return 'تم إجراء محاولات كثيرة. يرجى الانتظار قليلًا ثم المحاولة مرة أخرى.';

    case 'auth/network-request-failed':
      return 'تعذر الاتصال بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.';

    case 'auth/operation-not-allowed':
      return 'طريقة تسجيل الدخول هذه غير مفعلة حاليًا.';

    case 'auth/account-exists-with-different-credential':
      return 'يوجد حساب بالفعل باستخدام طريقة تسجيل دخول مختلفة لهذا البريد الإلكتروني.';

    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'تم إلغاء تسجيل الدخول.';

    case 'auth/popup-blocked':
      return 'تم منع نافذة تسجيل الدخول. يرجى السماح بالنوافذ المنبثقة والمحاولة مرة أخرى.';

    case 'auth/credential-already-in-use':
      return 'بيانات تسجيل الدخول هذه مرتبطة بحساب آخر.';

    case 'auth/requires-recent-login':
      return 'لأمان حسابك، يرجى تسجيل الدخول مرة أخرى ثم المحاولة.';

    case 'auth/invalid-verification-code':
      return 'رمز التحقق غير صحيح.';

    case 'auth/invalid-verification-id':
      return 'رمز التحقق غير صالح. يرجى طلب رمز جديد.';

    case 'auth/missing-email':
      return 'يرجى إدخال بريدك الإلكتروني.';

    case 'auth/missing-password':
      return 'يرجى إدخال كلمة المرور.';

    case 'auth/user-token-expired':
      return 'انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.';

    case 'auth/invalid-user-token':
      return 'انتهت صلاحية جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.';

    default: {
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error
      ) {
        const firebaseMessage = String(
          (error as { message?: unknown }).message || ''
        );

        if (
          firebaseMessage &&
          !firebaseMessage.startsWith('Firebase:')
        ) {
          return firebaseMessage;
        }
      }

      return fallback;
    }
  }
}

function getErrorCode(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error
  ) {
    return String(
      (error as { code?: unknown }).code || ''
    );
  }

  return '';
}

function providerName(user: User): string {
  const providerId =
    user.providerData[0]?.providerId;

  switch (providerId) {
    case 'google.com':
      return 'Google';

    default:
      return 'Email';
  }
}

function createProfile(
  firebaseUser: User,
  name?: string
): AuthProfile {
  return {
    uid: firebaseUser.uid,

    name:
      name?.trim() ||
      firebaseUser.displayName?.trim() ||
      firebaseUser.email?.split('@')[0] ||
      'User',

    email: firebaseUser.email || '',

    photoURL:
      firebaseUser.photoURL || null,

    provider:
      providerName(firebaseUser),
  };
}

async function uploadImageToCloudinary(
  uri: string,
  userId: string
): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      'Cloudinary cloud name is not configured. Add EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME.'
    );
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary upload preset is not configured. Add EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET.'
    );
  }

  if (!uri) {
    throw new Error(
      'No image URI was provided.'
    );
  }

  const formData = new FormData();

  formData.append(
    'file',
    {
      uri,
      type: 'image/jpeg',
      name: `profile_${userId}_${Date.now()}.jpg`,
    } as any
  );

  formData.append(
    'upload_preset',
    CLOUDINARY_UPLOAD_PRESET
  );

  formData.append(
    'folder',
    'sabbah/profile-images'
  );

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
    throw new Error(
      'Cloudinary returned an invalid response.'
    );
  }

  if (!response.ok) {
    console.error(
      '[Cloudinary] Upload failed:',
      data
    );

    throw new Error(
      data?.error?.message ||
        `Cloudinary upload failed with status ${response.status}.`
    );
  }

  if (!data?.secure_url) {
    console.error(
      '[Cloudinary] Missing secure_url:',
      data
    );

    throw new Error(
      'Cloudinary did not return an image URL.'
    );
  }

  return data.secure_url;
}

export const [AuthProvider, useAuthStore] =
  createContextHook<AuthStore>(() => {
    const [user, setUser] =
      useState<User | null>(null);

    const [profile, setProfile] =
      useState<AuthProfile | null>(null);

    const [isLoading, setIsLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(null);

    const persistProfile = useCallback(
      async (
        firebaseUser: User,
        name?: string
      ): Promise<AuthProfile> => {
        const userRef = doc(
          firestore,
          'users',
          firebaseUser.uid
        );

        const existing =
          await getDoc(userRef);

        const userProfile =
          createProfile(
            firebaseUser,
            name
          );

        if (existing.exists()) {
          await setDoc(
            userRef,
            {
              ...userProfile,
              updatedAt:
                serverTimestamp(),
            },
            {
              merge: true,
            }
          );
        } else {
          await setDoc(
            userRef,
            {
              ...userProfile,
              createdAt:
                serverTimestamp(),
              updatedAt:
                serverTimestamp(),
            },
            {
              merge: true,
            }
          );
        }

        setProfile(userProfile);

        return userProfile;
      },
      []
    );

    useEffect(() => {
      let active = true;

      const unsubscribe =
        onAuthStateChanged(
          firebaseAuth,
          async (nextUser) => {
            if (!active) {
              return;
            }

            setUser(nextUser);

            if (!nextUser) {
              setProfile(null);
              setIsLoading(false);
              return;
            }

            try {
              await persistProfile(
                nextUser
              );

              if (!active) {
                return;
              }
            } catch (cause) {
              console.error(
                '[Auth] Profile hydration failed:',
                cause
              );

              if (!active) {
                return;
              }

              setProfile(
                createProfile(nextUser)
              );
            } finally {
              if (active) {
                setIsLoading(false);
              }
            }
          }
        );

      return () => {
        active = false;
        unsubscribe();
      };
    }, [persistProfile]);

    const run = useCallback(
      async (
        action: () => Promise<void>
      ) => {
        if (!isFirebaseConfigured) {
          const message =
            'خدمة تسجيل الدخول غير متاحة حاليًا. يرجى المحاولة لاحقًا.';

          setError(message);

          throw new Error(message);
        }

        setError(null);

        try {
          await action();
        } catch (cause: any) {
          const code =
            getErrorCode(cause);

          const message =
            getAuthErrorMessage(cause);

          console.error(
            '[Auth] Firebase error:',
            {
              code,
              message:
                cause?.message,
              error: cause,
            }
          );

          setError(message);

          throw new Error(message);
        }
      },
      []
    );

    const [
      googleRequest,
      ,
      promptAsync,
    ] = Google.useAuthRequest({
      clientId:
        process.env
          .EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,

      iosClientId:
        process.env
          .EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,

      androidClientId:
        process.env
          .EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,

      webClientId:
        process.env
          .EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

    const signInWithGoogle =
      useCallback(
        () =>
          run(async () => {
            if (!googleRequest) {
              throw new Error(
                'تسجيل الدخول باستخدام Google غير جاهز حاليًا. يرجى المحاولة مرة أخرى.'
              );
            }

            const result =
              await promptAsync();

            if (
              result.type ===
                'dismiss' ||
              result.type ===
                'cancel'
            ) {
              return;
            }

            if (
              result.type !==
              'success'
            ) {
              throw new Error(
                'تعذر تسجيل الدخول باستخدام Google. يرجى المحاولة مرة أخرى.'
              );
            }

            const idToken =
              result.params
                ?.id_token;

            if (!idToken) {
              throw new Error(
                'تعذر إكمال تسجيل الدخول باستخدام Google. يرجى المحاولة مرة أخرى.'
              );
            }

            const credential =
              GoogleAuthProvider.credential(
                idToken
              );

            const signedIn =
              await signInWithCredential(
                firebaseAuth,
                credential
              );

            await persistProfile(
              signedIn.user
            );
          }),
        [
          googleRequest,
          persistProfile,
          promptAsync,
          run,
        ]
      );

    const logout = useCallback(
      () =>
        run(async () => {
          await signOut(
            firebaseAuth
          );

          setUser(null);
          setProfile(null);
        }),
      [run]
    );

    const clearError =
      useCallback(() => {
        setError(null);
      }, []);

    const updateProfile =
      useCallback(
        async (data: {
          name: string;
          photoURL?: string | null;
        }) => {
          const currentUser =
            firebaseAuth.currentUser;

          if (!currentUser) {
            const message =
              'لم يتم تسجيل الدخول. يرجى تسجيل الدخول أولًا.';

            setError(message);

            throw new Error(message);
          }

          await run(async () => {
            const cleanName =
              data.name.trim();

            if (!cleanName) {
              throw new Error(
                'يرجى إدخال الاسم.'
              );
            }

            const updateData: {
              displayName: string;
              photoURL?: string | null;
            } = {
              displayName:
                cleanName,
            };

            if (
              data.photoURL !==
              undefined
            ) {
              updateData.photoURL =
                data.photoURL;
            }

            await firebaseUpdateProfile(
              currentUser,
              updateData
            );

            await currentUser.reload();

            const refreshedUser =
              firebaseAuth.currentUser;

            if (refreshedUser) {
              await persistProfile(
                refreshedUser,
                cleanName
              );
            }
          });
        },
        [persistProfile, run]
      );

    const uploadProfilePhoto =
      useCallback(
        async (
          uri: string
        ): Promise<string> => {
          const currentUser =
            firebaseAuth.currentUser;

          if (!currentUser) {
            const message =
              'لم يتم تسجيل الدخول. يرجى تسجيل الدخول أولًا.';

            setError(message);

            throw new Error(message);
          }

          if (!uri) {
            const message =
              'يرجى اختيار صورة أولًا.';

            setError(message);

            throw new Error(message);
          }

          try {
            const imageUrl =
              await uploadImageToCloudinary(
                uri,
                currentUser.uid
              );

            await firebaseUpdateProfile(
              currentUser,
              {
                photoURL:
                  imageUrl,
              }
            );

            await currentUser.reload();

            const refreshedUser =
              firebaseAuth.currentUser;

            if (refreshedUser) {
              await persistProfile(
                refreshedUser
              );
            }

            setError(null);

            return imageUrl;
          } catch (error: any) {
            console.error(
              '[Auth] Cloudinary profile photo upload error:',
              error
            );

            const message =
              error?.message ||
              'تعذر رفع الصورة. يرجى المحاولة مرة أخرى.';

            setError(message);

            throw new Error(
              message
            );
          }
        },
        [persistProfile]
      );

    const deleteProfilePhoto =
      useCallback(
        async (): Promise<void> => {
          const currentUser =
            firebaseAuth.currentUser;

          if (!currentUser) {
            const message =
              'لم يتم تسجيل الدخول. يرجى تسجيل الدخول أولًا.';

            setError(message);

            throw new Error(message);
          }

          const currentPhotoURL =
            currentUser.photoURL;

          if (!currentPhotoURL) {
            return;
          }

          try {
            await firebaseUpdateProfile(
              currentUser,
              {
                photoURL: null,
              }
            );

            await currentUser.reload();

            const refreshedUser =
              firebaseAuth.currentUser;

            if (refreshedUser) {
              await persistProfile(
                refreshedUser
              );
            }

            setError(null);
          } catch (error: any) {
            console.error(
              '[Auth] Delete profile photo error:',
              error
            );

            const message =
              error?.message ||
              'تعذر حذف صورة الملف الشخصي. يرجى المحاولة مرة أخرى.';

            setError(message);

            throw new Error(
              message
            );
          }
        },
        [persistProfile]
      );

    return useMemo(
      () => ({
        user,
        profile,
        isLoading,
        error,
        isConfigured:
          isFirebaseConfigured,
        signInWithGoogle,
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
        logout,
        clearError,
        updateProfile,
        uploadProfilePhoto,
        deleteProfilePhoto,
      ]
    );
  });