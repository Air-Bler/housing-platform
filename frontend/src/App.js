import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import LandingPage from "./pages/LandingPage";
import EstimatorPage from "./pages/EstimatorPage";
import PriceMapPage from "./pages/PriceMapPage";
import RenovationPage from "./pages/RenovationPage";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/estimator" element={<EstimatorPage />} />

        <Route path="/renovation" element={<RenovationPage />} />

        <Route path="/heatmap" element={<PriceMapPage />} />
        <Route path="/prices" element={<PriceMapPage />} />
        <Route path="/map" element={<PriceMapPage />} />
      </Routes>
    </Router>
  );
}

export default App;