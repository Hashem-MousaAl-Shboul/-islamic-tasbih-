import React from "react";
/* eslint-disable */
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }) => React.createElement(View, props, children),
  };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Svg: ({ children, ...props }) => React.createElement(View, props, children),
    Circle: ({ children, ...props }) => React.createElement(View, props, children),
    Path: ({ children, ...props }) => React.createElement(View, props, children),
    G: ({ children, ...props }) => React.createElement(View, props, children),
  };
});

// Mock lucide-react-native
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockIcon = (props) => React.createElement(View, { testID: 'mock-icon', ...props });
  
  return {
    Settings: MockIcon,
    Moon: MockIcon,
    Sun: MockIcon,
    Volume2: MockIcon,
    VolumeX: MockIcon,
    Vibrate: MockIcon,
    VibrateOff: MockIcon,
    MessageCircle: MockIcon,
    Star: MockIcon,
    RotateCcw: MockIcon,
    Plus: MockIcon,
    Minus: MockIcon,
  };
});

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Stack: {
    Screen: ({ children, ...props }) => children,
  },
  Tabs: {
    Screen: ({ children, ...props }) => children,
  },
}));

// Global test timeout
jest.setTimeout(10000);