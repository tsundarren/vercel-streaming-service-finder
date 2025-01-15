import { fetchContent } from './fetchcontent';
import { updateCache } from './updatecache';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const topMovies = await fetchContent('movie', 10, 'week');
    await updateCache('movie', 'week');
    return res.status(200).json(topMovies);
  } catch (error) {
    console.error('Error in /api/trending-movies:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
