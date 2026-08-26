import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfileTargets } from '@/hooks/use-profile-targets';

const TARGET_ROWS: { key: 'calories' | 'protein_g' | 'carbs_g' | 'fat_g' | 'fiber_g'; label: string; unit: string }[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein_g', label: 'Protein', unit: 'g' },
  { key: 'carbs_g', label: 'Carbs', unit: 'g' },
  { key: 'fat_g', label: 'Fat', unit: 'g' },
  { key: 'fiber_g', label: 'Fibre', unit: 'g' },
];

export default function AboutScreen() {
  const { state } = useProfileTargets();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.header}>
            <ThemedText type="title">About me</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Your targets, from the profile set up on the web app.
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.stepContainer}>
            <ThemedText type="smallBold">Targets</ThemedText>
            {state.status === 'loading' && <ThemedText type="small">Loading…</ThemedText>}
            {state.status === 'error' && (
              <ThemedText type="small">❌ {state.message}</ThemedText>
            )}
            {state.status === 'success' &&
              TARGET_ROWS.map((row) => (
                <View key={row.key} style={styles.row}>
                  <ThemedText type="small">{row.label}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {state.targets[row.key]} {row.unit}
                  </ThemedText>
                </View>
              ))}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    alignItems: 'stretch',
    gap: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  header: {
    paddingVertical: Spacing.two,
    gap: Spacing.half,
  },
  stepContainer: {
    gap: Spacing.two,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
