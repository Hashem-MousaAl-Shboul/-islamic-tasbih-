# Verify & Fix Banner Ads Setup for Production Builds


## Current Status

The banner ads library (`react-native-google-mobile-ads`) is already installed and configured in your project. The AdBanner component is placed on all 4 screens: **Tasbih, Adhkar, Statistics, and Settings**.

**Why ads don't appear in the preview:** This ads library is a *native* library — it can only display ads in a real production build (App Store / Google Play), not in the web preview or Expo Go test app. This is a limitation of the ads library itself, not a bug.

## What This Plan Will Do

- **Double-check** all configuration is correct (App ID, Ad Unit ID, plugin settings)
- **Ensure the ad component** is robust — gracefully handles loading, errors, and platforms
- **Verify placement** on all 4 screens (Tasbih, Adhkar, Statistics, Settings) with the banner at the bottom
- **Confirm web compatibility** — the app won't crash on web (ads simply won't show)
- **Verify app.json** has the correct Google Mobile Ads plugin with your App ID: `ca-app-pub-4282819777610118~7403522538`
- **Verify Ad Unit ID** is set to: `ca-app-pub-4282819777610118/7510239834`

## Important Note

Once you create a **production build** and publish to the App Store / Google Play, the banner ads will appear at the bottom of all 4 screens on real devices. They will **never** appear in the web preview — this is expected and normal.
