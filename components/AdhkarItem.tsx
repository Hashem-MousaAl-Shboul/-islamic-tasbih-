import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface AdhkarItemProps {
  id: string;
  arabicText: string;
  transliteration?: string;
  translation?: string;
  category?: string;
  isAdded?: boolean;
  onToggle?: () => void;
  isLast?: boolean;
}

export const AdhkarItem: React.FC<AdhkarItemProps> = ({
  id,
  arabicText,
  transliteration,
  translation,
  category,
  isAdded = false,
  onToggle,
  isLast = false,
}) => {
  return (
    <View style={[styles.container, isLast && styles.lastContainer]} testID={`adhkar-item-${id}`}>
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        
        {onToggle && (
          <TouchableOpacity
            style={[
              styles.addButton,
              isAdded ? styles.addedButton : {}
            ]}
            onPress={onToggle}
          >
            {isAdded ? (
              <>
                <Check size={12} color="#FFFFFF" />
                <Text style={styles.addedText}>مضاف</Text>
              </>
            ) : (
              <Text style={styles.addText}>إضافة</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.arabicText}>{arabicText}</Text>
      
      {transliteration && (
        <Text style={styles.transliteration}>{transliteration}</Text>
      )}
      
      {translation && (
        <Text style={styles.translation}>&quot;{translation}&quot;</Text>
      )}
      
      {isAdded && (
        <View style={styles.addedContainer}>
          <Check size={12} color={Colors.success} />
          <Text style={styles.addedStatusText}>تم الإضافة</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  lastContainer: {
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: Colors.accent.gold.start,
    fontSize: 10,
    fontWeight: '600' as const,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addedButton: {
    backgroundColor: Colors.success,
  },
  addText: {
    color: '#FFFFFF',
    fontWeight: '500' as const,
    fontSize: 9,
  },
  addedText: {
    color: '#FFFFFF',
    fontWeight: '500' as const,
    fontSize: 9,
    marginLeft: 2,
  },
  arabicText: {
    fontSize: 18,
    lineHeight: 28,
    color: Colors.dark.text,
    textAlign: 'right',
    marginBottom: 4,
    fontWeight: '600' as const,
  },
  transliteration: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 3,
    fontStyle: 'italic',
    textAlign: 'left',
  },
  translation: {
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.dark.textSecondary,
    lineHeight: 18,
    textAlign: 'left',
  },
  addedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    marginTop: 6,
  },
  addedStatusText: {
    color: Colors.success,
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '500' as const,
  },
});