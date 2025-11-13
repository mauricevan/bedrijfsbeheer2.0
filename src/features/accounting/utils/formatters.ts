/**
 * Accounting Formatters
 * Pure formatting functies voor accounting module
 */

// ============================================================================
// CURRENCY FORMATTERS
// ============================================================================

/**
 * Formatteer bedrag als EUR currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatteer currency voor charts (kort formaat)
 */
export const formatCurrencyForChart = (amount: number): string => {
  if (amount >= 1000000) {
    return `€${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `€${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
};

/**
 * Formatteer currency compact (zonder decimalen als niet nodig)
 */
export const formatCurrencyCompact = (amount: number): string => {
  const isWholeNumber = amount % 1 === 0;

  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: isWholeNumber ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// ============================================================================
// PERCENTAGE FORMATTERS
// ============================================================================

/**
 * Formatteer percentage
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formatteer ratio als percentage
 */
export const formatRatioAsPercentage = (numerator: number, denominator: number, decimals: number = 0): string => {
  if (denominator === 0) return '0%';

  const percentage = (numerator / denominator) * 100;
  return formatPercentage(percentage, decimals);
};

// ============================================================================
// DATE FORMATTERS
// ============================================================================

/**
 * Formatteer datum naar Nederlands formaat
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Formatteer datum naar ISO formaat (YYYY-MM-DD)
 */
export const formatDateISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Formatteer datum naar lang Nederlands formaat
 */
export const formatDateLong = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Formatteer datum met tijd
 */
export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatteer date range
 */
export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Formatteer maand + jaar
 */
export const formatMonthYear = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString('nl-NL', {
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Formatteer relatieve tijd (bijv. "2 dagen geleden")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();

  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Vandaag';
  if (diffDays === 1) return 'Gisteren';
  if (diffDays < 7) return `${diffDays} dagen geleden`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weken geleden`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} maanden geleden`;

  return `${Math.floor(diffDays / 365)} jaar geleden`;
};

// ============================================================================
// NUMBER FORMATTERS
// ============================================================================

/**
 * Formatteer nummer met Nederlandse locale
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('nl-NL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formatteer nummer zonder decimalen
 */
export const formatWholeNumber = (value: number): string => {
  return new Intl.NumberFormat('nl-NL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formatteer hours (uren)
 */
export const formatHours = (hours: number): string => {
  if (hours === 1) return '1 uur';
  return `${formatNumber(hours, 1)} uur`;
};

/**
 * Formatteer quantity met unit
 */
export const formatQuantity = (quantity: number, unit?: string): string => {
  const formattedQty = formatNumber(quantity, quantity % 1 === 0 ? 0 : 2);
  return unit ? `${formattedQty} ${unit}` : formattedQty;
};

// ============================================================================
// STATUS FORMATTERS
// ============================================================================

/**
 * Formatteer quote status naar Nederlands
 */
export const formatQuoteStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: 'Concept',
    sent: 'Verzonden',
    approved: 'Goedgekeurd',
    rejected: 'Afgewezen',
    expired: 'Verlopen',
  };

  return statusMap[status] || status;
};

/**
 * Formatteer invoice status naar Nederlands
 */
export const formatInvoiceStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: 'Concept',
    sent: 'Verzonden',
    paid: 'Betaald',
    overdue: 'Verlopen',
    cancelled: 'Geannuleerd',
  };

  return statusMap[status] || status;
};

/**
 * Formatteer workorder status naar Nederlands
 */
export const formatWorkOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    todo: 'Te doen',
    pending: 'In afwachting',
    in_progress: 'In uitvoering',
    completed: 'Afgerond',
  };

  return statusMap[status] || status;
};

// ============================================================================
// DOCUMENT NUMBER FORMATTERS
// ============================================================================

/**
 * Formatteer quote number
 */
export const formatQuoteNumber = (id: string): string => {
  // Assume format: Q2025-001
  return id;
};

/**
 * Formatteer invoice number
 */
export const formatInvoiceNumber = (id: string): string => {
  // Assume format: 2025-001
  return id;
};

/**
 * Formatteer invoice number met prefix
 */
export const formatInvoiceNumberWithPrefix = (id: string): string => {
  return `Factuur ${id}`;
};

/**
 * Formatteer quote number met prefix
 */
export const formatQuoteNumberWithPrefix = (id: string): string => {
  return `Offerte ${id}`;
};

// ============================================================================
// PAYMENT FORMATTERS
// ============================================================================

/**
 * Formatteer payment term (aantal dagen)
 */
export const formatPaymentTerm = (days: number): string => {
  if (days === 0) return 'Direct';
  if (days === 1) return '1 dag';
  return `${days} dagen`;
};

/**
 * Formatteer betalingsstatus met deadline info
 */
export const formatPaymentStatus = (dueDate: string, isPaid: boolean): string => {
  if (isPaid) return 'Betaald';

  const today = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} dagen te laat`;
  if (diffDays === 0) return 'Vervalt vandaag';
  if (diffDays === 1) return 'Vervalt morgen';
  if (diffDays <= 7) return `Vervalt over ${diffDays} dagen`;

  return `Vervalt ${formatDate(dueDate)}`;
};

// ============================================================================
// LIST FORMATTERS
// ============================================================================

/**
 * Formatteer lijst van items met komma's en 'en'
 */
export const formatList = (items: string[]): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} en ${items[1]}`;

  const last = items[items.length - 1];
  const rest = items.slice(0, -1);

  return `${rest.join(', ')}, en ${last}`;
};

/**
 * Formatteer file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// ============================================================================
// PLACEHOLDER FORMATTERS
// ============================================================================

/**
 * Formatteer waarde of toon placeholder
 */
export const formatOrPlaceholder = (value: string | null | undefined, placeholder: string = '-'): string => {
  return value && value.trim() !== '' ? value : placeholder;
};

/**
 * Formatteer nummer of toon placeholder
 */
export const formatNumberOrPlaceholder = (value: number | null | undefined, placeholder: string = '-'): string => {
  return value !== null && value !== undefined ? formatNumber(value) : placeholder;
};
