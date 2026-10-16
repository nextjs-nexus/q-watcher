import SignInForm from '@/components/SignInForm';

export default async function SignInPage({ searchParams }: {
  searchParams: Promise<{ verified?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050807] p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0B1410] rounded-2xl border-0 border-[#B6FF3C]/15 p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Q-Watcher
            </h1>
            <p className="text-[#A0B3A8]">Sign in to your account</p>
          </div>
          {params.verified === '1' && !params.error && (
            <p role="status" className="mb-4 text-sm text-[#00FFC6]">Email verified. You can now sign in.</p>
          )}
          {params.error && (
            <p role="alert" className="mb-4 text-sm text-red-400">This verification link is invalid or expired. Request another using Verify email below.</p>
          )}
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
