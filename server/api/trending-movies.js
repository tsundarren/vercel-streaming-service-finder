import WeeklyTrendingMovies from '../../server/models/weekly-trending-movies'; // Import your model
import { fetchContent, updateCache } from '../../server/services/cacheUtils'; // Adjust the path as needed

export async function GET(request) {
  try {
    // 1. Check if there are cached entries for trending movies
    const cachedData = await WeeklyTrendingMovies.find({}); // Find all cached data

    // 2. If there are already cached entries, check if they are sufficient (i.e., 10)
    if (cachedData.length === 10) {
      console.log('Using cached trending movies data');
      return new Response(JSON.stringify(cachedData), { status: 200 });
    }

    // 3. If no sufficient cache, fetch trending movies data
    const topMovies = await fetchContent('movie', 10, 'week'); // Fetch top 10 movies for the week
    if (topMovies.length > 0) {
      // 4. Clear previous cache if it doesn't have sufficient data
      await WeeklyTrendingMovies.deleteMany({}); // Clear the cache (optional)

      // 5. Save fresh data into cache
      const newCacheData = topMovies.map(movie => ({
        title: movie.title,
        overview: movie.overview,
        release_date: movie.release_date,
        posterUrl: `https://image.tmdb.org/t/p/original${movie.poster_path}`,
        streamingServices: movie.streamingServices,
      }));

      await WeeklyTrendingMovies.insertMany(newCacheData); // Save all 10 movies into the cache

      return new Response(JSON.stringify(topMovies), { status: 200 });
    } else {
      return new Response('No trending movies found', { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
