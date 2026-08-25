import { useCallback, useEffect, useState } from 'react';

import { getProfile, type Targets } from '@/lib/api';

export type ProfileTargetsState =
  | { status: 'loading' }
  | { status: 'success'; targets: Targets }
  | { status: 'error'; message: string };

export function useProfileTargets() {
  const [state, setState] = useState<ProfileTargetsState>({ status: 'loading' });

  const refetch = useCallback(() => {
    getProfile()
      .then((data) => setState({ status: 'success', targets: data.targets }))
      .catch((err) =>
        setState({ status: 'error', message: err instanceof Error ? err.message : String(err) })
      );
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { state, refetch };
}
