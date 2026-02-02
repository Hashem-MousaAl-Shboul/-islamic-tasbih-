import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// إنشاء QueryClient للاختبارات
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// مكون Wrapper للاختبارات
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// دالة render مخصصة للاختبارات
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// إعادة تصدير كل شيء
export * from '@testing-library/react-native';

// تصدير render المخصص
export { customRender as render };

// دوال مساعدة للاختبارات
export const createMockDhikr = (overrides = {}) => ({
  id: '1',
  arabicText: 'سبحان الله',
  transliteration: 'Subhan Allah',
  translation: 'Glory be to Allah',
  count: 0,
  targetCount: 33,
  color: '#4CAF50',
  category: 'morning' as const,
  ...overrides,
});

export const createMockSettings = (overrides = {}) => ({
  theme: 'dark' as const,
  vibration: true,
  sound: true,
  autoAdvance: true,
  primaryColor: '#4CAF50',
  ...overrides,
});

export const createMockStats = (overrides = {}) => ({
  totalDhikr: 0,
  dailyDhikr: 0,
  weeklyDhikr: 0,
  monthlyDhikr: 0,
  streak: 0,
  lastActive: new Date().toISOString().split('T')[0],
  ...overrides,
});

// دالة لانتظار انتهاء الرسوم المتحركة
export const waitForAnimations = () => 
  new Promise(resolve => setTimeout(resolve, 500));

// دالة لمحاكاة الضغط المتعدد
export const multiplePress = async (element: any, times: number) => {
  const { fireEvent } = await import('@testing-library/react-native');
  for (let i = 0; i < times; i++) {
    fireEvent.press(element);
  }
};