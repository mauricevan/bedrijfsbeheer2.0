import React from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Home } from './pages/Home';
import './App.css';

/**
 * App Component - Root component
 *
 * Structuur:
 * - Header (sticky navigation)
 * - Main content (pages)
 * - Footer
 */

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow">
        <Home />
      </div>
      <Footer />
    </div>
  );
};

export default App;
