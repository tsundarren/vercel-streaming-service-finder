import { MongoClient } from 'mongodb';
import DailyCache from '../models/daily-cache';
import WeeklyTrendingMovies from '../models/weekly-trending-movies';
import WeeklyTrendingShows from '../models/weekly-trending-shows';

const MONGO_URI = process.env.MONGODB_URI;

const clientPromise = MongoClient.connect(MONGO_URI);

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
