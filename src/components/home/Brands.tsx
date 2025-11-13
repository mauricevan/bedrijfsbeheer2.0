import React from 'react';
import { brands } from '../../data/companyData';

/**
 * Brands Component - Merken overzicht sectie
 *
 * Features:
 * - Grid layout van merken
 * - Responsive grid
 * - Clean minimalistic design
 */

export const Brands: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Onze Merken
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Wij werken met meer dan 30 toonaangevende beveiligingsmerken
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center hover:shadow-lg transition-shadow"
            >
              <span className="text-gray-700 font-semibold text-center">
                {brand.name}
              </span>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            En nog vele andere kwaliteitsmerken. Neem contact op voor meer informatie.
          </p>
        </div>
      </div>
    </section>
  );
};
