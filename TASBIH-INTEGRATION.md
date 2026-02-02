# Tasbih Screen - Complete Integration Documentation

## Overview
تم ربط ميزة الإحصائيات (اليومية، المثالية، والمكتملة) بشكل كامل مع عداد التسبيح وبطاقات الأذكار.

## Components Integration

### 1. TasbihScreen (app/(tabs)/tasbih.tsx)
الشاشة الرئيسية التي تجمع جميع المكونات معًا:
- **TasbihHeader**: يعرض ملخص الإحصائيات في الأعلى
- **TasbihStats**: يعرض الإحصائيات التفصيلية
- **TasbihCard**: بطاقات الأذكار مع التقدم
- **TasbihCounter**: العداد الرئيسي

### 2. Data Flow

#### عند الضغط على العداد (Increment):
```
1. handleIncrement() → 
2. updateTasbihCount(id, true) →
3. Updates:
   - item.count++
   - item.isCompleted (if count >= targetCount)
   - stats.todayCount++
   - stats.totalCount++
   - stats.completedSessions++ (if completed)
4. Auto-navigation to next incomplete dhikr (if completed)
5. UI Updates:
   - Counter value
   - Progress bar in TasbihCard
   - All stats in TasbihStats
   - Header compact stats
```

#### عند التراجع (Decrement):
```
1. handleDecrement() →
2. updateTasbihCount(id, false) →
3. Updates:
   - item.count--
   - item.isCompleted (recalculated)
   - stats.todayCount--
   - stats.totalCount--
4. UI Updates:
   - Counter value
   - Progress bar
   - Stats
```

#### عند إعادة تعيين العداد (Reset):
```
1. handleReset() →
2. resetTasbih(id) →
3. Updates:
   - item.count = 0
   - item.isCompleted = false
   - stats.todayCount -= removed count
   - stats.totalCount -= removed count
4. UI Updates:
   - Counter resets
   - Progress bar resets
   - Stats update
```

### 3. Statistics Components

#### TasbihStats (components/TasbihStats.tsx)
يعرض 4 بطاقات إحصائية:
1. **اليوم (Today)**: عدد التسبيحات اليوم
2. **مكتمل (Completed)**: نسبة إكمال الأذكار (X/Y)
3. **الإجمالي (Total)**: إجمالي التسبيحات كل الوقت
4. **متتالية (Streak)**: عدد الأيام المتتالية

#### TasbihCard (components/TasbihCard.tsx)
يعرض:
- النص العربي
- الترجمة اللفظية (إذا مفعلة)
- العداد الحالي/الهدف
- نسبة التقدم (%)
- شريط التقدم (للبطاقة المحددة)
- علامة الإكمال (✓)

#### TasbihCounter (components/TasbihCounter.tsx)
يعرض:
- العداد الحالي
- الهدف
- نسبة التقدم (%)
- علامة الإكمال

### 4. State Management (hooks/useTasbihStore.ts)

#### State Variables:
- `tasbihItems`: قائمة بطاقات الأذكار
- `stats`: الإحصائيات العامة
  - `totalCount`: إجمالي العد
  - `todayCount`: عد اليوم
  - `streakDays`: الأيام المتتالية
  - `completedSessions`: الجلسات المكتملة
- `selectedItemId`: البطاقة المحددة حاليًا

#### Key Functions:
- `updateTasbihCount()`: تحديث العداد والإحصائيات
- `resetTasbih()`: إعادة تعيين عداد محدد
- `resetStats()`: إعادة تعيين جميع الإحصائيات
- `getTodayStats()`: حساب إحصائيات اليوم
- `getSelectedItem()`: الحصول على البطاقة المحددة

### 5. Auto-Navigation Feature

عند إكمال ذكر:
1. يتم تحديث حالة الإكمال
2. بعد 500ms يتم البحث عن الذكر التالي غير المكتمل
3. التنقل التلقائي للذكر التالي
4. إذا تم إكمال جميع الأذكار، يبقى على الذكر الحالي

```typescript
if (completionAchieved && completedItemId) {
  setTimeout(() => {
    const nextIncompleteItem = activeItems
      .slice(currentIndex + 1)
      .find(item => !item.isCompleted);
    
    const previousIncompleteItem = activeItems
      .slice(0, currentIndex)
      .find(item => !item.isCompleted);
    
    const nextItem = nextIncompleteItem || previousIncompleteItem;
    
    if (nextItem) {
      setSelectedItemId(nextItem.id);
    }
  }, 500);
}
```

### 6. Real-time Synchronization

جميع المكونات مرتبطة بـ `useTasbihStore` وتتحدث تلقائيًا عند:
- تغيير العداد
- إكمال ذكر
- إعادة تعيين
- حذف أو استعادة بطاقة

#### Auto-save:
- يتم حفظ البيانات تلقائيًا كل 1 ثانية
- يستخدم `useEffect` مع debounce
- يحفظ في AsyncStorage (Native) أو localStorage (Web)

### 7. Visual Indicators

#### في TasbihCard:
- لون البطاقة يتغير عند التحديد
- شريط التقدم يظهر للبطاقة المحددة
- نسبة مئوية تظهر للبطاقات غير المكتملة
- علامة ✓ تظهر للبطاقات المكتملة

#### في TasbihStats:
- 4 بطاقات ملونة
- أيقونات توضيحية
- قيم محدثة في الوقت الفعلي
- عنوان فرعي لكل بطاقة

#### في Header:
- ملخص مختصر (اليوم، النسبة، المتتالية)
- زر حذف الإحصائيات

## Console Logs for Debugging

تم إضافة console logs شاملة لتتبع:
- `[TasbihStore] updateTasbihCount called`
- `[TasbihStore] Stats updated`
- `[TasbihStore] Count incremented/decremented`
- `[TasbihStore] Dhikr completed`
- `[TasbihStore] Auto-navigating to`
- `[TasbihStore] getTodayStats`

## Testing Checklist

✅ عند الضغط على العداد:
  - يزيد العداد
  - تتحدث الإحصائيات
  - يتحدث شريط التقدم
  - تتحدث النسبة المئوية

✅ عند إكمال ذكر:
  - تظهر علامة الإكمال
  - يتم التنقل للذكر التالي
  - تزيد الجلسات المكتملة
  - تتحدث نسبة الإكمال

✅ عند إعادة التعيين:
  - يصفر العداد
  - تتحدث الإحصائيات
  - تزول علامة الإكمال
  - يصفر شريط التقدم

✅ عند التبديل بين البطاقات:
  - يتغير العداد
  - تتغير حالة التحديد
  - يظهر شريط التقدم للبطاقة الجديدة

✅ الإحصائيات الأربع متصلة:
  - اليوم
  - مكتمل
  - الإجمالي
  - متتالية

## Notes
- جميع البيانات تُحفظ تلقائيًا
- التحديثات فورية عبر جميع المكونات
- التنقل التلقائي يعمل بعد إكمال الذكر
- الإحصائيات مرتبطة 100% مع العداد والبطاقات
