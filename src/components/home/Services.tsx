import React from 'react';
import { services } from '../../data/companyData';

/**
 * Services Component - Diensten overzicht sectie
 *
 * Features:
 * - Grid layout van diensten
 * - Icon weergave per dienst
 * - Responsive design
 */

export const Services: React.FC = () => {
  const iconMap: Record<string, string> = {
    car: '🚗',
    key: '🔑',
    lock: '🔒',
    system: '🔐',
  };

  return (
    <section id="diensten" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Onze Diensten
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Specialist in sloten, sleutels en beveiligingssystemen voor particulier en zakelijk
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="text-6xl mb-4">{iconMap[service.icon]}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {service.name}
              </h3>
              <p className="text-gray-600">{service.description}</p>
              <a
                href={`#${service.id}`}
                className="inline-block mt-4 text-primary-700 font-semibold hover:text-primary-800 transition-colors"
              >
                Meer informatie →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
