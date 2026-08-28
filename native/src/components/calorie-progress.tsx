import { View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { strings } from '@/constants/strings';
import { useTheme } from '@/hooks/use-theme';
import { getTopExerciseBonus, type ExerciseLog, type Targets } from '@/lib/api';

type CalorieProgressProps = {
  totalCalories: number;
  exercise: ExerciseLog[];
  targets: Targets;
};

export function CalorieProgress({ totalCalories, exercise, targets }: CalorieProgressProps) {
  const theme = useTheme();
  const bonus = getTopExerciseBonus(exercise);
  const target = targets.calories + bonus.calories;
  const pct = Math.min((totalCalories / target) * 100, 100);

  const barColor = pct >= 100 ? '#f43f5e' : pct >= 80 ? '#f59e0b' : '#10b981';

  return (
    <View style={styles.container}>
      <View style={styles.numbers}>
        <ThemedText type="subtitle">{Math.round(totalCalories)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {strings.calorieProgress.target(target)}
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {strings.calorieProgress.remaining(Math.round(target - totalCalories))}
        {bonus.calories > 0 ? strings.calorieProgress.exerciseBonus(bonus.calories) : ''}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  numbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  track: {
    height: 10,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Spacing.two,
  },
});
