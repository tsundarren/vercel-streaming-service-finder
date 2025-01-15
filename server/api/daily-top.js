import { waitUntil } from '@vercel/functions';
import { fetchContent, updateCache } from '../services/cacheUtils';  // Correct import

export async function GET(request) {
  try {
    const topMovies = await fetchContent('movie', 1, 'day');
    if (topMovies.length > 0) {
      const topMovie = topMovies[0];

      // Use waitUntil to handle background tasks asynchronously
      waitUntil(updateCache('movie', 'day'));

      return new Response(JSON.stringify(topMovie), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new Response('No top daily movie found', { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching daily top movie:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
