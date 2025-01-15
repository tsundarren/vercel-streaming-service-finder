import axios from 'axios';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { updateCache, fetchContent } from './utils';  // utility functions can be moved to a separate file

const corsHandler = cors({
  origin: 'https://streaming-service-finder.vercel.app',
  methods: ['GET', 'POST'],
  credentials: true,
});

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

export default async (req, res) => {
  await new Promise((resolve, reject) => {
    corsHandler(req, res, () => resolve());
  });

  if (req.method === 'GET') {
    try {
      const topMovies = await fetchContent('movie', 1, 'day');
      if (topMovies.length > 0) {
        const topMovie = topMovies[0];
        await updateCache('movie', 'day');
        res.status(200).json(topMovie);
      } else {
        res.status(404).send('No top daily movie found');
      }
    } catch (error) {
      res.status(500).send('Error fetching daily top movie');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
};
