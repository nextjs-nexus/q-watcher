'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const genres = [
    { id: '', name: 'All Genres' },
    { id: '28', name: 'Action' },
    { id: '35', name: 'Comedy' },
    { id: '18', name: 'Drama' },
    { id: '27', name: 'Horror' },
    { id: '878', name: 'Sci-Fi' },
];

export default function GenreFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentGenre = searchParams.get('genre') || '';

    const handleFilter = (genreId: string) => {
        const params = new URLSearchParams(searchParams);
        params.delete('page');
        if (genreId) {
            params.set('genre', genreId);
            params.delete('query');
        } else {
            params.delete('genre');
        }
        router.replace(`/list?${params.toString()}`);
    };

    return (
        <select
            value={currentGenre}
            onChange={(e) => handleFilter(e.target.value)}
            className="px-4 py-3 bg-[#0B1410] border border-[#B6FF3C]/20 rounded-lg text-sm text-white focus:ring-[#B6FF3C] focus:border-[#B6FF3C] cursor-pointer"
        >
            {genres.map((g) => (
                <option key={g.id} value={g.id}>
                    {g.name}
                </option>
            ))}
        </select>
    );
}
