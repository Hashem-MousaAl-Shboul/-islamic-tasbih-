import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, RotateCcw } from 'lucide-react-native';
import { TasbihItem } from '@/hooks/useTasbihStore';
import { androidTextFix } from '@/utils/androidOptimizations';

const DEEP_GREEN = '#1B4332';
const CARD_WHITE = '#FFFFFF';

interface TasbihCardProps {
  item: TasbihItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  showTransliteration: boolean;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  isDeleted?: boolean;
}

const TasbihCard = memo<TasbihCardProps>(({
  item,
  isSelected,
  onSelect,
  showTransliteration,
  onDelete,
  onRestore,
  isDeleted = false
}) => {

  const progress = useMemo(() => {
    return item.targetCount > 0 ? Math.min(item.count / item.targetCount, 1) : 0;
  }, [item.count, item.targetCount]);

  const progressPercentage = useMemo(() => {
    return Math.round(progress * 100);
  }, [progress]);

  const gradientColors = useMemo(() => {
    if (isSelected) {
      return [item.color, item.color + 'CC'] as const;
    }
    return [CARD_WHITE, '#F7F4EE'] as const;
  }, [isSelected, item.color]);

  const textColor = useMemo(() => isSelected ? '#FFFFFF' : DEEP_GREEN, [isSelected]);
  const borderStyle = useMemo(() => ({
    borderColor: isSelected ? item.color : 'rgba(0,0,0,0.08)',
    borderWidth: isSelected ? 2 : 1,
  }), [isSelected, item.color]);

  const handlePress = useCallback(() => {
    if (!isDeleted) {
      console.log('[TasbihCard] Card pressed:', item.id);
      onSelect(item.id);
    }
  }, [onSelect, item.id, isDeleted]);

  const handleDelete = useCallback(() => {
    console.log('[TasbihCard] Delete pressed:', item.id);
    if (onDelete) onDelete(item.id);
  }, [onDelete, item.id]);

  const handleRestore = useCallback(() => {
    console.log('[TasbihCard] Restore pressed:', item.id);
    if (onRestore) onRestore(item.id);
  }, [onRestore, item.id]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        testID={`tasbih-card-${item.id}`}
        activeOpacity={isDeleted ? 1 : 0.7}
        disabled={isDeleted}
      >
        <LinearGradient
          colors={gradientColors}
          style={[styles.card, borderStyle, isDeleted && styles.deletedCard]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.content, isDeleted && styles.deletedContent]}>
            <Text style={[styles.arabicText, { color: textColor }, androidTextFix]} numberOfLines={2}>
              {item.arabicText}
            </Text>

            {showTransliteration && (
              <Text style={[styles.transliterationText, { color: textColor }, androidTextFix]} numberOfLines={1}>
                {item.transliteration}
              </Text>
            )}

            <View style={styles.countContainer}>
              <Text style={[styles.countText, { color: isSelected ? 'rgba(255,255,255,0.9)' : DEEP_GREEN }, androidTextFix]}>
                {item.count}/{item.targetCount}
              </Text>
              {item.isCompleted ? (
                <View style={[styles.completedDot, { backgroundColor: isSelected ? '#FFFFFF' : '#2D8B6F' }]} />
              ) : (
                <Text style={[styles.percentageText, { color: isSelected ? 'rgba(255,255,255,0.7)' : '#8A9B91' }, androidTextFix]}>
                  {progressPercentage}%
                </Text>
              )}
            </View>

            {isSelected && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(progress * 100, 100)}%`,
                        backgroundColor: '#FFFFFF'
                      }
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {!isDeleted && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID={`delete-button-${item.id}`}
          activeOpacity={0.6}
        >
          <View style={styles.deleteButtonInner}>
            <Trash2 size={12} color="#E05252" />
          </View>
        </TouchableOpacity>
      )}

      {isDeleted && (
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID={`restore-button-${item.id}`}
          activeOpacity={0.6}
        >
          <View style={styles.restoreButtonInner}>
            <RotateCcw size={12} color="#2D8B6F" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
});

TasbihCard.displayName = 'TasbihCard';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 6,
    position: 'relative' as const,
  },
  card: {
    minWidth: 80,
    width: 80,
    height: 68,
    borderRadius: 14,
    padding: 8,
    position: 'relative' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  deletedCard: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  deletedContent: {
    opacity: 0.6,
  },
  deleteButton: {
    position: 'absolute' as const,
    top: -5,
    right: -5,
    zIndex: 10,
  },
  deleteButtonInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: CARD_WHITE,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1.5,
    borderColor: '#E05252',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  restoreButton: {
    position: 'absolute' as const,
    top: -5,
    right: -5,
    zIndex: 10,
  },
  restoreButtonInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: CARD_WHITE,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1.5,
    borderColor: '#2D8B6F',
  },
  arabicText: {
    fontSize: 12,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    lineHeight: 16,
  },
  transliterationText: {
    fontSize: 9,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
    opacity: 0.8,
  },
  countContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 5,
  },
  countText: {
    fontSize: 10,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  completedDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  percentageText: {
    fontSize: 8,
    fontWeight: '600' as const,
  },
  progressContainer: {
    width: '100%',
    marginTop: 3,
  },
  progressBar: {
    width: '100%',
    height: 2,
    borderRadius: 1,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
});

export default TasbihCard;
