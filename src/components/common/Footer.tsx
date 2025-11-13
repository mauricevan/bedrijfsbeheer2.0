import React from 'react';
import { companyInfo } from '../../data/companyData';

/**
 * Footer Component - Website footer
 *
 * Features:
 * - Bedrijfsinformatie
 * - Social media links
 * - Copyright informatie
 */

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">{companyInfo.name}</h3>
            <p className="text-gray-400 mb-4">
              Al {companyInfo.yearsInBusiness} jaar uw betrouwbare partner voor sloten,
              sleutels en beveiligingssystemen.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              <span className="text-gray-400">{companyInfo.rating} Google Reviews</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Diensten</h3>
            <ul className="space-y-2">
              <li>
                <a href="#autosleutels" className="text-gray-400 hover:text-white transition-colors">
                  Autosleutels
                </a>
              </li>
              <li>
                <a href="#sleutels" className="text-gray-400 hover:text-white transition-colors">
                  Sleutels
                </a>
              </li>
              <li>
                <a href="#sloten" className="text-gray-400 hover:text-white transition-colors">
                  Sloten
                </a>
              </li>
              <li>
                <a href="#sluitsystemen" className="text-gray-400 hover:text-white transition-colors">
                  Sluitsystemen
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                {companyInfo.contactInfo.address}<br />
                {companyInfo.contactInfo.postalCode} {companyInfo.contactInfo.city}
              </li>
              <li>
                <a
                  href={`tel:${companyInfo.contactInfo.phone}`}
                  className="hover:text-white transition-colors"
                >
                  {companyInfo.contactInfo.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${companyInfo.contactInfo.email}`}
                  className="hover:text-white transition-colors"
                >
                  {companyInfo.contactInfo.email}
                </a>
              </li>
            </ul>

            {/* Social Media Links */}
            <div className="mt-6 flex gap-4">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <span className="text-2xl">💼</span>
              </a>
              <a
                href="https://wa.me/31786148148"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <span className="text-2xl">💬</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            © {currentYear} {companyInfo.name}. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
};
