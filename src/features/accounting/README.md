# Accounting Module

## Overzicht
Business logic voor accounting features: Quotes, Invoices, Transactions.

## Structuur
```
accounting/
├── types/       # TypeScript types & interfaces
│   ├── accounting.types.ts  # Accounting-specifieke helper types
│   └── index.ts             # Barrel file
├── utils/       # Pure utility functions
│   ├── helpers.ts           # Helper functies (getEmployeeName, getStatusColor, etc.)
│   ├── calculations.ts      # Berekeningsfuncties (totalen, statistieken, etc.)
│   ├── validators.ts        # Validatie functies (forms, items, transitions, etc.)
│   ├── formatters.ts        # Formatting functies (currency, dates, etc.)
│   ├── filters.ts           # Filter en sort functies
│   └── index.ts             # Barrel file
├── services/    # Business logic (pure functions)
│   ├── quoteService.ts      # Quote CRUD en business logic
│   ├── invoiceService.ts    # Invoice CRUD en business logic
│   ├── transactionService.ts# Transaction analysis en grouping
│   └── index.ts             # Barrel file
├── hooks/       # React hooks (bestaand)
│   ├── useQuotes.ts         # Quote state management
│   ├── useInvoices.ts       # Invoice state management
│   └── index.ts             # Barrel file
└── index.ts     # Main barrel file
```

## Usage

### Import Types
```typescript
import type {
  QuoteFilterOptions,
  InvoiceFilterOptions,
  ValidationResult,
  QuoteTotals,
  InvoiceTotals,
} from '@/features/accounting/types';
```

### Import Utilities
```typescript
// Helpers
import {
  getEmployeeName,
  getCustomerName,
  getQuoteStatusColor,
  isInvoiceOverdue,
} from '@/features/accounting/utils';

// Calculations
import {
  calculateQuoteTotals,
  calculateInvoiceTotals,
  calculateAveragePaymentDays,
} from '@/features/accounting/utils';

// Validators
import {
  validateQuoteForm,
  validateInvoiceForm,
  validateQuoteToInvoice,
} from '@/features/accounting/utils';

// Formatters
import {
  formatCurrency,
  formatDate,
  formatPercentage,
} from '@/features/accounting/utils';

// Filters
import {
  filterQuotes,
  filterInvoices,
  filterTransactions,
} from '@/features/accounting/utils';
```

### Import Services
```typescript
// Quote Service
import {
  createQuote,
  updateQuote,
  cloneQuote,
  convertQuoteToInvoice,
  syncQuoteToWorkOrder,
} from '@/features/accounting/services';

// Invoice Service
import {
  createInvoice,
  updateInvoice,
  cloneInvoice,
  markInvoiceAsPaid,
  checkAndUpdateOverdueStatus,
} from '@/features/accounting/services';

// Transaction Service
import {
  groupTransactionsByMonth,
  calculateTotalsByCategory,
  sortTransactionsByDateDesc,
} from '@/features/accounting/services';
```

### Import Hooks
```typescript
import { useQuotes, useInvoices } from '@/features/accounting/hooks';

function MyComponent() {
  const {
    quotes,
    stats,
    addQuote,
    updateQuote,
    deleteQuote,
  } = useQuotes(initialQuotes);

  const {
    invoices,
    stats: invoiceStats,
    addInvoice,
    markAsPaid,
  } = useInvoices(initialInvoices);
}
```

## Features

### Quote Management
- ✅ Create, Read, Update, Delete quotes
- ✅ Quote status management (draft → sent → approved/rejected)
- ✅ Clone quotes
- ✅ Convert quotes naar invoices
- ✅ Sync quotes met werkorders
- ✅ Quote item management
- ✅ Quote totals berekening (subtotal, VAT, total)
- ✅ Quote validation

