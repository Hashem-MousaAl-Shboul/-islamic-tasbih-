# Fix Metro build error — remove expo-web-browser from plugins

## The Problem

The build fails because `"expo-web-browser"` is listed in the `plugins` array of `app.json`. Expo tries to load it as a config plugin, but `expo-web-browser` is a **runtime-only API** (used for `openBrowserAsync`, etc.) — it has no build-time plugin. This causes:

```
ENOENT while resolving package 'expo-web-browser/package.json'
```

## The Fix

**One change in `expo/app.json`** — remove `"expo-web-browser"` from the `plugins` array (line 52).

The package itself stays installed in `package.json` and all runtime usage of `expo-web-browser` continues to work normally. Only the unnecessary plugin entry is removed.
