import axios from 'axios';
import cors from 'cors';
import { updateCache, fetchContent } from './utils';

const corsHandler = cors({
  origin: 'https://streaming-service-finder.vercel.app',
  methods: ['GET', 'POST'],
  credentials: true,
});

export default async (req, res) => {
  await new Promise((resolve, reject) => {
    corsHandler(req, res, () => resolve());
  });

  if (req.method === 'GET') {
    try {
      const topMovies = await fetchContent('movie', 10, 'week');
      res.status(200).json(topMovies);
      await updateCache('movie', 'week');
    } catch (error) {
      res.status(500).send('Error fetching top streaming movies');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
};
