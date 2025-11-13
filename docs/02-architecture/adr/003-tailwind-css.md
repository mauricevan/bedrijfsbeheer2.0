# ADR 003: Use Tailwind CSS 4 for Styling

**Status:** ✅ Accepted
**Date:** December 2024
**Deciders:** Architecture Team, UX Designer
**Technical Story:** Styling strategy for business management dashboard

---

## Context and Problem Statement

The Bedrijfsbeheer Dashboard needs a consistent, maintainable, and responsive styling solution for 12 business modules with complex UI components (tables, forms, modals, charts, kanban boards).

**Key Requirements:**
- Consistent design system across 12 modules
- Responsive design (mobile, tablet, desktop)
- Fast development velocity
- Easy to maintain and modify
- Dark mode support (future)
- Good performance (small CSS bundle)
- TypeScript/IntelliSense support
- Multi-agent friendly (no style conflicts)

**Considered Options:**
1. Tailwind CSS 4
2. CSS Modules
3. Styled Components (CSS-in-JS)
4. Emotion
5. Plain CSS/SCSS
6. Material-UI (MUI)
7. Chakra UI

---

## Decision Drivers

### Must-Have
- ✅ **Consistent design system**: Same spacing, colors, typography across all modules
- ✅ **Responsive utilities**: Easy mobile/tablet/desktop breakpoints
- ✅ **Fast development**: Quick iteration on UI
- ✅ **Small bundle size**: Purge unused CSS
- ✅ **Multi-agent safe**: No style conflicts between agents
- ✅ **TypeScript support**: IntelliSense for class names

### Nice-to-Have
- Dark mode support
- Animation utilities
- Component library integration
- Design token export (for designers)

---

## Decision Outcome

**Chosen option:** Tailwind CSS 4

### Why Tailwind CSS 4?

#### ✅ Advantages

**1. Utility-First = Fast Development**
```tsx
// ✅ Tailwind - Inline, fast, no context switching
<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Nieuwe Werkorder
</button>

// ❌ CSS Modules - Context switching, more files
// Button.module.css
.button {
  background-color: #2563eb;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
.button:hover {
  background-color: #1d4ed8;
}

// Button.tsx
<button className={styles.button}>Nieuwe Werkorder</button>
```

**Development Speed:**
- Tailwind: ~30 seconds to style a button
- CSS Modules: ~2 minutes (create file, write CSS, import)
- **5x faster with Tailwind!**

**2. Consistent Design System (Built-in)**
```typescript
// tailwind.config.js
export default {
  theme: {
    colors: {
      // Consistent colors across all modules
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      },
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    spacing: {
      // Consistent spacing (8px grid)
      '1': '0.25rem',  // 4px
      '2': '0.5rem',   // 8px
      '4': '1rem',     // 16px
      '8': '2rem',     // 32px
    },
  },
};
```

**Usage:**
```tsx
// ✅ All agents use same colors automatically
<div className="bg-primary-600 text-white p-4 rounded-lg">
  {/* Consistent blue, consistent padding */}
</div>

// No need for shared CSS variables or theme context!
```

**3. Responsive Design Made Easy**
```tsx
// ✅ Mobile-first responsive design
<div className="
  grid
  grid-cols-1       {/* Mobile: 1 column */}
  md:grid-cols-2    {/* Tablet: 2 columns */}
  lg:grid-cols-3    {/* Desktop: 3 columns */}
  gap-4
">
  <Card />
  <Card />
  <Card />
</div>

// Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
```

**4. Automatic CSS Purging = Tiny Bundle**
```bash
# Development build (all utilities)
CSS size: ~3.5MB (uncompressed)

# Production build (only used utilities)
CSS size: ~12KB (gzipped)

# 99.7% reduction!
```

**How it works:**
```javascript
// Tailwind scans all .tsx files
// Keeps only classes that are actually used
// Result: tiny production bundle
```

**5. Multi-Agent Safe (No Conflicts)**
```
Agent A (Accounting):
  src/components/accounting/QuoteCard.tsx
  → className="bg-white p-6 rounded-lg shadow"

Agent B (CRM):
  src/components/crm/CustomerCard.tsx
  → className="bg-white p-6 rounded-lg shadow"

Result: ✅ Same classes, no conflicts!
         ✅ Both agents use shared design system
         ✅ No CSS file ownership issues
```

**With CSS Modules:**
```
Agent A creates: QuoteCard.module.css
Agent B creates: CustomerCard.module.css
Result: ⚠️ Two separate files with duplicate styles
        ⚠️ Harder to maintain consistency
```

**6. TypeScript IntelliSense Support**
```tsx
// Install: npm install -D tailwindcss-intellisense

// VSCode shows autocomplete:
<div className="bg-"
             // ↑ Shows: bg-white, bg-gray-50, bg-blue-600, etc.

// Shows color preview, spacing values, etc.
```

**7. Dark Mode (Future-Ready)**
```tsx
// tailwind.config.js
export default {
  darkMode: 'class', // Enable dark mode
};

// Component
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
">
  Content
</div>

// Toggle: <html class="dark">
```

