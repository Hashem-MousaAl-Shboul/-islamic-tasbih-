# Fix "Cannot find single active touch" error

The error happens because the Adhkar screen uses low-level touch responder methods (`onStartShouldSetResponder` / `onResponderRelease`) on plain `View` elements for the web platform. This pattern causes the "Cannot find single active touch" crash.

**Fix:**
- Replace all `View` + `onStartShouldSetResponder` + `onResponderRelease` patterns with `Pressable` + `onPress` on the web branch too (favorite button, share button, and speak button)
- This makes the web and native code paths consistent and eliminates the touch error