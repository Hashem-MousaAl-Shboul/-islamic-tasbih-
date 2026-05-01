# Fix EAS build npm peer dependency error

**Problem**

The cloud build is failing because the installer is strict about version mismatches between two libraries used by the AI toolkit and the core app framework.

**Fix**

- Add a small configuration file that tells the installer to allow these minor version mismatches (the standard approach for Expo/React Native projects using the AI toolkit).
- This makes the build install dependencies successfully without changing any app behavior, UI, or features.

**Result**

- `eas build --platform android --profile production` will proceed past the install step.
- No visual or functional changes to the app.

