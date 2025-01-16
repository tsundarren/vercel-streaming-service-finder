import TrendingShowsCache from '../../server/models/TrendingShowsCache'; // Import the cache model for trending shows
import { fetchContent, updateCache } from '../../server/services/cacheUtils'; // Adjust the path as needed

export async function GET(request) {
  try {
    const cachedData = await TrendingShowsCache.findOne({});

    if (cachedData) {
      console.log('Using cached trending shows data');
      return new Response(JSON.stringify(cachedData), { status: 200 });
    }

    const topShows = await fetchContent('tv', 10, 'week');
    if (topShows.length > 0) {
      await updateCache('tv', 'week');

      const newCacheData = new TrendingShowsCache({
        shows: topShows,
        fetchedAt: new Date(),
      });

      await newCacheData.save();

      return new Response(JSON.stringify(topShows), { status: 200 });
    } else {
      return new Response('No trending shows found', { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching trending shows:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
