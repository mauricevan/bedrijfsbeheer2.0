import React from 'react';
import { companyInfo } from '../../data/companyData';

/**
 * Contact Component - Contact informatie sectie
 *
 * Features:
 * - Volledige contact gegevens
 * - Openingstijden
 * - Locatie informatie
 * - Direct contact links
 */

export const Contact: React.FC = () => {
  const { contactInfo } = companyInfo;

  return (
    <section id="contact" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Neem Contact Op
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Heeft u vragen of wilt u een afspraak maken? Wij staan voor u klaar!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Gegevens
              </h3>

              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <span className="text-3xl">📍</span>
                  <div>
                    <div className="font-semibold text-gray-900">Adres</div>
                    <div className="text-gray-600">
                      {contactInfo.address}<br />
                      {contactInfo.postalCode} {contactInfo.city}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <span className="text-3xl">📞</span>
                  <div>
                    <div className="font-semibold text-gray-900">Telefoon</div>
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="text-primary-700 hover:text-primary-800 transition-colors"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <span className="text-3xl">✉️</span>
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-primary-700 hover:text-primary-800 transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Openingstijden
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-3">
                  {contactInfo.hours.map((day) => (
                    <div
                      key={day.day}
                      className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-b-0"
                    >
                      <span className="font-medium text-gray-900">{day.day}</span>
                      <span className="text-gray-600">
                        {day.open === 'Gesloten' ? (
                          <span className="text-red-600">Gesloten</span>
                        ) : (
                          `${day.open} - ${day.close}`
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Stuur ons een bericht
            </h3>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Naam *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Uw naam"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="uw.email@voorbeeld.nl"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefoon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="06-12345678"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Bericht *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Waar kunnen wij u mee helpen?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
              >
                Verstuur Bericht
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
