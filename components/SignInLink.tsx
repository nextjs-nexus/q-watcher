'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSignInHref } from '@/lib/redirect';

export function useCurrentPath(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  return search ? `${pathname}?${search}` : pathname;
}

// Links to sign-in and brings the visitor back to the current page afterwards.
export default function SignInLink({ className, children }: { className?: string; children: ReactNode }) {
  const currentPath = useCurrentPath();

  return (
    <Link href={getSignInHref(currentPath)} className={className}>
      {children}
    </Link>
  );
}
