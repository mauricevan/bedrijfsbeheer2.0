import React, { useState } from 'react';
import { companyInfo } from '../../data/companyData';

/**
 * Header Component - Navigatie en bedrijfsinfo
 *
 * Features:
 * - Responsive navigatie met hamburger menu
 * - Contact informatie in header
 * - Sticky navigation
 */

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Home', href: '#home' },
    { name: 'Autosleutels', href: '#autosleutels' },
    { name: 'Sleutels', href: '#sleutels' },
    { name: 'Sloten', href: '#sloten' },
    { name: 'Sluitsystemen', href: '#sluitsystemen' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar met contact info */}
      <div className="bg-primary-700 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm gap-2">
            <div className="flex items-center gap-4">
              <a
                href={`tel:${companyInfo.contactInfo.phone}`}
                className="hover:text-primary-200 transition-colors"
              >
                📞 {companyInfo.contactInfo.phone}
              </a>
              <a
                href={`mailto:${companyInfo.contactInfo.email}`}
                className="hover:text-primary-200 transition-colors hidden sm:inline"
              >
                ✉️ {companyInfo.contactInfo.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span>⭐ {companyInfo.rating} Google Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-700">
              {companyInfo.name}
            </h1>
            <p className="text-xs text-gray-600 hidden sm:block">
              {companyInfo.tagline}
            </p>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary-700 font-medium transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-700 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            {mobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-primary-700 hover:bg-gray-50 px-3 py-2 rounded-md font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
