import { getTopRatedMovies } from '@/lib/tmdb';
import { MetadataRoute } from 'next';

const BASE_URL = 'https://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { movies } = await getTopRatedMovies(1);

    const movieEntries: MetadataRoute.Sitemap = movies.map((movie) => ({
        url: `${BASE_URL}/movie/${movie.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...movieEntries,
    ];
}
