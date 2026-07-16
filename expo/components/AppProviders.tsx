import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from '@/hooks/useLanguageStore';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { TasbihProvider } from '@/hooks/useTasbihStore';
import { FavoritesProvider } from '@/hooks/useFavoritesStore';
import { ReciterProvider } from '@/hooks/useReciterStore';
import { QuranStoreProvider } from '@/hooks/useQuranStore';
import { QuranAudioProvider } from '@/hooks/useQuranAudio';
import { CreditsProvider } from '@/hooks/useCreditsStore';
import { AdhkarCountsProvider } from '@/hooks/useAdhkarCountsStore';
import { queryClient } from '@/utils/queryClient';

interface AppProvidersProps { children: ReactNode }

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <LanguageProvider>
          <ReciterProvider>
            <QuranStoreProvider>
              <QuranAudioProvider>
                <TasbihProvider>
                  <FavoritesProvider>
                    <ThemeProvider>
                      <CreditsProvider>
                        <AdhkarCountsProvider>
                          {children}
                        </AdhkarCountsProvider>
                      </CreditsProvider>
                    </ThemeProvider>
                  </FavoritesProvider>
                </TasbihProvider>
              </QuranAudioProvider>
            </QuranStoreProvider>
          </ReciterProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
