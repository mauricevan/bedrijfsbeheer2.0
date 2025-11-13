# OWASP Top 10 Security Mapping

**Voor:** Developers en Security Reviewers
**Versie:** 1.0.0
**OWASP Versie:** 2021
**Laatst bijgewerkt:** Januari 2025

---

## 📋 Inhoudsopgave

1. [Overzicht](#overzicht)
2. [A01:2021 - Broken Access Control](#a012021---broken-access-control)
3. [A02:2021 - Cryptographic Failures](#a022021---cryptographic-failures)
4. [A03:2021 - Injection](#a032021---injection)
5. [A04:2021 - Insecure Design](#a042021---insecure-design)
6. [A05:2021 - Security Misconfiguration](#a052021---security-misconfiguration)
7. [A06:2021 - Vulnerable Components](#a062021---vulnerable-and-outdated-components)
8. [A07:2021 - Authentication Failures](#a072021---identification-and-authentication-failures)
9. [A08:2021 - Software and Data Integrity](#a082021---software-and-data-integrity-failures)
10. [A09:2021 - Logging Failures](#a092021---security-logging-and-monitoring-failures)
11. [A10:2021 - SSRF](#a102021---server-side-request-forgery-ssrf)

---

## 🎯 Overzicht

Dit document mapped elke OWASP Top 10 (2021) vulnerability naar onze implementatie, beschrijft huidige mitigaties, en identificeert verbeterpunten.

### Status Legend

- ✅ **Implemented** - Volledig geïmplementeerd
- 🔄 **Partial** - Gedeeltelijk geïmplementeerd
- ❌ **Missing** - Nog niet geïmplementeerd
- 📅 **Planned** - Gepland voor toekomstige release

---

## A01:2021 - Broken Access Control

### 🎯 Beschrijving

Gebruikers kunnen acties uitvoeren buiten hun toegestane permissies.

### 📊 Huidige Status: 🔄 **Partial**

#### ✅ Geïmplementeerde Mitigaties

**1. Role-Based Access Control (RBAC)**
```typescript
// File: src/types.ts
interface User {
  role: 'admin' | 'user';
  isAdmin: boolean;
}

// File: src/App.tsx
// Centralized permission checks
{currentUser?.isAdmin && (
  <button onClick={handleDelete}>Verwijder</button>
)}
```

**Locatie:** Alle modules (Dashboard, CRM, WorkOrders, etc.)
**Documentatie:** [User Roles](../04-features/user-roles.md)

**2. Component-Level Access Control**
```typescript
// File: src/pages/AdminSettings.tsx
const AdminSettings = () => {
  if (!currentUser?.isAdmin) {
    return <AccessDenied />;
  }
  return <AdminContent />;
};
```

**3. UI-Level Restrictions**
```typescript
// Buttons disabled voor non-admin
<button
  disabled={!currentUser?.isAdmin}
  title={!currentUser?.isAdmin ? 'Alleen admins' : ''}
>
  Bewerk
</button>
```

#### ❌ Ontbrekende Mitigaties

1. **Backend API Authorization** (Critical!)
   - **Status:** ❌ Missing
   - **Risk:** High
   - **Impact:** Users kunnen API calls doen buiten permissions
   - **Solution:**
   ```typescript
   // Backend middleware
   const authorize = (roles: string[]) => {
     return (req, res, next) => {
       if (!roles.includes(req.user.role)) {
         return res.status(403).json({ error: 'Forbidden' });
       }
       next();
     };
   };

   app.delete('/api/customers/:id',
     authenticate,
     authorize(['admin']),
     deleteCustomer
   );
   ```

2. **Resource-Level Authorization**
   - **Status:** ❌ Missing
   - **Risk:** Medium
   - **Impact:** Users kunnen resources van anderen bewerken
   - **Solution:** Check ownership before CRUD operations

3. **Rate Limiting**
   - **Status:** ❌ Missing
   - **Risk:** Medium
   - **Impact:** Brute force attacks mogelijk
   - **Solution:** Implement express-rate-limit

#### 📝 Action Items

- [ ] Implement backend authorization middleware
- [ ] Add resource ownership checks
- [ ] Implement rate limiting (5 req/min per IP)
- [ ] Add CSRF tokens
- [ ] Audit all API endpoints voor permissions

**Priority:** 🔴 Critical
**Target Date:** Q1 2025

---

## A02:2021 - Cryptographic Failures

### 🎯 Beschrijving

Gevoelige data wordt niet goed beschermd (encryption, hashing).

### 📊 Huidige Status: ❌ **Missing**

#### ❌ Ontbrekende Mitigaties

1. **Password Hashing** (Critical!)
   - **Status:** ❌ Missing (development heeft plain text!)
   - **Risk:** Critical
   - **Current:** `password: '1234'` (plain text)
   - **Required:**
   ```typescript
   import bcrypt from 'bcrypt';

   // Hash password bij registratie
   const saltRounds = 12;
   const hashedPassword = await bcrypt.hash(password, saltRounds);

   // Verify bij login
   const isValid = await bcrypt.compare(password, user.passwordHash);
   ```

2. **HTTPS Enforcement**
   - **Status:** ❌ Missing
   - **Risk:** High
   - **Solution:** Force HTTPS in production
   ```typescript
   // Express middleware
   app.use((req, res, next) => {
     if (req.header('x-forwarded-proto') !== 'https') {
       res.redirect(`https://${req.header('host')}${req.url}`);
     }
     next();
   });
   ```

3. **Sensitive Data in LocalStorage**
   - **Status:** ❌ Missing
   - **Risk:** Medium
   - **Current:** JWT tokens in localStorage (XSS vulnerable)
   - **Better:** Use httpOnly cookies

4. **Database Encryption**
   - **Status:** ❌ Missing
   - **Risk:** High
   - **Solution:** Encrypt customer PII at rest

#### 📝 Action Items

- [ ] Implement bcrypt password hashing (saltRounds: 12)
- [ ] Force HTTPS in production
- [ ] Move tokens to httpOnly cookies
- [ ] Encrypt sensitive customer data
- [ ] Implement key rotation policy
- [ ] Add Content-Security-Policy headers

**Priority:** 🔴 Critical
**Target Date:** Q1 2025

---

## A03:2021 - Injection

### 🎯 Beschrijving

Onveilige input kan leiden tot SQL injection, XSS, command injection.

### 📊 Huidige Status: 🔄 **Partial**

#### ✅ Geïmplementeerde Mitigaties

1. **React JSX Auto-Escaping**
```typescript
// React escapes automatically
<div>{userInput}</div>  // ✅ Safe
```

2. **TypeScript Type Safety**
```typescript
// Type checking prevents some injections
interface Customer {
  name: string;
  email: string;
}
```

#### ❌ Ontbrekende Mitigaties

1. **Input Validation**
   - **Status:** ❌ Missing
   - **Risk:** High
   - **Solution:**
   ```typescript
   import validator from 'validator';
   import DOMPurify from 'dompurify';

   // Email validation
   if (!validator.isEmail(email)) {
     throw new Error('Invalid email');
   }

   // Sanitize HTML
   const clean = DOMPurify.sanitize(dirtyHTML);
   ```

2. **SQL Injection Prevention** (Future - Database)
   - **Status:** 📅 Planned
   - **Solution:** Use Prisma/TypeORM (parameterized queries)
   ```typescript
   // ✅ Safe - Prisma uses prepared statements
   const user = await prisma.user.findUnique({
     where: { email: email }  // Automatically sanitized
   });

   // ❌ Unsafe - Raw SQL
   const user = await db.raw(`SELECT * FROM users WHERE email = '${email}'`);
   ```

3. **XSS Prevention**
   - **Status:** 🔄 Partial
   - **Missing:** Content-Security-Policy
   - **Solution:**
   ```typescript
   // Add CSP headers
   app.use((req, res, next) => {
     res.setHeader(
       'Content-Security-Policy',
       "default-src 'self'; script-src 'self'"
     );
     next();
   });
   ```

#### 📝 Action Items

- [ ] Add input validation library (validator.js)
- [ ] Add DOMPurify for HTML sanitization
- [ ] Implement Content-Security-Policy
- [ ] Use Prisma for SQL injection prevention
- [ ] Validate ALL user inputs server-side
- [ ] Escape outputs in templates

**Priority:** 🔴 Critical
**Target Date:** Q1 2025

---

## A04:2021 - Insecure Design

### 🎯 Beschrijving

Fundamentele design flaws in security architecture.

### 📊 Huidige Status: 🔄 **Partial**

#### ✅ Geïmplementeerde Mitigaties

1. **Separation of Concerns**
   - Components, Services, Hooks gescheiden
   - [Architecture Docs](./technical-stack.md)

2. **Type Safety**
   - TypeScript voor alle code
   - Strict mode enabled

#### ❌ Ontbrekende Mitigaties

1. **Threat Modeling**
   - **Status:** ❌ Missing
   - **Risk:** Medium
   - **Solution:** STRIDE analysis per module

2. **Security Requirements**
   - **Status:** ❌ Missing
   - **Risk:** Medium
   - **Solution:** Security stories in backlog

3. **Secure Defaults**
   - **Status:** 🔄 Partial
   - **Issue:** Some features default to insecure (plain text passwords)

#### 📝 Action Items

- [ ] Conduct STRIDE threat modeling
- [ ] Document security requirements per feature
- [ ] Implement secure-by-default principle
- [ ] Add security acceptance criteria to user stories
- [ ] Regular security design reviews

**Priority:** 🟡 High
**Target Date:** Q2 2025

---

## A05:2021 - Security Misconfiguration

### 🎯 Beschrijving

Onjuiste configuratie van framework, libraries, servers.

### 📊 Huidige Status: ❌ **Missing**

#### ❌ Ontbrekende Mitigaties

1. **Security Headers**
   - **Status:** ❌ Missing
   - **Required Headers:**
   ```typescript
   app.use((req, res, next) => {
     // HSTS
     res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

     // X-Frame-Options
     res.setHeader('X-Frame-Options', 'DENY');

     // X-Content-Type-Options
     res.setHeader('X-Content-Type-Options', 'nosniff');

     // X-XSS-Protection
     res.setHeader('X-XSS-Protection', '1; mode=block');

     // Referrer-Policy
     res.setHeader('Referrer-Policy', 'no-referrer');

     next();
   });
   ```

2. **Environment Variables**
   - **Status:** ❌ Missing
   - **Solution:** Use .env files (never commit!)
   ```bash
   # .env (NEVER COMMIT!)
   DATABASE_URL=postgresql://...
   JWT_SECRET=...
   API_KEY=...
   ```

3. **Error Handling**
   - **Status:** ❌ Missing
   - **Risk:** Information disclosure
   - **Solution:**
   ```typescript
   // ❌ BAD - Leaks stack trace
   res.status(500).json({ error: error.stack });

   // ✅ GOOD - Generic message
   res.status(500).json({ error: 'Internal server error' });
   ```

#### 📝 Action Items

- [ ] Add security headers middleware
- [ ] Setup .env for secrets
- [ ] Implement generic error responses
- [ ] Disable debug mode in production
- [ ] Remove default credentials
- [ ] Setup automated security scanning

**Priority:** 🔴 Critical
**Target Date:** Q1 2025

---

## A06:2021 - Vulnerable and Outdated Components

### 🎯 Beschrijving

Using components met bekende vulnerabilities.

### 📊 Huidige Status: 🔄 **Partial**

#### ✅ Geïmplementeerde Mitigaties

1. **Modern Dependencies**
   - React 19 (latest)
   - TypeScript 5.x
   - Vite 6 (latest)

#### ❌ Ontbrekende Mitigaties

1. **Automated Dependency Scanning**
   - **Status:** ❌ Missing
   - **Solution:**
   ```bash
   # Run regularly
   npm audit
   npm audit fix

   # Or use Snyk/Dependabot
   ```

2. **Dependency Update Policy**
   - **Status:** ❌ Missing
   - **Solution:** Monthly dependency reviews

3. **Vulnerability Monitoring**
   - **Status:** ❌ Missing
   - **Solution:** GitHub Dependabot alerts

#### 📝 Action Items

- [ ] Enable GitHub Dependabot
- [ ] Run `npm audit` weekly
- [ ] Create dependency update policy
- [ ] Subscribe to security advisories
- [ ] Automate dependency updates (minor/patch)
- [ ] Regular security patch reviews

**Priority:** 🟡 High
**Target Date:** Q1 2025

---

## A07:2021 - Identification and Authentication Failures

### 🎯 Beschrijving

Falende authenticatie en sessie management.

### 📊 Huidige Status: ❌ **Missing**

#### ❌ Ontbrekende Mitigaties

1. **Strong Password Requirements**
   - **Status:** ❌ Missing
   - **Current:** "1234" allowed!
   - **Required:**
   ```typescript
   const passwordRequirements = {
     minLength: 12,
     requireUppercase: true,
     requireLowercase: true,
     requireNumbers: true,
     requireSpecialChars: true,
     bannedPasswords: ['password', '123456', 'qwerty']
   };
   ```

2. **Multi-Factor Authentication**
   - **Status:** ❌ Missing
   - **Risk:** High
   - **Solution:** Implement TOTP (Google Authenticator)

3. **Session Management**
   - **Status:** ❌ Missing
   - **Issues:**
     - No session timeout
     - No concurrent session control
     - No session invalidation on logout

4. **Brute Force Protection**
   - **Status:** ❌ Missing
   - **Solution:**
   ```typescript
   import rateLimit from 'express-rate-limit';

   const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // 5 attempts
     message: 'Te veel login pogingen, probeer over 15 minuten'
   });

   app.post('/api/auth/login', loginLimiter, handleLogin);
   ```

#### 📝 Action Items

- [ ] Implement password strength requirements
- [ ] Add brute force protection (5 attempts/15min)
- [ ] Implement MFA (TOTP)
- [ ] Add session timeout (15min inactivity)
- [ ] Implement "remember me" securely
- [ ] Add password reset flow
- [ ] Implement account lockout policy

**Priority:** 🔴 Critical
**Target Date:** Q1 2025

---

## A08:2021 - Software and Data Integrity Failures

### 🎯 Beschrijving

Code en infrastructure zonder integrity verificatie.

### 📊 Huidige Status: ❌ **Missing**

#### ❌ Ontbrekende Mitigaties

1. **Subresource Integrity (SRI)**
   - **Status:** ❌ Missing
   - **Solution:**
   ```html
   <script
     src="https://cdn.example.com/lib.js"
     integrity="sha384-..."
     crossorigin="anonymous"
   ></script>
   ```

2. **Code Signing**
   - **Status:** ❌ Missing
   - **Solution:** Sign builds before deployment

3. **CI/CD Pipeline Security**
   - **Status:** ❌ Missing
   - **Solution:** Secure GitHub Actions workflows

#### 📝 Action Items

- [ ] Add SRI to all CDN resources
- [ ] Implement code signing for releases
- [ ] Secure CI/CD pipeline
- [ ] Add checksum verification for downloads
- [ ] Implement artifact signing

**Priority:** 🟢 Medium
**Target Date:** Q2 2025

---

## A09:2021 - Security Logging and Monitoring Failures

### 🎯 Beschrijving

Insufficient logging en monitoring van security events.

### 📊 Huidige Status: ❌ **Missing**

#### ❌ Ontbrekende Mitigaties

1. **Security Event Logging**
   - **Status:** ❌ Missing
   - **Required Events:**
     - Failed login attempts
     - Privilege escalation attempts
     - Data exports
     - Permission changes
     - Account modifications

2. **Audit Trail**
   - **Status:** ❌ Missing
   - **Solution:**
   ```typescript
   interface AuditLog {
     timestamp: Date;
     userId: string;
     action: string;
     resource: string;
     resourceId: string;
     changes: Record<string, any>;
     ipAddress: string;
     userAgent: string;
   }
   ```

3. **Monitoring & Alerting**
   - **Status:** ❌ Missing
   - **Solution:** Implement log aggregation (ELK/Splunk)

#### 📝 Action Items

- [ ] Implement audit logging for all critical actions
- [ ] Add security event monitoring
- [ ] Setup alerting for suspicious activity
- [ ] Implement log retention policy (90 days)
- [ ] Add tamper-proof logging
- [ ] Create security dashboard

**Priority:** 🟡 High
**Target Date:** Q2 2025

---

## A10:2021 - Server-Side Request Forgery (SSRF)

### 🎯 Beschrijving

Server maakt requests naar attacker-controlled URLs.

### 📊 Huidige Status: ✅ **Not Applicable**

**Reason:** Huidige implementatie is frontend-only (geen server-side requests naar user-provided URLs).

#### 📝 Future Considerations

Als backend wordt toegevoegd met features zoals:
- URL shorteners
- Webhooks
- External API integrations

Dan implementeren:
```typescript
// Whitelist allowed domains
const allowedDomains = ['api.trusted-service.com'];

const isAllowedUrl = (url: string): boolean => {
  const parsed = new URL(url);
  return allowedDomains.includes(parsed.hostname);
};
```

**Priority:** 📅 Planned (when backend added)

---

## 📊 Summary Matrix

| OWASP Category | Status | Priority | Target Date |
|---------------|--------|----------|-------------|
| A01 - Broken Access Control | 🔄 Partial | 🔴 Critical | Q1 2025 |
| A02 - Cryptographic Failures | ❌ Missing | 🔴 Critical | Q1 2025 |
| A03 - Injection | 🔄 Partial | 🔴 Critical | Q1 2025 |
| A04 - Insecure Design | 🔄 Partial | 🟡 High | Q2 2025 |
| A05 - Security Misconfiguration | ❌ Missing | 🔴 Critical | Q1 2025 |
| A06 - Vulnerable Components | 🔄 Partial | 🟡 High | Q1 2025 |
| A07 - Authentication Failures | ❌ Missing | 🔴 Critical | Q1 2025 |
| A08 - Data Integrity | ❌ Missing | 🟢 Medium | Q2 2025 |
| A09 - Logging Failures | ❌ Missing | 🟡 High | Q2 2025 |
| A10 - SSRF | ✅ N/A | - | - |

### Critical Items (Must Fix Before Production)

1. 🔴 **Password Hashing** (A02)
2. 🔴 **Backend Authorization** (A01)
3. 🔴 **Input Validation** (A03)
4. 🔴 **Security Headers** (A05)
5. 🔴 **Brute Force Protection** (A07)

---

## 📚 Gerelateerde Documentatie

- [Security](./security.md) - Main security documentation
- [Security Testing Guide](../04-features/security-testing.md) - Testing procedures
- [User Roles](../04-features/user-roles.md) - Permission matrix
- [API Overview](../05-api/overview.md) - API security

---

## 🆘 Security Incident Response

**Als je een vulnerability ontdekt:**

1. **DO NOT** fix in public PR
2. Email security@bedrijf.nl
3. Create private security advisory on GitHub
4. Follow responsible disclosure

---

**Laatste update:** Januari 2025
**Versie:** 1.0.0
**Status:** Living document

**Security is een journey, niet een destination! 🔒**
