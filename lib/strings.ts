// Centralised UI copy for the web app. Mirrors native/src/constants/strings.ts —
// keep both in sync when adding or changing text (no shared package between the two apps).

export const strings = {
  brand: {
    name: "🥗 Meal Tracker",
  },
  nav: {
    today: "Today",
    trends: "Trends",
    aboutMe: "About me",
  },
  dashboard: {
    title: "Meal Tracker",
    todaysMeals: "Today's meals",
    mealsForDate: (date: string) => `Meals — ${date}`,
    emptyToday: "Log your first meal above to get started.",
    emptyForDate: (date: string) => `No meals logged for ${date}.`,
  },
  dateNavigator: {
    previousDay: "Previous day",
    nextDay: "Next day",
    jumpToDate: "Jump to date",
    today: "Today",
  },
  mealInput: {
    heading: "Log a meal",
    placeholder: "e.g. 2 scrambled eggs on sourdough toast with avocado and a latte",
    submit: "Log meal",
    submitting: "Analysing…",
    error: "Something went wrong. Please try again.",
    logForDate: (date: string) => `Logging for ${date}`,
  },
  exercisePanel: {
    heading: "Log exercise",
    typePlaceholder: "Activity (e.g. run, gym, yoga)",
    durationPlaceholder: "mins",
    submit: "Log exercise",
    submitting: "Logging…",
    error: "Failed to log exercise.",
    deleteLabel: "Delete exercise log",
    logForDate: (date: string) => `Logging for ${date}`,
  },
  mealCard: {
    deleteLabel: "Delete meal",
  },
  nutrientGrid: {
    heading: "Today's nutrients",
  },
  calorieProgress: {
    heading: "Calories today",
    workoutBonus: (calories: number, intensity: string) =>
      `🏃 +${calories} kcal from ${intensity} workout`,
    remaining: (kcal: number) => `${kcal} kcal remaining`,
    exerciseBonus: (calories: number) => ` (includes +${calories} kcal from exercise)`,
    target: (kcal: number) => `/ ${kcal} kcal`,
  },
  macroChart: {
    heading: "Macros vs target",
    labels: { protein: "Protein", carbs: "Carbs", fat: "Fat", fiber: "Fibre" },
    consumed: "Consumed",
    target: "Target",
  },
  weeklyTrends: {
    heading: "7-day trends",
    empty: "Log meals over multiple days to see trends",
    dayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    calories: "Calories",
    protein: "Protein (g)",
    fiber: "Fibre (g)",
  },
  trendsView: {
    title: "Trends",
    subtitle: "Today's macros vs. target, and your last 7 days.",
  },
  profileForm: {
    bodyStats: "Body stats",
    height: "Height (cm)",
    weight: "Weight (kg)",
    sex: "Sex",
    sexPlaceholder: "—",
    male: "Male",
    female: "Female",
    age: "Age",
    activityLevel: "Activity level",
    targets: "Targets",
    labels: { calories: "Calories", protein: "Protein", carbs: "Carbs", fat: "Fat", fiber: "Fibre" },
    computedNote: "(computed from your stats)",
    overrideNote: "Leave a field blank to use the computed value. Enter a number to override it.",
    reset: "Reset",
    save: "Save",
    saving: "Saving…",
    loading: "Loading…",
    saveError: "Failed to save.",
    genericError: "Something went wrong. Please try again.",
    activityOptions: {
      sedentary: "Sedentary (little to no exercise)",
      light: "Lightly active (1-3 days/week)",
      moderate: "Moderately active (3-5 days/week)",
      active: "Active (6-7 days/week)",
      very_active: "Very active (hard exercise daily)",
    },
  },
} as const;
