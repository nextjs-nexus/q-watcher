'use client';

import { useRouter } from 'next/navigation';
import { signOut, useSession } from '@/lib/auth-client';
import { LogOut, User } from 'lucide-react';

export default function UserNav() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-[#A0B3A8]">
        <User size={18} className="text-[#B6FF3C]" />
        <span className="text-sm font-medium text-nowrap">{session.user.name || session.user.email}</span>
      </div>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-1.5 px-3 py-3 bg-[#0B1410] hover:bg-[#0A1912] text-[#A0B3A8] hover:text-white rounded-lg text-sm transition"
      >
        <LogOut size={16} />
        <span className='text-nowrap'>Sign Out</span>
      </button>
    </div>
  );
}
