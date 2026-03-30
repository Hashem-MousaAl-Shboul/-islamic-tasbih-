import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, Platform, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'select' | 'button' | 'action';
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
  variant?: 'card' | 'grouped';
  iconBgColor?: string;
}

export const SettingsItem = memo(function SettingsItem({
  icon,
  title,
  subtitle,
  type,
  value,
  onPress,
  onToggle,
  danger = false,
  variant = 'card',
  iconBgColor,
}: SettingsItemProps) {
  const theme = useTheme();
  const isOn = useMemo(() => Boolean(value), [value]);

  const containerStyle = [
    styles.container,
    variant === 'grouped' && styles.containerGrouped,
  ];

  const iconContainerStyle = [
    styles.iconContainer,
    {
      backgroundColor: danger 
        ? 'rgba(255,107,107,0.15)' 
        : iconBgColor || `${theme.primary}20`
    }
  ];

  const renderContent = () => (
    <View style={[styles.touchableContent, variant === 'grouped' && styles.touchableGrouped]}>
      <View style={styles.leftContent}>
        <View style={iconContainerStyle}>
          {/* eslint-disable-next-line @rork/linters/general-no-raw-text */}
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }, danger && styles.dangerText]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
        </View>
      </View>
      
      <View style={styles.rightContent}>
        {type === 'toggle' ? (
          <Switch
            value={isOn}
            onValueChange={onToggle}
            trackColor={{ 
              false: Platform.OS === 'android' ? '#d0d0d0' : (theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'), 
              true: theme.primary 
            }}
            thumbColor={Platform.OS === 'android' ? (isOn ? theme.primary : '#f4f3f4') : '#FFFFFF'}
            ios_backgroundColor={theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            testID={`toggle-${title}`}
            style={Platform.OS === 'android' ? styles.switchAndroid : styles.switch}
          />
        ) : null}
        
        {type === 'select' ? (
          <View style={[styles.selectButton, { backgroundColor: theme.primary + '08', borderColor: theme.primary + '20' }]}>
            <Text style={[styles.selectValue, { color: theme.primary }]}>{(value as string) ?? ''}</Text>
            <View style={[styles.chevronContainer, { backgroundColor: theme.primary + '15' }]}>
              <ChevronRight size={18} color={theme.primary} strokeWidth={2.5} />
            </View>
          </View>
        ) : null}
        
        {type === 'button' ? (
          <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.button, { backgroundColor: theme.primary }]}>
              <Text style={styles.buttonText}>{String(value ?? '')}</Text>
            </View>
          </TouchableOpacity>
        ) : null}
        
        {type === 'action' ? (
          <View style={styles.actionButton}>
            <View style={[
              styles.chevronContainer,
              { backgroundColor: danger ? 'rgba(255,107,107,0.1)' : theme.primary + '15' },
              danger && styles.dangerChevron
            ]}>
              <ChevronRight 
                size={18} 
                color={danger ? '#FF6B6B' : theme.primary} 
                strokeWidth={2.5}
              />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (type === 'toggle') {
    return (
      <Pressable
        style={({ pressed }) => [
          ...containerStyle,
          Platform.OS === 'android' && pressed && { backgroundColor: 'rgba(0,0,0,0.03)' },
        ]}
        onPress={() => onToggle?.(!isOn)}
        android_ripple={Platform.OS === 'android' ? { color: 'rgba(0,0,0,0.06)', borderless: false } : undefined}
      >
        {({ pressed }) => (
          <View style={[styles.touchableContent, variant === 'grouped' && styles.touchableGrouped]}>
            <View style={styles.leftContent}>
              <View style={iconContainerStyle}>
                {icon}
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: theme.text }, danger && styles.dangerText]}>{title}</Text>
                {subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
              </View>
            </View>
            <View style={styles.rightContent}>
              <Switch
                value={isOn}
                onValueChange={undefined}
                trackColor={{ 
                  false: Platform.OS === 'android' ? '#d0d0d0' : (theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'), 
                  true: theme.primary 
                }}
                thumbColor={Platform.OS === 'android' ? (isOn ? theme.primary : '#f4f3f4') : '#FFFFFF'}
                ios_backgroundColor={theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                testID={`toggle-${title}`}
                style={Platform.OS === 'android' ? styles.switchAndroid : styles.switch}
                pointerEvents="none"
              />
            </View>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        ...containerStyle,
        Platform.OS === 'android' && pressed && { backgroundColor: 'rgba(0,0,0,0.03)' },
      ]}
      testID={`settings-item-${title}`}
      onPress={onPress}
      disabled={type !== 'action' && type !== 'select'}
      android_ripple={Platform.OS === 'android' ? { color: 'rgba(0,0,0,0.06)', borderless: false } : undefined}
    >
      {renderContent()}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0,
  },
  containerGrouped: {
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    marginVertical: 0,
    borderRadius: 0,
    borderWidth: 0,
    shadowColor: 'transparent',
  },
  touchableContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 68,
  },
  touchableGrouped: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '500' as const,
    letterSpacing: -0.2,
  },
  dangerText: {
    color: '#FF6B6B',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.7,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectValue: {
    fontSize: 14,
    marginRight: 6,
    fontWeight: '500' as const,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  actionButton: {
    padding: 4,
  },
  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerChevron: {
    backgroundColor: 'rgba(255,107,107,0.1)',
  },
  switch: {
    transform: [{ scale: 0.95 }],
  },
  switchAndroid: {
    transform: [{ scale: 1.05 }],
  },
});
