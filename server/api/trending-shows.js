import { waitUntil } from '@vercel/functions';  // Import waitUntil
import { fetchContent, updateCache } from '../services/cacheUtils';  // Correct import

export async function GET(request) {
  try {
    const topShows = await fetchContent('tv', 10, 'week');

    // Use waitUntil to handle the background task asynchronously
    waitUntil(updateCache('tv', 'week'));

    return new Response(JSON.stringify(topShows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching top trending shows:', error);
    return new Response('Error fetching top trending shows', { status: 500 });
  }
}
