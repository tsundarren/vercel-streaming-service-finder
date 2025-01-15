import React, { useEffect, useState } from 'react';
import { fetchTopStreamingMovies, fetchTopTrendingShows } from '../services/api';
import '../css/Trending.css';

const Trending = () => {
  const [topMovies, setTopMovies] = useState([]);
  const [topShows, setTopShows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const movies = await fetchTopStreamingMovies();
      setTopMovies(movies);

      const shows = await fetchTopTrendingShows();
      setTopShows(shows);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="divider">Trending Movies</h2>
      <div className="trending-container">
        {topMovies.map((movie) => (
          <div key={movie.id} className="movie-card">
            {movie.poster_path && (
              <div className="poster-container">
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  className="movie-poster"
                />
                <div className="overlay">
                  {movie.streamingServices.map((service) => (
                    <img
                      key={service.provider_name}
                      src={service.logoUrl}
                      alt={service.provider_name}
                      className="service-logo"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 className="divider">Trending Series</h2>
      <div className="trending-container">
        {topShows.map((show) => (
          <div key={show.id} className="movie-card">
            {show.poster_path && (
              <div className="poster-container">
                <img
                  src={`https://image.tmdb.org/t/p/w200${show.poster_path}`}
                  alt={show.name}
                  className="movie-poster"
                />
                <div className="overlay">
                  {show.streamingServices.map((service) => (
                    <img
                      key={service.provider_name}
                      src={service.logoUrl}
                      alt={service.provider_name}
                      className="service-logo"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trending;
