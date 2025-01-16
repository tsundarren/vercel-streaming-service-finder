import { fetchContent, updateCache } from '../../server/services/cacheUtils'; // Adjust the path as needed

export async function GET(request) {
  try {
    const topMovies = await fetchContent('movie', 10, 'week'); // Fetch 10 movies for the week
    if (topMovies.length > 0) {
      await updateCache('movie', 'week');
      return new Response(JSON.stringify(topMovies), { status: 200 });
    } else {
      return new Response('No trending movies found', { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
