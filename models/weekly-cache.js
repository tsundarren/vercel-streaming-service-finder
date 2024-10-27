const mongoose = require('mongoose');

const WeeklyCacheSchema = new mongoose.Schema({
  title: { type: String, required: true },
  overview: { type: String, required: true },
  release_date: { type: String, required: true },
  backdropUrl: { type: String, required: true },
  streamingServices: [{
    provider_name: { type: String, required: true },
    logoUrl: { type: String, required: true }
  }]
}, { timestamps: true }); // Include timestamps for createdAt and updatedAt

module.exports = mongoose.model('WeeklyCache', WeeklyCacheSchema);