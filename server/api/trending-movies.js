import TrendingCache from '../../server/models/TrendingCache'; 
import { fetchContent, updateCache } from '../../server/services/cacheUtils';

export async function GET(request) {
  try {
    const cachedData = await TrendingCache.findOne({});

    if (cachedData) {
      console.log('Using cached trending movies data');
      return new Response(JSON.stringify(cachedData), { status: 200 });
    }

    const topMovies = await fetchContent('movie', 10, 'week');
    if (topMovies.length > 0) {
      await updateCache('movie', 'week');

      const newCacheData = new TrendingCache({
        movies: topMovies,
        fetchedAt: new Date(),
      });

      await newCacheData.save(); 

      return new Response(JSON.stringify(topMovies), { status: 200 });
    } else {
      return new Response('No trending movies found', { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
