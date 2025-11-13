import React from 'react';
import { platforms } from '../../data/companyData';

/**
 * Platforms Component - Lock system platforms sectie
 *
 * Features:
 * - 3 platforms: Budget, Mid-range, Premium
 * - Feature highlights per platform
 * - Visual hierarchy per type
 */

export const Platforms: React.FC = () => {
  const badgeColors: Record<string, string> = {
    budget: 'bg-green-100 text-green-800',
    'mid-range': 'bg-blue-100 text-blue-800',
    premium: 'bg-purple-100 text-purple-800',
  };

  const typeLabels: Record<string, string> = {
    budget: 'Budget-vriendelijk',
    'mid-range': 'Mid-range',
    premium: 'Premium',
  };

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Sleutelsysteem Platforms
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Modulaire sleutel- en slotplatforms voor elke beveiligingsbehoefte
          </p>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-gray-100"
            >
              <div className="p-8">
                {/* Type Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      badgeColors[platform.type]
                    }`}
                  >
                    {typeLabels[platform.type]}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {platform.name}
                </h3>
                <p className="text-gray-600 mb-6">{platform.description}</p>

                {/* Features List */}
                <ul className="space-y-3 mb-6">
                  {platform.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-primary-700 font-bold text-lg flex-shrink-0">
                        •
                      </span>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-primary-700">
                  Vraag Advies Aan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
