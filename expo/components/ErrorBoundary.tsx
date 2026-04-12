import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DEEP_GREEN = '#1B4332';
const GOLD = '#D4A853';
const IVORY = '#F7F4EE';
const TEXT_MUTED = '#8A9B91';

interface ErrorBoundaryState { hasError: boolean; errorMessage: string | null }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.log('[ErrorBoundary] getDerivedStateFromError', message);
    return { hasError: true, errorMessage: message };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] componentDidCatch', error, info.componentStack);
  }

  handleRetry = () => {
    console.log('[ErrorBoundary] User tapped retry');
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container} testID="error-boundary">
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>!</Text>
          </View>
          <Text style={styles.title}>حدث خطأ غير متوقع</Text>
          <Text style={styles.subtitle}>يرجى إعادة المحاولة لاحقاً</Text>
          {this.state.errorMessage ? (
            <Text style={styles.details} numberOfLines={3}>{this.state.errorMessage}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.retryButton}
            onPress={this.handleRetry}
            activeOpacity={0.7}
            testID="error-boundary-retry"
          >
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: IVORY,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GOLD + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: GOLD,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: DEEP_GREEN,
    textAlign: 'center' as const,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center' as const,
  },
  details: {
    marginTop: 12,
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'center' as const,
    opacity: 0.7,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: DEEP_GREEN,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
