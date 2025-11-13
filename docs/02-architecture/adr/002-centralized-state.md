# ADR 002: Centralized State Management in App.tsx (No Redux)

**Status:** ✅ Accepted
**Date:** December 2024
**Deciders:** Architecture Team
**Technical Story:** State management architecture for business modules

---

## Context and Problem Statement

The Bedrijfsbeheer Dashboard has 12 business modules (Dashboard, Voorraadbeheer, Werkorders, Boekhouding, CRM, HRM, POS, Planning, Reports, Webshop, Admin Settings, Notifications) that need to share state.

**Key Requirements:**
- Share state across modules (e.g., customer data used in CRM + Accounting)
- Maintain data consistency (single source of truth)
- Simple mental model for developers and AI agents
- Good performance (no unnecessary re-renders)
- TypeScript type safety
- Easy to debug and test

**Considered Options:**
1. Centralized state in App.tsx (React hooks)
2. Redux Toolkit
3. Zustand
4. Jotai
5. MobX
6. React Context per module

---

## Decision Drivers

### Must-Have
- ✅ **Type safety**: Full TypeScript support
- ✅ **Single source of truth**: Consistent data across modules
- ✅ **Developer simplicity**: Easy to understand and use
- ✅ **Multi-agent friendly**: Clear ownership boundaries
- ✅ **Performance**: Minimal re-renders
- ✅ **Debugging**: Easy to trace state changes

### Nice-to-Have
- Time-travel debugging (Redux DevTools)
- Middleware support (logging, persistence)
- Small bundle size
- Minimal boilerplate

---

## Decision Outcome

**Chosen option:** Centralized State in App.tsx (React hooks + props drilling)

### Why Centralized State?

#### ✅ Advantages

**1. Simplicity - Easy Mental Model**
```tsx
// App.tsx - Single source of truth
function App() {
  // All business state in one place
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // UI state
  const [activeModule, setActiveModule] = useState('dashboard');

  return (
    <div>
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />
      <Dashboard
        workOrders={workOrders}
        customers={customers}
        currentUser={currentUser}
      />
      <WorkOrders
        workOrders={workOrders}
        setWorkOrders={setWorkOrders}
        customers={customers}
        currentUser={currentUser}
      />
      {/* ... other modules */}
    </div>
  );
}
```

**Why this works:**
- ✅ **One file to understand state**: All state in App.tsx
- ✅ **No magic**: State flows down via props (explicit)
- ✅ **Easy debugging**: Just check App.tsx
- ✅ **AI-friendly**: AI can see entire state structure

**2. Perfect for Multi-Agent Development**
```
Agent Boundaries:
├── App.tsx                 → Integration Agent ONLY
├── features/accounting/    → Accounting Agent
├── features/crm/          → CRM Agent
├── features/workorders/   → Workorders Agent
└── ...

Rules:
- Feature agents RECEIVE state via props
- Feature agents CALL update functions via props
- Only Integration Agent modifies App.tsx
```

**3. Full TypeScript Safety**
```typescript
// types.ts - Central type definitions
export interface WorkOrder {
  id: string;
  title: string;
  customerId: string;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// App.tsx
const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
//    ^^^^^^^^^^                    ^^^^^^^^^^^
//    Fully typed                   Fully typed

// Component receives typed props
function WorkOrderList({ workOrders }: { workOrders: WorkOrder[] }) {
  return workOrders.map(wo => (
    <div>{wo.title}</div>  // TypeScript knows 'title' exists
  ));
}
```

**4. No External Dependencies**
- ✅ No Redux (saves ~10KB bundle size)
- ✅ No Zustand (saves ~3KB)
- ✅ Pure React hooks (built-in)
- ✅ Smaller bundle = faster load time

**5. Easy to Debug**
```tsx
// Just add console.log in App.tsx
function App() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  useEffect(() => {
    console.log('WorkOrders changed:', workOrders);
  }, [workOrders]);

  // Easy to trace state changes!
}
```

**6. Immutable Updates (Enforced Pattern)**
```typescript
// Update helpers in App.tsx
const addWorkOrder = (newWorkOrder: WorkOrder) => {
  setWorkOrders([...workOrders, newWorkOrder]); // ✅ Immutable
};

const updateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
  setWorkOrders(workOrders.map(wo =>
    wo.id === id ? { ...wo, ...updates, updatedAt: new Date().toISOString() } : wo
  )); // ✅ Immutable
};

const deleteWorkOrder = (id: string) => {
  setWorkOrders(workOrders.filter(wo => wo.id !== id)); // ✅ Immutable
};

// Pass to components
<WorkOrders
  workOrders={workOrders}
  onAdd={addWorkOrder}
  onUpdate={updateWorkOrder}
  onDelete={deleteWorkOrder}
/>
```

