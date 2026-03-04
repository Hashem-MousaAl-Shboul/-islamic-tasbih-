import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { Clock, X, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import i18n from '@/constants/translations';

interface ReminderTimePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (hour: number, minute: number) => void;
  currentHour: number;
  currentMinute: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const formatHour12 = (hour: number): string => {
  if (hour === 0) return '12';
  if (hour > 12) return String(hour - 12);
  return String(hour);
};

const getAmPm = (hour: number): string => {
  return hour < 12 ? (i18n.t('am') || 'AM') : (i18n.t('pm') || 'PM');
};

const formatTime = (hour: number, minute: number): string => {
  const h = formatHour12(hour);
  const m = minute.toString().padStart(2, '0');
  const period = getAmPm(hour);
  return `${h}:${m} ${period}`;
};

export const ReminderTimePicker = memo(function ReminderTimePicker({
  visible,
  onClose,
  onSelect,
  currentHour,
  currentMinute,
}: ReminderTimePickerProps) {
  const insets = useSafeAreaInsets();
  const [selectedHour, setSelectedHour] = useState<number>(currentHour);
  const [selectedMinute, setSelectedMinute] = useState<number>(currentMinute);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSelectedHour(currentHour);
      setSelectedMinute(currentMinute);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible, currentHour, currentMinute, slideAnim]);

  const handleConfirm = useCallback(() => {
    console.log(`[ReminderTimePicker] Selected time: ${selectedHour}:${selectedMinute}`);
    onSelect(selectedHour, selectedMinute);
    onClose();
  }, [selectedHour, selectedMinute, onSelect, onClose]);

  const handleClose = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [slideAnim, onClose]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.container,
            { paddingBottom: insets.bottom + 16, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.headerBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={22} color="#8e8e93" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Clock size={20} color="#1a5c4c" strokeWidth={2.5} />
              <Text style={styles.headerTitle}>
                {i18n.t('selectReminderTime') || 'Select reminder time'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.headerBtn, styles.confirmBtn]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Check size={22} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.previewContainer}>
            <Text style={styles.previewTime}>
              {formatTime(selectedHour, selectedMinute)}
            </Text>
            <Text style={styles.previewLabel}>
              {i18n.t('reminderTime') || 'Reminder Time'}
            </Text>
          </View>

          <View style={styles.pickersRow}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>{i18n.t('hour') || 'Hour'}</Text>
              <ScrollView
                style={styles.scrollPicker}
                contentContainerStyle={styles.scrollPickerContent}
                showsVerticalScrollIndicator={false}
                snapToInterval={52}
                decelerationRate="fast"
              >
                {HOURS.map((h) => {
                  const isSelected = h === selectedHour;
                  return (
                    <TouchableOpacity
                      key={`hour-${h}`}
                      onPress={() => setSelectedHour(h)}
                      style={[
                        styles.pickerItem,
                        isSelected && styles.pickerItemSelected,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          isSelected && styles.pickerItemTextSelected,
                        ]}
                      >
                        {formatHour12(h)}
                      </Text>
                      <Text
                        style={[
                          styles.pickerItemPeriod,
                          isSelected && styles.pickerItemPeriodSelected,
                        ]}
                      >
                        {getAmPm(h)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.pickerDivider} />

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>{i18n.t('minute') || 'Minute'}</Text>
              <ScrollView
                style={styles.scrollPicker}
                contentContainerStyle={styles.scrollPickerContent}
                showsVerticalScrollIndicator={false}
                snapToInterval={52}
                decelerationRate="fast"
              >
                {MINUTES.map((m) => {
                  const isSelected = m === selectedMinute;
                  return (
                    <TouchableOpacity
                      key={`minute-${m}`}
                      onPress={() => setSelectedMinute(m)}
                      style={[
                        styles.pickerItem,
                        isSelected && styles.pickerItemSelected,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          isSelected && styles.pickerItemTextSelected,
                        ]}
                      >
                        {m.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    maxHeight: '75%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 24,
      },
      web: {
        boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
      } as any,
    }),
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d1d6',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtn: {
    backgroundColor: '#1a5c4c',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    letterSpacing: -0.2,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'rgba(26,92,76,0.04)',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
  },
  previewTime: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#1a5c4c',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  previewLabel: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 4,
    fontWeight: '500' as const,
  },
  pickersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    textAlign: 'center',
  },
  pickerDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 12,
    marginTop: 30,
    marginBottom: 8,
  },
  scrollPicker: {
    maxHeight: 260,
  },
  scrollPickerContent: {
    paddingVertical: 4,
  },
  pickerItem: {
    height: 48,
    marginVertical: 2,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 8,
    backgroundColor: 'transparent',
  },
  pickerItemSelected: {
    backgroundColor: '#1a5c4c',
    ...Platform.select({
      ios: {
        shadowColor: '#1a5c4c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  pickerItemText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#3a3a3c',
    fontVariant: ['tabular-nums'],
  },
  pickerItemTextSelected: {
    color: '#fff',
  },
  pickerItemPeriod: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#8e8e93',
    marginTop: 2,
  },
  pickerItemPeriodSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
});
