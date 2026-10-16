import AuthEmailForm from '@/components/AuthEmailForm';

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050807] p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0B1410] p-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Forgot password?</h1>
        <p className="mb-8 text-[#A0B3A8]">Enter your email to request a password-reset link.</p>
        <AuthEmailForm mode="forgot" />
      </div>
    </div>
  );
}
