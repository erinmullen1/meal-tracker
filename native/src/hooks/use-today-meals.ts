import { useCallback, useEffect, useState } from 'react';

import { getMeals, today, type Meal } from '@/lib/api';

export type TodayMealsState =
  | { status: 'loading' }
  | { status: 'success'; meals: Meal[] }
  | { status: 'error'; message: string };

export function useTodayMeals() {
  const [state, setState] = useState<TodayMealsState>({ status: 'loading' });

  const refetch = useCallback(() => {
    getMeals(today())
      .then((meals) => setState({ status: 'success', meals }))
      .catch((err) =>
        setState({ status: 'error', message: err instanceof Error ? err.message : String(err) })
      );
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { state, refetch };
}
