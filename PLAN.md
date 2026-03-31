# Activate App Rating and Sharing Features

## What will change

**Features:**

- **Rate App** — Tapping "Rate App" in settings will open the native in-app review dialog on iPhone/Android. If the dialog isn't available, it falls back to opening the App Store or Google Play page directly
- **Share App** — Tapping "Share App" will open the system share sheet with a friendly message and a direct link to download the app from the App Store / Google Play
- Both features will work gracefully on web with appropriate fallbacks (alert for rating, web share API for sharing)

**Changes:**

- Update the settings screen to use the improved rating and sharing functions from the utility file
- The rating function will first try the native review popup, then fall back to opening the store link
- The share message will include the app download link so recipients can easily install the app
- Add the app store link to the share message for each platform (iOS App Store, Google Play)

