const mongoose = require('mongoose');

const WeeklyTrendingMoviesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  overview: { type: String, required: true },
  release_date: { type: String, required: true },
  posterUrl: { type: String, required: true },
  streamingServices: [{
    provider_name: { type: String, required: true },
    logoUrl: { type: String, required: true },
  }]
}, { timestamps: true });

module.exports = mongoose.model('WeeklyTrendingMovies', WeeklyTrendingMoviesSchema);
