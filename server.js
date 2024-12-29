const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const DailyCache = require('./models/daily-cache');  // Import DailyCache model
const WeeklyTrendingMovies = require('./models/weekly-trending-movies');
const WeeklyTrendingShows = require('./models/weekly-trending-shows');

const app = express();
const PORT = process.env.PORT || 5001;

const API_KEY = 'fe7a337e0580140119903a698dc55a00';
const BASE_URL = 'https://api.themoviedb.org/3';

mongoose.connect('mongodb://localhost:27017/streaming-service-finder');

app.use(cors());
app.use(bodyParser.json());

const getUniqueProviders = (providers) => {
  const uniqueProviders = [];
  const seen = new Set();
  const excludedKeywords = ['Channel', 'with ads', 'Paramount+'];

  providers.forEach((provider) => {
    const baseName = provider.provider_name.split(' ')[0];
    if (!seen.has(baseName) && !excludedKeywords.some(keyword => provider.provider_name.includes(keyword))) {
      seen.add(baseName);
      uniqueProviders.push(provider);
    }
  });

  return uniqueProviders;
};

const fetchFromAPI = async (endpoint, params) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, { params: { api_key: API_KEY, ...params } });
    return response.data;
  } catch (error) {
    throw new Error('API request failed');
  }
};

const fetchContent = async (type, maxItems, timeFrame) => {
  let topContent = [];
  let page = 1;

  while (topContent.length < maxItems) {
    const response = await fetchFromAPI(`/trending/${type}/${timeFrame}`, { page });
    const items = response.results;

    for (const item of items) {
      const providers = await fetchFromAPI(`/${type === 'movie' ? 'movie' : 'tv'}/${item.id}/watch/providers`);
      const streamingServices = providers.results.US?.flatrate?.map(provider => ({
        provider_name: provider.provider_name,
        logoUrl: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
      })) || [];

      if (streamingServices.length > 0) {
        topContent.push({ ...item, streamingServices: getUniqueProviders(streamingServices) });

        if (topContent.length === maxItems) {
          break;
        }
      }
    }

    page++;
  }

  return topContent;
};

const updateCache = async (mediaType, frequency) => {
  try {
    const isDaily = frequency === 'day';
    const cacheModel = isDaily ? DailyCache : mediaType === 'movie' ? WeeklyTrendingMovies : WeeklyTrendingShows;

    console.log(`Updating ${isDaily ? 'daily' : 'weekly'} cache for ${mediaType}...`);

    // Fetch trending content
    const maxItems = isDaily ? 1 : 10;
    const topContent = await fetchContent(mediaType, maxItems, frequency);

    if (topContent.length === 0) {
      console.warn('No content fetched for cache update.');
      return;
    }

    console.log('Fetched content for cache update:', topContent);

    // Clear existing cache
    await cacheModel.deleteMany({});
    console.log('Existing cache cleared.');

    // Insert new cache
    const cacheData = topContent.map(item => ({
      title: item.title || item.name,
      overview: item.overview || 'No overview available',
      release_date: item.release_date || item.first_air_date,
      posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'defaultPosterUrl',
      backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : 'defaultBackdropUrl',
      streamingServices: item.streamingServices || [],
    }));

    await cacheModel.insertMany(cacheData);
    console.log(`${isDaily ? 'Daily' : 'Weekly'} ${mediaType} cache updated successfully.`);
  } catch (error) {
    console.error(`Error updating ${mediaType} cache:`, error);
  }
};





// Routes
app.get('/api/providers/:mediaId', async (req, res) => {
  const { mediaId } = req.params;
  try {
    const providers = await fetchFromAPI(`/movie/${mediaId}/watch/providers`);
    const streamingServices = providers.results.US?.flatrate?.map(provider => ({
      provider_name: provider.provider_name,
      logoUrl: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
    })) || [];
    res.json(getUniqueProviders(streamingServices));
  } catch (error) {
    console.error('Error fetching streaming providers:', error);
    res.status(500).send('Error fetching streaming providers');
  }
});

app.get('/api/daily-top', async (req, res) => {
  try {
    // Check if data exists in the DailyCache
    const cachedMovie = await DailyCache.findOne();
    if (cachedMovie) {
      console.log('Serving from cache:', cachedMovie.title);
      return res.json(cachedMovie);
    }

    console.log('Cache is empty. Fetching and updating...');
    
    // If no cached data, fetch from API and update the cache
    const topMovies = await fetchContent('movie', 1, 'day');
    if (topMovies.length > 0) {
      const topMovie = topMovies[0];

      // Cache the fetched movie
      await updateCache('movie', 'day');
      console.log('Daily cache updated successfully.');

      // Respond with the top movie
      res.json(topMovie);
    } else {
      res.status(404).send('No top daily movie found');
    }
  } catch (error) {
    console.error('Error fetching top daily movie:', error);
    res.status(500).send('Error fetching top daily movie');
  }
});




// Update weekly cache for top movies and shows
app.get('/api/trending-movies', async (req, res) => {
  try {
    const topMovies = await fetchContent('movie', 10, 'week'); // Always weekly for top 10 movies
    res.json(topMovies);

    // Cache weekly movies in WeeklyCache
    await updateCache('movie', 'week');
  } catch (error) {
    console.error('Error fetching top streaming movies:', error);
    res.status(500).send('Error fetching top streaming movies');
  }
});

app.get('/api/trending-shows', async (req, res) => {
  try {
    const topShows = await fetchContent('tv', 10, 'week'); // Always weekly for top 10 shows
    res.json(topShows);

    // Cache weekly shows in WeeklyCache
    await updateCache('tv', 'week');
  } catch (error) {
    console.error('Error fetching top trending shows:', error);
    res.status(500).send('Error fetching top trending shows');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