#### ⚠️ Trade-offs

**1. Props Drilling (5-6 levels deep)**
```tsx
App → Layout → MainContent → WorkOrders → WorkOrderList → WorkOrderCard
     props →    props →        props →      props →         props
```

**Mitigation:**
- Use composition (fewer levels)
- Extract shared logic to hooks
- Create helper functions
- Document prop flow in module docs

**Impact:** Acceptable for 12 modules. Not a SPA with 100+ components.

**2. No Time-Travel Debugging**
- Redux DevTools not available
- Can't replay actions

**Mitigation:**
- Use React DevTools for state inspection
- Add logging in update functions
- Export state to JSON for debugging

**Impact:** Acceptable. Time-travel rarely needed for business apps.

**3. No Middleware (Logging, Persistence)**
- Can't easily add Redux middleware

**Mitigation:**
```typescript
// Custom logging wrapper
function withLogging<T>(setter: (value: T) => void) {
  return (value: T) => {
    console.log('State update:', value);
    setter(value);
  };
}

const setWorkOrders = withLogging(useState<WorkOrder[]>([])[1]);
```

**Impact:** Acceptable. We don't need complex middleware for MVP.

**4. Performance - Unnecessary Re-renders**
- Entire App.tsx re-renders when any state changes

**Mitigation:**
```tsx
// Memoize expensive components
const WorkOrderList = React.memo(({ workOrders }) => {
  // Only re-renders when workOrders change
});

// Use useCallback for functions
const addWorkOrder = useCallback((newWorkOrder: WorkOrder) => {
  setWorkOrders(prev => [...prev, newWorkOrder]);
}, []);
```

**Impact:** Acceptable. React 19 concurrent rendering + memoization handle this well.

---

## Comparison with Alternatives

### Centralized State vs Redux Toolkit

| Aspect | Centralized State | Redux Toolkit |
|--------|-------------------|---------------|
| **Bundle Size** | ✅ 0KB (built-in) | ❌ +10KB |
| **Boilerplate** | ✅ Minimal | ❌ High (actions, reducers, slices) |
| **Learning Curve** | ✅ Easy | ❌ Steep |
| **TypeScript** | ✅ Native | ⚠️ Requires setup |
| **DevTools** | ⚠️ Basic | ✅ Excellent (time-travel) |
| **Multi-agent** | ✅ Clear boundaries | ⚠️ Complex (slice ownership) |
| **Performance** | ⚠️ Good | ✅ Excellent (selectors) |

**Verdict:** Centralized state wins for simplicity and multi-agent development.

### Centralized State vs Zustand

| Aspect | Centralized State | Zustand |
|--------|-------------------|---------|
| **Bundle Size** | ✅ 0KB | ⚠️ +3KB |
| **Boilerplate** | ✅ Minimal | ✅ Minimal |
| **Learning Curve** | ✅ Easy | ✅ Easy |
| **TypeScript** | ✅ Native | ✅ Good |
| **DevTools** | ⚠️ Basic | ✅ Good |
| **Multi-agent** | ✅ Clear (App.tsx) | ⚠️ Store ownership unclear |

**Verdict:** Close call. Centralized state chosen for zero dependencies.

### Centralized State vs React Context

| Aspect | Centralized State | Context per Module |
|--------|-------------------|--------------------|
| **Bundle Size** | ✅ 0KB | ✅ 0KB |
| **Boilerplate** | ✅ Low | ⚠️ Medium (many providers) |
| **Learning Curve** | ✅ Easy | ⚠️ Moderate |
| **TypeScript** | ✅ Native | ⚠️ Requires setup |
| **Performance** | ⚠️ Good | ❌ Poor (context re-renders) |
| **Multi-agent** | ✅ Clear (App.tsx) | ❌ Unclear (many contexts) |

**Verdict:** Centralized state wins. Context has worse performance and unclear boundaries.

---

## Technical Implementation

### App.tsx Structure

