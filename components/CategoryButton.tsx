import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { DhikrCategory } from '@/types';

interface CategoryButtonProps {
  category: DhikrCategory;
  isActive: boolean;
  onPress: () => void;
  disableAnimation?: boolean;
}

export const CategoryButton: React.FC<CategoryButtonProps> = ({ 
  category, 
  isActive, 
  onPress,
  disableAnimation = true,
}) => {
  const handlePress = () => {
    onPress();
  };


  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        testID={`category-${category.id}`}
      >
        <LinearGradient
          colors={isActive 
            ? [Colors.accent.gold.start, Colors.accent.gold.end]
            : ['rgba(255,215,0,0.1)', 'rgba(255,215,0,0.05)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.container,
            isActive && styles.activeContainer
          ]}
        >
          <Text style={[
            styles.text,
            isActive ? styles.activeText : null
          ]}>
            {category.nameArabic}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    margin: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    ...Platform.select({
      ios: {
        shadowColor: Colors.accent.gold.start,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  activeContainer: {
    borderColor: 'rgba(255,255,255,0.3)',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent.gold.start,
    letterSpacing: 0.2,
  },
  activeText: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
});