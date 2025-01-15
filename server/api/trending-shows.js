const express = require("express");
const app = express();
import axios from 'axios';
import cors from 'cors';
import { updateCache, fetchContent } from './utils';

const corsHandler = cors({
  origin: 'https://streaming-service-finder.vercel.app',
  methods: ['GET', 'POST'],
  credentials: true,
});

app.get('/api/trending-shows', async (req, res) => {
    try {
      const topShows = await fetchContent('tv', 10, 'week');
      res.json(topShows);
      await updateCache('tv', 'week');
    } catch (error) {
      res.status(500).send('Error fetching top trending shows');
    }
  });

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;