import { fetchContent, updateCache } from '../../server/services/cacheUtils'; // Adjust the path as needed

export async function GET(request) {
  try {
    const topShows = await fetchContent('tv', 10, 'week'); // Fetch 10 trending shows for the week
    if (topShows.length > 0) {
      await updateCache('tv', 'week');
      return new Response(JSON.stringify(topShows), { status: 200 });
    } else {
      return new Response('No trending shows found', { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching trending shows:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
