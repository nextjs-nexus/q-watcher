import Link from 'next/link';

export default function Logo({ compact = false, href = '/' }: { compact?: boolean; href?: string }) {
  return (
    <Link href={href} scroll={false} aria-label={href === '/' ? 'Q-Watcher home' : 'Q-Watcher movie list'} className="inline-flex shrink-0 items-center gap-3">
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden="true">
        <rect width="48" height="48" rx="14" fill="#0B1410" />
        <circle cx="23" cy="22" r="13" stroke="#B6FF3C" strokeWidth="4" />
        <path d="m29 31 8 8" stroke="#00FFC6" strokeWidth="4" strokeLinecap="round" />
        <path d="m20 15 10 7-10 7z" fill="#B6FF3C" />
      </svg>
      {!compact && <span className="text-2xl font-bold tracking-tight text-white">Q-Watcher<span className="text-[#B6FF3C]">.</span></span>}
    </Link>
  );
}
