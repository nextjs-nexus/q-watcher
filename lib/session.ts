import 'server-only';

import { cache } from 'react';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getDemoConfig, isDemoEmail } from '@/lib/demo';
import type { Viewer } from '@/lib/viewer';

// One session lookup per request, shared by pages, data helpers, and Server Actions.
export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
});

export async function getViewer(): Promise<Viewer> {
  const user = await getCurrentUser();

  return {
    signedIn: Boolean(user),
    isDemo: Boolean(user && isDemoEmail(user.email)),
    demoAvailable: getDemoConfig() !== null,
  };
}
