# Fix Banner Ads — Install & Configure Google Mobile Ads

**Problem**
The ad library is missing from the project. The ad component exists on all 4 screens but silently does nothing because the library isn't installed.

**What will be done**

1. **Install the Google Mobile Ads library** into the project
2. **Add the ad configuration** back to the app settings file with your App ID (`ca-app-pub-4282819777610118~7403522538`)
3. **Verify the AdBanner component** is correctly placed on all 4 screens (Tasbih, Adhkar, Statistics, Settings)

**Important Note**

- After this change, you will need to **create a new app build** (development or production build) for ads to appear on your Android and iOS devices
- Ads will **not** appear in the web preview — they only work on real devices with a native build
- Ads will **not** appear in Expo Go — a custom build is required

