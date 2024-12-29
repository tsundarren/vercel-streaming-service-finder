import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export const fetchDailyTopMovie = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/daily-top`);
    const movie = response.data;
    return {
      title: movie.title || movie.name,
      overview: movie.overview,
      backdropUrl: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
    };
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
