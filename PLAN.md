# Fix clipboard fallback for web sharing

**Problem**: Both the Web Share API and the modern Clipboard API are blocked by browser permissions policy in the web preview, so sharing and copying text fails completely on web.

**Fix**:
- [x] Add a legacy clipboard fallback that creates a temporary text area and uses the older copy command — this works even when the modern Clipboard API is blocked
- [x] Update the **Share App** function (settings screen) to use this new fallback
- [x] Update the **Share Adhkar** function (adhkar screen) to use this new fallback
- [x] Show a "Copied to clipboard" confirmation message when the fallback succeeds
- [x] If all methods fail, show the text in a popup so the user can manually copy it
- [x] No changes to native iOS/Android sharing — it continues working as before