**8. Animation & Transitions (Built-in)**
```tsx
// ✅ Smooth hover effects
<button className="
  bg-blue-600
  hover:bg-blue-700
  transition-colors duration-200
">
  Hover Me
</button>

// ✅ Loading spinners
<div className="animate-spin">⏳</div>

// ✅ Fade in/out
<div className="opacity-0 hover:opacity-100 transition-opacity">
  Fade
</div>
```

#### ⚠️ Trade-offs

**1. Long Class Strings**
```tsx
// ❌ Can get verbose
<div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
  Content
</div>
```

**Mitigation:**
```tsx
// ✅ Extract to reusable components
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      {children}
    </div>
  );
}

// Usage
<Card>Content</Card>
```

**2. Learning Curve (Class Names)**
- Need to learn Tailwind class names
- Not standard CSS property names

**Mitigation:**
- Excellent documentation
- IntelliSense autocomplete
- AI assistants know Tailwind well

**Impact:** 2-3 days to learn basics, 1 week to become proficient.

**3. HTML/JSX Clutter**
```tsx
// ❌ Lots of class names in JSX
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Click
</button>
```

**Mitigation:**
- Extract to reusable components
- Use `@apply` in CSS for repeated patterns (sparingly)

**Impact:** Acceptable. Trade-off for development speed.

---

## Comparison with Alternatives

### Tailwind CSS 4 vs CSS Modules

| Aspect | Tailwind CSS 4 | CSS Modules |
|--------|----------------|-------------|
| **Development Speed** | ✅ Very fast | ⚠️ Moderate |
| **Bundle Size** | ✅ 12KB (purged) | ⚠️ 50-100KB |
| **Consistency** | ✅ Built-in design system | ⚠️ Manual enforcement |
| **Responsive** | ✅ Easy utilities | ⚠️ Manual media queries |
| **Multi-agent** | ✅ No conflicts | ⚠️ File ownership issues |
| **TypeScript** | ✅ IntelliSense plugin | ❌ No autocomplete |
| **Learning Curve** | ⚠️ Class names | ✅ Standard CSS |

**Verdict:** Tailwind wins on speed, consistency, and multi-agent safety.

### Tailwind CSS 4 vs Styled Components

| Aspect | Tailwind CSS 4 | Styled Components |
|--------|----------------|-------------------|
| **Development Speed** | ✅ Very fast | ⚠️ Moderate |
| **Bundle Size** | ✅ 12KB | ❌ 20KB + runtime overhead |
| **Performance** | ✅ Static CSS | ⚠️ Runtime cost |
| **Consistency** | ✅ Design tokens | ⚠️ Manual theme |
| **TypeScript** | ✅ Good | ✅ Excellent |
| **Multi-agent** | ✅ No conflicts | ⚠️ Theme ownership |
| **SSR** | ✅ No issues | ⚠️ Requires setup |

**Verdict:** Tailwind wins on performance and bundle size.

### Tailwind CSS 4 vs Material-UI (MUI)

| Aspect | Tailwind CSS 4 | Material-UI |
|--------|----------------|-------------|
| **Development Speed** | ✅ Fast | ✅ Very fast (pre-built) |
| **Bundle Size** | ✅ 12KB | ❌ 300KB+ |
| **Customization** | ✅ Full control | ⚠️ Limited (Material Design) |
| **Design System** | ✅ Custom | ❌ Google Material (opinionated) |
| **Learning Curve** | ⚠️ Class names | ✅ Component props |
| **Performance** | ✅ Excellent | ⚠️ Heavy |

**Verdict:** Tailwind wins. MUI too opinionated and heavy for business app.

---

## Technical Implementation

### Installation

```bash
npm install -D tailwindcss@4.0.0 postcss autoprefixer
npx tailwindcss init -p
```

### Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom brand colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Main brand color
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),      // Better form styles
    require('@tailwindcss/typography'),  // Prose styles
  ],
};
```

### Main CSS File

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utilities (sparingly) */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors;
  }

  .card {
    @apply p-6 bg-white rounded-lg shadow-md border border-gray-200;
  }
}
```

### Component Examples

**Button Component:**
```tsx
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) {
  const baseClasses = "font-medium rounded-lg transition-colors";

  const variantClasses = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Usage
<Button variant="primary" size="md">Nieuwe Werkorder</Button>
```

**Card Component:**
```tsx
// components/ui/Card.tsx
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-6 bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

// Usage
<Card>
  <h2 className="text-xl font-bold mb-4">Werkorder #123</h2>
  <p className="text-gray-600">Details...</p>
</Card>
```

**Responsive Grid:**
```tsx
// Dashboard layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
  <StatCard title="Actieve WO" value="12" />
  <StatCard title="Klanten" value="45" />
  <StatCard title="Voorraad" value="234" />
  <StatCard title="Omzet" value="€15.2K" />
</div>
```

---

## Consequences

### Positive Consequences

✅ **Development Velocity**
- 5x faster than CSS Modules
- No context switching (CSS ↔ JSX)
- IntelliSense autocomplete

✅ **Consistent Design System**
- Built-in spacing, colors, typography
- All agents use same design tokens
- Easy to maintain consistency

