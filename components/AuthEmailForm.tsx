'use client';

import { PASSWORD_MIN_LENGTH, PASSWORD_REQUIREMENTS, isValidPassword } from "@/lib/password-policy";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

type Props = {
  mode: 'verify' | 'forgot' | 'reset';
  token?: string;
  invalidToken?: boolean;
};

export default function AuthEmailForm({ mode, token, invalidToken }: Props) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const unusableToken = mode === 'reset' && (!token || invalidToken);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError('');
    setMessage('');
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    if (mode === 'reset' && password !== formData.get('confirmPassword')) {
      setError('Passwords do not match.');
      return;
    }
    if (mode === 'reset' && !isValidPassword(password)) {
      setError(PASSWORD_REQUIREMENTS);
      return;
    }
    setPending(true);
    try {
      if (mode === 'reset') {
        const result = await authClient.resetPassword({ newPassword: password, token });
        if (result.error) {
          setError('Unable to reset your password. Request a new link and try again.');
          return;
        }
        setComplete(true);
        setMessage('Your password has been reset. You can now sign in.');
      } else {
        const result = mode === 'forgot'
          ? await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' })
          : await authClient.sendVerificationEmail({ email, callbackURL: '/signin?verified=1' });
        if (result.error) {
          setError('Unable to send the email. Please try again later.');
          return;
        }
        setMessage(mode === 'forgot'
          ? 'If an account exists for this address, you will receive a password-reset link. Check your spam folder too.'
          : 'If this account needs verification, you will receive a verification link. Check your spam folder too.');
      }
    } catch {
      setError('Unable to complete your request. Please try again later.');
    } finally {
      setPending(false);
    }
  }

  const inputClass = 'w-full rounded-lg border border-[#B6FF3C]/20 bg-[#050807] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#B6FF3C]';
  return (
    <form onSubmit={submit} className="space-y-6">
      {message && <p role="status" className="text-sm text-[#00FFC6]">{message}</p>}
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {unusableToken && (
        <p role="alert" className="text-sm text-red-400">This reset link is missing, invalid, or expired. Request a new one.</p>
      )}
      {!complete && !unusableToken && (
        <>
          {mode === 'reset' ? (
            <>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm text-[#A0B3A8]">New password</label>
                <input id="password" name="password" type="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} maxLength={128} required className={inputClass} />
              </div>
              <p className="text-sm text-[#A0B3A8]">{PASSWORD_REQUIREMENTS}</p>
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm text-[#A0B3A8]">Confirm password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} maxLength={128} required className={inputClass} />
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-[#A0B3A8]">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
            </div>
          )}
          <button disabled={pending} className="w-full rounded-lg bg-[#B6FF3C] px-4 py-3 font-semibold text-[#050807] hover:bg-[#B6FF3C]/80 disabled:opacity-60">
            {pending ? 'Please wait...' : mode === 'reset' ? 'Reset password' : mode === 'forgot' ? 'Send reset link' : 'Send verification email'}
          </button>
        </>
      )}
      <div className="flex justify-between text-sm text-[#B6FF3C]">
        <Link href="/signin">Back to sign in</Link>
        {mode === 'reset' && <Link href="/forgot-password">Request a new link</Link>}
      </div>
    </form>
  );
}
