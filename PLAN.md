# Fix Web Share Permission Error

**Problem**: The web share dialog fails with "Permission denied" because the browser requires a direct user tap to trigger sharing. The current code sometimes loses this direct connection.

**Fix**:
- [x] Update the share function in the app so that on web, if `navigator.share` fails (permission denied), it gracefully falls back to copying the text to the clipboard instead
- [x] Apply this fix to both the "Share App" button (settings screen) and the "Share Adhkar" button (adhkar screen)
- [x] Show a brief notification/alert when text is copied to clipboard as a fallback, so the user knows it worked
- [x] On native (iOS/Android), sharing will continue to work as before with no changes
