import React from 'react';
import { Hero } from '../components/home/Hero';
import { Services } from '../components/home/Services';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { Platforms } from '../components/home/Platforms';
import { Brands } from '../components/home/Brands';
import { Contact } from '../components/home/Contact';

/**
 * Home Page - BTD Beveiliging Homepage
 *
 * Orchestreert alle homepage secties
 */

export const Home: React.FC = () => {
  return (
    <main>
      <Hero />
      <Services />
      <FeaturedProducts />
      <Platforms />
      <Brands />
      <Contact />
    </main>
  );
};
