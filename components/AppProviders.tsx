import React, { ReactNode, memo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { trpc, trpcClient } from '@/lib/trpc';
import { LanguageProvider } from '@/hooks/useLanguageStore';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { TasbihProvider } from '@/hooks/useTasbihStore';
import { FavoritesProvider } from '@/hooks/useFavoritesStore';
import { ReciterProvider } from '@/hooks/useReciterStore';
import { AuthProvider } from '@/hooks/useAuthStore';
import { queryClient } from '@/utils/queryClient';

interface AppProvidersProps { children: ReactNode }

const GestureRoot = memo(({ children }: { children: ReactNode }) => (
  <GestureHandlerRootView style={styles.flex1} testID="gesture-root">
    {children}
  </GestureHandlerRootView>
));

GestureRoot.displayName = 'GestureRoot';

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <LanguageProvider>
            <AuthProvider>
              <ReciterProvider>
                <TasbihProvider>
                  <FavoritesProvider>
                    <ThemeProvider>
                      <GestureRoot>
                        {children}
                      </GestureRoot>
                    </ThemeProvider>
                  </FavoritesProvider>
                </TasbihProvider>
              </ReciterProvider>
            </AuthProvider>
          </LanguageProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});
