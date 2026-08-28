import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalorieProgress } from '@/components/calorie-progress';
import { ExerciseRow } from '@/components/exercise-row';
import { LogExerciseForm } from '@/components/log-exercise-form';
import { LogMealForm } from '@/components/log-meal-form';
import { MealRow } from '@/components/meal-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { strings } from '@/constants/strings';
import { useProfileTargets } from '@/hooks/use-profile-targets';
import { useTodayExercise } from '@/hooks/use-today-exercise';
import { useTodayMeals } from '@/hooks/use-today-meals';

export default function TodayScreen() {
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
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {strings.today.title}
            </ThemedText>
          </ThemedView>

          {targetsState.status === 'success' && exerciseState.status === 'success' && (
            <ThemedView type="backgroundElement" style={styles.stepContainer}>
              <ThemedText type="smallBold">{strings.today.caloriesHeading}</ThemedText>
              <CalorieProgress
                totalCalories={totalCalories}
                exercise={exerciseState.logs}
                targets={targetsState.targets}
              />
            </ThemedView>
          )}

          <ThemedView type="backgroundElement" style={styles.stepContainer}>
            <ThemedText type="smallBold">{strings.today.logMealHeading}</ThemedText>
            <LogMealForm onMealAdded={refetchMeals} />
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.stepContainer}>
            <ThemedText type="smallBold">{strings.today.todaysMealsHeading}</ThemedText>
            {mealsState.status === 'loading' && (
              <ThemedText type="small">{strings.today.loading}</ThemedText>
            )}
            {mealsState.status === 'error' && (
              <ThemedText type="small">❌ {mealsState.message}</ThemedText>
            )}
            {mealsState.status === 'success' && mealsState.meals.length === 0 && (
              <ThemedText type="small">{strings.today.noMealsToday}</ThemedText>
            )}
            {mealsState.status === 'success' &&
              mealsState.meals.map((meal) => <MealRow key={meal.id} meal={meal} />)}
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.stepContainer}>
            <ThemedText type="smallBold">{strings.today.logExerciseHeading}</ThemedText>
            <LogExerciseForm onExerciseLogged={refetchExercise} />
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.stepContainer}>
            <ThemedText type="smallBold">{strings.today.todaysExerciseHeading}</ThemedText>
            {exerciseState.status === 'loading' && (
              <ThemedText type="small">{strings.today.loading}</ThemedText>
            )}
            {exerciseState.status === 'error' && (
              <ThemedText type="small">❌ {exerciseState.message}</ThemedText>
            )}
            {exerciseState.status === 'success' && exerciseState.logs.length === 0 && (
              <ThemedText type="small">{strings.today.noExerciseToday}</ThemedText>
            )}
            {exerciseState.status === 'success' &&
              exerciseState.logs.map((log) => <ExerciseRow key={log.id} log={log} />)}
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
  },
  title: {
    textAlign: 'left',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});
