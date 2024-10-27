import React, { useEffect, useState } from 'react';
import { fetchDailyTopMovie } from '../services/api';
import '../css/DailyBanner.css';

const DailyBanner = () => {
  const [topMovie, setTopMovie] = useState(null);

  useEffect(() => {
    const fetchTopMovie = async () => {
      try {
        const movie = await fetchDailyTopMovie();
        setTopMovie(movie);
      } catch (error) {
        console.error('Error fetching top daily movie:', error);
      }
    };

    fetchTopMovie();
  }, []);

  if (!topMovie) return null;

  return (
    <div
      className="daily-banner"
      style={{ backgroundImage: `url(${topMovie.backdropUrl})` }}
    >
      <div className="banner-content">
        <h1>{topMovie.title}</h1>
        <p>{topMovie.overview}</p>
        <p>Release Date: {topMovie.release_date}</p>
      </div>
    </div>
  );
};

export default DailyBanner;
