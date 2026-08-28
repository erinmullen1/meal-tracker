// Centralised UI copy for the native app. Mirrors lib/strings.ts on the web app —
// keep both in sync when adding or changing text (no shared package between the two apps).

export const strings = {
  brand: {
    name: '🥗 Meal Tracker',
  },
  nav: {
    today: 'Today',
    trends: 'Trends',
    aboutMe: 'About me',
  },
  today: {
    title: 'Today',
    caloriesHeading: 'Calories today',
    logMealHeading: 'Log a meal',
    todaysMealsHeading: "Today's meals",
    loading: 'Loading…',
    noMealsToday: 'No meals logged today.',
    logExerciseHeading: 'Log exercise',
    todaysExerciseHeading: "Today's exercise",
    noExerciseToday: 'No exercise logged today.',
  },
  mealForm: {
    placeholder: 'e.g. 2 scrambled eggs on sourdough with avocado',
    submit: 'Log meal',
    submitting: 'Analysing…',
  },
  exerciseForm: {
    typePlaceholder: 'Activity (e.g. run, gym, yoga)',
    durationPlaceholder: 'mins',
    submit: 'Log exercise',
    submitting: 'Logging…',
  },
  calorieProgress: {
    target: (kcal: number) => `/ ${kcal} kcal`,
    remaining: (kcal: number) => `${kcal} kcal remaining`,
    exerciseBonus: (calories: number) => ` (includes +${calories} kcal from exercise)`,
  },
  about: {
    title: 'About me',
    subtitle: 'Your targets, from the profile set up on the web app.',
    targetsHeading: 'Targets',
    loading: 'Loading…',
    labels: { calories: 'Calories', protein: 'Protein', carbs: 'Carbs', fat: 'Fat', fiber: 'Fibre' },
  },
  trends: {
    title: 'Trends',
    placeholder: 'Macro and 7-day charts are coming in the next update.',
  },
} as const;
