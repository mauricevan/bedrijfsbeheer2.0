/**
 * BTD Beveiliging Type Definitions
 * Voorbereid voor backend integratie
 */

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  features: string[];
  image?: string;
}

export interface Platform {
  id: string;
  name: string;
  type: 'budget' | 'mid-range' | 'premium';
  description: string;
  features: string[];
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
}

export interface ContactInfo {
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  yearsInBusiness: number;
  keyTypes: number;
  brandCount: number;
  rating: number;
  contactInfo: ContactInfo;
}
