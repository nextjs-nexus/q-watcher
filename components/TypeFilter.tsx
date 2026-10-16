'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const types = [
    { id: '0', name: 'Movies and TV Shows' },
    { id: '1', name: 'Movies' },
    { id: '2', name: 'TV Shows' },
];

export default function TypeFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentType = searchParams.get('type') || '1';

    const handleFilter = (typeId: string) => {
        const params = new URLSearchParams(searchParams);
        params.delete('page');
        if (typeId) {
            params.set('type', typeId);
        } else {
            params.delete('type');
        }
        router.replace(`/list?${params.toString()}`);
    };

    return (
        <select
            value={currentType}
            onChange={(e) => handleFilter(e.target.value)}
            className="px-4 py-3 bg-[#0B1410] border border-[#B6FF3C]/20 rounded-lg text-sm text-white focus:ring-[#B6FF3C] focus:border-[#B6FF3C] cursor-pointer"
        >
            {types.map((type) => (
                <option key={type.id} value={type.id}>
                    {type.name}
                </option>
            ))}
        </select>
    );
}
