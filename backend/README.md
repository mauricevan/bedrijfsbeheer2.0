# BTD Beveiliging Backend

## Structuur

Deze backend is voorbereid voor toekomstige implementatie volgens de conventies in `CONVENTIONS.md`.

### Directory Overzicht

```
backend/
├── config/              # Database, environment, security configuratie
│   ├── database.js      # Prisma client instantie
│   ├── env.js           # Environment variabelen validatie
│   └── security.js      # CORS, Helmet, rate limiting
│
├── controllers/         # Request handlers (business logic)
│   ├── productController.js
│   ├── serviceController.js
│   └── contactController.js
│
├── models/              # Database schema
│   └── schema.prisma    # Prisma schema (PostgreSQL)
│
├── routes/              # API endpoints definitie
│   ├── productRoutes.js
│   ├── serviceRoutes.js
│   └── contactRoutes.js
│
├── middleware/          # Express middleware
│   ├── authenticate.js  # JWT verificatie
│   ├── validate.js      # Request validation
│   └── errorHandler.js  # Global error handler
│
├── utils/               # Backend helpers
│   ├── email.js         # Email service
│   └── logger.js        # Winston logger
│
└── tests/               # Test suites
    ├── unit/            # Unit tests
    └── integration/     # Integration tests
```

## Toekomstige Implementatie

### 1. Database Setup

```bash
# Install Prisma
npm install prisma @prisma/client

# Initialize Prisma
npx prisma init
```

### 2. API Endpoints

**Geplande endpoints:**

- `GET /api/services` - Alle diensten ophalen
- `GET /api/products` - Featured producten ophalen
- `GET /api/platforms` - Lock system platforms ophalen
- `GET /api/brands` - Merken lijst ophalen
- `POST /api/contact` - Contact formulier versturen

### 3. Database Schema

**Geplande models:**

- `Service` - Diensten (Autosleutels, Sleutels, etc.)
- `Product` - Producten (Tedee Pro, Iseo Libra, etc.)
- `Platform` - Lock system platforms
- `Brand` - Merken
- `ContactSubmission` - Contact formulier inzendingen
- `User` - Gebruikers (voor admin panel - toekomst)

### 4. Authentication

**Voor toekomstige admin panel:**

- JWT-based authentication
- Role-based access control (Admin/User)
- Secure password hashing (bcrypt)

### 5. Environment Variables

**Benodigde .env variabelen:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/btd_beveiliging"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="info@btdbeveiliging.nl"
SMTP_PASS="your-password"
```

## Tech Stack

- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **Validation:** Joi
- **Email:** Nodemailer
- **Testing:** Vitest
- **Logging:** Winston

## Development Workflow

1. **Setup Database:**
   ```bash
   docker-compose up -d  # Start PostgreSQL
   npx prisma migrate dev
   npx prisma generate
   ```

2. **Start Backend:**
   ```bash
   npm run dev
   ```

3. **Run Tests:**
   ```bash
   npm run test
   ```

## API Documentation

Toekomstige API documentatie zal beschikbaar zijn via Swagger/OpenAPI.

## Security

- HTTPS only in production
- CORS configuratie
- Rate limiting
- Input validation
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF protection

## Deployment

**Geplande deployment opties:**

- Docker containers
- Heroku
- DigitalOcean
- AWS/Azure

## Contact

Voor vragen over de backend implementatie:
- Email: info@btdbeveiliging.nl
- Phone: 078-6148148
