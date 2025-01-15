import { fetchContent, updateCache } from '../utils/utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const topShows = await fetchContent('tv', 10, 'week');
    await updateCache('tv', 'week');
    return res.status(200).json(topShows);
  } catch (error) {
    console.error('Error in /api/trending-shows:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
