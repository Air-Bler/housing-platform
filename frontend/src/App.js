// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import EstimatorPage from './pages/EstimatorPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/estimator" element={<EstimatorPage />} />
        <Route path="/renovation" element={<div style={{ padding: '2rem' }}><h2>Renovation ROI Component (In Progress)</h2></div>} />
        <Route path="/heatmap" element={<div style={{ padding: '2rem' }}><h2>Interactive Heatmap Component (In Progress)</h2></div>} />
      </Routes>
    </Router>
  );
}

export default App;