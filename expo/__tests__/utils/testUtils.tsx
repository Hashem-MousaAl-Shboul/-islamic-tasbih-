import React, {
  ReactElement,
  ReactNode,
  useState,
} from 'react';

import {
  act,
  fireEvent,
  render as rtlRender,
  RenderOptions,
} from '@testing-library/react-native';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

/* ==========================================================================
   Types
   ========================================================================== */

export type MockDhikr = {
  id: string;
  arabicText: string;
  transliteration: string;
  translation: string;
  count: number;
  targetCount: number;
  color: string;
  category: 'morning' | 'evening' | 'general';
};

export type MockSettings = {
  theme: 'dark' | 'light';
  vibration: boolean;
  sound: boolean;
  autoAdvance: boolean;
  primaryColor: string;
};

export type MockStats = {
  totalDhikr: number;
  dailyDhikr: number;
  weeklyDhikr: number;
  monthlyDhikr: number;
  streak: number;
  lastActive: string;
};

/* ==========================================================================
   Query Client
   ========================================================================== */

/**
 * إنشاء QueryClient مخصص للاختبارات.
 *
 * الإعدادات هنا تجعل الاختبارات:
 * - أسرع
 * - أكثر استقراراً
 * - بدون Retry تلقائي
 * - بدون Cache طويل الأمد
 */
export const createTestQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },

      mutations: {
        retry: false,
      },
    },
  });
};

/* ==========================================================================
   Test Providers
   ========================================================================== */

type AllTheProvidersProps = {
  children: ReactNode;
};

/**
 * Providers المستخدمة في الاختبارات.
 *
 * useState يضمن أن QueryClient لا يتم إنشاؤه من جديد
 * عند حدوث Re-render للمكون.
 */
const AllTheProviders = ({
  children,
}: AllTheProvidersProps) => {
  const [queryClient] = useState<QueryClient>(
    createTestQueryClient
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

/* ==========================================================================
   Custom Render
   ========================================================================== */

export type CustomRenderOptions = Omit<
  RenderOptions,
  'wrapper'
>;

/**
 * Render مخصص للمشروع.
 *
 * أي Component يتم اختباره سيتم تغليفه تلقائياً
 * بـ QueryClientProvider.
 */
const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  return rtlRender(ui, {
    wrapper: AllTheProviders,
    ...options,
  });
};

/* ==========================================================================
   Testing Library Exports
   ========================================================================== */

// إعادة تصدير جميع أدوات React Native Testing Library.
export * from '@testing-library/react-native';

// استبدال render الافتراضي بالـ custom render.
export {
  customRender as render,
};

/* ==========================================================================
   Mock Data
   ========================================================================== */

/**
 * إنشاء Dhikr وهمي للاختبارات.
 */
export const createMockDhikr = (
  overrides: Partial<MockDhikr> = {}
): MockDhikr => {
  return {
    id: '1',
    arabicText: 'سبحان الله',
    transliteration: 'Subhan Allah',
    translation: 'Glory be to Allah',
    count: 0,
    targetCount: 33,
    color: '#4CAF50',
    category: 'morning',

    ...overrides,
  };
};

/**
 * إنشاء Settings وهمية للاختبارات.
 */
export const createMockSettings = (
  overrides: Partial<MockSettings> = {}
): MockSettings => {
  return {
    theme: 'dark',
    vibration: true,
    sound: true,
    autoAdvance: true,
    primaryColor: '#4CAF50',

    ...overrides,
  };
};

/**
 * إنشاء Statistics وهمية للاختبارات.
 *
 * التاريخ ثابت لتجنب الاختبارات غير المستقرة
 * بسبب تغير تاريخ الجهاز.
 */
export const createMockStats = (
  overrides: Partial<MockStats> = {}
): MockStats => {
  return {
    totalDhikr: 0,
    dailyDhikr: 0,
    weeklyDhikr: 0,
    monthlyDhikr: 0,
    streak: 0,

    // تاريخ ثابت للاختبارات
    lastActive: '2026-01-01',

    ...overrides,
  };
};

/* ==========================================================================
   Testing Helpers
   ========================================================================== */

/**
 * انتظار انتهاء Animation أو Transition.
 *
 * يمكن تمرير مدة مختلفة عند الحاجة:
 *
 * await waitForAnimations();
 * await waitForAnimations(300);
 */
export const waitForAnimations = (
  duration = 500
): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
};

/**
 * الضغط على عنصر عدة مرات.
 *
 * مثال:
 *
 * await multiplePress(button, 5);
 */
export const multiplePress = async (
  element: unknown,
  times: number
): Promise<void> => {
  if (!Number.isInteger(times)) {
    throw new Error(
      'multiplePress: times must be an integer.'
    );
  }

  if (times < 0) {
    throw new Error(
      'multiplePress: times cannot be negative.'
    );
  }

  await act(async () => {
    for (let i = 0; i < times; i++) {
      fireEvent.press(element);
    }
  });
};

/* ==========================================================================
   Query Helpers
   ========================================================================== */

/**
 * إنشاء QueryClient مستقل للاختبارات التي تحتاج
 * الوصول المباشر إلى Cache أو Queries.
 */
export const createQueryClient = (): QueryClient => {
  return createTestQueryClient();
};

/**
 * مسح جميع بيانات QueryClient.
 */
export const clearQueryClient = (
  queryClient: QueryClient
): void => {
  queryClient.clear();
};

/* ==========================================================================
   Utility Helpers
   ========================================================================== */

/**
 * إنشاء تاريخ ثابت للاختبارات.
 */
export const TEST_DATE = '2026-01-01';

/**
 * إنشاء تاريخ Mock بصيغة YYYY-MM-DD.
 */
export const createMockDate = (
  date: string = TEST_DATE
): string => {
  return date;
};

/**
 * إنشاء Dhikr مكتمل.
 *
 * مفيد لاختبار الحالات التي يصل فيها المستخدم
 * إلى targetCount.
 */
export const createCompletedDhikr = (
  overrides: Partial<MockDhikr> = {}
): MockDhikr => {
  return createMockDhikr({
    count: 33,
    targetCount: 33,
    ...overrides,
  });
};

/**
 * إنشاء Dhikr غير مكتمل.
 */
export const createIncompleteDhikr = (
  overrides: Partial<MockDhikr> = {}
): MockDhikr => {
  return createMockDhikr({
    count: 0,
    targetCount: 33,
    ...overrides,
  });
};