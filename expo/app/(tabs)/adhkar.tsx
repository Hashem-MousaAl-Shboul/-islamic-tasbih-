const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IVORY,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorContainer: {
    padding: 24,
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: DEEP_GREEN,
    borderRadius: 14,
    overflow: 'hidden' as const,
    boxShadow: '0px 4px 12px rgba(27, 67, 50, 0.25)',
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
    fontSize: 14,
    letterSpacing: 0.3,
  },

  loadingText: {
    fontSize: 15,
    color: TEXT_MUTED,
    marginTop: 14,
    fontWeight: '600' as const,
  },

  headerSection: {
    backgroundColor: CARD_WHITE,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 168, 83, 0.15)',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.03)',
  },

  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },

  filterButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 83, 0.25)',
    backgroundColor: '#FAF9F5',
    overflow: 'hidden' as const,
  },

  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
    gap: 6,
  },

  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },

  filterButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: DEEP_GREEN,
  },

  contentContainer: {
    flex: 1,
  },

  adhkarCard: {
    borderRadius: 20,
    marginBottom: 14,
    backgroundColor: CARD_WHITE,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 83, 0.25)',
    shadowColor: '#1B4332',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  adhkarCardTouchable: {
    padding: 16,
    overflow: 'hidden' as const,
    borderRadius: 20,
  },

  cardAccentBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 5,
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },

  adhkarCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    flexShrink: 1,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },

  actionIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(27, 67, 50, 0.04)',
    overflow: 'hidden' as const,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },

  androidCardBody: {
    gap: 12,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 2,
    marginBottom: 4,
  },

  ornamentContainer: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ornamentDiamond: {
    width: 9,
    height: 9,
    backgroundColor: GOLD,
    transform: [
      {
        rotate: '45deg',
      },
    ],
    borderRadius: 2,
    shadowColor: GOLD,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },

  dhikrTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: DEEP_GREEN,
    textAlign: 'center',
    letterSpacing: 0.4,
    flexShrink: 1,
  },

  adhkarMainContentAndroid: {
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },

  adhkarArabicTextFull: {
    fontSize: 19,
    lineHeight: 36,
    color: DEEP_GREEN,
    textAlign: 'right',
    fontWeight: '700' as const,
    letterSpacing: 0.4,
    writingDirection: 'rtl',
    flexWrap: 'wrap',
  },

  adhkarTransliterationFull: {
    fontSize: 13,
    color: DEEP_GREEN,
    opacity: 0.75,
    textAlign: 'right',
    lineHeight: 22,
    fontStyle: 'italic',
    fontWeight: '500' as const,
    writingDirection: 'rtl',
  },

  adhkarTranslationFull: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'right',
    lineHeight: 22,
    fontWeight: '400' as const,
    writingDirection: 'rtl',
  },

  counterBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 168, 83, 0.2)',
  },

  sideCounterButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: CARD_WHITE,
    borderWidth: 1.5,
    borderColor: `${GOLD}60`,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden' as const,
    elevation: 3,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  sideCounterButtonDisabled: {
    borderColor: 'rgba(0,0,0,0.06)',
    backgroundColor: 'rgba(0,0,0,0.02)',
    elevation: 0,
    shadowOpacity: 0,
  },

  emptyContainer: {
    marginHorizontal: 20,
    marginTop: 60,
  },

  emptyCard: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    backgroundColor: CARD_WHITE,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 83, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },

  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: `${GOLD}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: DEEP_GREEN,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: TEXT_MUTED,
    marginTop: 8,
    textAlign: 'center',
  },

  flatListContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 140,
  },

  playAllProgress: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: GOLD,
  },
});