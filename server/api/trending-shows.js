import WeeklyTrendingShows from '../../server/models/weekly-trending-shows'; // Import your model
import { fetchContent, updateCache } from '../../server/services/cacheUtils'; // Adjust the path as needed

export async function GET(request) {
  try {
    // 1. Check if there are cached entries for trending shows
    const cachedData = await WeeklyTrendingShows.find({}); // Find all cached data

    // 2. If there are already cached entries, check if they are sufficient
    if (cachedData.length === 10) {
      console.log('Using cached trending shows data');
      return new Response(JSON.stringify(cachedData), { status: 200 });
    }

    // 3. If no sufficient cache, fetch trending shows data
    const topShows = await fetchContent('tv', 10, 'week'); // Fetch top 10 trending shows for the week
    if (topShows.length > 0) {
      // 4. Clear previous cache if it doesn't have sufficient data
      await WeeklyTrendingShows.deleteMany({}); // Clear the cache (optional)

      // 5. Save fresh data into cache
      const newCacheData = topShows.map(show => ({
        title: show.title,
        overview: show.overview,
        release_date: show.release_date,
        posterUrl: `https://image.tmdb.org/t/p/original${show.poster_path}`,
        streamingServices: show.streamingServices,
      }));

      await WeeklyTrendingShows.insertMany(newCacheData); // Save all 10 shows into the cache

      return new Response(JSON.stringify(topShows), { status: 200 });
    } else {
      return new Response('No trending shows found', { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching trending shows:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
