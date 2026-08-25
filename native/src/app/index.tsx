import * as Device from 'expo-device';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { CalorieProgress } from '@/components/calorie-progress';
import { ExerciseRow } from '@/components/exercise-row';
import { HintRow } from '@/components/hint-row';
import { LogExerciseForm } from '@/components/log-exercise-form';
import { LogMealForm } from '@/components/log-meal-form';
import { MealRow } from '@/components/meal-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfileTargets } from '@/hooks/use-profile-targets';
import { useTodayExercise } from '@/hooks/use-today-exercise';
import { useTodayMeals } from '@/hooks/use-today-meals';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  const { state: targetsState } = useProfileTargets();
  const { state: mealsState, refetch: refetchMeals } = useTodayMeals();
  const { state: exerciseState, refetch: refetchExercise } = useTodayExercise();

  const totalCalories =
    mealsState.status === 'success'
      ? mealsState.meals.reduce((sum, m) => sum + (m.calories ?? 0), 0)
      : 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Welcome to&nbsp;Expo
          </ThemedText>
        </ThemedView>

        <ThemedText type="code" style={styles.code}>
          get started
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <HintRow
            title="Try editing"
            hint={<ThemedText type="code">src/app/index.tsx</ThemedText>}
          />
          <HintRow title="Dev tools" hint={getDevMenuHint()} />
          <HintRow
            title="Fresh start"
            hint={<ThemedText type="code">npm run reset-project</ThemedText>}
          />
        </ThemedView>

        {targetsState.status === 'success' && exerciseState.status === 'success' && (
          <ThemedView type="backgroundElement" style={styles.stepContainer}>
            <ThemedText type="smallBold">Calories today</ThemedText>
            <CalorieProgress
              totalCalories={totalCalories}
              exercise={exerciseState.logs}
              targets={targetsState.targets}
            />
          </ThemedView>
        )}

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <ThemedText type="smallBold">Log a meal</ThemedText>
          <LogMealForm onMealAdded={refetchMeals} />
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <ThemedText type="smallBold">Today&apos;s meals</ThemedText>
          {mealsState.status === 'loading' && (
            <ThemedText type="small">Loading…</ThemedText>
          )}
          {mealsState.status === 'error' && (
            <ThemedText type="small">❌ {mealsState.message}</ThemedText>
          )}
          {mealsState.status === 'success' && mealsState.meals.length === 0 && (
            <ThemedText type="small">No meals logged today.</ThemedText>
          )}
          {mealsState.status === 'success' &&
            mealsState.meals.map((meal) => <MealRow key={meal.id} meal={meal} />)}
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <ThemedText type="smallBold">Log exercise</ThemedText>
          <LogExerciseForm onExerciseLogged={refetchExercise} />
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <ThemedText type="smallBold">Today&apos;s exercise</ThemedText>
          {exerciseState.status === 'loading' && (
            <ThemedText type="small">Loading…</ThemedText>
          )}
          {exerciseState.status === 'error' && (
            <ThemedText type="small">❌ {exerciseState.message}</ThemedText>
          )}
          {exerciseState.status === 'success' && exerciseState.logs.length === 0 && (
            <ThemedText type="small">No exercise logged today.</ThemedText>
          )}
          {exerciseState.status === 'success' &&
            exerciseState.logs.map((log) => <ExerciseRow key={log.id} log={log} />)}
        </ThemedView>

        {Platform.OS === 'web' && <WebBadge />}
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
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});
