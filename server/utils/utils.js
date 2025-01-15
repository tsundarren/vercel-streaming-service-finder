import axios from 'axios';
import { MongoClient } from 'mongodb';
import DailyCache from '../models/daily-cache';
import WeeklyTrendingMovies from '../models/weekly-trending-movies';
import WeeklyTrendingShows from '../models/weekly-trending-shows';

// API Constants
const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;
const MONGO_URI = process.env.MONGODB_URI;

// MongoDB Connection
const clientPromise = MongoClient.connect(MONGO_URI);

// Fetch Data from API
export const fetchFromAPI = async (endpoint, params) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: { api_key: API_KEY, ...params },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching from API:', error);
    throw new Error('API request failed');
  }
};

// Fetch Content (Movies/Shows)
export const fetchContent = async (type, maxItems, timeFrame) => {
  let topContent = [];
  let page = 1;

  while (topContent.length < maxItems) {
    const response = await fetchFromAPI(`/trending/${type}/${timeFrame}`, { page });
    for (const item of response.results) {
      const providers = await fetchFromAPI(`/${type}/${item.id}/watch/providers`);
      const streamingServices =
        providers.results?.US?.flatrate?.map((provider) => ({
          provider_name: provider.provider_name,
          logoUrl: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
        })) || [];
      if (streamingServices.length) {
        topContent.push({ ...item, streamingServices });
      }
      if (topContent.length >= maxItems) break;
    }
    page++;
  }
  return topContent;
};

// Update Cache Function
export const updateCache = async (mediaType, frequency) => {
  const client = await clientPromise;
  const db = client.db('your-database-name');

  const isDaily = frequency === 'day';
  const cacheModel = isDaily
    ? DailyCache
    : mediaType === 'movie'
    ? WeeklyTrendingMovies
    : WeeklyTrendingShows;

  const maxItems = isDaily ? 1 : 10;
  const topContent = await fetchContent(mediaType, maxItems, frequency);

  if (topContent.length > 0) {
    await cacheModel.deleteMany({});
    const cacheData = topContent.map((item) => ({
      title: item.title || item.name,
      overview: item.overview || 'No overview available',
      release_date: item.release_date || item.first_air_date,
      posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      streamingServices: item.streamingServices || [],
    }));
    await cacheModel.insertMany(cacheData);
  }
};
