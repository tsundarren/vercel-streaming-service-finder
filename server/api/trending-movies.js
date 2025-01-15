// /api/trendingMovies.js
const { fetchContent, updateCache } = require('../services/cacheUtils');

module.exports = async (req, res) => {
  try {
    const topMovies = await fetchContent('movie', 10, 'week');
    await updateCache('movie', 'week');
    return res.status(200).json(topMovies);
  } catch (error) {
    console.error('Error fetching top trending movies:', error);
    return res.status(500).send('Error fetching top trending movies');
  }
};