✅ **Tiny Production Bundle**
- 12KB (gzipped) vs 50-100KB with other solutions
- Automatic purging of unused CSS
- Faster page load times

✅ **Responsive Design**
- Easy breakpoints (sm, md, lg, xl)
- Mobile-first approach
- Consistent across all modules

✅ **Multi-Agent Safe**
- No CSS file conflicts
- Shared design system
- Clear component boundaries

✅ **Future-Proof**
- Dark mode ready
- Animation utilities
- Tailwind CSS 4 new features (native cascade layers)

✅ **TypeScript Support**
- IntelliSense autocomplete
- Type-safe design tokens (via plugin)
- Error detection

### Negative Consequences

⚠️ **Long Class Strings**
- Can get verbose in complex components
- Mitigation: Extract to reusable components

⚠️ **Learning Curve**
- Need to learn Tailwind class names
- Mitigation: Good docs, AI assistance

⚠️ **HTML/JSX Clutter**
- Many class names in markup
- Mitigation: Extract components, use `@apply` sparingly

⚠️ **Non-Standard CSS**
- Not standard CSS property names
- Mitigation: Most developers learn quickly (1 week)

---

## Design System

### Color Palette

```typescript
// Primary (Brand Blue)
bg-primary-50   // Lightest
bg-primary-600  // Main brand color
bg-primary-900  // Darkest

// Semantic Colors
bg-green-600    // Success
bg-yellow-600   // Warning
bg-red-600      // Error
bg-blue-600     // Info

// Neutral
bg-white
bg-gray-50      // Lightest gray
bg-gray-900     // Almost black
```

### Spacing Scale (8px Grid)

```typescript
p-1   // 4px
p-2   // 8px
p-4   // 16px
p-6   // 24px
p-8   // 32px

// Gap, margin, padding all use same scale
gap-4   // 16px
m-6     // 24px margin
```

### Typography

```typescript
text-xs    // 12px
text-sm    // 14px
text-base  // 16px
text-lg    // 18px
text-xl    // 20px
text-2xl   // 24px

font-normal   // 400
font-medium   // 500
font-semibold // 600
font-bold     // 700
```

### Border Radius

```typescript
rounded       // 4px
rounded-md    // 6px
rounded-lg    // 8px
rounded-xl    // 12px
rounded-full  // 9999px (circle)
```

---

## Performance Optimization

### 1. Purge Unused CSS (Production)

```javascript
// vite.config.ts
export default {
  build: {
    cssCodeSplit: true,
    minify: 'esbuild',
  },
};

// Tailwind automatically purges in production
// Result: 12KB CSS (gzipped)
```

### 2. Code Splitting

```tsx
// Lazy load modules
const WorkOrders = React.lazy(() => import('./components/workorders/WorkOrders'));

// Only loads WorkOrders CSS when component loads
```

### 3. Critical CSS Inlining

```html
<!-- index.html -->
<style>
  /* Inline critical CSS for above-the-fold content */
  .bg-white { background-color: #fff; }
  .p-6 { padding: 1.5rem; }
</style>
```

### Benchmark Results

**Production Build (V5.8.0):**
- Total CSS: 12.3KB (gzipped)
- First Contentful Paint: 1.2s
- Time to Interactive: 1.8s
- Lighthouse Performance: 95/100

---

## Accessibility

### Built-in Accessibility

```tsx
// Focus rings (keyboard navigation)
<button className="
  focus:outline-none
  focus:ring-2
  focus:ring-primary-600
  focus:ring-offset-2
">
  Accessible Button
</button>

// Screen reader utilities
<span className="sr-only">Screen reader only text</span>

// High contrast mode support
<div className="text-gray-900 dark:text-white">
  High contrast text
</div>
```

### WCAG Compliance

- ✅ Color contrast ratios: 4.5:1 (AA standard)
- ✅ Focus indicators: 2px ring
- ✅ Touch targets: 44x44px minimum
- ✅ Responsive text scaling

---

## Migration Path

### If We Need to Migrate Away

**Effort Estimate:**
- Tailwind → CSS Modules: 2-3 weeks
- Tailwind → Styled Components: 3-4 weeks
- Tailwind → MUI: 4-6 weeks (component rewrite)

**Tools:**
- [Tailwind to CSS](https://transform.tools/tailwind-to-css) - Converter
- Manual extraction to CSS Modules

**Risk:** Low. Tailwind is stable, widely adopted, actively maintained.

---

## Related Decisions

- **ADR-001:** Use React 19 (JSX for Tailwind classes)
- **ADR-004:** No CSS-in-JS (chose Tailwind instead)
- **ADR-008:** Mobile-first design (Tailwind responsive utilities)

---

## References

- [Tailwind CSS 4 Docs](https://tailwindcss.com/)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Tailwind UI Components](https://tailwindui.com/)
- [Headless UI (Unstyled Components)](https://headlessui.com/)

---

**Decision Date:** December 2024
**Review Date:** December 2025
**Status:** ✅ Accepted
**Supersedes:** None (initial decision)

---

**Last Updated:** Januari 2025
**Version:** 1.0.0
