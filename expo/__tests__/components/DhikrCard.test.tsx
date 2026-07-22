import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DhikrCard } from '@/components/DhikrCard';
import { Dhikr } from '@/types';

const mockDhikr: Dhikr = {
  id: '1',
  arabicText: 'سبحان الله',
  translation: 'Glory be to Allah',
  count: 15,
  targetCount: 33,
  color: '#4CAF50',
  category: 'morning',
};

const mockOnPress = jest.fn();

describe('DhikrCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('يجب أن يعرض النص العربي', () => {
    const { getByText } = render(
      <DhikrCard
        dhikr={mockDhikr}
        isActive={false}
        onPress={mockOnPress}
      />
    );

    expect(getByText('سبحان الله')).toBeTruthy();
  });

  it('يجب أن يعرض العداد والهدف', () => {
    const { getByText } = render(
      <DhikrCard
        dhikr={mockDhikr}
        isActive={false}
        onPress={mockOnPress}
      />
    );

    expect(getByText('15/33')).toBeTruthy();
  });

  it('يجب أن يستدعي onPress عند الضغط', async () => {
    const { getByTestId } = render(
      <DhikrCard
        dhikr={mockDhikr}
        isActive={false}
        onPress={mockOnPress}
      />
    );

    const card = getByTestId(`dhikr-card-${mockDhikr.id}`);
    fireEvent.press(card);

    await waitFor(() => {
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  it('يجب أن يظهر أيقونة الإكمال عند الانتهاء', () => {
    const completedDhikr = { ...mockDhikr, count: 33 };
    const { getByTestId } = render(
      <DhikrCard
        dhikr={completedDhikr}
        isActive={false}
        onPress={mockOnPress}
      />
    );

    // التحقق من وجود أيقونة الإكمال
    expect(getByTestId('completion-icon')).toBeTruthy();
  });

  it('يجب أن يطبق الستايل النشط عندما يكون isActive صحيح', () => {
    const { getByTestId } = render(
      <DhikrCard
        dhikr={mockDhikr}
        isActive={true}
        onPress={mockOnPress}
      />
    );

    const card = getByTestId(`dhikr-card-${mockDhikr.id}`);
    expect(card).toBeTruthy();
  });

  it('يجب أن يعرض النسبة المئوية للتقدم', () => {
    const { getByText } = render(
      <DhikrCard
        dhikr={mockDhikr}
        isActive={false}
        onPress={mockOnPress}
      />
    );

    // 15/33 = ~45%
    expect(getByText('45%')).toBeTruthy();
  });

  it('يجب أن يحتوي على testID صحيح', () => {
    const { getByTestId } = render(
      <DhikrCard
        dhikr={mockDhikr}
        isActive={false}
        onPress={mockOnPress}
      />
    );

    expect(getByTestId(`dhikr-card-${mockDhikr.id}`)).toBeTruthy();
  });
});
