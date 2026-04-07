# Fix all publishing blockers and make the app store-ready

Based on the full project review, here's everything that needs to be fixed before the app can be submitted to the App Store:

---

**1. Generate App Icon & Splash Screen**
- Create a beautiful app icon with an Islamic/Tasbih theme using deep green and gold colors
- Generate matching splash screen image
- These are currently missing — the app references them but no image files exist

**2. Shorten App Name**
- Current name is too long for the App Store (Apple limits to 30 characters)
- Change to a shorter name like **"سبّح - Sabbah"** which fits within limits

**3. Fix URL Scheme**
- Change from the generic `"myapp"` to a unique scheme like `"sabbah"` to avoid conflicts with other apps

**4. Remove Unnecessary Permissions**
- Remove `RECORD_AUDIO`, `READ_EXTERNAL_STORAGE`, and `WRITE_EXTERNAL_STORAGE` from Android permissions (not used by the app)
- Remove the microphone usage description from iOS settings (not needed)
- Remove the microphone permission from the audio plugin config
- Keeping unused permissions can cause App Store rejection

**5. Update App Store URLs**
- The rating and sharing features currently have placeholder URLs (`id123456789`)
- Update them so the "Rate App" and "Share App" features work correctly after launch

**6. Set Splash Screen Background Color**
- Change the splash screen background from white (`#ffffff`) to deep green (`#1B4332`) to match the app's theme and provide a smooth loading experience

---

These changes will resolve all the identified deployment blockers and make the app ready for App Store submission.