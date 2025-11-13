import React from 'react';
import { featuredProducts } from '../../data/companyData';

/**
 * FeaturedProducts Component - Uitgelichte producten sectie
 *
 * Features:
 * - Grid layout van featured producten
 * - Feature list per product
 * - Responsive design
 */

export const FeaturedProducts: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Uitgelichte Producten
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            De nieuwste technologieën in slimme toegangscontrole en beveiliging
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-6">{product.description}</p>

                {/* Features List */}
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-primary-700 font-bold text-xl flex-shrink-0">
                        ✓
                      </span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className="mt-6 w-full bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors">
                  Meer Informatie
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
