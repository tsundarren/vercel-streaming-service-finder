import DailyCache from '../../server/models/DailyCache'; // Import the DailyCache model
import { fetchContent, updateCache } from '../../server/services/cacheUtils'; // Adjust the path as needed

export async function GET(request) {
  try {
    const cachedData = await DailyCache.findOne({});

    if (cachedData) {
      console.log('Using cached data');
      return new Response(JSON.stringify(cachedData), { status: 200 });
    }

    const topMovies = await fetchContent('movie', 1, 'day'); 
    if (topMovies.length > 0) {
      const topMovie = topMovies[0];

      await updateCache('movie', 'day');

      const newCacheData = new DailyCache({
        title: topMovie.title,
        overview: topMovie.overview,
        release_date: topMovie.release_date,
        backdropUrl: `https://image.tmdb.org/t/p/original${topMovie.backdrop_path}`,
        streamingServices: topMovie.streamingServices,
      });

      await newCacheData.save();

      return new Response(JSON.stringify(topMovie), { status: 200 });
    } else {
      return new Response('No top daily movie found', { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching daily top movie:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
