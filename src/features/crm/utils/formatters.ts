/**
 * CRM Formatters
 * Format functies voor CRM weergave
 */

/**
 * Format phone number to Dutch format
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 10) {
    // 0123456789 -> 012-3456789
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }

  return phone; // Return as-is if doesn't match expected format
};

/**
 * Format address to single line
 */
export const formatAddress = (
  address?: string,
  postalCode?: string,
  city?: string
): string => {
  const parts = [address, postalCode, city].filter(Boolean);
  return parts.join(', ');
};

/**
 * Format company name with legal form
 */
export const formatCompanyName = (company?: string): string => {
  if (!company) return '';
  return company;
};

/**
 * Format VAT number
 */
export const formatVATNumber = (vat: string): string => {
  // NL123456789B01 format
  if (vat.length === 14 && vat.startsWith('NL')) {
    return `${vat.slice(0, 2)} ${vat.slice(2, 11)} B${vat.slice(12)}`;
  }
  return vat;
};

/**
 * Format lead source
 */
export const formatLeadSource = (source?: string): string => {
  if (!source) return 'Onbekend';

  const sources: Record<string, string> = {
    website: 'Website',
    referral: 'Verwijzing',
    'cold-call': 'Cold Call',
    advertisement: 'Advertentie',
    social: 'Social Media',
    event: 'Event',
    other: 'Anders'
  };

  return sources[source] || source;
};

/**
 * Format currency (reuse from inventory)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format date relative to now (bijv. "2 dagen geleden")
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Vandaag';
  if (diffDays === 1) return 'Gisteren';
  if (diffDays < 7) return `${diffDays} dagen geleden`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weken geleden`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} maanden geleden`;
  return `${Math.floor(diffDays / 365)} jaar geleden`;
};

/**
 * Format date to Dutch format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};
