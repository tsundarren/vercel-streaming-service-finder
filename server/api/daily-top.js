import { fetchContent } from './fetchcontent';
import { updateCache } from './updatecache';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const topMovies = await fetchContent('movie', 1, 'day');
    if (topMovies.length > 0) {
      const topMovie = topMovies[0];
      await updateCache('movie', 'day');
      return res.status(200).json(topMovie);
    } else {
      return res.status(404).json({ error: 'No top daily movie found' });
    }
  } catch (error) {
    console.error('Error in /api/daily-top:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
