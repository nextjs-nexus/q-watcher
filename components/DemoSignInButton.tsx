'use client';

import { useFormStatus } from 'react-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { demoSignInAction } from '@/actions/auth';

type Variant = 'primary' | 'secondary' | 'link';

const variantClasses: Record<Variant, string> = {
  primary: 'inline-flex items-center justify-center gap-2 rounded-full bg-[#00FFC6] px-6 py-3.5 font-semibold text-[#050807] transition hover:bg-[#00FFC6]/80',
  secondary: 'inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#00FFC6]/40 px-4 py-3 font-semibold text-[#00FFC6] transition hover:bg-[#00FFC6]/10',
  link: 'inline-flex items-center gap-1 font-medium text-[#00FFC6] underline-offset-4 transition hover:underline',
};

function SubmitButton({ variant, label }: { variant: Variant; label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${variantClasses[variant]} disabled:cursor-wait disabled:opacity-70`}
    >
      {pending ? (
        <Loader2 size={variant === 'link' ? 14 : 18} className="animate-spin" aria-hidden="true" />
      ) : (
        <Sparkles size={variant === 'link' ? 14 : 18} aria-hidden="true" />
      )}
      {pending ? 'Opening demo…' : label}
    </button>
  );
}

// Signs the visitor in to the shared demo account, then opens `next`.
export default function DemoSignInButton({
  next,
  variant = 'primary',
  label = 'Try the demo account',
}: {
  next: string;
  variant?: Variant;
  label?: string;
}) {
  return (
    <form action={demoSignInAction} className={variant === 'secondary' ? 'w-full' : 'inline'}>
      <input type="hidden" name="next" value={next} />
      <SubmitButton variant={variant} label={label} />
    </form>
  );
}
