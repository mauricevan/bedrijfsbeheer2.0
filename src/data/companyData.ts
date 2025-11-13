import type { CompanyInfo, Service, Product, Platform, Brand } from '../types';

/**
 * BTD Beveiliging Data
 * Gebaseerd op website scraping van https://www.btdbeveiliging.nl/
 */

export const companyInfo: CompanyInfo = {
  name: 'BTD BeveiligingsTechniek Dordrecht',
  tagline: 'Slot & Beveiligingsspecialist',
  yearsInBusiness: 43,
  keyTypes: 8000,
  brandCount: 30,
  rating: 4.9,
  contactInfo: {
    address: 'Merwedestraat 261',
    city: 'Dordrecht',
    postalCode: '3313 GT',
    phone: '078-6148148',
    email: 'info@btdbeveiliging.nl',
    hours: [
      { day: 'Maandag', open: 'Gesloten', close: '' },
      { day: 'Dinsdag', open: '08:00', close: '17:00' },
      { day: 'Woensdag', open: '08:00', close: '17:00' },
      { day: 'Donderdag', open: '08:00', close: '17:00' },
      { day: 'Vrijdag', open: '08:00', close: '17:00' },
      { day: 'Zaterdag', open: 'Gesloten', close: '' },
      { day: 'Zondag', open: 'Gesloten', close: '' },
    ],
  },
};

export const services: Service[] = [
  {
    id: 'autosleutels',
    name: 'Autosleutels',
    description: 'Professionele autosleutel service voor alle merken',
    icon: 'car',
  },
  {
    id: 'sleutels',
    name: 'Sleutels',
    description: '8000+ soorten sleutels op voorraad',
    icon: 'key',
  },
  {
    id: 'sloten',
    name: 'Sloten',
    description: 'Hoogwaardige sloten voor optimale beveiliging',
    icon: 'lock',
  },
  {
    id: 'sluitsystemen',
    name: 'Sluitsystemen',
    description: 'Moderne sluitsystemen op maat',
    icon: 'system',
  },
];

export const featuredProducts: Product[] = [
  {
    id: 'tedee-pro',
    name: 'Tedee Pro',
    description: 'Smart door oplossing - Uw deur slim in enkele minuten',
    features: [
      'Eenvoudige installatie',
      'Smart toegang via app',
      'Compatibel met bestaande sloten',
      'Veilig en betrouwbaar',
    ],
  },
  {
    id: 'iseo-libra',
    name: 'Iseo Libra',
    description: 'Draadloos toegangscontrolesysteem',
    features: [
      'SKG3 gecertificeerd',
      'IP69 weerbestendig',
      'Draadloze communicatie',
      'Gebruiksvriendelijk',
    ],
  },
];

export const platforms: Platform[] = [
  {
    id: 'plura',
    name: 'Plura Platform',
    type: 'budget',
    description: 'Budget-vriendelijke beveiligingscilinders',
    features: [
      'Betaalbare oplossing',
      'Betrouwbare kwaliteit',
      'Geschikt voor woningen',
      'Eenvoudige installatie',
    ],
  },
  {
    id: 'rs-sirius',
    name: 'rs Sirius Platform',
    type: 'mid-range',
    description: 'Mid-range systeem met kopieerbeveiliging',
    features: [
      'Kopieerbeveiliging',
      'Uitgebreid sleutelbeheer',
      'Geschikt voor bedrijven',
      'Professionele kwaliteit',
    ],
  },
  {
    id: 'ix-teco',
    name: 'ix Teco Platform',
    type: 'premium',
    description: 'Premium gepatenteerd keersleutelsysteem',
    features: [
      'Gepatenteerd systeem',
      'Hoogste beveiligingsniveau',
      'Restricted key system',
      'Complete toegangscontrole',
    ],
  },
];

export const brands: Brand[] = [
  { id: 'mul-t-lock', name: 'Mul-T-Lock' },
  { id: 'dom', name: 'Dom' },
  { id: 'iseo', name: 'Iseo' },
  { id: 'nemef', name: 'Nemef' },
  { id: 'abus', name: 'Abus' },
  { id: 'assa', name: 'Assa' },
  { id: 'evva', name: 'Evva' },
  { id: 'burg-wachter', name: 'Burg-Wächter' },
  { id: 'cisa', name: 'Cisa' },
  { id: 'yale', name: 'Yale' },
];
