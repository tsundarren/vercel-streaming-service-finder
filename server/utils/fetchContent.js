import axios from 'axios';

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

export const fetchFromAPI = async (endpoint, params) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: { api_key: API_KEY, ...params },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching from API:', error);
    throw new Error('API request failed');
  }
};

export const fetchContent = async (type, maxItems, timeFrame) => {
  let topContent = [];
  let page = 1;

  while (topContent.length < maxItems) {
    const response = await fetchFromAPI(`/trending/${type}/${timeFrame}`, { page });
    for (const item of response.results) {
      const providers = await fetchFromAPI(`/${type}/${item.id}/watch/providers`);
      const streamingServices =
        providers.results?.US?.flatrate?.map((provider) => ({
          provider_name: provider.provider_name,
          logoUrl: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
        })) || [];
      if (streamingServices.length) {
        topContent.push({ ...item, streamingServices });
      }
      if (topContent.length >= maxItems) break;
    }
    page++;
  }
  return topContent;
};
