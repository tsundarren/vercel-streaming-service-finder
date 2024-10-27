import React, { useState, useRef } from 'react';
import { fetchSuggestions, fetchMovieDetails } from '../services/api';
import Result from './Result';
import '../css/SearchComponent.css';

const SearchComponent = () => {
  const [title, setTitle] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const suggestionsRef = useRef(null);

  const handleSearch = async (searchTitle = title) => {
    setError(null);
    setTitle('');
    setSuggestions([]);
    try {
      const response = await fetchMovieDetails(searchTitle);
      if (response) {
        setResult(response);
      } else {
        setResult(null);
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch streaming information.');
      setResult(null);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setTitle(suggestion.title);
    handleSearch(suggestion.title);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    if (value.length > 2) {
      fetchSuggestions(value)
        .then(setSuggestions)
        .catch(console.error);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(title);
    }
  };

  const handleBlur = (e) => {
    // Timeout to allow click event to register on suggestion
    setTimeout(() => {
      setSuggestions([]);
    }, 100);
  };

  const closeResult = () => {
    setResult(null);
  };

  return (
    <div className="search-component">
      <input
        type="text"
        value={title}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Enter movie/series title"
      />
      {error && <p>{error}</p>}
      {suggestions.length > 0 && (
        <ul className="suggestions" ref={suggestionsRef}>
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion.title}
              <div>
                <h4>Available on:</h4>
                {suggestion.streamingServices && suggestion.streamingServices.length > 0 ? (
                  suggestion.streamingServices.map((service, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                      <img src={service.logoUrl} alt={service.provider_name} style={{ width: '30px', marginRight: '10px' }} />
                      <span>{service.provider_name}</span>
                    </div>
                  ))
                ) : (
                  <p>Not available for streaming</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {result && <Result movie={result} onClose={closeResult} />}
    </div>
  );
};

export default SearchComponent;
