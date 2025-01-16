const { fetchContent, updateCache } = require('../../server/services/cacheUtils');
const mongoose = require('mongoose');
const WeeklyTrendingMovies = require('../../server/models/weekly-trending-movies');  // Assuming this is the model for trending movies

const checkCacheValidity = async () => {
  const cache = await WeeklyTrendingMovies.findOne();
  if (!cache) {
    return false;  // Cache doesn't exist, needs to fetch data
  }

  const now = new Date();
  const cacheDate = new Date(cache.updatedAt);
  const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));  // Cache expires after 7 days

  return cacheDate > oneWeekAgo;
};

export async function GET(request) {
  try {
    const isCacheValid = await checkCacheValidity();
    
    if (!isCacheValid) {
      // Cache is expired or doesn't exist, fetch new data
      const topMovies = await fetchContent('movie', 10, 'week'); // Fetch 10 movies for the week
      if (topMovies.length > 0) {
        await updateCache('movie', 'week');  // Update the cache
        return new Response(JSON.stringify(topMovies), { status: 200 });
      } else {
        return new Response('No trending movies found', { status: 404 });
      }
    }

    // If the cache is valid, return cached data
    const cachedMovies = await WeeklyTrendingMovies.find({});
    return new Response(JSON.stringify(cachedMovies), { status: 200 });
    
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
