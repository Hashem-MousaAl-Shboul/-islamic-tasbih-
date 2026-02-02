# دليل الاختبارات - تطبيق التسبيح والأذكار

## 🧪 نظرة عامة

تم إعداد نظام اختبارات شامل للتطبيق باستخدام Jest و React Native Testing Library لضمان جودة الكود وموثوقية التطبيق.

## 📁 هيكل الاختبارات

```
__tests__/
├── components/           # اختبارات المكونات
│   ├── TasbihCounter.test.tsx
│   └── DhikrCard.test.tsx
├── hooks/               # اختبارات الـ Hooks
│   └── useTasbihStore.test.ts
├── screens/             # اختبارات الشاشات
│   └── TasbihScreen.test.tsx
├── integration/         # اختبارات التكامل
│   └── TasbihFlow.test.tsx
├── constants/           # اختبارات الثوابت
│   └── dhikr.test.ts
└── utils/              # أدوات مساعدة للاختبارات
    └── testUtils.tsx
```

## 🚀 تشغيل الاختبارات

### الأوامر الأساسية

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل الاختبارات مع مراقبة التغييرات
npm run test:watch

# تشغيل الاختبارات مع تقرير التغطية
npm run test:coverage
```

### تشغيل اختبارات محددة

```bash
# اختبار مكون معين
npm test TasbihCounter

# اختبار مجلد معين
npm test __tests__/components

# اختبار بنمط معين
npm test --testNamePattern="يجب أن يزيد العداد"
```

## 📋 أنواع الاختبارات

### 1. اختبارات المكونات (Component Tests)

تختبر المكونات الفردية بمعزل عن باقي التطبيق:

```typescript
// مثال: اختبار مكون TasbihCounter
it('يجب أن يعرض العداد الحالي والهدف', () => {
  const { getByText } = render(
    <TasbihCounter dhikr={mockDhikr} onIncrement={mockOnIncrement} onReset={mockOnReset} />
  );
  
  expect(getByText('0')).toBeTruthy();
  expect(getByText('/ 33')).toBeTruthy();
});
```

### 2. اختبارات الـ Hooks

تختبر منطق إدارة الحالة:

```typescript
// مثال: اختبار useTasbihStore
it('يجب أن يزيد العداد عند استدعاء incrementCount', () => {
  const { result } = renderHook(() => useTasbihStore());
  
  act(() => {
    result.current.incrementCount();
  });
  
  expect(result.current.stats.totalDhikr).toBe(1);
});
```

### 3. اختبارات التكامل (Integration Tests)

تختبر تفاعل المكونات مع بعضها البعض:

```typescript
// مثال: اختبار دورة التسبيح الكاملة
it('يجب أن يكمل دورة تسبيح كاملة', async () => {
  const { getByTestId } = render(<TasbihScreen />);
  
  const incrementButton = getByTestId('increment-button');
  fireEvent.press(incrementButton);
  
  await waitFor(() => {
    expect(mockActions.incrementCount).toHaveBeenCalled();
  });
});
```

## 🛠️ الأدوات المستخدمة

### Jest
- إطار عمل الاختبارات الرئيسي
- يوفر وظائف المحاكاة (Mocking)
- تقارير التغطية

### React Native Testing Library
- اختبار المكونات بطريقة تحاكي تفاعل المستخدم
- البحث عن العناصر بطريقة طبيعية
- انتظار التحديثات غير المتزامنة

### Testing Utilities
- دوال مساعدة مخصصة
- محاكاة البيانات (Mock Data)
- إعداد البيئة

## 📊 تقارير التغطية

يتم إنشاء تقارير التغطية في مجلد `coverage/`:

```
coverage/
├── lcov-report/         # تقرير HTML تفاعلي
├── lcov.info           # بيانات التغطية
└── coverage-final.json # بيانات JSON
```

### عرض تقرير التغطية

```bash
# تشغيل الاختبارات مع التغطية
npm run test:coverage

# فتح التقرير في المتصفح (macOS)
open coverage/lcov-report/index.html

# فتح التقرير في المتصفح (Linux)
xdg-open coverage/lcov-report/index.html
```

## 🎯 أهداف التغطية

- **الخطوط (Lines)**: 80% أو أكثر
- **الوظائف (Functions)**: 80% أو أكثر
- **الفروع (Branches)**: 70% أو أكثر
- **البيانات (Statements)**: 80% أو أكثر

## 🔧 إعداد البيئة

### ملفات الإعداد

- `jest.config.js`: إعدادات Jest الرئيسية
- `jest-setup.js`: إعداد البيئة والمحاكاة
- `__tests__/utils/testUtils.tsx`: أدوات مساعدة

### المحاكاة (Mocks)

تم إعداد محاكاة للمكتبات التالية:
- `@react-native-async-storage/async-storage`
- `expo-haptics`
- `expo-linear-gradient`
- `react-native-svg`
- `lucide-react-native`
- `expo-router`

## 📝 كتابة اختبارات جديدة

### قواعد التسمية

```typescript
// استخدم أسماء وصفية باللغة العربية
describe('TasbihCounter', () => {
  it('يجب أن يعرض النص العربي والترجمة الصوتية', () => {
    // كود الاختبار
  });
});
```

### استخدام TestIDs

```typescript
// في المكون
<TouchableOpacity testID="increment-button">

// في الاختبار
const button = getByTestId('increment-button');
```

### اختبار التفاعلات

```typescript
// محاكاة الضغط
fireEvent.press(button);

// انتظار التحديثات
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled();
});
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

1. **خطأ في المحاكاة**: تأكد من إعداد المحاكاة في `jest-setup.js`
2. **مهلة زمنية**: استخدم `waitFor` للعمليات غير المتزامنة
3. **عناصر غير موجودة**: تحقق من `testID` والنص المستخدم

### تشغيل اختبار واحد

```bash
# تشغيل اختبار محدد
npm test -- --testNamePattern="اسم الاختبار"

# تشغيل ملف واحد
npm test TasbihCounter.test.tsx
```

## 📈 التحسين المستمر

### إضافة اختبارات جديدة

1. اكتب الاختبار أولاً (TDD)
2. تأكد من فشل الاختبار
3. اكتب الكود لتمرير الاختبار
4. قم بالتحسين

### مراجعة التغطية

```bash
# تحقق من التغطية الحالية
npm run test:coverage

# ابحث عن الملفات غير المغطاة
grep -r "0%" coverage/lcov-report/
```

## 🎉 الخلاصة

نظام الاختبارات يضمن:
- ✅ موثوقية التطبيق
- ✅ سهولة الصيانة
- ✅ اكتشاف الأخطاء مبكراً
- ✅ ثقة في التحديثات

للمساعدة أو الاستفسارات، راجع الوثائق أو اتصل بفريق التطوير.