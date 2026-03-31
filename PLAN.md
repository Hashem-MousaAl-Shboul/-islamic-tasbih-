# Fix minor TypeScript strictness issues

After a thorough review of every file in the project, the codebase is largely clean. Here are the small fixes I'll make:

**Fixes:**
- **Quran Audio Player**: Add `as const` to `fontWeight` string values (4 places) to satisfy strict type checking
- **Settings Item component**: Remove unused `pressed` variable from a render function
- **Tasbih Stats component**: Add explicit fallback for a platform-specific style value that could be `undefined`

These are minor strictness improvements — the app should already be working correctly.