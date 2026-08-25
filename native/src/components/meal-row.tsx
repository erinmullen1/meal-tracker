import { View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import type { Meal } from '@/lib/api';

type MealRowProps = {
  meal: Meal;
};

export function MealRow({ meal }: MealRowProps) {
  return (
    <View style={styles.row}>
      <ThemedText type="small" style={styles.description}>
        {meal.description}
      </ThemedText>
      <View style={styles.stats}>
        {meal.calories != null && (
          <ThemedText type="small" themeColor="textSecondary">
            {Math.round(meal.calories)} kcal
          </ThemedText>
        )}
        {meal.score != null && (
          <ThemedText type="small" themeColor="textSecondary">
            {meal.score.toFixed(1)}/10
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.half,
  },
  description: {
    flexShrink: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
