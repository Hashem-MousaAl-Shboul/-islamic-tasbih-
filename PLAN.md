# تحسين شاشة الترحيب لعرض جميع الشاشات والمزايا

## Features

- **Welcome screen showcases all 4 app screens** with their icons and descriptions
- **Tasbih feature card** — icon with title "عداد التسبيح" and description about the digital counter for dhikr
- **Adhkar feature card** — icon with title "الأذكار" and description about morning/evening adhkar and duas
- **Statistics feature card** — icon with title "الإحصائيات" and description about tracking your dhikr progress
- **Settings feature card** — icon with title "الإعدادات" and description about customizing language, theme, sounds
- **Smooth entrance animations** — each feature card animates in sequentially with a staggered fade + slide effect
- **Start button** at the bottom to begin using the app

## Design

- **Scrollable single page** with a rich green gradient background (matching existing app theme)
- **App logo area** at the top with the sparkle icon and "تسبيح" title + subtitle
- **4 feature cards** stacked vertically, each with:
  - A circular icon container on the right (RTL layout)
  - Feature title in bold white
  - Short description in lighter white below
  - Slightly transparent card background with subtle border for depth
- Each card uses a **unique accent color** for its icon circle (gold for tasbih, purple for adhkar, green for statistics, warm tone for settings)
- **"ابدأ التسبيح" button** at the bottom — dark green rounded pill with white text
- **"اضغط للبدء" hint** below the button in faded text
- Overall feel: elegant, Islamic-inspired, calm and welcoming

## Screens

- **Welcome Screen** (single scrollable page):
  - Top: Sparkle icon + "تسبيح" title + subtitle
  - Middle: 4 feature cards (Tasbih, Adhkar, Statistics, Settings)
  - Bottom: Start button + hint text
