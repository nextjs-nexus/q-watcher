import Link from 'next/link';
import { ArrowRight, Bookmark, Check, Film, Lock, Search, Star, Unlock } from 'lucide-react';
import Logo from '@/components/Logo';
import DemoSignInButton from '@/components/DemoSignInButton';
import { getViewer } from '@/lib/session';

const features = [
  { icon: Bookmark, title: 'Save what’s next', description: 'Build your To Watch list for movie nights and your next series.' },
  { icon: Check, title: 'Remember what you loved', description: 'Keep your Watched list together, from old favorites to new discoveries.' },
  { icon: Star, title: 'Make it your rating', description: 'Rate movies and TV shows out of 10. Your taste, your score.' },
];

const openFeatures = [
  'Browse top-rated movies and TV shows',
  'Search titles and actors, filter by genre',
  'Open details, ratings, and trailers',
];

const accountFeatures = [
  'Save titles to your To Watch list',
  'Mark titles as Watched',
  'Rate movies and shows out of 10',
];

export default async function Home() {
  const viewer = await getViewer();

  return (
    <main className="relative isolate overflow-hidden bg-[#050807]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-[#B6FF3C]/5 blur-[120px]" />
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
        <Logo />
        {viewer.signedIn ? (
          <div className="flex items-center gap-5 text-sm">
            <Link href="/list?status=toWatch" className="rounded-full border border-[#B6FF3C]/30 px-5 py-2.5 text-[#B6FF3C] transition hover:bg-[#B6FF3C]/10">Open my lists</Link>
          </div>
        ) : (
          <div className="flex items-center gap-5 text-sm">
            <Link href="/signin" className="text-[#A0B3A8] transition hover:text-white">Log in</Link>
            <Link href="/signup" className="rounded-full border border-[#B6FF3C]/30 px-5 py-2.5 text-[#B6FF3C] transition hover:bg-[#B6FF3C]/10">Sign up free</Link>
          </div>
        )}
      </nav>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 lg:grid-cols-[1.15fr_1fr] lg:py-20">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00FFC6]/30 bg-[#00FFC6]/10 px-4 py-2 text-sm font-medium text-[#00FFC6]">
            <Unlock size={15} aria-hidden="true" />
            No account needed to browse
          </p>
          <p className="mb-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#B6FF3C]"><Film size={15} /> Your next great watch starts here</p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">Great stories.<br />One place to <span className="text-[#B6FF3C]">keep them.</span></h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#A0B3A8]">Discover movies and TV shows, save what you want to watch, and give every story your own rating.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/list" className="inline-flex items-center gap-3 rounded-full bg-[#B6FF3C] px-6 py-3.5 font-semibold text-[#050807] transition hover:bg-[#B6FF3C]/80">Start browsing, no sign-up <ArrowRight size={18} /></Link>
            {!viewer.signedIn && viewer.demoAvailable && (
              <DemoSignInButton next="/list?status=toWatch" />
            )}
            {!viewer.signedIn && !viewer.demoAvailable && (
              <Link href="/signup" className="rounded-full border border-white/15 px-6 py-3.5 font-medium transition hover:border-[#B6FF3C]/50">Create an account</Link>
            )}
          </div>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#A0B3A8]">
            Anyone can browse and search the whole catalog. Saving titles to To Watch, marking them as Watched, and rating them are available after you log in.
            {!viewer.signedIn && viewer.demoAvailable && ' Want to see those features without signing up? Try the shared demo account.'}
          </p>
        </div>
        <div aria-label="Illustration of your personal movie collection" className="relative mx-auto flex w-full max-w-md items-center justify-center py-10">
          <div aria-hidden="true" className="absolute inset-8 rounded-full border border-[#B6FF3C]/10" />
          <div aria-hidden="true" className="absolute inset-14 rounded-full bg-[#B6FF3C]/5 blur-3xl motion-safe:animate-pulse motion-safe:[animation-duration:8s]" />
          <div className="relative w-64 -rotate-6 rounded-2xl border border-[#B6FF3C]/20 bg-[#0B1410] p-3 shadow-2xl sm:w-72">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#00FFC6]/20 via-[#0B1410] to-[#B6FF3C]/20">
              <div aria-hidden="true" className="absolute h-44 w-44 rounded-full border border-[#B6FF3C]/20 motion-safe:animate-spin motion-safe:[animation-duration:45s]"><span className="absolute left-5 top-5 h-2 w-2 rounded-full bg-[#B6FF3C]" /></div>
              <Film size={56} strokeWidth={1} className="text-[#B6FF3C]" />
              <span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-[#050807]/70 px-3 py-1 text-xs text-[#A0B3A8]">Your next favorite</span>
            </div>
            <div className="px-2 pb-2 pt-4"><p className="font-semibold">A story worth saving</p><p className="mt-2 flex items-center gap-1 text-sm text-[#B6FF3C]"><Star size={14} fill="currentColor" /> 9.0 <span className="ml-auto text-[#A0B3A8]">Your rating</span></p></div>
          </div>
          <div className="absolute bottom-4 right-0 flex rotate-3 items-center gap-3 rounded-xl border border-[#00FFC6]/20 bg-[#0A1912] px-5 py-4 shadow-xl motion-safe:animate-pulse motion-safe:[animation-duration:6s]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00FFC6]/10 text-[#00FFC6]"><Check size={18} /></span>
            <div><p className="text-sm font-medium">Watched. Rated. Remembered.</p><p className="mt-1 text-xs text-[#A0B3A8]">Your collection, all together.</p></div>
          </div>
        </div>
      </section>
      <section aria-labelledby="access-heading" className="mx-auto max-w-6xl border-t border-[#B6FF3C]/10 px-6 py-10">
        <h2 id="access-heading" className="text-2xl font-semibold">What you can do</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#00FFC6]/20 bg-[#0A1912]/60 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-[#00FFC6]">
              <Search size={18} aria-hidden="true" />
              Open to everyone
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-[#A0B3A8]">
              {openFeatures.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#00FFC6]" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[#B6FF3C]/20 bg-[#0A1912]/60 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-[#B6FF3C]">
              <Lock size={18} aria-hidden="true" />
              After you log in
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-[#A0B3A8]">
              {accountFeatures.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#B6FF3C]" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section aria-label="Personal list features" className="mx-auto grid max-w-6xl gap-6 border-t border-[#B6FF3C]/10 px-6 py-10 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex gap-4">
            <Icon size={21} className="mt-1 shrink-0 text-[#B6FF3C]" />
            <div>
              <h2 className="flex flex-wrap items-center gap-2 font-semibold">
                {title}
                <span className="rounded-full border border-[#B6FF3C]/30 px-2 py-0.5 text-xs font-medium text-[#B6FF3C]">Free account</span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#A0B3A8]">{description}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
