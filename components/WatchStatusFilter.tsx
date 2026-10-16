'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function WatchStatusFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const changeStatus = (status: string) => {
        const params = new URLSearchParams(searchParams);
        params.delete('page');
        if (status === 'all') {
            params.delete('status');
        } else {
            params.set('status', status);
        }
        router.replace(`/list?${params.toString()}`);
    };

    return (
        <select
            aria-label="Watch status"
            value={searchParams.get('status') || 'all'}
            onChange={(event) => changeStatus(event.target.value)}
            className="rounded-lg border border-[#B6FF3C]/20 bg-[#0B1410] px-4 py-3 text-sm text-white focus:border-[#B6FF3C] focus:ring-[#B6FF3C] cursor-pointer"
        >
            <option value="all">Show All</option>
            <option value="toWatch">Show Watch List</option>
            <option value="watched">Show Watched</option>
        </select>
    );
}