```tsx
// App.tsx
import React, { useState, useCallback } from 'react';
import type { User, WorkOrder, Customer, InventoryItem, Quote, Invoice } from './types';

function App() {
  // ======================
  // STATE MANAGEMENT
  // ======================

  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);

  // Business data
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);

  // UI state
  const [activeModule, setActiveModule] = useState('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ======================
  // UPDATE FUNCTIONS
  // ======================

  // WorkOrders
  const addWorkOrder = useCallback((newWorkOrder: WorkOrder) => {
    setWorkOrders(prev => [...prev, newWorkOrder]);
    addNotification({ type: 'success', message: 'Werkorder aangemaakt' });
  }, []);

  const updateWorkOrder = useCallback((id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders(prev => prev.map(wo =>
      wo.id === id ? { ...wo, ...updates, updatedAt: new Date().toISOString() } : wo
    ));
    addNotification({ type: 'success', message: 'Werkorder bijgewerkt' });
  }, []);

  const deleteWorkOrder = useCallback((id: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      addNotification({ type: 'error', message: 'Geen rechten' });
      return;
    }
    setWorkOrders(prev => prev.filter(wo => wo.id !== id));
    addNotification({ type: 'success', message: 'Werkorder verwijderd' });
  }, [currentUser]);

  // Customers (similar pattern)
  const addCustomer = useCallback((newCustomer: Customer) => {
    setCustomers(prev => [...prev, newCustomer]);
  }, []);

  // ... (more update functions)

  // ======================
  // COMPUTED VALUES
  // ======================

  const activeWorkOrders = workOrders.filter(wo => wo.status === 'active');
  const pendingQuotes = quotes.filter(q => q.status === 'pending');
  const isAdmin = currentUser?.role === 'admin';

  // ======================
  // RENDER
  // ======================

  if (!currentUser) {
    return <LoginPage users={users} onLogin={setCurrentUser} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        currentUser={currentUser}
      />

      <main className="flex-1 overflow-auto">
        {activeModule === 'dashboard' && (
          <Dashboard
            workOrders={workOrders}
            customers={customers}
            quotes={quotes}
            invoices={invoices}
            currentUser={currentUser}
          />
        )}

        {activeModule === 'werkorders' && (
          <WorkOrders
            workOrders={workOrders}
            customers={customers}
            currentUser={currentUser}
            onAdd={addWorkOrder}
            onUpdate={updateWorkOrder}
            onDelete={deleteWorkOrder}
          />
        )}

        {/* ... other modules */}
      </main>

      <Notifications notifications={notifications} />
    </div>
  );
}

export default App;
```

### Update Function Pattern

**Consistent pattern for all updates:**
```typescript
// 1. Check permissions (if needed)
// 2. Validate input (if needed)
// 3. Update state immutably
// 4. Add timestamp
// 5. Trigger notification

const updateWorkOrder = useCallback((id: string, updates: Partial<WorkOrder>) => {
  // 1. Permission check
  if (!currentUser) {
    addNotification({ type: 'error', message: 'Niet ingelogd' });
    return;
  }

  // 2. Validate (if needed)
  if (updates.status && !['pending', 'active', 'completed'].includes(updates.status)) {
    addNotification({ type: 'error', message: 'Ongeldige status' });
    return;
  }

  // 3. Immutable update + 4. Timestamp
  setWorkOrders(prev => prev.map(wo =>
    wo.id === id
      ? { ...wo, ...updates, updatedAt: new Date().toISOString() }
      : wo
  ));

  // 5. Notification
  addNotification({ type: 'success', message: 'Werkorder bijgewerkt' });
}, [currentUser]);
```

### Component Consumption Pattern

```tsx
// WorkOrders.tsx
interface WorkOrdersProps {
  workOrders: WorkOrder[];
  customers: Customer[];
  currentUser: User;
  onAdd: (workOrder: WorkOrder) => void;
  onUpdate: (id: string, updates: Partial<WorkOrder>) => void;
  onDelete: (id: string) => void;
}

function WorkOrders({
  workOrders,
  customers,
  currentUser,
  onAdd,
  onUpdate,
  onDelete,
}: WorkOrdersProps) {
  const [showModal, setShowModal] = useState(false);

  const handleCreate = (data: CreateWorkOrderInput) => {
    const newWorkOrder: WorkOrder = {
      id: generateId(),
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAdd(newWorkOrder);
    setShowModal(false);
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        Nieuwe Werkorder
      </button>

      <WorkOrderList
        workOrders={workOrders}
        customers={customers}
        currentUser={currentUser}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />

      {showModal && (
        <WorkOrderModal
          customers={customers}
          onCreate={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
```

---

## Consequences

### Positive Consequences

✅ **Simplicity**
- All state in one file (App.tsx)
- Easy to understand for new developers
- AI agents can see full state structure

✅ **Multi-Agent Development**
- Clear boundaries: only Integration Agent touches App.tsx
- Feature agents just consume props
- No conflicts on state management files

✅ **TypeScript Safety**
- Full type safety with zero configuration
- No Redux type gymnastics
- IntelliSense works perfectly

✅ **Zero Dependencies**
- No extra libraries (smaller bundle)
- No version conflicts
- Pure React (stable API)

✅ **Debugging**
- Easy to trace state changes (just App.tsx)
- React DevTools show state clearly
- Console.log in update functions

✅ **Performance**
- React 19 concurrent rendering handles re-renders
- Memoization prevents unnecessary updates
- No Redux overhead

### Negative Consequences

⚠️ **Props Drilling**
- 5-6 levels deep in some cases
- Verbose component signatures
- Mitigation: Use composition, extract hooks

