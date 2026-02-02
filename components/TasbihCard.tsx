import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, RotateCcw } from 'lucide-react-native';
import { TasbihItem } from '@/hooks/useTasbihStore';

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
      return [item.color, item.color + '80'] as const;
    }
    return ['#1E293B', '#334155'] as const;
  }, [isSelected, item.color]);

  const textColor = useMemo(() => isSelected ? '#FFFFFF' : '#94A3B8', [isSelected]);
  const countColor = useMemo(() => isSelected ? '#FFFFFF' : '#64748B', [isSelected]);
  const borderStyle = useMemo(() => ({
    borderColor: isSelected ? item.color : '#334155',
    borderWidth: isSelected ? 2 : 1,
  }), [isSelected, item.color]);

  const handlePress = useCallback(() => {
    if (!isDeleted) {
      onSelect(item.id);
    }
  }, [onSelect, item.id, isDeleted]);



  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(item.id);
    }
  }, [onDelete, item.id]);

  const handleRestore = useCallback(() => {
    if (onRestore) {
      onRestore(item.id);
    }
  }, [onRestore, item.id]);

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      testID={`tasbih-card-${item.id}`}
    >
      <LinearGradient
        colors={gradientColors}
        style={[styles.card, borderStyle, isDeleted && styles.deletedCard]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {!isDeleted && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            testID={`delete-button-${item.id}`}
          >
            <View style={styles.deleteButtonInner}>
              <Trash2 size={14} color="#EF4444" />
            </View>
          </TouchableOpacity>
        )}
        
        {isDeleted && (
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            testID={`restore-button-${item.id}`}
          >
            <View style={styles.restoreButtonInner}>
              <RotateCcw size={14} color="#10B981" />
            </View>
          </TouchableOpacity>
        )}
        
        <View style={[styles.content, isDeleted && styles.deletedContent]}>
          <Text style={[styles.arabicText, { color: textColor }]} numberOfLines={2}>
            {item.arabicText}
          </Text>
          
          {showTransliteration && (
            <Text style={[styles.transliterationText, { color: textColor }]} numberOfLines={1}>
              {item.transliteration}
            </Text>
          )}
          
          <View style={styles.countContainer}>
            <Text style={[styles.countText, { color: countColor }]}>
              {item.count}/{item.targetCount}
            </Text>
            {item.isCompleted ? (
              <View style={[styles.completedDot, { backgroundColor: '#10B981' }]} />
            ) : (
              <Text style={[styles.percentageText, { color: isSelected ? '#FFFFFF' : '#64748B' }]}>
                {progressPercentage}%
              </Text>
            )}
          </View>
          
          {isSelected && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
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
    </Pressable>
  );
});

TasbihCard.displayName = 'TasbihCard';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    position: 'relative',
  },
  card: {
    minWidth: 80,
    width: 80,
    height: 72,
    borderRadius: 12,
    padding: 8,
    position: 'relative',
  },
  deletedCard: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deletedContent: {
    opacity: 0.6,
  },
  deleteButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 10,
  },
  deleteButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  restoreButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 10,
  },
  restoreButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  arabicText: {
    fontSize: 12,
    fontWeight: '700' as const,
    textAlign: 'center',
    lineHeight: 16,
  },
  transliterationText: {
    fontSize: 9,
    fontWeight: '500' as const,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.85,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  countText: {
    fontSize: 10,
    fontWeight: '600' as const,
    textAlign: 'center',
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
    marginTop: 4,
  },
  progressBar: {
    width: '100%',
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
});

export default TasbihCard;