import { DEFAULT_DHIKR_LIST } from '@/constants/dhikr';
import { Dhikr } from '@/types';

describe('DEFAULT_DHIKR_LIST', () => {
  it('يجب أن يحتوي على أذكار صحيحة', () => {
    expect(DEFAULT_DHIKR_LIST).toBeDefined();
    expect(Array.isArray(DEFAULT_DHIKR_LIST)).toBe(true);
    expect(DEFAULT_DHIKR_LIST.length).toBeGreaterThan(0);
  });

  it('يجب أن يحتوي كل ذكر على الخصائص المطلوبة', () => {
    DEFAULT_DHIKR_LIST.forEach((dhikr: Dhikr) => {
      expect(dhikr).toHaveProperty('id');
      expect(dhikr).toHaveProperty('arabicText');
      expect(dhikr).toHaveProperty('transliteration');
      expect(dhikr).toHaveProperty('translation');
      expect(dhikr).toHaveProperty('count');
      expect(dhikr).toHaveProperty('targetCount');
      expect(dhikr).toHaveProperty('color');
      expect(dhikr).toHaveProperty('category');
      
      // التحقق من أن القيم ليست فارغة
      expect(dhikr.id).toBeTruthy();
      expect(dhikr.arabicText).toBeTruthy();
      expect(dhikr.transliteration).toBeTruthy();
      expect(dhikr.translation).toBeTruthy();
      expect(typeof dhikr.count).toBe('number');
      expect(typeof dhikr.targetCount).toBe('number');
      expect(dhikr.color).toBeTruthy();
      expect(dhikr.category).toBeTruthy();
    });
  });

  it('يجب أن تكون جميع المعرفات فريدة', () => {
    const ids = DEFAULT_DHIKR_LIST.map(dhikr => dhikr.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('يجب أن تبدأ جميع الأذكار بعداد صفر', () => {
    DEFAULT_DHIKR_LIST.forEach((dhikr: Dhikr) => {
      expect(dhikr.count).toBe(0);
    });
  });

  it('يجب أن تحتوي على أذكار الصباح والمساء', () => {
    const morningDhikr = DEFAULT_DHIKR_LIST.filter(dhikr => dhikr.category === 'morning');
    const eveningDhikr = DEFAULT_DHIKR_LIST.filter(dhikr => dhikr.category === 'evening');
    
    expect(morningDhikr.length).toBeGreaterThan(0);
    expect(eveningDhikr.length).toBeGreaterThan(0);
  });

  it('يجب أن تحتوي على الأذكار الأساسية', () => {
    const arabicTexts = DEFAULT_DHIKR_LIST.map(dhikr => dhikr.arabicText);
    
    // التحقق من وجود بعض الأذكار الأساسية
    expect(arabicTexts).toContain('سبحان الله');
    expect(arabicTexts).toContain('الحمد لله');
    expect(arabicTexts).toContain('الله أكبر');
  });

  it('يجب أن تكون أهداف العد منطقية', () => {
    DEFAULT_DHIKR_LIST.forEach((dhikr: Dhikr) => {
      expect(dhikr.targetCount).toBeGreaterThan(0);
      expect(dhikr.targetCount).toBeLessThanOrEqual(1000); // حد أقصى معقول
    });
  });

  it('يجب أن تكون الألوان بتنسيق صحيح', () => {
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    
    DEFAULT_DHIKR_LIST.forEach((dhikr: Dhikr) => {
      expect(dhikr.color).toMatch(colorRegex);
    });
  });
});