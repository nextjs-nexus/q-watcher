import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SignInForm from '@/components/SignInForm';
import DemoSignInButton from '@/components/DemoSignInButton';
import { getDemoConfig } from '@/lib/demo';
import { getSafeRedirectPath } from '@/lib/redirect';

export default async function SignInPage({ searchParams }: {
  searchParams: Promise<{ verified?: string; error?: string; next?: string; demo?: string }>;
}) {
  const params = await searchParams;
  const nextPath = getSafeRedirectPath(params.next);
  const demoAvailable = getDemoConfig() !== null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050807] p-4">
      <div className="w-full max-w-md">
        <Link href={nextPath} className="mb-4 inline-flex items-center gap-2 text-sm text-[#A0B3A8] transition hover:text-white">
          <ArrowLeft size={16} aria-hidden="true" />
          Keep browsing without an account
        </Link>
        <div className="bg-[#0B1410] rounded-2xl border-0 border-[#B6FF3C]/15 p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Q-Watcher
            </h1>
            <p className="text-[#A0B3A8]">Sign in to use your To Watch and Watched lists</p>
          </div>
          {params.verified === '1' && !params.error && (
            <p role="status" className="mb-4 text-sm text-[#00FFC6]">Email verified. You can now sign in.</p>
          )}
          {params.error && (
            <p role="alert" className="mb-4 text-sm text-red-400">This verification link is invalid or expired. Request another using Verify email below.</p>
          )}
          {params.demo === 'unavailable' && (
            <p role="alert" className="mb-4 text-sm text-red-400">The demo account is not available right now. You can still browse without an account.</p>
          )}
          <SignInForm next={nextPath} />
          {demoAvailable && (
            <div className="mt-8 border-t border-[#B6FF3C]/15 pt-6 text-center">
              <p className="mb-3 text-sm text-[#A0B3A8]">Just looking around? No sign-up needed.</p>
              <DemoSignInButton next={nextPath} variant="secondary" />
              <p className="mt-3 text-xs text-[#6B7F75]">A shared account with sample lists. Changes reset every day.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
