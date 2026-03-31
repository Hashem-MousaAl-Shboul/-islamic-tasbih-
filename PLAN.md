# Fix Tasbih Counter for Android

## What will be fixed

**Counter Store (`useTasbihStore`)**
- Fix the count update logic so the counter number and statistics always update together reliably on Android
- Remove the problematic pattern where state is read through a fake state update after completion
- Use a proper ref-based approach for auto-navigation after completing a dhikr
- Reduce unnecessary re-renders caused by the auto-save watcher reacting to every tap

**Counter Button (Tasbih Screen)**
- Replace the main counter button with a more responsive touch handler that works better on Android (switch from TouchableOpacity to Pressable)
- Make sound playback non-blocking so it never delays the counter increment
- Pre-load click sound during initialization instead of lazily on first tap
- Add proper error boundaries around haptics calls for Android devices that don't support them

**Sound Service**
- Pre-load the click sound during app initialization so the first tap isn't delayed by a network download
- Make all sound calls fully fire-and-forget so they never block the counter

These changes will make the counter feel instant and reliable on Android without changing the look or design of the screen.