### Invoice Management
- ✅ Create, Read, Update, Delete invoices
- ✅ Invoice status management (draft → sent → paid/overdue)
- ✅ Clone invoices
- ✅ Mark invoices as paid
- ✅ Overdue detection en status updates
- ✅ Invoice item management
- ✅ Invoice totals berekening
- ✅ Invoice validation
- ✅ Payment reminders

### Transaction Management
- ✅ Transaction filtering (type, category, date range)
- ✅ Transaction grouping (by month, year, category)
- ✅ Transaction sorting
- ✅ Transaction statistics
- ✅ Running balance calculation
- ✅ Outlier detection

### Utilities
- ✅ 50+ pure utility functies
- ✅ Currency formatting (EUR, compact, voor charts)
- ✅ Date formatting (Nederlands, ISO, relative)
- ✅ Percentage formatting
- ✅ Status color mapping
- ✅ Comprehensive validation
- ✅ Advanced filtering en sorting

## Status
- ✅ FASE 1: Types (voltooid)
- ✅ FASE 2: Utils (voltooid) - 5 utility modules
- ✅ FASE 3: Services (voltooid) - 3 service modules
- ⏳ FASE 4: Hooks (bestaand: useQuotes, useInvoices)
- ⏳ FASE 5-10: Components & Pages (pending)

## Implementatie Details

### Pure Functions
Alle utils en services zijn **pure functies**:
- ✅ Geen React dependencies (useState, useEffect, etc.)
- ✅ Geen side effects
- ✅ Deterministisch (zelfde input = zelfde output)
- ✅ Testbaar zonder React testing library
- ✅ Type-safe met TypeScript strict mode

### TypeScript
- ✅ Strict mode compliant
- ✅ Volledig getypeerd (geen `any`)
- ✅ Helper types voor filters, validatie, forms
- ✅ Result types met error handling

### Error Handling
Services retourneren altijd een result object:
```typescript
const { quote, error } = createQuote(input, existingQuotes);
if (error) {
  // Handle error
  console.error(error);
  return;
}
// Use quote
```

### Validation
Validators retourneren een `ValidationResult`:
```typescript
const validation = validateQuoteForm(formData);
if (!validation.isValid) {
  validation.errors.forEach(err => {
    console.log(`${err.field}: ${err.message}`);
  });
}
```

## Testing
```bash
npm run build       # TypeScript compilation
npm run lint        # Code quality
```

## Voorbeeld Workflow

### Quote → Invoice Flow
```typescript
import {
  createQuote,
  convertQuoteToInvoice,
  updateQuoteStatus
} from '@/features/accounting/services';

// 1. Maak quote
const { quote, error } = createQuote({
  customerId: 'customer-1',
  customerName: 'ACME Corp',
  items: [...],
  laborHours: 10,
  hourlyRate: 75,
  vatRate: 21,
  createdBy: 'user-1',
}, existingQuotes);

// 2. Update status naar sent
const { quote: sentQuote } = updateQuoteStatus(quote.id, 'sent', existingQuotes);

// 3. Update status naar approved
const { quote: approvedQuote } = updateQuoteStatus(quote.id, 'approved', existingQuotes);

// 4. Convert naar invoice
const { invoice } = convertQuoteToInvoice(
  quote.id,
  existingQuotes,
  existingInvoices,
  'user-1'
);
```

## Dependencies
- **Core Types**: `src/types/index.ts` (Quote, Invoice, Transaction, etc.)
- **React** (alleen voor hooks): `useQuotes.ts`, `useInvoices.ts`
- **Geen externe libraries** voor utils/services

## Versie
- **Versie**: 1.0.0
- **Status**: Production ready (FASE 1-3)
- **Laatste update**: 13 November 2025

## Volgende Stappen
- FASE 4: Extra hooks implementeren (useTransactions, useAccountingDashboard, etc.)
- FASE 5-10: UI Components bouwen
- Unit tests toevoegen (Jest voor services, React Testing Library voor hooks)
- E2E tests voor complete workflows

## Contact
Voor vragen over de accounting module, zie de docs in `docs/03-modules/accounting.md` (indien beschikbaar).
