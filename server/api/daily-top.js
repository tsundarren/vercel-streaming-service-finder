const express = require("express");
const app = express();
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

app.get('/api/daily-top', async (req, res) => {
    const topMovies = await fetchContent('movie', 1, 'day');
    if (topMovies.length > 0) {
      const topMovie = topMovies[0];
      await updateCache('movie', 'day');
      res.json(topMovie);
    } else {
      res.status(404).send('No top daily movie found');
    }
  });

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;