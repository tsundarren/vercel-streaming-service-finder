const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Media = require('./models/movie-cache'); // Updated import

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

const fetchMediaData = async (title) => {
  try {
    const searchResult = await fetchFromAPI('/search/movie', { query: title });
    const mediaId = searchResult.results[0]?.id;

    if (!mediaId) throw new Error('Media not found');

    const [details, providers] = await Promise.all([
      fetchFromAPI(`/movie/${mediaId}`),
      fetchFromAPI(`/movie/${mediaId}/watch/providers`)
    ]);

    const streamingServices = providers.results.US?.flatrate?.map(provider => ({
      provider_name: provider.provider_name,
      logoUrl: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
    })) || [];

    return {
      title: details.title,
      overview: details.overview,
      release_date: details.release_date,
      posterUrl: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
      streamingServices: getUniqueProviders(streamingServices),
    };
  } catch (error) {
    throw new Error('Error fetching media data');
  }
};

const fetchSuggestionsWithProviders = async (title) => {
  const searchResult = await fetchFromAPI('/search/movie', { query: title });
  const suggestions = searchResult.results.slice(0, 3);

  return Promise.all(
    suggestions.map(async (suggestion) => {
      const providers = await fetchFromAPI(`/movie/${suggestion.id}/watch/providers`);
      const streamingServices = providers.results.US?.flatrate?.map(provider => ({
        provider_name: provider.provider_name,
        logoUrl: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
      })) || [];
      return { ...suggestion, streamingServices: getUniqueProviders(streamingServices) };
    })
  );
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

const updateCache = async (type, mediaType, frequency) => {
  try {
    // Fetch the data from the API
    const endpoint = `/trending/${mediaType}/${frequency}`;
    const topContent = await fetchFromAPI(endpoint, { page: 1 }); // Assuming page 1 for simplicity

    // Cache the results
    const cacheModel = type === 'daily' ? DailyCache : WeeklyCache;
    await cacheModel.deleteMany({}); // Clear existing cache
    const cacheData = topContent.results.map(item => ({
      title: item.title || item.name, // Handle both movies and shows
      overview: item.overview,
      release_date: item.release_date || item.first_air_date,
      backdropUrl: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
      streamingServices: getUniqueProviders(item.streamingServices || [])
    }));
    await cacheModel.insertMany(cacheData);

    console.log(`Cache updated for ${type} ${mediaType}`);
  } catch (error) {
    console.error(`Error updating ${type} cache:`, error);
  }
};

// Routes
app.post('/api/search', async (req, res) => {
  const { title } = req.body;
  try {
    let mediaItem = await Media.findOne({ title });
    if (!mediaItem) {
      mediaItem = await fetchMediaData(title);
      await Media.create(mediaItem);
    }
    res.json(mediaItem);
  } catch (error) {
    console.error('Error fetching media data:', error);
    res.status(500).send('Error fetching media data');
  }
});

app.post('/api/suggestions', async (req, res) => {
  const { title } = req.body;
  try {
    const suggestions = await fetchSuggestionsWithProviders(title);
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching media suggestions:', error);
    res.status(500).send('Error fetching media suggestions');
  }
});

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
    const topMovies = await fetchContent('movie', 1, 'day'); // Fetching only the top movie
    if (topMovies.length > 0) {
      const topMovie = topMovies[0];
      res.json({
        title: topMovie.title,
        backdropUrl: `https://image.tmdb.org/t/p/original${topMovie.backdrop_path}`,
        overview: topMovie.overview,
        release_date: topMovie.release_date,
      });
    } else {
      res.status(404).send('No top daily movie found');
    }
  } catch (error) {
    console.error('Error fetching top daily movie:', error);
    res.status(500).send('Error fetching top daily movie');
  }
});

app.get('/api/trending-movies', async (req, res) => {
  try {
    const topMovies = await fetchContent('movie', 10, 'week'); // Always weekly
    res.json(topMovies);
  } catch (error) {
    console.error('Error fetching top streaming movies:', error);
    res.status(500).send('Error fetching top streaming movies');
  }
});

app.get('/api/trending-shows', async (req, res) => {
  try {
    const topShows = await fetchContent('tv', 10, 'week'); // Always weekly
    res.json(topShows);
  } catch (error) {
    console.error('Error fetching top trending shows:', error);
    res.status(500).send('Error fetching top trending shows');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
