import { waitUntil } from '@vercel/functions';  // Import waitUntil
import { fetchContent, updateCache } from '../services/cacheUtils';  // Correct import

export async function GET(request) {
  try {
    const topMovies = await fetchContent('movie', 10, 'week');

    // Use waitUntil to handle the background task asynchronously
    waitUntil(updateCache('movie', 'week'));

    return new Response(JSON.stringify(topMovies), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching top trending movies:', error);
    return new Response('Error fetching top trending movies', { status: 500 });
  }
}
