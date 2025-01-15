import React from 'react';
import Trending from './components/Trending';
import DailyBanner from './components/DailyBanner';
import './App.css'; // Import the new CSS file

const App = () => {
  return (
    <div className="app-container">
      <DailyBanner />
      <Trending />
    </div>
  );
};

export default App;
