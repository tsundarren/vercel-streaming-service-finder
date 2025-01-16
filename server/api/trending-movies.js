const { fetchContent, updateCache } = require('../../server/services/cacheUtils');
const mongoose = require('mongoose');
const WeeklyTrendingMovies = require('../../server/models/weekly-trending-movies'); // Assuming this is the model for trending movies

// Function to check cache validity
const checkCacheValidity = async () => {
  try {
    const cache = await WeeklyTrendingMovies.findOne().sort({ updatedAt: -1 }); // Get the most recently updated cache
    if (!cache) {
      console.log('Cache does not exist.');
      return false; // Cache doesn't exist
    }

    const now = new Date();
    const cacheDate = new Date(cache.updatedAt);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    console.log(`Cache Date: ${cacheDate}, One Week Ago: ${oneWeekAgo}`);
    return cacheDate > oneWeekAgo;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
};

// GET handler
export async function GET(request) {
  try {
    // Check if the cache is valid
    const isCacheValid = await checkCacheValidity();

    if (!isCacheValid) {
      console.log('Cache is invalid or does not exist. Fetching new data.');
      const topMovies = await fetchContent('movie', 10, 'week'); // Fetch 10 movies for the week

      if (topMovies.length > 0) {
        await updateCache('movie', 'week'); // Update the cache
        console.log('Cache updated successfully.');
        return new Response(JSON.stringify(topMovies), { status: 200 });
      } else {
        console.log('No trending movies found during fetch.');
        return new Response('No trending movies found', { status: 404 });
      }
    }

    console.log('Cache is valid. Returning cached data.');
    const cachedMovies = await WeeklyTrendingMovies.find({});
    return new Response(JSON.stringify(cachedMovies), { status: 200 });
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
