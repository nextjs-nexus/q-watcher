'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getListUrl } from '@/lib/browsing-state';

export default function BackButton() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = getListUrl(searchParams.get('returnTo'));

    return (
        <button
            type="button"
            onClick={() => router.push(returnTo, { scroll: false })}
            className="flex items-center gap-1.5 px-3 py-3 bg-[#0B1410] hover:bg-[#0A1912] text-[#A0B3A8] hover:text-white rounded-lg text-sm transition"
        >
            <ArrowLeft size={20} />
            <span>Back to List</span>
        </button>
    );
}
