# Agent Task Boundaries 🎯

**Voor:** AI Agents - Duidelijke grenzen om overlap en conflicts te voorkomen
**Versie:** 1.0.0
**Laatst bijgewerkt:** Januari 2025

---

## 📋 Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Module Ownership](#module-ownership)
3. [Gedeelde Boundaries](#gedeelde-boundaries)
4. [File Ownership Matrix](#file-ownership-matrix)
5. [Task Decomposition](#task-decomposition)
6. [Integration Points](#integration-points)
7. [Boundary Violations](#boundary-violations)
8. [Coördinatie Protocol](#coördinatie-protocol)

---

## 🎯 Overzicht

Dit document definieert **wie** welke files mag bewerken, **wanneer** coördinatie vereist is, en **hoe** je veilig werkt binnen jouw boundaries zonder andere agents te verstoren.

### Kernprincipes

- ✅ **Exclusive Ownership** - Eén agent = één module/feature
- ✅ **Respect Boundaries** - Bewerk nooit files van andere agents
- ✅ **Coordinate Shared** - Gedeelde files vereisen locking
- ✅ **Clear Interfaces** - Communicatie via exports/imports
- ✅ **No Surprises** - Wijzigingen worden aangekondigd

---

## 📦 Module Ownership

### Accounting Module 💰

**Owner Agent ID:** `accounting-agent`

**Exclusive Files (Full Control):**
```
src/
├── features/accounting/
│   ├── hooks/
│   │   ├── useQuotes.ts
│   │   ├── useInvoices.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── quoteService.ts
│   │   ├── invoiceService.ts
│   │   ├── calculationService.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── accounting.types.ts
│   │   └── index.ts
│   └── index.ts (barrel file)
├── components/accounting/
│   ├── QuoteList.tsx
│   ├── QuoteForm.tsx
│   ├── InvoiceList.tsx
│   ├── InvoiceForm.tsx
│   └── index.ts
└── pages/
    └── AccountingPage.tsx

docs/
└── 03-modules/
    └── accounting.md
```

**Permissions:**
- ✅ **MAG:** Alles in `accounting/` wijzigen
- ✅ **MAG:** Eigen types in `accounting.types.ts` wijzigen
- ✅ **MAG:** Eigen hooks en services
- ✅ **MAG:** Eigen components
- ✅ **MAG:** Documentatie `accounting.md`

**Restrictions:**
- ❌ **MAG NIET:** Globale types in `src/types.ts` zonder coördinatie
- ❌ **MAG NIET:** `src/App.tsx` wijzigen (alleen Integration Agent)
- ❌ **MAG NIET:** WorkOrder state/files (andere module)
- ❌ **MAG NIET:** CRM files (andere module)
- ❌ **MAG NIET:** Shared utilities zonder coördinatie

---

### CRM Module 👥

**Owner Agent ID:** `crm-agent`

**Exclusive Files:**
```
src/
├── features/crm/
│   ├── hooks/
│   │   ├── useCustomers.ts
│   │   ├── useLeads.ts
│   │   ├── useTasks.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── customerService.ts
│   │   ├── leadService.ts
│   │   ├── emailService.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── emailParser.ts
│   │   ├── validators.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── crm.types.ts
│   │   └── index.ts
│   └── index.ts
├── components/crm/
│   ├── CustomerList.tsx
│   ├── CustomerForm.tsx
│   ├── LeadKanban.tsx
│   ├── EmailDropZone.tsx
│   └── index.ts
└── pages/
    └── CRMPage.tsx

docs/
└── 03-modules/
    └── crm.md
```

**Permissions:**
- ✅ **MAG:** Alles in `crm/` wijzigen
- ✅ **MAG:** Email integratie features
- ✅ **MAG:** Customer en Lead management

**Restrictions:**
- ❌ **MAG NIET:** Invoice/Quote data (Accounting module)
- ❌ **MAG NIET:** WorkOrder assignment (WorkOrders module)
- ❌ **MAG NIET:** Inventory data (Inventory module)

---

### WorkOrders Module 🔧

**Owner Agent ID:** `workorders-agent`

**Exclusive Files:**
```
src/
├── features/workorders/
│   ├── hooks/
│   │   ├── useWorkOrders.ts
│   │   ├── useWorkBoard.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── workOrderService.ts
│   │   ├── statusService.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── statusHelpers.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── workorder.types.ts
│   │   └── index.ts
│   └── index.ts
├── components/workorders/
│   ├── WorkBoard.tsx
│   ├── WorkOrderCard.tsx
│   ├── WorkOrderForm.tsx
│   └── index.ts
└── pages/
    └── WorkOrdersPage.tsx

docs/
└── 03-modules/
    └── workorders.md
```

**Dependencies:**
- 📦 **DEPENDS ON:** Accounting (Quote → WorkOrder conversion)
- 📦 **DEPENDS ON:** CRM (Customer data)
- 📦 **DEPENDS ON:** Inventory (Materials)

**Integration Requirements:**
```typescript
// WorkOrders needs from Accounting:
import { convertQuoteToWorkOrder } from '@/features/accounting/services';

// WorkOrders needs from CRM:
import { Customer } from '@/features/crm/types';

// WorkOrders needs from Inventory:
import { InventoryItem } from '@/features/inventory/types';
```

**Coördinatie:** Wacht op `[INTEGRATION-POINT]` tags van dependency modules

---

### Inventory Module 📦

**Owner Agent ID:** `inventory-agent`

**Exclusive Files:**
```
src/
├── features/inventory/
│   ├── hooks/
│   │   ├── useInventory.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── inventoryService.ts
│   │   ├── stockService.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── inventory.types.ts
│   │   └── index.ts
│   └── index.ts
├── components/inventory/
│   ├── InventoryList.tsx
│   ├── InventoryForm.tsx
│   └── index.ts
└── pages/
    └── InventoryPage.tsx

docs/
└── 03-modules/
    └── inventory.md
```

**Permissions:**
- ✅ **MAG:** Stock management
- ✅ **MAG:** SKU types (3 types: product, material, service)
- ✅ **MAG:** Categories

---

### HRM Module 👤

**Owner Agent ID:** `hrm-agent`

**Exclusive Files:**
```
src/
├── features/hrm/
│   ├── hooks/
│   │   ├── useEmployees.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── employeeService.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── hrm.types.ts
│   │   └── index.ts
│   └── index.ts
├── components/hrm/
│   ├── EmployeeList.tsx
│   ├── EmployeeForm.tsx
│   └── index.ts
└── pages/
    └── HRMPage.tsx

docs/
└── 03-modules/
    └── hrm.md
```

**Note:** HRM is mostly standalone, minimale dependencies

---

### Dashboard Module 📊

**Owner Agent ID:** `dashboard-agent`

**Exclusive Files:**
```
src/
├── features/dashboard/
│   ├── hooks/
│   │   ├── useDashboardData.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── kpiService.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   └── index.ts
│   └── index.ts
├── components/dashboard/
│   ├── KPICard.tsx
│   ├── EmailDropZone.tsx
│   ├── NotificationPanel.tsx
│   └── index.ts
└── pages/
    └── DashboardPage.tsx

docs/
└── 03-modules/
    └── dashboard.md
```

**Special:** Dashboard aggregeert data van ALLE modules (read-only access)

---

### POS Module 💵

**Owner Agent ID:** `pos-agent`

**Exclusive Files:**
```
src/
├── features/pos/
│   ├── hooks/
│   │   ├── usePOS.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── posService.ts
│   │   └── index.ts
│   └── index.ts
├── components/pos/
│   ├── POSInterface.tsx
│   ├── ProductGrid.tsx
│   └── index.ts
└── pages/
    └── POSPage.tsx

docs/
└── 03-modules/
    └── pos.md
```

**Dependencies:**
- 📦 **DEPENDS ON:** Inventory (Product data, stock deduction)
- 📦 **DEPENDS ON:** Accounting (Invoice creation)

---

## 🔒 Gedeelde Boundaries (Coördinatie Vereist)

### Shared Files - LOCK REQUIRED

Deze files vereisen **locking via `.agent-lock.json`** voordat je ze bewerkt:

#### 1. `src/types.ts` 🔒

**Why Shared:** Globale TypeScript types voor alle modules

**Who Can Edit:**
- ✅ **Primary:** Architecture Agent
- ⚠️ **Secondary:** Feature Agents (met lock + coördinatie)

**Protocol:**
```bash
# 1. Check lock
cat .agent-lock.json | jq '.locks["src/types.ts"]'

# 2. If null, acquire lock
# (See AGENT_STATE_MANAGEMENT.md)

# 3. Add your types
export interface NewType {
  // ...
}

# 4. Commit immediately
git add src/types.ts
git commit -m "feat(types): Add NewType interface"

# 5. Release lock
# (See AGENT_STATE_MANAGEMENT.md)
```

**Best Practice:** Minimize edits, prefer module-specific types

---

#### 2. `src/App.tsx` 🔒

**Why Shared:** Centralized state, routing, global providers

**Who Can Edit:**
- ✅ **Primary:** Integration Agent
- ❌ **Secondary:** NO other agents (te risicovol)

**Protocol:**
```
Feature Agent needs state added to App.tsx:

1. Create GitHub Issue: "Add [Module] state to App.tsx"
2. Tag Integration Agent
3. Integration Agent adds state
4. Integration Agent commits with [INTEGRATION-POINT] tag
5. Feature Agent uses state via props
```

**Example:**
```typescript
// Integration Agent adds:
const [quotes, setQuotes] = useState<Quote[]>([]);

// Feature Agent receives:
<AccountingPage
  quotes={quotes}
  setQuotes={setQuotes}
/>
```

---

#### 3. `docs/AI_GUIDE.md` 🔒

**Why Shared:** Development guidelines voor alle agents

**Who Can Edit:**
- ✅ **Primary:** Documentation Agent
- ⚠️ **Secondary:** Feature Agents (voor nieuwe patterns)

**Protocol:**
```
Feature Agent discovers new pattern:

1. Document pattern in jouw module README.md EERST
2. Tag Documentation Agent: [NEW-PATTERN:NAME]
3. Documentation Agent review pattern
4. Documentation Agent adds to AI_GUIDE.md
5. Documentation Agent commits
```

---

#### 4. `CONVENTIONS.md` 🔒

**Why Shared:** Code conventions voor alle agents

**Who Can Edit:**
- ✅ **Primary:** Architecture Agent + Documentation Agent
- ❌ **Secondary:** NO feature agents (consistentie)

**Protocol:**
```
Als je nieuwe convention wilt voorstellen:

1. Create GitHub Discussion: "Proposal: [New Convention]"
2. Tag Architecture Agent + Documentation Agent
3. Wait for approval
4. Documentation Agent updates CONVENTIONS.md
```

---

#### 5. `docs/INDEX.md` 🔒

**Why Shared:** Master documentation index

**Who Can Edit:**
- ✅ **Primary:** Documentation Agent
- ⚠️ **Secondary:** Feature Agents (voor links naar nieuwe docs)

**Protocol:**
```bash
# Feature Agent:
# 1. Create jouw module doc (bijv. accounting.md)
# 2. Commit module doc
# 3. Tag Documentation Agent: [NEW-DOC:accounting.md]

# Documentation Agent:
# 1. Review module doc
# 2. Add link to INDEX.md
# 3. Commit
```

---

### Shared Utilities - COORDINATE

#### `src/utils/shared/` ⚠️

**Why Shared:** Utilities gebruikt door meerdere modules

**Examples:**
```
src/utils/shared/
├── dateUtils.ts      # Datum formatting
├── currencyUtils.ts  # Valuta formatting
├── validators.ts     # Input validation
└── index.ts
```

**Protocol:**
```typescript
// BAD: Wijzig bestaande utility functie
// Dit breekt mogelijk andere modules!
export const formatDate = (date: Date) => {
  return date.toLocaleDateString('nl-NL'); // Changed!
}

// GOOD: Voeg NIEUWE functie toe
export const formatDateExtended = (date: Date, includeTime: boolean) => {
  // New function, geen breaking change
}

// Of gebruik overloading
export function formatDate(date: Date): string;
export function formatDate(date: Date, format: string): string;
export function formatDate(date: Date, format?: string): string {
  // Backward compatible
}
```

**Rule:** Nieuwe functies OK, wijzigen bestaande = coördinatie vereist

---

## 📊 File Ownership Matrix

| File/Folder | Owner Agent | Lock Required | Edit Permission |
|-------------|-------------|---------------|-----------------|
| `src/features/accounting/**` | accounting-agent | ❌ | Exclusive |
| `src/features/crm/**` | crm-agent | ❌ | Exclusive |
| `src/features/workorders/**` | workorders-agent | ❌ | Exclusive |
| `src/features/inventory/**` | inventory-agent | ❌ | Exclusive |
| `src/features/hrm/**` | hrm-agent | ❌ | Exclusive |
| `src/features/pos/**` | pos-agent | ❌ | Exclusive |
| `src/features/dashboard/**` | dashboard-agent | ❌ | Exclusive |
| `src/components/[module]/**` | [module]-agent | ❌ | Exclusive |
| `src/pages/[Module]Page.tsx` | [module]-agent | ❌ | Exclusive |
| `src/types.ts` | architecture-agent | ✅ | Shared (lock) |
| `src/App.tsx` | integration-agent | ✅ | Integration only |
| `src/utils/shared/**` | architecture-agent | ⚠️ | Add OK, modify = lock |
| `docs/03-modules/[module].md` | [module]-agent | ❌ | Exclusive |
| `docs/AI_GUIDE.md` | documentation-agent | ✅ | Shared (lock) |
| `docs/INDEX.md` | documentation-agent | ✅ | Shared (lock) |
| `CONVENTIONS.md` | architecture-agent | ✅ | Architecture only |
| `README.md` | documentation-agent | ❌ | Docs only |
| `.agent-lock.json` | ALL | ❌ | Update lock status |

---

## 🧩 Task Decomposition

Voor grote taken (> 1 uur werk), splits in kleinere subtaken:

### ❌ **BAD** - Te groot, overlap risico

```
Task: "Maak Accounting module"
Agent: accounting-agent
Duration: 8 uur
Files: Alles in accounting/
```

**Problemen:**
- Te veel files tegelijk
- Merge conflicts bij andere agents
- Moeilijk te reviewen
- Blocking voor dependencies

---

### ✅ **GOOD** - Kleine, discrete taken

```
Task 1: "FASE 2 - Extract accounting types"
Agent: accounting-agent
Duration: 30 min
Deliverable: src/features/accounting/types/accounting.types.ts

Task 2: "FASE 3 - Extract accounting utils"
Agent: accounting-agent
Dependencies: Task 1 done
Duration: 45 min
Deliverable: src/features/accounting/utils/**

Task 3: "FASE 4 - Extract accounting services"
Agent: accounting-agent
Dependencies: Task 2 done
Duration: 1 uur
Deliverable: src/features/accounting/services/**

Task 4: "FASE 5 - Extract accounting hooks"
Agent: accounting-agent
Dependencies: Task 3 done
Duration: 1 uur
Deliverable: src/features/accounting/hooks/**

Task 5: "FASE 6 - Create accounting components"
Agent: accounting-agent
Dependencies: Task 4 done
Duration: 2 uur
Deliverable: src/components/accounting/**

Task 6: "FASE 7 - Create accounting page"
Agent: accounting-agent
Dependencies: Task 5 done
Duration: 1 uur
Deliverable: src/pages/AccountingPage.tsx
```

**Voordelen:**
- ✅ Kleine commits (easy review)
- ✅ Duidelijke progress tracking
- ✅ Makkelijk om te switchen tussen taken
- ✅ Minimale blocking voor anderen

---

## 🔗 Integration Points

Als jouw module integreert met andere modules:

### Pattern: Provider-Consumer

#### Accounting Module (Provider)

```typescript
// src/features/accounting/services/quoteService.ts

/**
 * INTEGRATION POINT: Quote → WorkOrder Conversion
 *
 * @consumer workorders-agent
 * @since v6.0.0
 * @stability stable
 */
export const convertQuoteToWorkOrder = (quote: Quote): WorkOrder => {
  return {
    id: `WO-${Date.now()}`,
    quoteId: quote.id,
    title: `Werkorder voor ${quote.customerName}`,
    description: quote.description,
    estimatedHours: quote.laborHours,
    materials: quote.items.map(item => ({
      inventoryItemId: item.inventoryItemId,
      quantity: item.quantity
    })),
    status: 'todo',
    createdAt: new Date().toISOString()
  };
};
```

**Provider Checklist:**
- [ ] Function gedefinieerd en getest
- [ ] JSDoc comment met `@consumer` tag
- [ ] Exported via barrel file
- [ ] Committed met `[INTEGRATION-POINT:QUOTE-TO-WO]` tag
- [ ] Gedocumenteerd in accounting.md

---

#### WorkOrders Module (Consumer)

```typescript
// src/features/workorders/hooks/useWorkOrders.ts

import { convertQuoteToWorkOrder } from '@/features/accounting/services';
import type { Quote } from '@/features/accounting/types';

export const useWorkOrders = () => {
  const createFromQuote = (quote: Quote) => {
    // Wait for [INTEGRATION-POINT:QUOTE-TO-WO] tag before using
    const workOrder = convertQuoteToWorkOrder(quote);

    setWorkOrders(prev => [...prev, workOrder]);
  };

  return { createFromQuote };
};
```

**Consumer Checklist:**
- [ ] Wacht op `[INTEGRATION-POINT]` tag van provider
- [ ] Import via barrel file (`@/features/accounting/services`)
- [ ] Error handling voor missing data
- [ ] Integration test geschreven

---

### Coördinatie Sequence

```
┌─────────────────────────┐
│  Accounting Agent       │
│  (Provider)             │
└───────────┬─────────────┘
            │
            │ 1. Implement convertQuoteToWorkOrder
            │
            ▼
    ┌────────────────┐
    │ Commit + Tag   │
    │ [INTEGRATION-  │
    │  POINT:...]    │
    └───────┬────────┘
            │
            │ 2. WorkOrders Agent waits for tag
            │
            ▼
┌─────────────────────────┐
│  WorkOrders Agent       │
│  (Consumer)             │
└───────────┬─────────────┘
            │
            │ 3. Import function
            │
            ▼
    ┌────────────────┐
    │ Use function   │
    │ in hook        │
    └───────┬────────┘
            │
            │ 4. Test integration
            │
            ▼
    ┌────────────────┐
    │ Commit + Tag   │
    │ [INTEGRATION-  │
    │  USED:...]     │
    └────────────────┘
```

---

## ⚠️ Boundary Violations

### Common Violations

#### Violation 1: Cross-Module File Edit

```typescript
// ❌ FOUT
// CRM Agent bewerkt WorkOrders files
// File: src/features/workorders/services/workOrderService.ts
export const assignCustomerToWorkOrder = (workOrderId, customerId) => {
  // CRM agent added this - BOUNDARY VIOLATION!
}
```

**Impact:**
- Merge conflicts
- Ownership confusion
- Breaking changes zonder notice

**Resolution:**
```typescript
// ✅ CORRECT
// CRM Agent exposes functie in eigen module
// File: src/features/crm/services/customerService.ts
export const getCustomerById = (id: string): Customer | null => {
  // CRM's responsibility
}

// WorkOrders Agent importeert en gebruikt
// File: src/features/workorders/hooks/useWorkOrders.ts
import { getCustomerById } from '@/features/crm/services';

const customer = getCustomerById(workOrder.customerId);
```

---

#### Violation 2: Direct State Mutation

```typescript
// ❌ FOUT
// Accounting Agent wijzigt CRM state direct
const updateCustomerInvoiceTotal = (customerId: string, total: number) => {
  const customer = customers.find(c => c.id === customerId);
  customer.totalInvoiced = total; // NIET DOEN!
}
```

**Impact:**
- State inconsistency
- Race conditions
- Unpredictable behavior

**Resolution:**
```typescript
// ✅ CORRECT
// Accounting exposes event/callback
export const onInvoiceCreated = (invoice: Invoice) => {
  // Emit event or callback
  eventBus.emit('invoice:created', invoice);
};

// CRM luistert naar event
eventBus.on('invoice:created', (invoice) => {
  // CRM updates eigen state
  updateCustomerStats(invoice.customerId);
});
```

---

#### Violation 3: Skipping Lock

```typescript
// ❌ FOUT
// Agent bewerkt src/types.ts zonder lock

// Agent 1
export interface Quote { ... }

// Agent 2 (tegelijkertijd!)
export interface Invoice { ... }

// MERGE CONFLICT!
```

**Resolution:**
```bash
# ✅ CORRECT
# 1. Check lock
cat .agent-lock.json | jq '.locks["src/types.ts"]'

# 2. Acquire lock (if null)
# (See AGENT_STATE_MANAGEMENT.md)

# 3. Edit file
# 4. Commit immediately
# 5. Release lock
```

---

## 🤝 Coördinatie Protocol

### When Coordination Needed

Coördinatie is vereist als:

1. **Shared File Edit** - Je wilt een file bewerken die niet in jouw ownership is
2. **Breaking Change** - Je wijziging beïnvloedt andere modules
3. **New Dependency** - Je module heeft nieuwe dependency op andere module
4. **State Change** - Je wijzigt gedeelde state structuur
5. **API Contract Change** - Je wijzigt een public interface

---

### Coordination Steps

#### Step 1: Check Boundaries

```bash
# Check AGENT_TASK_BOUNDARIES.md
# Is file in jouw ownership?

if [ file in exclusive ownership ]; then
  # No coordination needed
  proceed with work
else
  # Coordination needed
  proceed to Step 2
fi
```

#### Step 2: Request Permission

```bash
# Create GitHub Issue
Title: "[COORDINATION] [Agent X] needs to edit [file/feature]"
Body:
---
**Requesting Agent:** accounting-agent
**Target File:** src/types.ts
**Reason:** Need to add AccountingTypes interface
**Impact:** None (only adding, not modifying)
**Estimated Time:** 15 minutes
**Urgency:** Medium

**Owner Agent:** @architecture-agent
**Action Requested:** Please confirm or provide alternative approach
---
```

#### Step 3: Wait for Approval

```bash
# Owner Agent responds:
# Option A: "Approved - please proceed and lock file"
# Option B: "Alternative approach: [suggestion]"
# Option C: "Denied - reason: [explanation]"
```

#### Step 4: Execute (if approved)

```bash
# Acquire lock (if shared file)
# Make changes
# Test
# Commit with coordination tag
git commit -m "feat: Add AccountingTypes

[COORDINATED-WITH:architecture-agent]
Approval: GitHub Issue #123
Changes: Added AccountingTypes interface to src/types.ts
Impact: None (only additions)
"
```

#### Step 5: Notify Completion

```bash
# Comment on GitHub Issue
"Completed. Commit: <hash>. Lock released."
```

---

## 📋 Boundary Checklist

Voor elke taak, check:

### Pre-Start Checklist

- [ ] **Ownership:** File in mijn exclusive ownership?
- [ ] **Lock Status:** Check `.agent-lock.json` voor locks
- [ ] **Dependencies:** Alle dependencies beschikbaar?
- [ ] **Coordination:** Coördinatie nodig met andere agents?
- [ ] **Approval:** (Indien coördinatie) Approval ontvangen?

### During Work Checklist

- [ ] **Boundaries:** Blijf binnen jouw files
- [ ] **Lock:** Shared files locked?
- [ ] **Commits:** Regelmatig atomic commits
- [ ] **Tests:** Tests passing
- [ ] **Documentation:** Inline comments voor complexe logica

### Post-Work Checklist

- [ ] **Unlock:** Shared files unlocked?
- [ ] **Tag:** Handoff/integration tags toegevoegd?
- [ ] **Tests:** All tests passing
- [ ] **Build:** `npm run build` succesvol
- [ ] **Documentation:** Module docs geüpdatet

---

## 🚨 Emergency Override

In **uitzonderlijke** gevallen (critical bugs, security issues):

```bash
# Emergency boundary override protocol

git commit -m "fix(EMERGENCY): Critical security issue in [module]

[BOUNDARY-OVERRIDE]
Severity: Critical
Module: [affected module]
Owner: [owner agent]
Reason: [detailed reason]

This override fixes: [beschrijving]

Action Required by [owner agent]:
- Review this fix ASAP
- Approve or provide alternative
- Update tests if needed

Apologize for boundary violation, but urgency required it.
"
```

**Use sparingly!** Only voor critical issues.

---

## 📚 Gerelateerde Documentatie

- [MULTI_AGENT_WORKFLOW.md](./MULTI_AGENT_WORKFLOW.md) - Complete workflow
- [AGENT_STATE_MANAGEMENT.md](./AGENT_STATE_MANAGEMENT.md) - Lock mechanism
- [AGENT_CHECKLIST.md](./AGENT_CHECKLIST.md) - Task checklist
- [AI_GUIDE.md](./AI_GUIDE.md) - Development guidelines

---

**Laatste update:** Januari 2025
**Versie:** 1.0.0
**Status:** Productie-ready

**Respect the boundaries! 🎯**
