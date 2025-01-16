import WeeklyTrendingMovies from '../../server/models/WeeklyTrendingMovies'; // Import your model
import { fetchContent, updateCache } from '../../server/services/cacheUtils'; // Adjust the path as needed

export async function GET(request) {
  try {
    // 1. Check if there is cached data for trending movies
    const cachedData = await WeeklyTrendingMovies.findOne({});

    // 2. If cache exists, return cached data
    if (cachedData) {
      console.log('Using cached trending movies data');
      return new Response(JSON.stringify(cachedData), { status: 200 });
    }

    // 3. If no cache, fetch trending movies data
    const topMovies = await fetchContent('movie', 10, 'week'); // Fetch top 10 movies for the week
    if (topMovies.length > 0) {
      // 4. Save fresh data into cache
      const newCacheData = new WeeklyTrendingMovies({
        title: topMovies[0].title,
        overview: topMovies[0].overview,
        release_date: topMovies[0].release_date,
        posterUrl: `https://image.tmdb.org/t/p/original${topMovies[0].poster_path}`,
        streamingServices: topMovies[0].streamingServices,
      });

      await newCacheData.save(); // Save fresh data to cache

      return new Response(JSON.stringify(topMovies), { status: 200 });
    } else {
      return new Response('No trending movies found', { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
