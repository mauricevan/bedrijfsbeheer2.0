# BTD BeveiligingsTechniek Dordrecht

Website voor BTD BeveiligingsTechniek Dordrecht - Slot & Beveiligingsspecialist

## 🚀 Project Overzicht

Dit is een moderne, responsive website gebouwd met React 19, TypeScript en Tailwind CSS 4. De website is volledig voorbereid op toekomstige backend integratie.

### Features

- ✅ **Responsive Design** - Mobile-first benadering met hamburger menu
- ✅ **Moderne Tech Stack** - React 19, TypeScript, Vite 6, Tailwind CSS 4
- ✅ **Type-Safe** - Volledige TypeScript implementatie
- ✅ **Component-Based** - Modulaire architectuur volgens CONVENTIONS.md
- ✅ **Backend Ready** - Complete backend structuur voorbereid
- ✅ **SEO Optimized** - Meta tags en semantische HTML
- ✅ **Performance** - Optimale build size en laadtijden

## 🚀 Recent Progress

### November 2025 - Accounting Module Complete
- ✅ **FASE 1-10 VOLTOOID** - Complete Accounting Module Refactoring (v6.0.0)
  - **FASE 1-3**: Foundation Layer (Types, Utils, Services)
    - ~2800+ lines pure TypeScript business logic
    - 50+ utility functies (helpers, calculations, validators, formatters, filters)
    - 30+ service functies (quote, invoice, transaction services)

  - **FASE 4**: Custom Hooks Layer
    - 9 custom hooks (useQuotes, useInvoices, useTransactions, useAccountingDashboard, useForm, useQuoteForm, useInvoiceForm, useInventorySelection, useModal)
    - Complete state management en business logic encapsulation

  - **FASE 5-9**: Component Layer
    - 20+ modulaire componenten (Dashboard, Quotes, Invoices, Transactions)
    - Reusable common components (ConfirmModal, forms)
    - Clean separation of concerns

  - **FASE 10**: Pages Refactoring
    - Accounting.tsx gereduceerd van 1085 naar ~350 regels
    - Volledig gerefactord met nieuwe componenten en hooks
    - Clean architecture met barrel files

### Current Status
- Frontend: Fully functional website + Complete Accounting Module ✅
- Backend: Not implemented ❌
- Database: No persistence ❌

## 📦 Tech Stack

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Vite 6** - Build tool & dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS** - CSS transformations

### Backend (Voorbereid)
- **Express.js** - Web framework
- **Prisma** - ORM voor PostgreSQL
- **JWT** - Authentication
- **Joi** - Input validation
- **Nodemailer** - Email service

## 🛠 Installation

```bash
# Clone repository
git clone <repository-url>
cd bedrijfsbeheer2.0

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structuur

```
bedrijfsbeheer2.0/
├── src/
│   ├── components/
│   │   ├── common/           # Herbruikbare componenten (Header, Footer)
│   │   └── home/             # Homepage componenten
│   ├── data/                 # Bedrijfsgegevens en content
│   ├── pages/                # Page componenten
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx               # Root component
│   └── main.tsx              # Entry point
│
├── backend/                  # Backend structuur (voorbereid)
│   ├── config/              # Configuratie bestanden
│   ├── controllers/         # Request handlers
│   ├── models/              # Database schema (Prisma)
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   └── utils/               # Helper functies
│
├── docs/                     # Documentatie
└── public/                   # Static assets
```

## 📝 Componenten Overzicht

### Common Components
- **Header** - Sticky navigatie met hamburger menu
- **Footer** - Footer met contact info en social media

### Home Components
- **Hero** - Hero sectie met bedrijfsstatistieken
- **Services** - Diensten overzicht (4 services)
- **FeaturedProducts** - Uitgelichte producten (Tedee Pro, Iseo Libra)
- **Platforms** - Lock system platforms (Plura, rs Sirius, ix Teco)
- **Brands** - Merken overzicht (30+ merken)
- **Contact** - Contact formulier en bedrijfsgegevens

## 🔧 Backend Implementatie

De backend is volledig voorbereid voor implementatie. Zie `backend/README.md` voor details.

### Geplande API Endpoints

```
GET  /api/services           # Alle diensten
GET  /api/products           # Alle producten
GET  /api/products/featured  # Featured producten
GET  /api/platforms          # Lock system platforms
GET  /api/brands             # Merken lijst
POST /api/contact            # Contact formulier
```

### Database Schema

Het Prisma schema is beschikbaar in `backend/models/schema.prisma.example` met models voor:
- Service (diensten)
- Product (producten)
- Platform (lock system platforms)
- Brand (merken)
- ContactSubmission (contact formulier inzendingen)
- User (gebruikers voor admin panel)

## 🎨 Design System

### Kleurenschema
- **Primary**: Blauw tinten (#0369a1 - #f0f9ff)
- **Text**: Grijs tinten voor leesbaarheid
- **Accents**: Groen, Blauw, Paars voor platform badges

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

## 📋 Development Workflow

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Make changes**
   - Volg conventies in `CONVENTIONS.md`
   - Gebruik TypeScript types
   - Test responsive design

3. **Build and test**
   ```bash
   npm run build
   npm run preview
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: description"
   git push
   ```

## 📚 Documentatie

- **CONVENTIONS.md** - Code conventies en style guide
- **docs/AI_GUIDE.md** - Guide voor AI assistenten
- **backend/README.md** - Backend implementatie details

## 🌐 Bedrijfsinformatie

**BTD BeveiligingsTechniek Dordrecht**
- Adres: Merwedestraat 261, 3313 GT Dordrecht
- Telefoon: 078-6148148
- Email: info@btdbeveiliging.nl
- Openingstijden: Di-Vr 08:00 - 17:00
- Rating: ⭐ 4.9 Google Reviews

## 📄 License

Alle rechten voorbehouden © 2025 BTD BeveiligingsTechniek Dordrecht

## 🤝 Contributing

Dit is een private project. Voor vragen of suggesties, neem contact op met het development team.
