import WeeklyTrendingShows from '../../server/models/weekly-trending-shows'; // Import your model
import { fetchContent, updateCache } from '../../server/services/cacheUtils'; // Adjust the path as needed

export async function GET(request) {
  try {
    // 1. Check if there is cached data for trending shows
    const cachedData = await WeeklyTrendingShows.findOne({});

    // 2. If cache exists, return cached data
    if (cachedData) {
      console.log('Using cached trending shows data');
      return new Response(JSON.stringify(cachedData), { status: 200 });
    }

    // 3. If no cache, fetch trending shows data
    const topShows = await fetchContent('tv', 10, 'week'); // Fetch top 10 trending shows for the week
    if (topShows.length > 0) {
      // 4. Save fresh data into cache
      const newCacheData = new WeeklyTrendingShows({
        title: topShows[0].title,
        overview: topShows[0].overview,
        release_date: topShows[0].release_date,
        posterUrl: `https://image.tmdb.org/t/p/original${topShows[0].poster_path}`,
        streamingServices: topShows[0].streamingServices,
      });

      await newCacheData.save(); // Save fresh data to cache

      return new Response(JSON.stringify(topShows), { status: 200 });
    } else {
      return new Response('No trending shows found', { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching trending shows:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
