import { View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import type { ExerciseLog } from '@/lib/api';

type ExerciseRowProps = {
  log: ExerciseLog;
};

export function ExerciseRow({ log }: ExerciseRowProps) {
  return (
    <View style={styles.row}>
      <ThemedText type="small" style={styles.type}>
        {log.type}
      </ThemedText>
      <View style={styles.stats}>
        {log.duration_minutes != null && (
          <ThemedText type="small" themeColor="textSecondary">
            {log.duration_minutes} min
          </ThemedText>
        )}
        {log.intensity != null && (
          <ThemedText type="small" themeColor="textSecondary">
            {log.intensity}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  type: {
    textTransform: 'capitalize',
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
