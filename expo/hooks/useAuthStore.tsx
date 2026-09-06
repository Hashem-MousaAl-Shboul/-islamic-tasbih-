
outputs/AuthStore.fixed.ts
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

  const uploadProfilePhoto = useCallback(async (uri: string) => {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) throw new Error('لم يتم تسجيل الدخول. يرجى تسجيل الدخول أولًا.');
    return run(async () => {
      const imageUrl = await uploadImageToCloudinary(uri, currentUser.uid);
      await firebaseUpdateProfile(currentUser, { photoURL: imageUrl });
      await currentUser.reload();
      if (firebaseAuth.currentUser) await persistProfile(firebaseAuth.currentUser);
    }).then(() => firebaseAuth.currentUser?.photoURL || '');
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