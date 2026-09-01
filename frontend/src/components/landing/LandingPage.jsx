import React from 'react';
import Hero from './Hero';
import Problem from './Problem';
import Features from './Features';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#FDFBF7', minHeight: '100vh' }}>
      <Hero />
      <Problem />
      <Features />
      <Footer />
    </div>
  );
}