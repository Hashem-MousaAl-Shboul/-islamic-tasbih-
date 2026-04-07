# Fix "Cannot find single active touch" error

The error happens because there are buttons (delete/restore) nested inside another pressable area on the tasbih cards. When you tap, the system gets confused about which touch to handle.

**Fix:**

- Replace the outer pressable wrapper on each tasbih card with a simple tappable view that doesn't conflict with the inner delete/restore buttons
- Ensure the horizontal card list and the main scrollable area don't fight over touch events
- This will eliminate the "Cannot find single active touch" crash when interacting with the tasbih screen

