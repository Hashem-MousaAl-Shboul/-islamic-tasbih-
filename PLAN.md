# Fix Tasbih Counter Speed & Statistics Accuracy

## What will change

### **Faster Tasbih Counter (especially on Android)**

- Remove heavy logging from every single tap — this slows down Android significantly
- Optimize the counter animation to be lighter and snappier (shorter durations)
- Make haptic feedback and sound non-blocking so they don't delay the count
- Reduce unnecessary re-renders when tapping the counter button
- Save data less aggressively — batch saves instead of triggering on every tap

### **Accurate Statistics**

- Fix the nested state update pattern where stats are updated inside the items update — this can cause missed or stale stats on fast tapping
- Move stats updates to run independently alongside item updates so both are always accurate
- Ensure the statistics screen always shows the latest real-time data from the store
- Fix the "today count" tracking to properly reflect actual taps made

### **Better Tasbih → Statistics Link**

- The existing link button at the bottom of the tasbih screen will remain
- Add a small live stats summary (today's count, sessions) that updates instantly as you tap
- Tapping the stats summary will also navigate to the full statistics screen

### **What stays the same**

- All existing design and visual style
- The add/delete/restore tasbih functionality
- Settings and preferences
- Sound and haptic feedback options (just made faster)

