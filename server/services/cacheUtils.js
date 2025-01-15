// /services/cacheUtils.js
const axios = require('axios');
const mongoose = require('mongoose');
const DailyCache = require('../models/daily-cache');
const WeeklyTrendingMovies = require('../models/weekly-trending-movies');
const WeeklyTrendingShows = require('../models/weekly-trending-shows');

const MONGO_URI = process.env.MONGODB_URI;
const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const fetchFromAPI = async (endpoint, params) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, { params: { api_key: API_KEY, ...params } });
    return response.data;
  } catch (error) {
    console.error('API request failed:', error);
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
        topContent.push({ ...item, streamingServices });

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
  const isDaily = frequency === 'day';
  const cacheModel = isDaily ? DailyCache : mediaType === 'movie' ? WeeklyTrendingMovies : WeeklyTrendingShows;

  const maxItems = isDaily ? 1 : 10;
  const topContent = await fetchContent(mediaType, maxItems, frequency);

  if (topContent.length === 0) return;

  const existingCache = await cacheModel.find({});
  const existingCacheTitles = existingCache.map(item => item.title || item.name);

  const newContent = topContent.filter(item => !existingCacheTitles.includes(item.title || item.name));

  if (newContent.length === 0) return;

  await cacheModel.deleteMany({});
  const cacheData = newContent.map(item => ({
    title: item.title || item.name,
    overview: item.overview || 'No overview available',
    release_date: item.release_date || item.first_air_date,
    posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'defaultPosterUrl',
    backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : 'defaultBackdropUrl',
    streamingServices: item.streamingServices || [],
  }));

  await cacheModel.insertMany(cacheData);
};

module.exports = { fetchContent, updateCache };
