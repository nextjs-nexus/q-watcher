'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import DemoSignInButton from './DemoSignInButton';
import SignInLink, { useCurrentPath } from './SignInLink';

export const GUEST_LISTS_MESSAGE = 'To Watch, Watched, and ratings are available after you log in.';

// Shown when a signed-out visitor tries to use a personal-list feature.
export default function GuestNotice({
  demoAvailable,
  compact = false,
}: {
  demoAvailable: boolean;
  compact?: boolean;
}) {
  const currentPath = useCurrentPath();

  if (compact) {
    return (
      <div role="status" className="border-t border-[#B6FF3C]/15 px-4 py-3 text-xs leading-relaxed text-[#A0B3A8]">
        <p className="flex gap-1.5">
          <Lock size={13} className="mt-0.5 shrink-0 text-[#B6FF3C]" aria-hidden="true" />
          <span>Lists are available after you log in.</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <SignInLink className="font-medium text-[#B6FF3C] underline-offset-4 hover:underline">
            Log in
          </SignInLink>
          {demoAvailable && (
            <DemoSignInButton next={currentPath} variant="link" label="Try demo" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div role="status" className="rounded-lg border border-[#B6FF3C]/25 bg-[#050807]/70 p-4 text-sm text-[#A0B3A8]">
      <p className="flex gap-2 text-white">
        <Lock size={16} className="mt-0.5 shrink-0 text-[#B6FF3C]" aria-hidden="true" />
        <span>{GUEST_LISTS_MESSAGE}</span>
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 pl-6">
        <SignInLink className="font-medium text-[#B6FF3C] underline-offset-4 hover:underline">
          Log in
        </SignInLink>
        <Link href="/signup" className="font-medium text-[#B6FF3C] underline-offset-4 hover:underline">
          Sign up free
        </Link>
        {demoAvailable && (
          <DemoSignInButton next={currentPath} variant="link" />
        )}
      </div>
    </div>
  );
}
