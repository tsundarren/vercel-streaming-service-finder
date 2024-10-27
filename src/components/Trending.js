import React, { useEffect, useState } from 'react';
import { fetchTopStreamingMovies, fetchTopTrendingShows } from '../services/api';
import '../css/Trending.css'; // Make sure you have this stylesheet for the styles

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
      <h2>Trending Movies</h2>
      <div className="trending-container">
        <div className="arrow left" onClick={() => document.getElementById('movies-scroll-container').scrollBy({ left: -200, behavior: 'smooth' })}>
          &lt;
        </div>
        <div className="scroll-container" id="movies-scroll-container">
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
                    {movie.streamingServices.map(service => (
                      <img key={service.provider_name} src={service.logoUrl} alt={service.provider_name} className="service-logo" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="arrow right" onClick={() => document.getElementById('movies-scroll-container').scrollBy({ left: 200, behavior: 'smooth' })}>
          &gt;
        </div>
      </div>

      <h2>Trending Series</h2>
      <div className="trending-container">
        <div className="arrow left" onClick={() => document.getElementById('shows-scroll-container').scrollBy({ left: -200, behavior: 'smooth' })}>
          &lt;
        </div>
        <div className="scroll-container" id="shows-scroll-container">
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
                    {show.streamingServices.map(service => (
                      <img key={service.provider_name} src={service.logoUrl} alt={service.provider_name} className="service-logo" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="arrow right" onClick={() => document.getElementById('shows-scroll-container').scrollBy({ left: 200, behavior: 'smooth' })}>
          &gt;
        </div>
      </div>
    </div>
  );
};

export default Trending;
