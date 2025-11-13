# Multi-Agent Workflow Guide 🤖🤖🤖

**Voor:** AI Agents die samenwerken aan het Bedrijfsbeheer Dashboard
**Versie:** 1.0.0
**Laatst bijgewerkt:** Januari 2025

---

## 📋 Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Agent Rollen & Verantwoordelijkheden](#agent-rollen--verantwoordelijkheden)
3. [Task Ownership Matrix](#task-ownership-matrix)
4. [Sequential Workflow](#sequential-workflow)
5. [Parallel Work Rules](#parallel-work-rules)
6. [Handoff Protocol](#handoff-protocol)
7. [Conflict Resolution](#conflict-resolution)
8. [Integration Points](#integration-points)
9. [Best Practices](#best-practices)

---

## 🎯 Overzicht

Dit document beschrijft hoe meerdere AI agents veilig en efficiënt kunnen samenwerken aan dit project zonder elkaars werk te verstoren, merge conflicts te veroorzaken, of race conditions te creëren.

### Kernprincipes

- ✅ **Clear Ownership** - Elke agent heeft duidelijk eigenaarschap over specifieke modules
- ✅ **Sequential Dependencies** - Volgorde van werk is vooraf bepaald
- ✅ **Parallel Possibilities** - Waar mogelijk werken agents parallel
- ✅ **Explicit Handoffs** - Duidelijke overdracht punten tussen agents
- ✅ **Lock Mechanism** - Gedeelde files worden gelocked tijdens bewerking
- ✅ **Integration Agent** - Dedicated agent voor merge en conflict resolution

---

## 🤖 Agent Rollen & Verantwoordelijkheden

### 1. Architecture Agent 🏗️

**Primaire Verantwoordelijkheid:** Foundation setup, types, interfaces, barrel files

**Taken:**
- ✅ Setup TypeScript types en interfaces
- ✅ Create barrel files (index.ts) structuur
- ✅ Define shared utilities en helpers
- ✅ Setup folder structure voor nieuwe modules
- ✅ Define state management patterns
- ✅ Create API contracts (indien backend)

**Files Ownership:**
```
src/
├── types.ts (shared types)
├── utils/shared/ (shared utilities)
└── features/[module]/
    ├── types/
    ├── index.ts (barrel file)
    └── README.md (module structure)
```

**Handoff Trigger:** Architecture compleet, types gedefinieerd, barrel files aanwezig
**Tag:** `[HANDOFF:ARCHITECTURE-DONE]`

---

### 2. Feature Agents 🎨

**Primaire Verantwoordelijkheid:** Implementatie van specifieke modules/features

**Agent Types:**
- **Feature Agent 1:** Accounting module
- **Feature Agent 2:** CRM module
- **Feature Agent 3:** WorkOrders module
- **Feature Agent 4:** Inventory module
- **Feature Agent 5:** HRM module
- *(etc.)*

**Taken per Feature Agent:**
- ✅ Implementeer module-specifieke logica
- ✅ Create components voor de module
- ✅ Implementeer hooks en services
- ✅ Write module-specifieke tests
- ✅ Update module documentatie

**Files Ownership (voorbeeld Accounting):**
```
src/
├── features/accounting/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── types/
├── components/accounting/
└── docs/03-modules/accounting.md
```

**Handoff Trigger:** Module volledig geïmplementeerd, tests passing
**Tag:** `[HANDOFF:FEATURE-DONE:ACCOUNTING]`

---

### 3. Integration Agent 🔗

**Primaire Verantwoordelijkheid:** Module integraties, conflict resolution, merges

**Taken:**
- ✅ Merge feature branches naar main
- ✅ Resolve merge conflicts
- ✅ Ensure cross-module communication werkt
- ✅ Setup module interactions (Accounting ↔ WorkOrders)
- ✅ Integration testing
- ✅ Fix integration bugs

**Files Ownership:**
```
src/
├── App.tsx (centralized state & routing)
├── integrations/ (cross-module logic)
└── tests/integration/
```

**Handoff Trigger:** Alle integraties werkend, conflicts resolved
**Tag:** `[HANDOFF:INTEGRATION-DONE]`

---

### 4. Testing Agent 🧪

**Primaire Verantwoordelijkheid:** Testing, validation, quality assurance

**Taken:**
- ✅ Write unit tests voor alle modules
- ✅ Write integration tests
- ✅ Run all test suites
- ✅ Validate TypeScript compilation
- ✅ Check linting errors
- ✅ Performance testing
- ✅ Accessibility testing (WCAG compliance)

**Files Ownership:**
```
src/
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── vitest.config.ts
└── test-utils/
```

**Handoff Trigger:** All tests passing, no TypeScript errors, build succeeds
**Tag:** `[HANDOFF:TESTING-DONE]`

---

### 5. Documentation Agent 📚

**Primaire Verantwoordelijkheid:** Documentation updates, changelog, guides

**Taken:**
- ✅ Update module documentation (MD files)
- ✅ Update API documentation
- ✅ Update changelog
- ✅ Update AI_GUIDE.md met nieuwe patterns
- ✅ Update CONVENTIONS.md indien nodig
- ✅ Write migration guides (bij breaking changes)
- ✅ Update README.md

**Files Ownership:**
```
docs/
├── 03-modules/*.md
├── 04-features/*.md
├── 06-changelog/*.md
├── AI_GUIDE.md
└── CONVENTIONS.md
```

**Handoff Trigger:** Documentation compleet, accurate, reviewed
**Tag:** `[HANDOFF:DOCS-DONE]`

---

## 📊 Task Ownership Matrix

| Module/Feature | Architecture | Feature | Integration | Testing | Documentation |
|----------------|--------------|---------|-------------|---------|---------------|
| **Accounting** | Types, interfaces | Implementation | Integrates with WorkOrders | Unit + Integration tests | accounting.md |
| **CRM** | Types, interfaces | Implementation | Integrates with Email, WorkOrders | Unit + Integration tests | crm.md |
| **WorkOrders** | Types, interfaces | Implementation | Depends on Accounting, CRM | Unit + Integration tests | workorders.md |
| **Inventory** | Types, interfaces | Implementation | Integrates with POS, WorkOrders | Unit + Integration tests | inventory.md |
| **HRM** | Types, interfaces | Implementation | Standalone | Unit tests | hrm.md |
| **Shared State** | Setup in App.tsx | - | Connects all modules | Integration tests | state-management.md |

### Dependencies Diagram

```
┌─────────────────┐
│  Architecture   │ ← Start hier ALTIJD
└────────┬────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │   Feature Agents (Parallel OK)  │
    ├─────────────┬───────────────────┤
    │ Accounting  │  CRM  │ Inventory │
    └─────────────┴───────────────────┘
         │
         ▼
    ┌─────────────────┐
    │  Integration    │ ← Merge + resolve conflicts
    └────────┬────────┘
         │
         ▼
    ┌─────────────────┐
    │    Testing      │ ← Validate everything
    └────────┬────────┘
         │
         ▼
    ┌─────────────────┐
    │  Documentation  │ ← Final updates
    └─────────────────┘
         │
         ▼
    ┌─────────────────┐
    │  PRODUCTION ✅  │
    └─────────────────┘
```

---

## 🔄 Sequential Workflow

### STAP 1: Architecture Phase

**Owner:** Architecture Agent

**Taken:**
1. Analyseer requirements
2. Create TypeScript types/interfaces
3. Setup folder structure
4. Create barrel files (index.ts)
5. Define shared utilities
6. Setup state management structure

**Deliverables:**
```typescript
// src/types.ts
export interface NewModule {
  id: string;
  // ... fields
}

// src/features/new-module/index.ts
export * from './hooks';
export * from './services';
export * from './utils';

// src/features/new-module/types/index.ts
export * from './new-module.types';
```

**Completion:**
```bash
git add .
git commit -m "feat(architecture): Setup NewModule foundation

[HANDOFF:ARCHITECTURE-DONE]
- Created types and interfaces
- Setup folder structure
- Added barrel files
"
git push
```

---

### STAP 2: Feature Implementation Phase

**Owner:** Feature Agents (parallel mogelijk)

**Parallel Work Allowed:**
- ✅ Agent 1: Accounting module
- ✅ Agent 2: CRM module
- ✅ Agent 3: Inventory module

**Per Agent:**
```bash
# 1. Create eigen branch
git checkout -b agent/accounting-module

# 2. Pull latest architecture changes
git pull origin main

# 3. Implement feature
# ... development work ...

# 4. Commit regelmatig
git add .
git commit -m "feat(accounting): Implement quote management

- Added useQuotes hook
- Created QuoteList component
- Implemented quote CRUD operations
"

# 5. Push naar eigen branch
git push origin agent/accounting-module

# 6. Tag wanneer klaar
git commit --allow-empty -m "[HANDOFF:FEATURE-DONE:ACCOUNTING]"
git push
```

**Rules voor Parallel Work:**
- ✅ Elke agent werkt in **eigen feature folder**
- ✅ Elke agent werkt op **eigen git branch**
- ❌ **NIET** wijzigen: `src/types.ts` (alleen Architecture Agent)
- ❌ **NIET** wijzigen: `src/App.tsx` (alleen Integration Agent)
- ❌ **NIET** wijzigen: Andere agent's folders

---

### STAP 3: Integration Phase

**Owner:** Integration Agent

**Taken:**
1. Merge alle feature branches
2. Resolve conflicts
3. Setup cross-module communication
4. Connect modules in App.tsx
5. Ensure state synchronization werkt

**Workflow:**
```bash
# 1. Checkout main
git checkout main
git pull

# 2. Merge feature branches één voor één
git merge agent/accounting-module
# Resolve conflicts indien nodig
git merge agent/crm-module
# Resolve conflicts indien nodig
git merge agent/inventory-module
# Resolve conflicts indien nodig

# 3. Test integration
npm run build
npm run dev
# Manual testing...

# 4. Commit integration
git add .
git commit -m "feat: Integrate Accounting, CRM, and Inventory modules

[HANDOFF:INTEGRATION-DONE]
- Merged all feature branches
- Resolved conflicts in App.tsx
- Setup cross-module communication
- All modules working together
"
git push
```

---

### STAP 4: Testing Phase

**Owner:** Testing Agent

**Taken:**
1. Write unit tests voor nieuwe features
2. Write integration tests
3. Run all test suites
4. Validate TypeScript compilation
5. Check build succeeds
6. Performance testing

**Workflow:**
```bash
# 1. Pull latest
git checkout main
git pull

# 2. Run tests
npm run test
npm run type-check
npm run lint
npm run build

# 3. Write missing tests
# ... testing work ...

# 4. Commit tests
git add .
git commit -m "test: Add comprehensive tests for new modules

[HANDOFF:TESTING-DONE]
- Unit tests: 95% coverage
- Integration tests: all passing
- Build: successful
- TypeScript: no errors
"
git push
```

---

### STAP 5: Documentation Phase

**Owner:** Documentation Agent

**Taken:**
1. Update module documentation
2. Update changelog
3. Update AI_GUIDE.md
4. Update INDEX.md
5. Add troubleshooting sections

**Workflow:**
```bash
# 1. Pull latest
git checkout main
git pull

# 2. Update documentation
# ... documentation work ...

# 3. Commit docs
git add .
git commit -m "docs: Update documentation for new modules

[HANDOFF:DOCS-DONE]
- Updated accounting.md, crm.md, inventory.md
- Updated changelog v6.0.0
- Added troubleshooting sections
- Updated AI_GUIDE.md with new patterns
"
git push

# 4. Tag release
git tag -a v6.0.0 -m "Release v6.0.0: Accounting, CRM, Inventory modules"
git push --tags
```

---

## ⚡ Parallel Work Rules

### ✅ **TOEGESTAAN** - Safe Parallel Work

1. **Verschillende modules tegelijk**
   ```
   Agent 1: src/features/accounting/**
   Agent 2: src/features/crm/**
   Agent 3: src/features/inventory/**
   ✅ SAFE - Geen overlapping
   ```

2. **Verschillende documentatie files**
   ```
   Agent 1: docs/03-modules/accounting.md
   Agent 2: docs/03-modules/crm.md
   ✅ SAFE - Geen overlapping
   ```

3. **Eigen test files**
   ```
   Agent 1: src/__tests__/accounting.test.ts
   Agent 2: src/__tests__/crm.test.ts
   ✅ SAFE - Geen overlapping
   ```

### ❌ **VERBODEN** - Unsafe Parallel Work

1. **Zelfde file tegelijk**
   ```
   Agent 1: src/types.ts (adding AccountingTypes)
   Agent 2: src/types.ts (adding CRMTypes)
   ❌ CONFLICT - Race condition
   ```

2. **Gedeelde state zonder coördinatie**
   ```
   Agent 1: src/App.tsx (adding accounting state)
   Agent 2: src/App.tsx (adding crm state)
   ❌ CONFLICT - Merge hell
   ```

3. **Cross-module dependencies zonder sync**
   ```
   Agent 1: Accounting depends on WorkOrders
   Agent 2: WorkOrders not ready yet
   ❌ BLOCKING - Dependency not met
   ```

### 🔒 **COÖRDINATIE VEREIST** - Use Locking

Voor gedeelde files, gebruik `.agent-lock.json`:

```bash
# 1. Check if file is locked
cat .agent-lock.json | jq '.locks["src/types.ts"]'

# 2. If null, acquire lock
# (See AGENT_STATE_MANAGEMENT.md for full protocol)

# 3. Do your work

# 4. Release lock
```

---

## 🤝 Handoff Protocol

### Wat is een Handoff?

Een **handoff** is het moment waarop één agent klaar is met zijn deel en een andere agent kan starten.

### Handoff Requirements

Voor een succesvolle handoff:

1. ✅ **Work Compleet** - Alle taken van huidige fase voltooid
2. ✅ **Tests Passing** - Relevante tests slagen
3. ✅ **Build Succeeds** - `npm run build` succesvol
4. ✅ **Committed & Pushed** - Alle wijzigingen in git
5. ✅ **Tagged** - Commit heeft `[HANDOFF:PHASE-DONE]` tag
6. ✅ **Documented** - Relevante docs geüpdatet

### Handoff Types

#### Type 1: Sequential Handoff

```
Architecture Agent compleet
    ↓ [HANDOFF:ARCHITECTURE-DONE]
Feature Agent start
```

**Voorbeeld:**
```bash
# Architecture Agent
git commit -m "feat(architecture): Setup Accounting foundation

[HANDOFF:ARCHITECTURE-DONE]
- Created AccountingTypes interface
- Setup folder structure
- Added barrel files

Next Agent: Feature Agent (Accounting) can start implementation
"
```

#### Type 2: Parallel → Integration Handoff

```
Feature Agent 1 (Accounting) compleet
Feature Agent 2 (CRM) compleet
Feature Agent 3 (Inventory) compleet
    ↓ [HANDOFF:ALL-FEATURES-DONE]
Integration Agent start merge
```

**Voorbeeld:**
```bash
# Feature Agent 1
git commit -m "[HANDOFF:FEATURE-DONE:ACCOUNTING]"

# Feature Agent 2
git commit -m "[HANDOFF:FEATURE-DONE:CRM]"

# Feature Agent 3
git commit -m "[HANDOFF:FEATURE-DONE:INVENTORY]"

# Integration Agent (waiting for all 3)
# Checks: all 3 tags present? → Start merge
```

#### Type 3: Blocking Handoff

```
Feature Agent blocked by missing dependency
    ↓ [HANDOFF:BLOCKED:NEED-ARCHITECTURE]
Architecture Agent prioritizes blocking issue
    ↓ [HANDOFF:UNBLOCKED]
Feature Agent continues
```

**Voorbeeld:**
```bash
# Feature Agent
git commit -m "wip: Accounting implementation paused

[HANDOFF:BLOCKED:NEED-WORKORDER-TYPES]
Need WorkOrder interface in types.ts to implement
convertQuoteToWorkOrder() function.

Blocking Agent: Architecture Agent
Required: WorkOrder interface definition
"

# Architecture Agent responds
git commit -m "feat: Add WorkOrder interface to types.ts

[HANDOFF:UNBLOCKED:WORKORDER-TYPES]
Unblocking: Accounting Feature Agent
Added WorkOrder interface as requested
"
```

### Handoff Checklist

Voor je handoff commit maakt:

- [ ] **Tests:** Alle relevante tests passing
- [ ] **Build:** `npm run build` succesvol
- [ ] **TypeScript:** `npm run type-check` geen errors
- [ ] **Lint:** `npm run lint` geen errors
- [ ] **Committed:** Alle changes committed
- [ ] **Tag:** Commit message heeft `[HANDOFF:...]` tag
- [ ] **Docs:** Inline comments voor complexe code
- [ ] **README:** Module README.md geüpdatet (indien module)

---

## ⚠️ Conflict Resolution

### Conflict Types

#### 1. Git Merge Conflicts

**Scenario:**
```
Agent 1 modified src/types.ts: added AccountingTypes
Agent 2 modified src/types.ts: added CRMTypes
Git merge conflict!
```

**Resolution:**
```bash
# Integration Agent handles this
git checkout main
git merge agent/accounting-module  # OK
git merge agent/crm-module         # CONFLICT in src/types.ts

# Open src/types.ts
<<<<<<< HEAD
// AccountingTypes
export interface Quote { ... }
=======
// CRMTypes
export interface Customer { ... }
>>>>>>> agent/crm-module

# Manual merge:
// AccountingTypes
export interface Quote { ... }

// CRMTypes
export interface Customer { ... }

git add src/types.ts
git commit -m "merge: Resolve types.ts conflict (Accounting + CRM)"
```

**Prevention:** Use `.agent-lock.json` (zie AGENT_STATE_MANAGEMENT.md)

---

#### 2. Logical Conflicts

**Scenario:**
```
Agent 1: Accounting module expects WorkOrder to have 'quoteId'
Agent 2: WorkOrders module doesn't have 'quoteId' field
Runtime error!
```

**Detection:**
```bash
# Testing Agent discovers:
npm run test
# Test fails: Cannot read property 'quoteId' of undefined
```

**Resolution:**
```bash
# Integration Agent:
# 1. Identify missing field
# 2. Add to WorkOrder interface
# 3. Update WorkOrders module
# 4. Re-run tests
```

**Prevention:** Architecture Agent defines ALL interfaces upfront

---

#### 3. State Synchronization Conflicts

**Scenario:**
```
Agent 1: Accounting updates Quote state
Agent 2: WorkOrders reads stale Quote state
Data out of sync!
```

**Resolution:**
```typescript
// Use shared context or centralized state
// See AGENT_STATE_MANAGEMENT.md for pattern
```

**Prevention:** Integration Agent ensures proper state flow

---

### Conflict Resolution Protocol

```
┌─────────────────────────┐
│   Conflict Detected     │
└───────────┬─────────────┘
            │
            ▼
    ┌───────────────┐
    │ Stop all work │  ← All agents pause
    └───────┬───────┘
            │
            ▼
    ┌────────────────────┐
    │ Integration Agent  │  ← Takes over
    │ analyzes conflict  │
    └────────┬───────────┘
            │
            ▼
    ┌──────────────────────┐
    │ Resolution approach: │
    ├──────────────────────┤
    │ 1. Git merge conflict│ → Manual merge
    │ 2. Logical conflict  │ → Code fix
    │ 3. State conflict    │ → Refactor state
    └────────┬─────────────┘
            │
            ▼
    ┌────────────────┐
    │ Apply fix      │
    │ Test fix       │
    │ Commit fix     │
    └────────┬───────┘
            │
            ▼
    ┌────────────────────────┐
    │ Tag: [CONFLICT-RESOLVED]│
    └────────┬───────────────┘
            │
            ▼
    ┌────────────────┐
    │ Agents resume  │  ← All agents continue
    └────────────────┘
```

---

## 🔗 Integration Points

### What are Integration Points?

**Integration Point** = Where twee modules communiceren met elkaar

**Voorbeeld:**
```
Accounting Module ← → WorkOrders Module
(Quote)               (WorkOrder)
```

### Common Integration Patterns

#### Pattern 1: Function Export

```typescript
// Module A exposes function
// src/features/accounting/services/quoteService.ts
export const convertQuoteToWorkOrder = (quote: Quote): WorkOrder => {
  return {
    id: `WO-${Date.now()}`,
    quoteId: quote.id,
    title: `Werkorder voor ${quote.customerName}`,
    // ...
  };
};

// Module B imports function
// src/features/workorders/hooks/useWorkOrders.ts
import { convertQuoteToWorkOrder } from '@/features/accounting/services';

export const useWorkOrders = () => {
  const createFromQuote = (quote: Quote) => {
    const workOrder = convertQuoteToWorkOrder(quote);
    // ...
  };
};
```

**Coördinatie:**
1. Accounting Agent implements `convertQuoteToWorkOrder`
2. Accounting Agent commits met tag: `[INTEGRATION-POINT:QUOTE-TO-WO]`
3. WorkOrders Agent waits for tag
4. WorkOrders Agent imports en gebruikt functie

---

#### Pattern 2: Shared State via Context

```typescript
// Module A creates context
// src/features/accounting/context/QuoteContext.tsx
export const QuoteContext = createContext<QuoteContextType | null>(null);

export const QuoteProvider = ({ children }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const addQuote = (quote: Quote) => setQuotes(prev => [...prev, quote]);
  const updateQuote = (id: string, updates: Partial<Quote>) => { /* ... */ };

  return (
    <QuoteContext.Provider value={{ quotes, addQuote, updateQuote }}>
      {children}
    </QuoteContext.Provider>
  );
};

// Module B consumes context
// src/features/workorders/hooks/useQuotes.ts
import { useContext } from 'react';
import { QuoteContext } from '@/features/accounting/context';

export const useQuotesInWorkOrders = () => {
  const context = useContext(QuoteContext);
  if (!context) throw new Error('QuoteContext not available');
  return context;
};
```

**Coördinatie:**
1. Accounting Agent setup QuoteContext
2. Accounting Agent wraps App in QuoteProvider
3. Accounting Agent commits: `[INTEGRATION-POINT:QUOTE-CONTEXT]`
4. WorkOrders Agent imports en gebruikt context

---

#### Pattern 3: Centralized State in App.tsx

```typescript
// src/App.tsx (Integration Agent manages this)
function App() {
  // Centralized state
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  return (
    <Router>
      <Routes>
        <Route path="/accounting" element={
          <AccountingPage
            quotes={quotes}
            setQuotes={setQuotes}
            workOrders={workOrders}  // For integration
          />
        } />
        <Route path="/workorders" element={
          <WorkOrdersPage
            workOrders={workOrders}
            setWorkOrders={setWorkOrders}
            quotes={quotes}  // For integration
          />
        } />
      </Routes>
    </Router>
  );
}
```

**Coördinatie:**
1. Architecture Agent defines state structure
2. Integration Agent adds state to App.tsx
3. Feature Agents receive state via props
4. No direct inter-module imports needed

---

### Integration Checklist

Bij het implementeren van een integration:

- [ ] **Contract Defined:** Interface/type voor data exchange
- [ ] **Provider Ready:** Export functie/context beschikbaar
- [ ] **Consumer Waiting:** Import alleen na provider commit
- [ ] **Error Handling:** Wat als data niet beschikbaar?
- [ ] **Testing:** Integration tests voor de flow
- [ ] **Documentation:** Integration gedocumenteerd in beide modules

---

## 💡 Best Practices

### 1. Communication via Git Commits

Gebruik commits om met andere agents te communiceren:

```bash
# ✅ GOED - Clear, actionable
git commit -m "feat(accounting): Expose convertQuoteToWorkOrder

[INTEGRATION-POINT:QUOTE-TO-WO]
Exposes: convertQuoteToWorkOrder(quote: Quote): WorkOrder
Location: src/features/accounting/services/quoteService.ts
Consumer: WorkOrders module can now import this

Next: WorkOrders agent can implement quote → workorder flow
"

# ❌ FOUT - Vague
git commit -m "added some accounting stuff"
```

### 2. Atomic Commits

Commit vaak, kleine stukjes:

```bash
# ✅ GOED - Atomic commits
git commit -m "feat(accounting): Add Quote interface"
git commit -m "feat(accounting): Add useQuotes hook"
git commit -m "feat(accounting): Add QuoteList component"

# ❌ FOUT - Mega commit
git commit -m "feat(accounting): Entire accounting module"
```

### 3. Branch Naming

Gebruik duidelijke branch namen:

```bash
# ✅ GOED
agent/accounting-module
agent/crm-email-integration
agent/fix-workorder-sync

# ❌ FOUT
feature-branch
test
my-changes
```

### 4. Regular Syncing

Pull vaak om conflicts te voorkomen:

```bash
# Elke 30 minuten of na elke commit van andere agents
git fetch origin
git pull origin main  # Of jouw branch
```

### 5. Tag Everything

Gebruik tags voor visibility:

```
[HANDOFF:PHASE-DONE]
[INTEGRATION-POINT:NAME]
[BLOCKED:REASON]
[UNBLOCKED]
[CONFLICT-RESOLVED]
[BREAKING-CHANGE]
[READY-FOR-REVIEW]
```

### 6. Lock Shared Files

Gebruik `.agent-lock.json` voor shared files:

```bash
# Voordat je src/types.ts bewerkt
# Check lock, acquire lock, work, release lock
# Zie AGENT_STATE_MANAGEMENT.md
```

### 7. Test Before Handoff

Voor elke handoff:

```bash
npm run type-check  # TypeScript errors?
npm run lint        # Linting errors?
npm run test        # Tests failing?
npm run build       # Build broken?
```

### 8. Document Integration Points

Bij elke integration point:

```typescript
/**
 * INTEGRATION POINT: Quote → WorkOrder Conversion
 *
 * Consumer: WorkOrders module
 * Provider: Accounting module
 *
 * @example
 * import { convertQuoteToWorkOrder } from '@/features/accounting/services';
 * const workOrder = convertQuoteToWorkOrder(quote);
 */
export const convertQuoteToWorkOrder = (quote: Quote): WorkOrder => {
  // ...
};
```

---

## 🚨 Emergency Protocols

### Emergency Stop

Als kritieke issue wordt ontdekt:

```bash
# Create emergency branch
git checkout -b emergency/critical-bug

# Fix ASAP
# ...

# Commit met CRITICAL tag
git commit -m "fix: CRITICAL - [beschrijving]

[EMERGENCY-FIX]
Severity: Critical
Impact: All modules
Resolution: [beschrijving fix]

All agents: Please pull immediately and rebase your work.
"

git push origin emergency/critical-bug

# Merge immediately
git checkout main
git merge emergency/critical-bug
git push origin main
```

### Rollback Protocol

Als een merge grote problemen veroorzaakt:

```bash
# 1. Identify problematic commit
git log --oneline

# 2. Revert commit
git revert <commit-hash>

# 3. Notify all agents
git commit --allow-empty -m "[ROLLBACK-ALERT]
Reverted: <commit-hash>
Reason: [reason]
Action: All agents pull latest and restart work
"
```

---

## 📚 Gerelateerde Documentatie

- [AGENT_TASK_BOUNDARIES.md](./AGENT_TASK_BOUNDARIES.md) - Ownership boundaries
- [AGENT_STATE_MANAGEMENT.md](./AGENT_STATE_MANAGEMENT.md) - State locking mechanism
- [AGENT_CHECKLIST.md](./AGENT_CHECKLIST.md) - Pre/post task checklist
- [AI_GUIDE.md](./AI_GUIDE.md) - Development guidelines
- [CONVENTIONS.md](../CONVENTIONS.md) - Code conventions

---

## 🆘 Support

**Voor vragen over multi-agent workflow:**

1. Check deze documentatie
2. Check `.agent-lock.json` voor locks
3. Check git log voor laatste commits
4. Tag Integration Agent in commit message

---

**Laatste update:** Januari 2025
**Versie:** 1.0.0
**Status:** Productie-ready

**Veel succes met collaboratie! 🤖🤝🤖**
