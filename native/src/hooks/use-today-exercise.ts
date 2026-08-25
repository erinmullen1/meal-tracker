import { useCallback, useEffect, useState } from 'react';

import { getExercise, today, type ExerciseLog } from '@/lib/api';

export type TodayExerciseState =
  | { status: 'loading' }
  | { status: 'success'; logs: ExerciseLog[] }
  | { status: 'error'; message: string };

export function useTodayExercise() {
  const [state, setState] = useState<TodayExerciseState>({ status: 'loading' });

  const refetch = useCallback(() => {
    getExercise(today())
      .then((logs) => setState({ status: 'success', logs }))
      .catch((err) =>
        setState({ status: 'error', message: err instanceof Error ? err.message : String(err) })
      );
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { state, refetch };
}
