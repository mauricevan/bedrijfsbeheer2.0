# Agent State Management 🔒

**Voor:** AI Agents - Voorkomen van race conditions en state conflicts
**Versie:** 1.0.0
**Laatst bijgewerkt:** Januari 2025

---

## 📋 Inhoudsopgave

1. [Overzicht](#overzicht)
2. [State Locking Mechanism](#state-locking-mechanism)
3. [Git Branch Strategy](#git-branch-strategy)
4. [State Synchronization](#state-synchronization)
5. [Avoiding Race Conditions](#avoiding-race-conditions)
6. [Conflict Detection & Resolution](#conflict-detection--resolution)
7. [Best Practices](#best-practices)

---

## 🎯 Overzicht

Wanneer meerdere AI agents simultaan werken aan hetzelfde project, is het **kritiek** om race conditions, merge conflicts, en state inconsistenties te voorkomen. Dit document beschrijft de mechanismen en protocols om veilig samen te werken.

### Kernprincipes

- 🔒 **Lock Before Edit** - Lock shared files voor bewerking
- 🌿 **Branch Per Agent** - Elke agent werkt op eigen branch
- 🔄 **Sync Frequently** - Pull regelmatig om conflicts te minimaliseren
- ✅ **Test Before Merge** - Tests moeten passing zijn
- 📢 **Communicate Changes** - Duidelijke commit messages

---

## 🔒 State Locking Mechanism

### `.agent-lock.json` Format

Create een lock file in de root van het project:

```json
{
  "version": "1.0.0",
  "locks": {
    "src/App.tsx": {
      "locked_by": null,
      "locked_at": null,
      "reason": null
    },
    "src/types.ts": {
      "locked_by": null,
      "locked_at": null,
      "reason": null
    },
    "docs/AI_GUIDE.md": {
      "locked_by": null,
      "locked_at": null,
      "reason": null
    },
    "docs/INDEX.md": {
      "locked_by": null,
      "locked_at": null,
      "reason": null
    },
    "CONVENTIONS.md": {
      "locked_by": null,
      "locked_at": null,
      "reason": null
    },
    "src/utils/shared/dateUtils.ts": {
      "locked_by": null,
      "locked_at": null,
      "reason": null
    }
  },
  "lock_history": []
}
```

### Lock Structure

```typescript
interface Lock {
  locked_by: string | null;      // Agent ID (e.g., "accounting-agent")
  locked_at: string | null;       // ISO 8601 timestamp
  reason: string | null;          // Why locked (e.g., "Adding AccountingTypes")
}

interface LockHistory {
  file: string;
  agent: string;
  locked_at: string;
  unlocked_at: string;
  duration_minutes: number;
  reason: string;
}

interface AgentLockFile {
  version: string;
  locks: Record<string, Lock>;
  lock_history: LockHistory[];
}
```

---

## 🔐 Locking Protocol

### Step-by-Step Locking

#### Step 1: Check Lock Status

```bash
# Check if file is locked
cat .agent-lock.json | jq '.locks["src/types.ts"]'

# Expected output if available:
{
  "locked_by": null,
  "locked_at": null,
  "reason": null
}

# Expected output if locked:
{
  "locked_by": "crm-agent",
  "locked_at": "2025-01-27T10:30:00Z",
  "reason": "Adding Customer interface"
}
```

#### Step 2: Acquire Lock (if available)

```bash
# Using jq to update JSON
jq '.locks["src/types.ts"] = {
  "locked_by": "accounting-agent",
  "locked_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "reason": "Adding Quote and Invoice interfaces"
}' .agent-lock.json > tmp.json && mv tmp.json .agent-lock.json

# Commit lock immediately
git add .agent-lock.json
git commit -m "chore: Lock src/types.ts for accounting-agent

Reason: Adding Quote and Invoice interfaces
Estimated duration: 15 minutes
"
git push
```

#### Step 3: Do Your Work

```bash
# Now you have exclusive access to the file
# Edit src/types.ts
nano src/types.ts

# Make your changes...
export interface Quote {
  id: string;
  // ... fields
}

export interface Invoice {
  id: string;
  // ... fields
}

# Test your changes
npm run type-check
npm run build
```

#### Step 4: Commit Your Changes

```bash
# Commit actual changes
git add src/types.ts
git commit -m "feat(types): Add Quote and Invoice interfaces

- Added Quote interface for accounting module
- Added Invoice interface for accounting module
- All fields typed according to CONVENTIONS.md
"
git push
```

#### Step 5: Release Lock

```bash
# Update lock history
jq '
  .lock_history += [{
    "file": "src/types.ts",
    "agent": "accounting-agent",
    "locked_at": (.locks["src/types.ts"].locked_at),
    "unlocked_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "reason": (.locks["src/types.ts"].reason)
  }] |
  .locks["src/types.ts"] = {
    "locked_by": null,
    "locked_at": null,
    "reason": null
  }
' .agent-lock.json > tmp.json && mv tmp.json .agent-lock.json

# Commit unlock
git add .agent-lock.json
git commit -m "chore: Unlock src/types.ts

Completed: Quote and Invoice interfaces added
Duration: 12 minutes
"
git push
```

---

### Lock Helper Script

Create een helper script om locking te vereenvoudigen:

```bash
#!/bin/bash
# scripts/lock-agent.sh

AGENT_ID="$1"
FILE_PATH="$2"
REASON="$3"
ACTION="$4"  # "acquire" or "release"

if [ "$ACTION" == "acquire" ]; then
  # Check if already locked
  CURRENT_LOCK=$(cat .agent-lock.json | jq -r ".locks[\"$FILE_PATH\"].locked_by")

  if [ "$CURRENT_LOCK" != "null" ] && [ "$CURRENT_LOCK" != "" ]; then
    echo "❌ File is already locked by: $CURRENT_LOCK"
    cat .agent-lock.json | jq ".locks[\"$FILE_PATH\"]"
    exit 1
  fi

  # Acquire lock
  jq ".locks[\"$FILE_PATH\"] = {
    \"locked_by\": \"$AGENT_ID\",
    \"locked_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"reason\": \"$REASON\"
  }" .agent-lock.json > tmp.json && mv tmp.json .agent-lock.json

  # Commit
  git add .agent-lock.json
  git commit -m "chore: Lock $FILE_PATH for $AGENT_ID

Reason: $REASON
"
  git push

  echo "✅ Lock acquired for $FILE_PATH"

elif [ "$ACTION" == "release" ]; then
  # Release lock and add to history
  LOCKED_AT=$(cat .agent-lock.json | jq -r ".locks[\"$FILE_PATH\"].locked_at")
  UNLOCK_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  jq "
    .lock_history += [{
      \"file\": \"$FILE_PATH\",
      \"agent\": \"$AGENT_ID\",
      \"locked_at\": \"$LOCKED_AT\",
      \"unlocked_at\": \"$UNLOCK_AT\",
      \"reason\": (.locks[\"$FILE_PATH\"].reason)
    }] |
    .locks[\"$FILE_PATH\"] = {
      \"locked_by\": null,
      \"locked_at\": null,
      \"reason\": null
    }
  " .agent-lock.json > tmp.json && mv tmp.json .agent-lock.json

  # Commit
  git add .agent-lock.json
  git commit -m "chore: Unlock $FILE_PATH

Completed by: $AGENT_ID
"
  git push

  echo "✅ Lock released for $FILE_PATH"
else
  echo "Usage: $0 <agent-id> <file-path> <reason> <acquire|release>"
  exit 1
fi
```

**Usage:**

```bash
# Make executable
chmod +x scripts/lock-agent.sh

# Acquire lock
./scripts/lock-agent.sh accounting-agent src/types.ts "Adding Quote interface" acquire

# Release lock
./scripts/lock-agent.sh accounting-agent src/types.ts "" release
```

---

## 🌿 Git Branch Strategy

### Branch Naming Convention

```
main
├── agent/accounting-module
├── agent/crm-module
├── agent/workorders-module
├── agent/inventory-module
├── agent/hrm-module
└── agent/integration-merge
```

**Format:** `agent/[module-or-task-name]`

### Branch Workflow

#### Agent Creates Branch

```bash
# 1. Start from latest main
git checkout main
git pull origin main

# 2. Create agent branch
git checkout -b agent/accounting-module

# 3. Push to remote
git push -u origin agent/accounting-module
```

#### Agent Works on Branch

```bash
# Regular workflow
# ... make changes ...

git add .
git commit -m "feat(accounting): Add quote management"
git push origin agent/accounting-module

# ... more changes ...

git add .
git commit -m "feat(accounting): Add invoice management"
git push origin agent/accounting-module
```

#### Keep Branch Updated

```bash
# Periodically sync with main to avoid large conflicts
git checkout agent/accounting-module
git fetch origin main
git merge origin/main

# Resolve any conflicts
# ... resolve ...

git add .
git commit -m "merge: Sync with main"
git push origin agent/accounting-module
```

---

### Integration Agent Merges

```bash
# Integration Agent handles merges
git checkout main
git pull origin main

# Merge agent branches one by one
git merge agent/accounting-module
# Resolve conflicts if any
git add .
git commit -m "merge: Integrate Accounting module"

git merge agent/crm-module
# Resolve conflicts if any
git add .
git commit -m "merge: Integrate CRM module"

git merge agent/workorders-module
# Resolve conflicts if any
git add .
git commit -m "merge: Integrate WorkOrders module"

# Test integration
npm run test
npm run build

# Push integrated main
git push origin main

# Tag handoff
git commit --allow-empty -m "[HANDOFF:INTEGRATION-DONE]"
git push origin main
```

---

### Branch Protection Rules

Stel branch protection in voor `main`:

```yaml
# .github/branch-protection.yml
main:
  required_status_checks:
    - build
    - test
    - type-check
  required_approvals: 1
  dismiss_stale_reviews: true
  require_code_owner_reviews: true
  restrict_pushes:
    - integration-agent  # Only Integration Agent can merge to main
```

---

## 🔄 State Synchronization

### Pattern 1: Centralized State (Current)

**Gebruikt in:** App.tsx

```typescript
// src/App.tsx
function App() {
  // Centralized state managed by Integration Agent
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  return (
    <Router>
      <Routes>
        {/* State passed down via props */}
        <Route path="/accounting" element={
          <AccountingPage
            quotes={quotes}
            setQuotes={setQuotes}
            invoices={invoices}
            setInvoices={setInvoices}
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

**Synchronization:**
- Integration Agent manages App.tsx
- Feature Agents receive state via props
- Changes flow through setters
- Single source of truth

---

### Pattern 2: Context API (Optional)

Voor modules met veel gedeelde state:

```typescript
// src/features/accounting/context/QuoteContext.tsx
// Managed by Accounting Agent

import { createContext, useContext, useState, ReactNode } from 'react';

interface QuoteContextType {
  quotes: Quote[];
  addQuote: (quote: Quote) => void;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
}

const QuoteContext = createContext<QuoteContextType | null>(null);

export const QuoteProvider = ({ children }: { children: ReactNode }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const addQuote = (quote: Quote) => {
    setQuotes(prev => [...prev, quote]);
  };

  const updateQuote = (id: string, updates: Partial<Quote>) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  return (
    <QuoteContext.Provider value={{ quotes, addQuote, updateQuote, deleteQuote }}>
      {children}
    </QuoteContext.Provider>
  );
};

export const useQuotes = () => {
  const context = useContext(QuoteContext);
  if (!context) throw new Error('useQuotes must be used within QuoteProvider');
  return context;
};
```

**Setup (Integration Agent):**

```typescript
// src/App.tsx
import { QuoteProvider } from '@/features/accounting/context';

function App() {
  return (
    <QuoteProvider>
      <Router>
        {/* Routes */}
      </Router>
    </QuoteProvider>
  );
}
```

**Usage (WorkOrders Agent):**

```typescript
// src/features/workorders/hooks/useWorkOrders.ts
import { useQuotes } from '@/features/accounting/context';

export const useWorkOrders = () => {
  const { quotes } = useQuotes();

  const createWorkOrderFromQuote = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    // ...
  };
};
```

**Synchronization:**
- Accounting Agent creates and manages QuoteContext
- Integration Agent wraps App in QuoteProvider
- WorkOrders Agent consumes context (read-only or via exposed methods)

---

### Pattern 3: Event Bus (Advanced)

Voor loosely coupled modules:

```typescript
// src/utils/eventBus.ts
// Managed by Architecture Agent

type EventCallback = (data: any) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  emit(event: string, data?: any) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
}

export const eventBus = new EventBus();
```

**Usage:**

```typescript
// Accounting Agent (Publisher)
import { eventBus } from '@/utils/eventBus';

const createInvoice = (invoice: Invoice) => {
  setInvoices(prev => [...prev, invoice]);

  // Emit event
  eventBus.emit('invoice:created', invoice);
};

// CRM Agent (Subscriber)
import { eventBus } from '@/utils/eventBus';

useEffect(() => {
  const handleInvoiceCreated = (invoice: Invoice) => {
    // Update customer stats
    updateCustomerInvoiceTotal(invoice.customerId);
  };

  eventBus.on('invoice:created', handleInvoiceCreated);

  return () => {
    eventBus.off('invoice:created', handleInvoiceCreated);
  };
}, []);
```

---

## ⚠️ Avoiding Race Conditions

### Race Condition Example

#### ❌ **BAD** - Race Condition

```typescript
// Agent 1 (Accounting) en Agent 2 (WorkOrders) wijzigen tegelijk App.tsx

// Agent 1 push (10:00:00):
function App() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  // ... accounting state only
}

// Agent 2 push (10:00:05):
function App() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  // ... workorders state only
}

// Merge conflict! 💥
```

**Result:** Git merge conflict in App.tsx

---

#### ✅ **GOOD** - Sequential Approach

```typescript
// Architecture Agent setup ALL state EERST (FASE 1):
function App() {
  // Complete state setup upfront
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // ... all state
}

// COMMIT & TAG: [HANDOFF:ARCHITECTURE-DONE]

// Feature Agents (FASE 2+) RECEIVE state via props
// No wijzigingen aan App.tsx needed!
```

**Result:** No conflicts, clean separation

---

### Race Condition Types

#### Type 1: Simultaneous File Edit

**Problem:**
```
Agent A: Edit src/types.ts (10:00:00)
Agent B: Edit src/types.ts (10:00:05)
Result: Merge conflict
```

**Prevention:**
```
✅ Use .agent-lock.json
✅ Lock file before edit
✅ Release lock after commit
```

---

#### Type 2: State Inconsistency

**Problem:**
```typescript
// Agent A creates Quote with ID "Q1"
const quote = { id: 'Q1', ... };
setQuotes(prev => [...prev, quote]);

// Agent B simultaneously creates WorkOrder referencing "Q1"
// But Quote not yet in state!
const workOrder = { quoteId: 'Q1', ... };  // ❌ Q1 doesn't exist yet!
```

**Prevention:**
```typescript
// ✅ Wait for integration point
// Accounting Agent commits Quote feature with tag
git commit -m "[INTEGRATION-POINT:QUOTES-READY]"

// WorkOrders Agent waits for tag before using Quotes
```

---

#### Type 3: Divergent Branches

**Problem:**
```
main (10:00) ──┬── agent/accounting ── commit A ── commit B
               └── agent/crm ───────── commit C ── commit D

# Both branches diverge significantly
# Large merge required
```

**Prevention:**
```bash
# ✅ Sync frequently
git checkout agent/accounting
git fetch origin main
git merge origin/main  # Every 30-60 minutes

# Keep branches close to main
```

---

## 🔍 Conflict Detection & Resolution

### Detection Methods

#### Method 1: Pre-Merge Check

```bash
# Before merging agent branch to main
git checkout main
git pull origin main

# Dry run merge
git merge --no-commit --no-ff agent/accounting-module

# Check for conflicts
if git diff --name-only --diff-filter=U | grep -q .; then
  echo "⚠️ Conflicts detected!"
  git merge --abort
  # Notify agents
else
  echo "✅ No conflicts, safe to merge"
  git merge --abort  # Abort dry run
  git merge agent/accounting-module  # Real merge
fi
```

#### Method 2: CI/CD Check

```yaml
# .github/workflows/conflict-check.yml
name: Conflict Check

on:
  pull_request:
    branches: [main]

jobs:
  check-conflicts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for merge conflicts
        run: |
          git fetch origin main
          git merge --no-commit --no-ff origin/main || {
            echo "❌ Merge conflicts detected!"
            exit 1
          }
          git merge --abort
```

---

### Resolution Strategies

#### Strategy 1: Manual Merge (Integration Agent)

```bash
# Integration Agent
git checkout main
git merge agent/accounting-module

# Conflict in src/types.ts
# Auto-merging src/types.ts
# CONFLICT (content): Merge conflict in src/types.ts
# Automatic merge failed; fix conflicts and then commit the result.

# Open file
nano src/types.ts

# Resolve markers
<<<<<<< HEAD
// CRM types
export interface Customer { ... }
=======
// Accounting types
export interface Quote { ... }
>>>>>>> agent/accounting-module

# Manual merge
// CRM types
export interface Customer { ... }

// Accounting types
export interface Quote { ... }

# Complete merge
git add src/types.ts
git commit -m "merge: Resolve types.ts conflict

Merged:
- Customer interface from CRM
- Quote interface from Accounting

No conflicts, both added successfully.
"
```

---

#### Strategy 2: Rebase (Agent)

```bash
# Agent rebases onto latest main
git checkout agent/accounting-module
git fetch origin main
git rebase origin/main

# Resolve conflicts during rebase
# ... resolve ...

git add .
git rebase --continue

# Force push (rebase rewrites history)
git push origin agent/accounting-module --force-with-lease
```

**When to use:**
- ✅ Branch is niet gemerged naar main
- ✅ Only één agent werkt op branch
- ❌ Branch is al gemerged (gebruik merge)

---

#### Strategy 3: Cherry-Pick (Selective)

```bash
# Integration Agent selectively picks commits
git checkout main

# Pick specific commits from agent branch
git cherry-pick <commit-hash-1>
git cherry-pick <commit-hash-2>

# Skip conflicting commits
# Notify agent to refactor those commits
```

**When to use:**
- ⚠️ Only if some commits can't be merged
- ⚠️ Last resort (prefer full merge)

---

## 💡 Best Practices

### 1. Lock Shared Files

```bash
# ✅ ALWAYS lock shared files
./scripts/lock-agent.sh accounting-agent src/types.ts "Adding types" acquire

# ❌ NEVER edit without lock
nano src/types.ts  # NO!
```

### 2. Small, Frequent Commits

```bash
# ✅ GOOD - Atomic commits
git commit -m "feat(accounting): Add Quote interface"
git commit -m "feat(accounting): Add useQuotes hook"
git commit -m "feat(accounting): Add QuoteList component"

# ❌ BAD - Mega commit
git commit -m "feat(accounting): Complete accounting module"
```

### 3. Sync Frequently

```bash
# Pull every 30-60 minutes
git fetch origin
git merge origin/main  # Or rebase
```

### 4. Test Before Push

```bash
# ALWAYS before push
npm run type-check
npm run lint
npm run test
npm run build

# Only push if all pass
git push
```

### 5. Clear Commit Messages

```bash
# ✅ GOOD
git commit -m "feat(accounting): Add Quote interface

Added Quote interface to src/types.ts with following fields:
- id: string
- customerId: string
- items: QuoteItem[]
- total: number

[INTEGRATION-POINT:QUOTE-TYPE]
Consumer: WorkOrders module can now import Quote type
"

# ❌ BAD
git commit -m "updated types"
```

### 6. Tag Important Commits

```bash
# Handoff points
git commit -m "[HANDOFF:ACCOUNTING-DONE]"

# Integration points
git commit -m "[INTEGRATION-POINT:QUOTES-READY]"

# Blocking issues
git commit -m "[BLOCKED:NEED-WORKORDER-TYPES]"
```

### 7. Use Pull Requests

```bash
# Create PR for visibility
gh pr create \
  --title "feat: Accounting Module Implementation" \
  --body "
## Changes
- Quote management
- Invoice management
- Payment tracking

## Testing
- [x] Unit tests passing
- [x] Integration tests passing
- [x] Build successful

## Integration Points
- Exposes convertQuoteToWorkOrder for WorkOrders module
- Consumes Customer data from CRM module
  "
```

### 8. Monitor Lock File

```bash
# Check active locks
cat .agent-lock.json | jq '.locks | to_entries[] | select(.value.locked_by != null)'

# Check lock history
cat .agent-lock.json | jq '.lock_history[-5:]'  # Last 5 locks
```

### 9. Emergency Unlock

```bash
# If agent crashes and doesn't release lock
# Integration Agent can force unlock

jq '.locks["src/types.ts"] = {
  "locked_by": null,
  "locked_at": null,
  "reason": null
}' .agent-lock.json > tmp.json && mv tmp.json .agent-lock.json

git add .agent-lock.json
git commit -m "chore: Emergency unlock src/types.ts

Reason: accounting-agent crashed without releasing lock
Verified: File is safe to unlock (no pending changes)
"
git push
```

### 10. Backup Before Major Merge

```bash
# Integration Agent before major merge
git branch backup/pre-integration-$(date +%Y%m%d)
git push origin backup/pre-integration-$(date +%Y%m%d)

# Now safe to merge
git merge agent/accounting-module
git merge agent/crm-module
# etc...
```

---

## 📚 Gerelateerde Documentatie

- [MULTI_AGENT_WORKFLOW.md](./MULTI_AGENT_WORKFLOW.md) - Complete workflow
- [AGENT_TASK_BOUNDARIES.md](./AGENT_TASK_BOUNDARIES.md) - File ownership
- [AGENT_CHECKLIST.md](./AGENT_CHECKLIST.md) - Pre/post task checks
- [AI_GUIDE.md](./AI_GUIDE.md) - Development guidelines

---

## 🆘 Troubleshooting

### Issue: Lock File Doesn't Exist

```bash
# Create initial lock file
cat > .agent-lock.json << 'EOF'
{
  "version": "1.0.0",
  "locks": {
    "src/App.tsx": {"locked_by": null, "locked_at": null, "reason": null},
    "src/types.ts": {"locked_by": null, "locked_at": null, "reason": null},
    "docs/AI_GUIDE.md": {"locked_by": null, "locked_at": null, "reason": null},
    "docs/INDEX.md": {"locked_by": null, "locked_at": null, "reason": null},
    "CONVENTIONS.md": {"locked_by": null, "locked_at": null, "reason": null}
  },
  "lock_history": []
}
EOF

git add .agent-lock.json
git commit -m "chore: Add agent lock file"
git push
```

### Issue: Merge Conflict in Lock File

```bash
# Accept "theirs" version (most recent lock state)
git checkout --theirs .agent-lock.json
git add .agent-lock.json
git commit -m "merge: Resolve lock file conflict"
```

### Issue: Stale Lock

```bash
# If lock is >2 hours old and agent not responding
# Integration Agent can force unlock
# See "Emergency Unlock" in Best Practices
```

---

**Laatste update:** Januari 2025
**Versie:** 1.0.0
**Status:** Productie-ready

**Lock wisely, merge safely! 🔒**
