import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Function to fetch suggestions with streaming providers
export const fetchSuggestions = async (title) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/suggestions`, { title });
    return response.data;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    throw new Error('Failed to fetch movie suggestions');
  }
};

// Function to fetch movie details
export const fetchMovieDetails = async (title) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/search`, { title });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw new Error('Failed to fetch movie details');
  }
};

export const fetchDailyTopMovie = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/daily-top`);
    return response.data;
  } catch (error) {
    console.error('Error fetching daily top movie:', error);
    throw new Error('Failed to fetch daily top movie');
  }
};

// Function to fetch top streaming movies
export const fetchTopStreamingMovies = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trending-movies`);
    return response.data;
  } catch (error) {
    console.error('Error fetching top streaming movies:', error);
    throw new Error('Failed to fetch top streaming movies');
  }
};

// Function to fetch top trending shows
export const fetchTopTrendingShows = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trending-shows`);
    return response.data;
  } catch (error) {
    console.error('Error fetching top trending shows:', error);
    throw new Error('Failed to fetch top trending shows');
  }
};
