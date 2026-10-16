'use client';

import { PASSWORD_REQUIREMENTS } from "@/lib/password-policy";

import { useActionState } from 'react';
import Link from 'next/link';
import { signInAction, type SignInState } from '@/actions/auth';

const initialState: SignInState = {
  error: null,
};

export default function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="flex flex-col space-y-6">
      {state.error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400"
        >
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#A0B3A8]">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="your@email.com"
          className="w-full rounded-lg border border-[#B6FF3C]/20 bg-[#050807] px-4 py-3 text-white placeholder-[#6B7F75] transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B6FF3C]"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#A0B3A8]">
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          aria-describedby="password-requirements"
          placeholder="Enter your password"
          className="w-full rounded-lg border border-[#B6FF3C]/20 bg-[#050807] px-4 py-3 text-white placeholder-[#6B7F75] transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B6FF3C]"
          required
        />
      </div>

      <p id="password-requirements" className="text-sm text-[#A0B3A8]">
        {PASSWORD_REQUIREMENTS}
      </p>

      <button
        className="w-full rounded-lg bg-[#B6FF3C] px-4 py-3 font-semibold text-[#050807] transition hover:bg-[#B6FF3C]/80 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
        type="submit"
        disabled={isPending}
      >
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="flex justify-between text-sm text-[#B6FF3C]">
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/verify-email">Verify email</Link>
      </div>

      <p className="text-center text-[#A0B3A8]">
        Don&apos;t have an account?
        <Link className="ml-2 text-[#B6FF3C] hover:text-[#00FFC6]" href="/signup">
          Sign up
        </Link>
      </p>
    </form>
  );
}
