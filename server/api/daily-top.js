import { fetchContent, updateCache } from '../../server/services/cacheUtils'; // Ensure the path is correct

export async function GET(request) {
  try {
    // Fetch the daily top movie
    const topMovies = await fetchContent('movie', 1, 'day');
    
    if (topMovies.length > 0) {
      const topMovie = topMovies[0];

      // Optionally update the cache
      await updateCache('movie', 'day');

      // Create the response object
      const response = new Response(JSON.stringify(topMovie), { status: 200 });

      // Add CORS headers to the response
      response.headers.set('Access-Control-Allow-Origin', '*'); // Allow all origins, change '*' to specific domain if necessary
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST'); // Allow specific methods
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers

      return response;
    } else {
      return new Response('No top daily movie found', { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching daily top movie:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
