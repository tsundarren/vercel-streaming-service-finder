import { fetchContent, updateCache } from '../../server/services/cacheUtils'; // Adjust the path as needed

export async function GET(request) {
  try {
    const topMovies = await fetchContent('movie', 1, 'day');
    if (topMovies.length > 0) {
      const topMovie = topMovies[0];
      await updateCache('movie', 'day');
      return new Response(JSON.stringify(topMovie), { status: 200 });
    } else {
      return new Response('No top daily movie found', { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching daily top movie:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
