import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container} testID="error-boundary">
          <Text style={styles.title}>حدث خطأ غير متوقع</Text>
          <Text style={styles.subtitle}>يرجى إعادة المحاولة لاحقاً</Text>
          {this.state.errorMessage ? (
            <Text style={styles.details} numberOfLines={3}>{this.state.errorMessage}</Text>
          ) : null}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700' as const },
  subtitle: { marginTop: 8, fontSize: 14, color: '#666666' },
  details: { marginTop: 12, fontSize: 12, color: '#999999', textAlign: 'center' as const },
});