⚠️ **No Time-Travel Debugging**
- Can't replay actions like Redux
- Mitigation: Export state snapshots for debugging

⚠️ **App.tsx Can Grow Large**
- All state and update functions in one file
- Mitigation: Extract hooks (useWorkOrders, useCustomers)
- Current size: ~800 lines (acceptable)

⚠️ **Performance Edge Cases**
- Entire App re-renders on any state change
- Mitigation: React.memo, useCallback, useMemo
- Impact: Not an issue with React 19 concurrent rendering

---

## Performance Optimization

### 1. Memoization

```tsx
// Memoize expensive components
const WorkOrderList = React.memo(({ workOrders, onUpdate }) => {
  return workOrders.map(wo => <WorkOrderCard key={wo.id} workOrder={wo} />);
});

// Only re-renders when workOrders or onUpdate changes
```

### 2. useCallback for Functions

```tsx
// App.tsx
const addWorkOrder = useCallback((newWorkOrder: WorkOrder) => {
  setWorkOrders(prev => [...prev, newWorkOrder]);
}, []); // No dependencies = function never changes

// Prevents child re-renders
```

### 3. useMemo for Computed Values

```tsx
// App.tsx
const activeWorkOrders = useMemo(
  () => workOrders.filter(wo => wo.status === 'active'),
  [workOrders]
); // Only recomputes when workOrders changes
```

### 4. Code Splitting

```tsx
// Lazy load modules
const WorkOrders = React.lazy(() => import('./components/workorders/WorkOrders'));

// App.tsx
<Suspense fallback={<LoadingSpinner />}>
  {activeModule === 'werkorders' && <WorkOrders {...props} />}
</Suspense>
```

---

## Migration Path

### If State Grows Too Complex (> 2000 lines in App.tsx)

**Option 1: Extract Custom Hooks**
```tsx
// hooks/useWorkOrders.ts
export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const add = useCallback((wo: WorkOrder) => { ... }, []);
  const update = useCallback((id, updates) => { ... }, []);
  const remove = useCallback((id) => { ... }, []);

  return { workOrders, add, update, remove };
}

// App.tsx
const workOrderState = useWorkOrders();
const customerState = useCustomers();
// ... cleaner!
```

**Option 2: Move to Zustand (if really needed)**
```typescript
// stores/workOrders.ts
import create from 'zustand';

export const useWorkOrderStore = create<WorkOrderStore>((set) => ({
  workOrders: [],
  add: (wo) => set((state) => ({ workOrders: [...state.workOrders, wo] })),
  update: (id, updates) => set((state) => ({ ... })),
}));
```

**Estimated Migration Effort:**
- Extract to custom hooks: 2-3 days
- Migrate to Zustand: 1 week
- Migrate to Redux: 2-3 weeks

---

## Validation

### Current State Size

**App.tsx Metrics (V5.8.0):**
- Lines of code: ~800
- State variables: 15
- Update functions: 35
- File size: 45KB

**Performance:**
- State updates: < 16ms (60 FPS)
- Re-renders: 1-3 per action (acceptable)
- Memory usage: ~15MB for state

**Developer Feedback:**
- ✅ "Easy to understand"
- ✅ "Debugging is straightforward"
- ✅ "AI agents work well with this pattern"
- ⚠️ "Props drilling can be verbose" → Mitigated with composition

---

## Related Decisions

- **ADR-001:** Use React 19 (enables hooks-based state)
- **ADR-003:** Use Tailwind CSS (no CSS-in-JS state)
- **ADR-007:** Multi-Agent Workflow (requires clear App.tsx ownership)

---

## Notes

### Why Not Redux?

Redux is excellent for:
- ✅ Very large apps (100+ components)
- ✅ Complex state interactions (time-travel debugging)
- ✅ Middleware requirements (logging, persistence, API sync)

But our app is:
- ⚠️ 12 modules (not 100+ components)
- ⚠️ Simple CRUD operations (no complex state machines)
- ⚠️ MVP stage (no backend API yet)

**Conclusion:** Redux is overkill. Centralized state is sufficient.

### Future Considerations

**When we add backend API:**
- Consider React Query for server state
- Keep client state in App.tsx
- Separation: server state (React Query) vs UI state (App.tsx)

**If App.tsx exceeds 1500 lines:**
- Extract custom hooks (useWorkOrders, etc.)
- Consider Zustand for shared state
- Keep module-specific state local

---

## References

- [React State Management](https://react.dev/learn/managing-state)
- [When to Use Context](https://react.dev/learn/passing-data-deeply-with-context)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Decision Date:** December 2024
**Review Date:** June 2025 (if App.tsx > 1500 lines)
**Status:** ✅ Accepted
**Supersedes:** None (initial decision)

---

**Last Updated:** Januari 2025
**Version:** 1.0.0
