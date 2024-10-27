// src/components/Result.js
import React from 'react';
import '../css/Result.css';

const Result = ({ movie, onClose }) => {
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('result-overlay')) {
      onClose(); // Close modal if clicking on overlay outside modal content
    }
  };

  // Logging to debug the issue
  console.log('Movie data:', movie);

  return (
    <div className="result-overlay" onClick={handleOverlayClick}>
      <div className="result-modal">
        <h2>{movie.title}</h2>
        {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} className="poster" />}
        <p>{movie.overview}</p>
        <p>Release Date: {movie.release_date}</p>
        <div>
          <h4>Available on:</h4>
          {movie.streamingServices && movie.streamingServices.length > 0 ? (
            movie.streamingServices.map((service, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <img src={service.logoUrl} alt={service.provider_name} style={{ width: '30px', marginRight: '10px' }} />
                <span>{service.provider_name}</span>
              </div>
            ))
          ) : (
            <p>Not available for streaming</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Result;
