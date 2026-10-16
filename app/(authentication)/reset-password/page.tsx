import AuthEmailForm from '@/components/AuthEmailForm';

export default async function Page({ searchParams }: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050807] p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0B1410] p-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Reset your password</h1>
        <p className="mb-8 text-[#A0B3A8]">Choose a new password for your account.</p>
        <AuthEmailForm mode="reset" token={params.token} invalidToken={Boolean(params.error)} />
      </div>
    </div>
  );
}
