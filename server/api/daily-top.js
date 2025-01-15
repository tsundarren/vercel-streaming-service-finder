import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { updateCache, fetchContent } from './utils'; // Assume utils is set up correctly

const app = express();

const corsHandler = cors({
  origin: 'https://streaming-service-finder.vercel.app',
  methods: ['GET', 'POST'],
  credentials: true,
});

app.use(corsHandler);

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

app.get('/api/daily-top', async (req, res) => {
  try {
    const topMovies = await fetchContent('movie', 1, 'day');
    if (topMovies.length > 0) {
      const topMovie = topMovies[0];
      await updateCache('movie', 'day');
      res.json(topMovie);
    } else {
      res.status(404).send('No top daily movie found');
    }
  } catch (error) {
    console.error('Error fetching daily top movie:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Export the handler for Vercel
export default app;
