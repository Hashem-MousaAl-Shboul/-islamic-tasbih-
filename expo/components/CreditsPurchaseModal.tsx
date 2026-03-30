import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { X, Coins, Sparkles, RotateCcw } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useCreditsStore } from '@/hooks/useCreditsStore';

interface CreditsPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreditsPurchaseModal({ visible, onClose }: CreditsPurchaseModalProps) {
  const theme = useTheme();
  const { t } = useLanguageStore();
  const {
    credits,
    isPurchasing,
    isRestoring,
    isLoadingOfferings,
    purchaseCredits,
    restorePurchases,
    getCreditsPackage,
  } = useCreditsStore();

  const pkg = useMemo(() => getCreditsPackage(), [getCreditsPackage]);

  const priceLabel = useMemo(() => {
    if (!pkg) return '$0.99';
    try {
      return pkg.product.priceString || '$0.99';
    } catch {
      return '$0.99';
    }
  }, [pkg]);

  const handlePurchase = useCallback(() => {
    if (!pkg) {
      console.log('[CreditsPurchase] No package available');
      return;
    }
    purchaseCredits(pkg);
  }, [pkg, purchaseCredits]);

  const handleRestore = useCallback(() => {
    restorePurchases();
  }, [restorePurchases]);

  const isDark = theme.mode === 'dark';
  const bgColor = isDark ? '#0F1628' : '#FFFFFF';
  const cardBg = isDark ? '#1A2340' : '#F0F4F8';
  const accentGreen = '#10B981';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      testID="credits-purchase-modal"
    >
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: cardBg }]}
            testID="credits-close-btn"
          >
            <X size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={[styles.iconCircle, { backgroundColor: `${accentGreen}18` }]}>
            <Coins size={48} color={accentGreen} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            {t('buyCredits') || 'Buy Credits'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('creditsDescription') || 'Use credits to unlock premium features'}
          </Text>

          <View style={[styles.balanceCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>
              {t('currentBalance') || 'Current Balance'}
            </Text>
            <View style={styles.balanceRow}>
              <Sparkles size={22} color="#F59E0B" />
              <Text style={[styles.balanceAmount, { color: theme.text }]}>
                {credits}
              </Text>
              <Text style={[styles.balanceUnit, { color: theme.textSecondary }]}>
                {t('credits') || 'credits'}
              </Text>
            </View>
          </View>

          <View style={[styles.productCard, { backgroundColor: cardBg, borderColor: accentGreen }]}>
            <View style={styles.productHeader}>
              <View style={[styles.badge, { backgroundColor: `${accentGreen}20` }]}>
                <Text style={[styles.badgeText, { color: accentGreen }]}>
                  {t('bestValue') || 'Best Value'}
                </Text>
              </View>
            </View>
            <Text style={[styles.productTitle, { color: theme.text }]}>
              100 {t('credits') || 'Credits'}
            </Text>
            <Text style={[styles.productPrice, { color: accentGreen }]}>
              {priceLabel}
            </Text>
            <Text style={[styles.productDesc, { color: theme.textSecondary }]}>
              {t('oneTimePurchase') || 'One-time purchase'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.purchaseBtn, { backgroundColor: accentGreen, opacity: (!pkg || isPurchasing) ? 0.6 : 1 }]}
            onPress={handlePurchase}
            disabled={!pkg || isPurchasing}
            activeOpacity={0.8}
            testID="credits-purchase-btn"
          >
            {isPurchasing ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.purchaseBtnText}>
                {t('buyNow') || 'Buy Now'} — {priceLabel}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestore}
            disabled={isRestoring}
            testID="credits-restore-btn"
          >
            {isRestoring ? (
              <ActivityIndicator color={theme.textSecondary} size="small" />
            ) : (
              <View style={styles.restoreRow}>
                <RotateCcw size={16} color={theme.textSecondary} />
                <Text style={[styles.restoreBtnText, { color: theme.textSecondary }]}>
                  {t('restorePurchases') || 'Restore Purchases'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {isLoadingOfferings && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={accentGreen} size="small" />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                {t('loading') || 'Loading...'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  balanceCard: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800' as const,
  },
  balanceUnit: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  productCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 24,
  },
  productHeader: {
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 32,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 13,
  },
  purchaseBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  purchaseBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  restoreBtn: {
    paddingVertical: 12,
  },
  restoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  restoreBtnText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  loadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  loadingText: {
    fontSize: 13,
  },
});
