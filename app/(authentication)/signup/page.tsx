import SignUpForm from "@/components/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050807] p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0B1410] rounded-2xl border-0 border-[#B6FF3C]/15 p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Q-Watcher
            </h1>
            <p className="text-[#A0B3A8]">Sign Up</p>
          </div>
          <SignUpForm />
        </div>
      </div>    
    </div>
  );
}
