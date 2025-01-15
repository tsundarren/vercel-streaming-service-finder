// /api/trendingShows.js
const { fetchContent, updateCache } = require('../services/cacheUtils');

module.exports = async (req, res) => {
  try {
    const topShows = await fetchContent('tv', 10, 'week');
    await updateCache('tv', 'week');
    return res.status(200).json(topShows);
  } catch (error) {
    console.error('Error fetching top trending shows:', error);
    return res.status(500).send('Error fetching top trending shows');
  }
};
