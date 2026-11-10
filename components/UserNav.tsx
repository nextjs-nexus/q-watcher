import Link from 'next/link';
import { LogOut, Sparkles, User } from 'lucide-react';
import { signOutAction } from '@/actions/auth';
import { getCurrentUser, getViewer } from '@/lib/session';
import SignInLink from './SignInLink';

export default async function UserNav() {
  const [user, viewer] = await Promise.all([getCurrentUser(), getViewer()]);

  if (!user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <SignInLink className="px-3 py-3 text-nowrap text-[#A0B3A8] transition hover:text-white">
          Log in
        </SignInLink>
        <Link
          href="/signup"
          className="rounded-lg border border-[#B6FF3C]/30 px-4 py-3 text-nowrap text-[#B6FF3C] transition hover:bg-[#B6FF3C]/10"
        >
          Sign up free
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {viewer.isDemo ? (
        <span
          title="Shared demo account. Lists reset every day."
          className="flex items-center gap-1.5 rounded-full border border-[#00FFC6]/30 px-3 py-1.5 text-sm font-medium text-nowrap text-[#00FFC6]"
        >
          <Sparkles size={15} aria-hidden="true" />
          Demo account
        </span>
      ) : (
        <div className="flex items-center gap-2 text-[#A0B3A8]">
          <User size={18} className="text-[#B6FF3C]" />
          <span className="text-sm font-medium text-nowrap">{user.name || user.email}</span>
        </div>
      )}
      <form action={signOutAction}>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-3 py-3 bg-[#0B1410] hover:bg-[#0A1912] text-[#A0B3A8] hover:text-white rounded-lg text-sm transition"
        >
          <LogOut size={16} />
          <span className="text-nowrap">Sign Out</span>
        </button>
      </form>
    </div>
  );
}
