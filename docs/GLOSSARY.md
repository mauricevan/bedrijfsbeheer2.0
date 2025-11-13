# Woordenlijst - Bedrijfsbeheer 2.0

**Voor:** Developers, Documenters, AI Agents
**Versie:** 1.0.0
**Laatst bijgewerkt:** Januari 2025

---

## 🎯 Doel

Dit document definieert de **officiële terminologie** voor het Bedrijfsbeheer Dashboard project. Gebruik deze termen **consistent** in code, documentatie, UI, en communicatie.

### Waarom Belangrijk?

- ✅ **Consistentie** - Iedereen gebruikt dezelfde termen
- ✅ **Duidelijkheid** - Geen verwarring over wat iets betekent
- ✅ **Leesbaarheid** - Code en docs zijn makkelijker te begrijpen
- ✅ **Onboarding** - Nieuwe developers begrijpen sneller
- ✅ **Zoekbaarheid** - Makkelijker om te vinden in codebase

---

## 📋 Inhoudsopgave

1. [Taalconventies](#taalconventies)
2. [Core Concepten](#core-concepten)
3. [Modules](#modules)
4. [User Management](#user-management)
5. [Data Types](#data-types)
6. [Actions & Operations](#actions--operations)
7. [UI Components](#ui-components)
8. [Technical Terms](#technical-terms)
9. [Status Values](#status-values)
10. [Forbidden Terms](#forbidden-terms)

---

## 🌐 Taalconventies

### Nederlands vs Engels

| Context | Taal | Voorbeeld |
|---------|------|-----------|
| **UI Text** | 🇳🇱 Nederlands | "Opslaan", "Nieuwe Klant", "Werkorder" |
| **Code (variabelen)** | 🇬🇧 Engels | `const workOrders = []` |
| **Code (types/interfaces)** | 🇬🇧 Engels | `interface WorkOrder { }` |
| **Code (functies)** | 🇬🇧 Engels | `function createWorkOrder()` |
| **Code (comments)** | 🇳🇱 Nederlands (optioneel) | `// Haal klantgegevens op` |
| **Documentatie** | 🇳🇱 Nederlands | "De werkorder module..." |
| **Git commits** | 🇳🇱 of 🇬🇧 | Beide OK, kies consistent |

### Voorbeeld Correct Gebruik

```typescript
// ✅ CORRECT
interface WorkOrder {  // Engels type
  id: string;
  title: string;
}

const workOrders: WorkOrder[] = [];  // Engels variabele

<button>Nieuwe Werkorder</button>  // Nederlands UI

// ❌ FOUT
interface Werkorder { }  // Nederlandse type naam
const werkorders = [];  // Nederlandse variabele
<button>New Work Order</button>  // Engelse UI
```

---

## 🎯 Core Concepten

### Werkorder

**Primaire term:** Werkorder (enkelvoud), Werkorders (meervoud)

**NIET gebruiken:**
- ❌ Work Order (spatie in Nederlands)
- ❌ Taak
- ❌ Opdracht
- ❌ Job
- ❌ WerkOrder (verkeerde capitalisatie)

**Engels equivalent:** Work Order

**Definitie:** Een toewijzing van werk aan een medewerker, met beschrijving, geschatte uren, materialen, en status tracking.

**Code gebruik:**
```typescript
// ✅ CORRECT
interface WorkOrder { }
const workOrders: WorkOrder[] = [];
<WorkOrderCard workOrder={order} />

// ❌ FOUT
interface Taak { }
const opdrachten = [];
```

**UI gebruik:**
```tsx
// ✅ CORRECT
<h1>Werkorders</h1>
<button>Nieuwe Werkorder</button>
<p>Werkorder is toegewezen aan Jan</p>

// ❌ FOUT
<h1>Werk Orders</h1>
<button>Nieuwe Taak</button>
```

---

### Offerte

**Primaire term:** Offerte (enkelvoud), Offertes (meervoud)

**NIET gebruiken:**
- ❌ Quote (Engels in Nederlands)
- ❌ Prijsopgave
- ❌ Aanbieding

**Engels equivalent:** Quote

**Definitie:** Een voorstel aan klant met items, arbeidsuren, en totaalprijs. Kan geaccepteerd worden en omgezet naar werkorder.

**Code gebruik:**
```typescript
// ✅ CORRECT
interface Quote { }
const quotes: Quote[] = [];
convertQuoteToWorkOrder(quote);

// ❌ FOUT
interface Offerte { }
const offertes = [];
```

**UI gebruik:**
```tsx
// ✅ CORRECT
<h1>Offertes</h1>
<button>Nieuwe Offerte</button>
<p>Offerte {quote.id} is geaccepteerd</p>

// ❌ FOUT
<h1>Quotes</h1>
<button>Nieuwe Quote</button>
```

---

### Factuur

**Primaire term:** Factuur (enkelvoud), Facturen (meervoud)

**NIET gebruiken:**
- ❌ Invoice (Engels in Nederlands)
- ❌ Nota
- ❌ Rekening

**Engels equivalent:** Invoice

**Definitie:** Betalingsverzoek aan klant, kan gegenereerd worden vanuit offerte of werkorder.

**Code gebruik:**
```typescript
// ✅ CORRECT
interface Invoice { }
const invoices: Invoice[] = [];
createInvoice(data);

// ❌ FOUT
interface Factuur { }
const facturen = [];
```

**UI gebruik:**
```tsx
// ✅ CORRECT
<h1>Facturen</h1>
<button>Nieuwe Factuur</button>
<p>Factuur is verzonden</p>

// ❌ FOUT
<h1>Invoices</h1>
```

---

### Klant

**Primaire term:** Klant (enkelvoud), Klanten (meervoud)

**NIET gebruiken:**
- ❌ Customer (Engels in Nederlands)
- ❌ Cliënt
- ❌ Afnemer

**Engels equivalent:** Customer

**Definitie:** Persoon of bedrijf waarvoor werkorders, offertes, en facturen worden aangemaakt.

**Code gebruik:**
```typescript
// ✅ CORRECT
interface Customer { }
const customers: Customer[] = [];

// ❌ FOUT
interface Klant { }
```

**UI gebruik:**
```tsx
// ✅ CORRECT
<h1>Klanten</h1>
<button>Nieuwe Klant</button>
```

---

### Voorraad / Voorraaditem

**Primaire term:** Voorraad (collectie), Voorraaditem (enkelvoud), Voorraaditems (meervoud)

**NIET gebruiken:**
- ❌ Inventory (Engels in Nederlands)
- ❌ Stock
- ❌ Item (te generiek)
- ❌ Product (is een type voorraaditem)
- ❌ Artikel

**Engels equivalent:** Inventory / Inventory Item

**Definitie:** Items in voorraad: producten (te verkopen), materialen (voor werkorders), of diensten.

**Code gebruik:**
```typescript
// ✅ CORRECT
interface InventoryItem { }
const inventory: InventoryItem[] = [];

// ❌ FOUT
interface Voorraaditem { }
const voorraad: Voorraaditem[] = [];
```

**UI gebruik:**
```tsx
// ✅ CORRECT
<h1>Voorraadbeheer</h1>
<p>Dit voorraaditem is bijna op</p>
<button>Nieuw Voorraaditem</button>

// ❌ FOUT
<h1>Inventory</h1>
```

---

### Medewerker

**Primaire term:** Medewerker (enkelvoud), Medewerkers (meervoud)

**NIET gebruiken:**
- ❌ Employee (Engels in Nederlands)
- ❌ Werknemer
- ❌ Personeelslid
- ❌ Gebruiker (is breder - includes admins and medewerkers)

**Engels equivalent:** Employee

**Definitie:** Persoon die werkt voor het bedrijf en werkorders toegewezen kan krijgen.

**Code gebruik:**
```typescript
// ✅ CORRECT
interface Employee {  // Let op: in code is dit vaak "User"
  role: 'admin' | 'user';  // 'user' = medewerker
}

// UI verwijst naar "Medewerker"
const employee = users.find(u => u.role === 'user');
```

**UI gebruik:**
```tsx
// ✅ CORRECT
<h1>Medewerkers</h1>
<select>
  <option>Selecteer medewerker</option>
</select>
<p>Toegewezen aan medewerker: Jan</p>

// ❌ FOUT
<h1>Employees</h1>
```

---

## 📦 Modules

### Dashboard

**Primaire term:** Dashboard

**NIET gebruiken:**
- ❌ Startpagina
- ❌ Home
- ❌ Overzicht (te generiek)

**Definitie:** Hoofdpagina met overzicht van KPI's, notificaties, en snelle acties.

---

### Voorraadbeheer

**Primaire term:** Voorraadbeheer

**NIET gebruiken:**
- ❌ Inventory (Engels)
- ❌ Voorraad (te kort, module naam moet specifieker)
- ❌ Magazijn

**Engels equivalent:** Inventory Management

**Code:**
```typescript
// Route
<Route path="/inventory" element={<InventoryPage />} />

// UI
<h1>Voorraadbeheer</h1>
```

---

### Boekhouding

**Primaire term:** Boekhouding

**NIET gebruiken:**
- ❌ Accounting (Engels in UI)
- ❌ Financiën (te breed)
- ❌ Administratie (te algemeen)

**Engels equivalent:** Accounting

**Definitie:** Module voor offertes, facturen, betalingen, en financiële rapportage.

---

### CRM

**Primaire term:** CRM (blijft CRM)

**Alternatief:** Klantenbeheer

**NIET gebruiken:**
- ❌ Customer Relationship Management (te lang)
- ❌ Klanten (te kort voor module)

**Definitie:** Module voor klanten, leads, taken, en email integratie.

---

### HRM

**Primaire term:** HRM (blijft HRM)

**Alternatief:** Personeelsbeheer

**NIET gebruiken:**
- ❌ Human Resources (te formeel)
- ❌ Medewerkers (te kort voor module)

**Definitie:** Module voor medewerkerbeheer, dossiers, en rechten.

---

### POS

**Primaire term:** POS (blijft POS)

**Alternatief:** Kassasysteem

**NIET gebruiken:**
- ❌ Point of Sale (te lang)
- ❌ Kassa (te informeel)

**Definitie:** Kassasysteem voor directe verkopen.

---

## 👥 User Management

### Admin

**Primaire term:** Admin

**Alternatief:** Beheerder

**NIET gebruiken:**
- ❌ Administrator (te formeel)
- ❌ Manager
- ❌ Eigenaar

**Definitie:** Gebruiker met volledige rechten (isAdmin: true).

**UI:**
```tsx
<p>Je bent ingelogd als Admin</p>
<button>Admin Instellingen</button>
```

---

### User (in code)

**Primaire term in code:** User

**UI term:** Medewerker (voor role: 'user')

**NIET verwarren:**
- `User` (type) = Admin OF Medewerker
- `role: 'user'` = Medewerker (geen admin)

```typescript
// ✅ CORRECT
interface User {
  role: 'admin' | 'user';  // 'user' = medewerker in UI
}

// UI
if (currentUser.role === 'admin') {
  return "Admin";  // Toon "Admin"
} else {
  return "Medewerker";  // Toon "Medewerker", niet "User"
}
```

---

## 📊 Data Types

### SKU Types

**Primaire termen:**
- Product
- Materiaal
- Dienst

**NIET gebruiken:**
- ❌ Service (Engels)
- ❌ Material (Engels)
- ❌ Goed

**Definitie:**
- **Product:** Te verkopen item (via POS/webshop)
- **Materiaal:** Wordt gebruikt in werkorders
- **Dienst:** Arbeid/service (bijv. consultancy uren)

---

### Status Types

Zie [Status Values](#status-values) sectie.

---

## ⚡ Actions & Operations

### CRUD Operations

| Nederlands (UI) | Engels (code) | Voorbeeld |
|----------------|---------------|-----------|
| **Nieuw** / **Toevoegen** | Create / Add | `createWorkOrder()` |
| **Bewerken** / **Wijzigen** | Edit / Update | `updateCustomer()` |
| **Verwijderen** | Delete | `deleteInvoice()` |
| **Opslaan** | Save | `handleSave()` |
| **Annuleren** | Cancel | `handleCancel()` |
| **Zoeken** | Search | `searchCustomers()` |
| **Filteren** | Filter | `filterByStatus()` |
| **Sorteren** | Sort | `sortByDate()` |

**UI voorbeelden:**
```tsx
<button>Nieuwe Klant</button>
<button>Klant Toevoegen</button>  // Ook OK
<button>Bewerken</button>
<button>Verwijderen</button>
<button>Opslaan</button>
```

---

### Workflow Actions

| Nederlands (UI) | Engels (code) | Context |
|----------------|---------------|---------|
| **Toewijzen** | Assign | Werkorder toewijzen aan medewerker |
| **Goedkeuren** | Approve | Offerte goedkeuren |
| **Afwijzen** | Reject | Offerte afwijzen |
| **Verzenden** | Send | Factuur verzenden naar klant |
| **Markeren als Betaald** | Mark as Paid | Factuur betaling registreren |
| **Starten** | Start | Werkorder starten |
| **Voltooien** | Complete | Werkorder voltooien |
| **Pauzeren** | Pause | Werkorder in wacht zetten |

---

## 🎨 UI Components

### Common Components

| Nederlands (UI) | Engels (component) | Gebruik |
|----------------|-------------------|---------|
| **Knop** | Button | `<Button />` |
| **Formulier** | Form | `<Form />` |
| **Tabel** | Table | `<Table />` |
| **Kaart** | Card | `<Card />` |
| **Modal / Dialoog** | Modal | `<Modal />` |
| **Dropdown** | Dropdown | `<Dropdown />` |
| **Tab** | Tab | `<Tabs />` |
| **Badge** | Badge | `<Badge />` |
| **Melding** | Notification | `<Notification />` |

---

### Layout Components

| Nederlands | Engels (component) |
|-----------|-------------------|
| **Zijbalk** | Sidebar |
| **Header** | Header |
| **Footer** | Footer |
| **Container** | Container |
| **Grid** | Grid |

---

## 🔧 Technical Terms

### Development Terms

Blijven **Engels** in code en technical documentatie:

- **Component** (niet: Onderdeel)
- **Hook** (niet: Haak)
- **Service** (niet: Dienst in technische context)
- **Util / Utility** (niet: Hulpmiddel)
- **Type** (niet: Type blijft Type)
- **Interface** (niet: Koppelvlak)
- **Props** (niet: Eigenschappen)
- **State** (niet: Status/Toestand)
- **Context** (niet: Context blijft Context)
- **Router** (niet: Router blijft Router)

```typescript
// ✅ CORRECT - Engels in code
const useWorkOrders = () => { };  // Hook
const workOrderService = { };     // Service
const formatDate = () => { };     // Utility

// ❌ FOUT - Nederlands in code
const gebruikWerkorders = () => { };
const werkorderDienst = { };
```

---

### Git Terms

| Engels | Nederlands (optioneel) |
|--------|------------------------|
| Commit | Commit (blijft Engels) |
| Branch | Branch (blijft Engels) |
| Merge | Merge (blijft Engels) |
| Pull Request | Pull Request / PR |
| Issue | Issue (blijft Engels) |

**Commit messages:** Engels OF Nederlands, kies consistent:

```bash
# ✅ Engels (recommended voor open source)
git commit -m "feat: Add customer search"

# ✅ Nederlands (OK voor intern project)
git commit -m "feat: Voeg klant zoeken toe"

# ❌ Mix (inconsistent)
git commit -m "feat: Add klant search"
```

---

## 📊 Status Values

### WorkOrder Status

| Status Value (code) | UI Label (Nederlands) | Beschrijving |
|--------------------|----------------------|--------------|
| `'todo'` | **Te Doen** | Nog niet gestart |
| `'pending'` | **In Wacht** | Wacht op input/materiaal |
| `'in_progress'` | **In Uitvoering** | Actief bezig |
| `'completed'` | **Afgerond** | Voltooid |

**Code:**
```typescript
type WorkOrderStatus = 'todo' | 'pending' | 'in_progress' | 'completed';
```

**UI:**
```tsx
const statusLabels = {
  'todo': 'Te Doen',
  'pending': 'In Wacht',
  'in_progress': 'In Uitvoering',
  'completed': 'Afgerond'
};
```

---

### Quote Status

| Status Value (code) | UI Label (Nederlands) | Beschrijving |
|--------------------|----------------------|--------------|
| `'draft'` | **Concept** | Nog niet verzonden |
| `'sent'` | **Verzonden** | Naar klant gestuurd |
| `'approved'` | **Geaccepteerd** | Door klant goedgekeurd |
| `'rejected'` | **Afgewezen** | Door klant afgewezen |
| `'expired'` | **Verlopen** | Vervaldatum voorbij |

---

### Invoice Status

| Status Value (code) | UI Label (Nederlands) | Beschrijving |
|--------------------|----------------------|--------------|
| `'draft'` | **Concept** | Nog niet verzonden |
| `'sent'` | **Verzonden** | Naar klant gestuurd |
| `'paid'` | **Betaald** | Betaling ontvangen |
| `'overdue'` | **Achterstallig** | Vervaldatum voorbij |
| `'cancelled'` | **Geannuleerd** | Factuur geannuleerd |

---

## ⛔ Forbidden Terms

### NOOIT Gebruiken

| ❌ FOUT | ✅ CORRECT | Reden |
|---------|-----------|-------|
| Werk Order | Werkorder | Geen spatie |
| WorkOrder | WorkOrder (code) | In code: geen spatie. In UI: "Werkorder" |
| Gebruiker | User (code) / Admin of Medewerker (UI) | Te ambigu |
| Item | Voorraaditem / Product / Materiaal | Te generiek |
| Task | Werkorder | Engels in Nederlands |
| Job | Werkorder | Engels in Nederlands |
| Employee | Employee (code) / Medewerker (UI) | Consistent blijven |

---

## 🔍 Quick Reference

### Code Variable Naming

```typescript
// ✅ CORRECT
const workOrders: WorkOrder[] = [];
const quotes: Quote[] = [];
const invoices: Invoice[] = [];
const customers: Customer[] = [];
const inventory: InventoryItem[] = [];
const employees: User[] = [];  // role: 'user'
const currentUser: User | null = null;

// ❌ FOUT
const werkorders = [];
const offertes = [];
const klanten = [];
```

---

### UI Text Quick Reference

```tsx
// ✅ CORRECT
<h1>Werkorders</h1>
<button>Nieuwe Werkorder</button>
<p>Werkorder toegewezen aan Jan</p>
<button>Opslaan</button>
<button>Annuleren</button>

// ❌ FOUT
<h1>Work Orders</h1>
<button>New Werkorder</button>
<p>Task assigned to Jan</p>
<button>Save</button>
```

---

## 📚 Gerelateerde Documentatie

- [CONVENTIONS.md](../CONVENTIONS.md) - Code conventions
- [AI_GUIDE.md](./AI_GUIDE.md) - Development guidelines
- [User Roles](./04-features/user-roles.md) - Permission terminology
- [Modules Overview](./03-modules/overview.md) - Module names

---

## 🔄 Changelog

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| 1.0.0 | Jan 2025 | Initiële versie |

---

## 🆘 Vragen?

**Twijfel over een term?**

1. Check deze glossary
2. Search in codebase voor voorbeelden
3. Check CONVENTIONS.md
4. Vraag in team

**Term ontbreekt?**

1. Open een GitHub Issue
2. Tag documentatie maintainer
3. Voeg toe na approval

---

**Laatste update:** Januari 2025
**Versie:** 1.0.0
**Status:** Living document

**Consistentie = Duidelijkheid! 📖**
