import React from 'react';
import { companyInfo } from '../../data/companyData';

/**
 * Hero Component - Hero sectie met bedrijfsinformatie
 *
 * Features:
 * - Prominente weergave van bedrijfsinfo
 * - Call-to-action buttons
 * - Belangrijke statistieken
 */

export const Hero: React.FC = () => {
  return (
    <section id="home" className="bg-gradient-to-br from-primary-50 to-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {companyInfo.name}
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-8">
            {companyInfo.tagline}
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            Al {companyInfo.yearsInBusiness} jaar uw betrouwbare partner voor sloten,
            sleutels en beveiligingssystemen in Dordrecht en omgeving.
          </p>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl font-bold text-primary-700 mb-2">
                {companyInfo.yearsInBusiness}+
              </div>
              <div className="text-gray-600">Jaar ervaring</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl font-bold text-primary-700 mb-2">
                {companyInfo.keyTypes.toLocaleString('nl-NL')}+
              </div>
              <div className="text-gray-600">Soorten sleutels</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl font-bold text-primary-700 mb-2">
                {companyInfo.brandCount}+
              </div>
              <div className="text-gray-600">Merken</div>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-800 transition-colors shadow-lg"
            >
              Neem Contact Op
            </a>
            <a
              href="#diensten"
              className="bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border-2 border-primary-700"
            >
              Bekijk Onze Diensten
            </a>
          </div>

          {/* Location Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📍</span>
                <span>
                  {companyInfo.contactInfo.address}, {companyInfo.contactInfo.postalCode}{' '}
                  {companyInfo.contactInfo.city}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🕐</span>
                <span>Di-Vr: 08:00 - 17:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
