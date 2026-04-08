# Fix crash on Adhkar screen

**Problem:** The Adhkar screen crashes because a translation function is used before it's set up in the code.

**Fix:** Move the translation setup to the top of the screen logic so it's available everywhere it's needed. This is a one-line move that will resolve the crash.