# Prepare Subbah app for Google Play & App Store publication

## Current Status: ✅ App is in good shape

Your app already has most of what's needed for store publication:
- ✅ App name, icon, and splash screen configured
- ✅ Android package name & iOS bundle ID set
- ✅ Privacy Policy & Terms of Use (translated in 9 languages)
- ✅ 4 working tabs: Settings, Adhkar, Statistics, Tasbih
- ✅ Error handling and error boundaries
- ✅ Web compatibility (ad banner web fallback)
- ✅ Multi-language support
- ✅ Google Mobile Ads integrated

## What will be improved for publication

**1. Android adaptive icon background**
- Currently set to white, which doesn't match the app's dark green theme
- Will be changed to match the app's deep green (#1B4332) for a polished look on Android home screens

**2. Add Android version code**
- Required by Google Play to track updates
- Will set the initial version code to 1

**3. Ensure ad banner uses production ad IDs**
- Verify the ad component correctly switches from test ads (during development) to real ads (in production builds)

**4. Final web compatibility check**
- Ensure the sharing feature works properly across platforms without crashing
- Confirm clipboard fallback is solid for all browsers

**5. Verify all screens render cleanly**
- Confirm no placeholder or debug-only UI is visible to end users
- Ensure the welcome screen flows correctly on first launch

## Important notes
- Banner ads will **only** appear in production builds (not in the web preview)
- After these changes, you'll need to build the app through the store submission process to get it on Google Play and the App Store
