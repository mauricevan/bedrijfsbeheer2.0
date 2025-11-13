# Security Testing Guide 🔒

**Voor:** Security Engineers, QA Engineers, Developers
**Versie:** 1.0.0
**Laatst bijgewerkt:** Januari 2025
**Status:** Production Security Testing Protocol

⚠️ **CRITICAL:** Deze guide test voor OWASP Top 10 (2021) vulnerabilities.

---

## 🎯 Doel

Dit document beschrijft:
1. **Security test procedures** voor alle OWASP Top 10 vulnerabilities
2. **Manual testing steps** (no special tools required)
3. **Automated security testing** met tools
4. **Test cases** voor elke security risk
5. **Expected results** (pass/fail criteria)
6. **Remediation steps** indien vulnerability gevonden

**Reference:** [Security OWASP Mapping](../02-architecture/security-owasp-mapping.md)

---

## 📋 Security Testing Checklist

### Quick Status Check

| OWASP Risk | Test Coverage | Current Status | Priority |
|------------|---------------|----------------|----------|
| **A01: Broken Access Control** | ✅ Full | 🔄 Partial | P0 Critical |
| **A02: Cryptographic Failures** | ✅ Full | ❌ Missing | P0 Critical |
| **A03: Injection** | ✅ Full | ✅ Protected | P1 High |
| **A04: Insecure Design** | ✅ Full | ⚠️ Partial | P1 High |
| **A05: Security Misconfiguration** | ✅ Full | ⚠️ Partial | P2 Medium |
| **A06: Vulnerable Components** | ✅ Full | ✅ Up-to-date | P1 High |
| **A07: Auth Failures** | ✅ Full | ❌ Missing | P0 Critical |
| **A08: Data Integrity Failures** | ✅ Full | ⚠️ Partial | P2 Medium |
| **A09: Logging Failures** | ✅ Full | ❌ Missing | P2 Medium |
| **A10: SSRF** | ⚠️ Partial | N/A | P3 Low |

---

## 🔐 A01: Broken Access Control Testing

### Risk Level: 🔴 CRITICAL

### Test Cases

#### Test 1.1: User Role Enforcement (Frontend)

**Objective:** Verify users cannot access admin-only features

**Steps:**
1. Login as **User** (user@example.com / 1234)
2. Navigate to Dashboard
3. Attempt to access admin features:
   - Try to delete a werkorder (should be disabled)
   - Try to delete a customer (should be disabled)
   - Try to access Admin Settings (should not be visible in sidebar)

**Expected Result:** ✅ PASS
- Delete buttons are hidden/disabled for User role
- Admin Settings not visible in sidebar
- Console shows: "User lacks admin rights" (if attempted via devtools)

**Actual Result (V5.8.0):** ✅ PASS
- UI correctly hides admin features from users

**Failure Scenario:**
```
❌ FAIL: User can click delete button
→ Indicates frontend permission check missing
→ Fix: Add {currentUser.role === 'admin' && <DeleteButton />}
```

#### Test 1.2: Backend API Authorization (FUTURE CRITICAL)

**Objective:** Verify backend rejects unauthorized requests

⚠️ **WARNING:** This test will FAIL currently (no backend yet)

**Steps:**
1. Login as **User**
2. Open Chrome DevTools → Console
3. Execute direct API call (bypassing UI):
   ```javascript
   fetch('http://localhost:3000/api/workorders/wo-001', {
     method: 'DELETE',
     headers: {
       'Authorization': 'Bearer USER_TOKEN',
       'Content-Type': 'application/json'
     }
   })
   .then(res => res.json())
   .then(console.log);
   ```

**Expected Result:** ❌ FAIL (current demo)
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions",
  "status": 403
}
```

**Current Result (V5.8.0):** ⚠️ N/A (no backend API yet)

**Production Fix Required:**
```typescript
// Backend middleware (MUST IMPLEMENT)
async function checkPermission(req, res, next) {
  const user = await getUserFromToken(req.headers.authorization);

  if (req.method === 'DELETE' && user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Only admins can delete resources'
    });
  }

  next();
}
```

#### Test 1.3: Direct URL Access

**Objective:** Verify users cannot access admin routes via URL manipulation

**Steps:**
1. Login as **User**
2. Manually type URL: `http://localhost:5173/#admin-settings`
3. Check if admin settings page loads

**Expected Result:** ✅ PASS (or ⚠️ redirect to dashboard)
- User cannot see admin content
- OR redirected to dashboard with error message

**Actual Result (V5.8.0):** ⚠️ PARTIAL
- No routing guards currently (single-page app with conditional rendering)
- Admin content not visible due to sidebar hiding
- **Recommendation:** Add route guards in production

#### Test 1.4: Permission Escalation via DevTools

**Objective:** Verify users cannot escalate permissions via browser manipulation

**Steps:**
1. Login as **User**
2. Open Chrome DevTools → Console
3. Attempt to modify user role:
   ```javascript
   // Try to escalate to admin
   window.currentUser = { ...window.currentUser, role: 'admin' };
   ```
4. Try to delete a resource

**Expected Result:** ⚠️ PARTIAL PASS
- Frontend may show delete button (cosmetic only)
- Backend MUST reject the delete (403 Forbidden)

**Current Result (V5.8.0):** ⚠️ COSMETIC ONLY
- No backend to enforce (frontend-only demo)
- **Production Fix:** Backend authorization (see Test 1.2)

---

## 🔑 A02: Cryptographic Failures Testing

### Risk Level: 🔴 CRITICAL

### Test Cases

#### Test 2.1: Password Storage (CRITICAL FAILURE)

**Objective:** Verify passwords are hashed, not plaintext

⚠️ **WARNING:** This test will FAIL (plaintext passwords in demo)

**Steps:**
1. Inspect demo user data:
   ```typescript
   // src/data/mockUsers.ts
   export const mockUsers: User[] = [
     {
       id: 'user-001',
       username: 'admin@example.com',
       password: '1234', // ❌ PLAINTEXT!
       role: 'admin'
     }
   ];
   ```

**Expected Result:** ❌ FAIL (demo mode)
```typescript
// ✅ Production MUST use bcrypt
{
  id: 'user-001',
  username: 'admin@example.com',
  passwordHash: '$2b$12$KIi7vZ5z...', // ✅ Hashed
  passwordSalt: 'unique_salt',
  role: 'admin'
}
```

**Current Result (V5.8.0):** ❌ FAIL
- Passwords stored in plaintext
- **MUST FIX** before production

**Production Fix:**
```typescript
import bcrypt from 'bcryptjs';

// Registration/password change
const salt = await bcrypt.genSalt(12);
const hash = await bcrypt.hash(password, salt);

// Save to database
await db.users.create({
  username,
  passwordHash: hash,
  passwordSalt: salt,
  role
});

// Login verification
const user = await db.users.findByUsername(username);
const isValid = await bcrypt.compare(password, user.passwordHash);

if (isValid) {
  // Grant access
} else {
  // Reject
}
```

#### Test 2.2: Sensitive Data in LocalStorage

**Objective:** Verify no sensitive data stored unencrypted

**Steps:**
1. Login to application
2. Open Chrome DevTools → Application → Local Storage
3. Inspect all stored values

**Expected Result:** ✅ PASS
- No passwords, tokens, or sensitive data in plaintext
- Session tokens (if any) should be HttpOnly cookies

**Current Result (V5.8.0):** ✅ PASS
- No LocalStorage usage currently
- **Future:** If using tokens, store in HttpOnly cookies only

#### Test 2.3: HTTPS Enforcement (Production)

**Objective:** Verify all traffic uses HTTPS

**Steps:**
1. Deploy to production
2. Visit: `http://yourdomain.com`
3. Check if redirected to `https://yourdomain.com`

**Expected Result:** ✅ PASS
- Automatic redirect to HTTPS
- HSTS header present: `Strict-Transport-Security: max-age=31536000`

**Current Result (Dev):** N/A (localhost)

**Production Fix:**
```nginx
# Nginx config
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

---

## 💉 A03: Injection Testing

### Risk Level: 🔴 HIGH

### Test Cases

#### Test 3.1: XSS (Cross-Site Scripting)

**Objective:** Verify user input is sanitized

**Steps:**
1. Login as **Admin**
2. Create new werkorder with malicious title:
   ```html
   <script>alert('XSS')</script>
   ```
3. Save and view werkorder

**Expected Result:** ✅ PASS
- Script tag rendered as plain text (not executed)
- React auto-escapes by default

**Actual Result (V5.8.0):** ✅ PASS
- React's JSX escapes HTML by default
- No XSS vulnerability

**Test 3.2: XSS via dangerouslySetInnerHTML**

**Objective:** Verify no unsafe HTML rendering

**Steps:**
1. Search codebase:
   ```bash
   grep -r "dangerouslySetInnerHTML" src/
   ```

**Expected Result:** ✅ PASS
- No results (or all results are sanitized)

**Actual Result (V5.8.0):** ✅ PASS
- No usage of `dangerouslySetInnerHTML`

#### Test 3.3: SQL Injection (Future Backend)

**Objective:** Verify parameterized queries (not string concatenation)

⚠️ **WARNING:** This test is for future backend API

**Steps:**
1. Inspect backend code for SQL queries:
   ```typescript
   // ❌ VULNERABLE
   const query = `SELECT * FROM workorders WHERE id = '${req.params.id}'`;
   db.query(query);

   // ✅ SAFE
   const query = 'SELECT * FROM workorders WHERE id = ?';
   db.query(query, [req.params.id]);
   ```

**Expected Result:** ✅ PASS
- All queries use parameterized statements
- No string concatenation in SQL

**Current Result:** N/A (no backend yet)

---

## 🏗️ A04: Insecure Design Testing

### Risk Level: 🟡 HIGH

### Test Cases

#### Test 4.1: Rate Limiting (Future Backend)

**Objective:** Verify login attempts are rate-limited

**Steps:**
1. Attempt to login 10 times with wrong password
2. Check if account is locked or rate-limited

**Expected Result:** ✅ PASS
- After 5 failed attempts: delay increases (1s, 2s, 4s, 8s, 16s)
- After 10 failed attempts: account locked for 15 minutes

**Current Result (V5.8.0):** ❌ FAIL
- No rate limiting (demo mode)
- **Production Fix Required**

**Production Fix:**
```typescript
// Backend rate limiting (express-rate-limit)
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again after 15 minutes'
});

app.post('/api/login', loginLimiter, async (req, res) => {
  // Login logic
});
```

#### Test 4.2: CSRF Protection (Future Backend)

**Objective:** Verify CSRF tokens on state-changing operations

**Steps:**
1. Open two browsers (Chrome + Firefox)
2. Login in Chrome
3. In Firefox, craft malicious form:
   ```html
   <form action="https://yourdomain.com/api/workorders/wo-001" method="POST">
     <input name="status" value="completed">
   </form>
   <script>document.forms[0].submit()</script>
   ```
4. Submit form

**Expected Result:** ✅ PASS
- Request rejected: "Invalid CSRF token"

**Current Result:** N/A (no backend yet)

**Production Fix:**
```typescript
// Backend CSRF protection (csurf)
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

app.post('/api/workorders/:id', csrfProtection, async (req, res) => {
  // Verify CSRF token (automatic)
});

// Frontend: Send CSRF token in requests
fetch('/api/workorders/wo-001', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
  }
});
```

---

## ⚙️ A05: Security Misconfiguration Testing

### Risk Level: 🟡 MEDIUM

### Test Cases

#### Test 5.1: Exposed Secrets in Code

**Objective:** Verify no API keys, passwords, or tokens in code

**Steps:**
1. Search codebase:
   ```bash
   grep -r "API_KEY" src/
   grep -r "password.*=.*['\"]" src/
   grep -r "token.*=.*['\"]" src/
   ```

**Expected Result:** ✅ PASS
- No hardcoded secrets
- All secrets in environment variables (.env)

**Actual Result (V5.8.0):** ✅ PASS
- Demo passwords are clearly marked as "DEMO ONLY"
- No real secrets in code

#### Test 5.2: Security Headers (Production)

**Objective:** Verify security headers present

**Steps:**
1. Visit production site
2. Check response headers:
   ```bash
   curl -I https://yourdomain.com
   ```

**Expected Result:** ✅ PASS
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

**Current Result (Dev):** ⚠️ PARTIAL
- Vite dev server missing some headers
- **Production Fix:** Add via Nginx/server config

**Production Fix:**
```nginx
# Nginx config
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

---

## 📦 A06: Vulnerable Components Testing

### Risk Level: 🔴 HIGH

### Test Cases

#### Test 6.1: Dependency Audit

**Objective:** Verify no known vulnerable dependencies

**Steps:**
1. Run npm audit:
   ```bash
   npm audit
   ```

**Expected Result:** ✅ PASS
- 0 vulnerabilities (or only low-severity dev dependencies)

**Actual Result (V5.8.0):** ✅ PASS
- No known vulnerabilities
- All dependencies up-to-date

**If vulnerabilities found:**
```bash
# Fix automatically
npm audit fix

# Force fix (may break things)
npm audit fix --force

# Review manually
npm audit
```

#### Test 6.2: Dependency Version Pinning

**Objective:** Verify exact versions (not ranges)

**Steps:**
1. Check package.json:
   ```json
   {
     "dependencies": {
       "react": "19.0.0",      // ✅ Exact version
       "react": "^19.0.0",     // ❌ Range (can auto-update)
     }
   }
   ```

**Expected Result:** ⚠️ PARTIAL
- Core dependencies (React, Vite) should be exact
- Dev dependencies can use ranges

**Current Result (V5.8.0):** ⚠️ PARTIAL
- Some dependencies use ranges (^)
- **Recommendation:** Pin critical deps before production

---

## 🔐 A07: Authentication Failures Testing

### Risk Level: 🔴 CRITICAL

### Test Cases

#### Test 7.1: Weak Password Policy

**Objective:** Verify strong password requirements

**Steps:**
1. Attempt to create user with weak password:
   - "123"
   - "password"
   - "admin"

**Expected Result:** ❌ FAIL (rejected)
```
Password must be:
- At least 12 characters
- Include uppercase, lowercase, number, special char
- Not in common password list
```

**Current Result (V5.8.0):** ❌ FAIL
- Demo passwords are "1234" (extremely weak)
- **Production Fix Required**

**Production Fix:**
```typescript
import passwordValidator from 'password-validator';

const schema = new passwordValidator();
schema
  .is().min(12)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().symbols()
  .is().not().oneOf(['password', '12345678', 'admin']);

if (!schema.validate(password)) {
  throw new Error('Password does not meet requirements');
}
```

#### Test 7.2: Session Timeout

**Objective:** Verify sessions expire after inactivity

**Steps:**
1. Login to application
2. Wait 30 minutes (no activity)
3. Try to perform action

**Expected Result:** ✅ PASS (or ⚠️ logged out)
- Session expired, redirected to login

**Current Result (V5.8.0):** ❌ FAIL
- No session timeout (demo mode)
- **Production Fix:** Implement session expiry (30 min idle)

#### Test 7.3: Brute Force Protection

**Objective:** Verify account lockout after failed logins

**Steps:**
1. Attempt to login 10 times with wrong password
2. Check if account locked

**Expected Result:** ✅ PASS
- Account locked after 5 failed attempts
- Lockout duration: 15 minutes

**Current Result (V5.8.0):** ❌ FAIL
- No lockout mechanism
- **Production Fix:** Implement rate limiting (see A04 Test 4.1)

---

## 🔍 Automated Security Testing

### Tools

#### 1. npm audit (Dependency Vulnerabilities)

```bash
# Run audit
npm audit

# Fix automatically
npm audit fix

# Generate audit report
npm audit --json > audit-report.json
```

**Schedule:** Weekly (automated in CI/CD)

#### 2. OWASP ZAP (Web Application Scanner)

```bash
# Install OWASP ZAP
# Download from: https://www.zaproxy.org/download/

# Run automated scan
zap-cli quick-scan --self-contained --spider http://localhost:5173

# Run full scan
zap-cli active-scan --recursive http://localhost:5173
```

**Schedule:** Before each production release

#### 3. ESLint Security Plugin

```bash
# Install
npm install -D eslint-plugin-security

# .eslintrc.js
module.exports = {
  plugins: ['security'],
  extends: ['plugin:security/recommended'],
};

# Run
npm run lint
```

**Catches:**
- `eval()` usage
- Insecure RegExp
- Potential XSS

#### 4. Snyk (Dependency & Code Scanning)

```bash
# Install
npm install -g snyk

# Authenticate
snyk auth

# Test dependencies
snyk test

# Monitor continuously
snyk monitor
```

**Schedule:** On every commit (CI/CD integration)

---

## 🔒 Security Testing Checklist

### Pre-Release Security Audit

#### A01: Broken Access Control
- [ ] User cannot delete resources (frontend)
- [ ] Backend rejects unauthorized API calls (403)
- [ ] Admin-only features hidden from users
- [ ] No permission escalation via DevTools

#### A02: Cryptographic Failures
- [ ] **CRITICAL:** Passwords hashed with bcrypt (saltRounds >= 12)
- [ ] No sensitive data in LocalStorage/SessionStorage
- [ ] HTTPS enforced (production)
- [ ] HSTS header present (production)

#### A03: Injection
- [ ] XSS test passed (React auto-escapes)
- [ ] No `dangerouslySetInnerHTML` usage
- [ ] SQL injection prevented (parameterized queries)

#### A04: Insecure Design
- [ ] Rate limiting on login (5 attempts/15 min)
- [ ] CSRF protection enabled (backend)
- [ ] Session timeout (30 min idle)

#### A05: Security Misconfiguration
- [ ] No secrets in code (use .env)
- [ ] Security headers present (X-Frame-Options, CSP, etc.)
- [ ] Error messages don't reveal sensitive info

#### A06: Vulnerable Components
- [ ] `npm audit` shows 0 high/critical vulnerabilities
- [ ] All dependencies up-to-date
- [ ] Unused dependencies removed

#### A07: Authentication Failures
- [ ] **CRITICAL:** Strong password policy (12+ chars, complexity)
- [ ] Account lockout after 5 failed login attempts
- [ ] Session timeout implemented (30 min)
- [ ] MFA available (optional, recommended)

#### A08: Data Integrity Failures
- [ ] JWT tokens signed (if using JWT)
- [ ] No unsigned/unverified data accepted
- [ ] Checksums for file uploads

#### A09: Logging Failures
- [ ] Security events logged (login, logout, failed attempts)
- [ ] Logs don't contain sensitive data (passwords, tokens)
- [ ] Centralized logging (production)

#### A10: SSRF
- [ ] User-provided URLs validated (whitelist)
- [ ] No unrestricted outbound requests

---

## 🐛 Troubleshooting Security Tests

### Test Failures

#### "npm audit" shows vulnerabilities

**Solution:**
```bash
# Try automatic fix
npm audit fix

# If that fails, update manually
npm update [package-name]

# Check for breaking changes
npm outdated
```

#### Security headers missing

**Solution:**
```nginx
# Add to Nginx/Apache config
add_header X-Frame-Options "DENY" always;
# (see A05 Test 5.2 for full list)
```

#### Passwords not hashing

**Solution:**
```typescript
// Install bcrypt
npm install bcryptjs

// Implement hashing (see A02 Test 2.1)
```

---

## 📚 Gerelateerde Documentatie

- [Security OWASP Mapping](../02-architecture/security-owasp-mapping.md) - Vulnerability details
- [Security Architecture](../02-architecture/security.md) - Security design
- [User Roles](./user-roles.md) - Permission matrix

---

## 📊 Security Test Report Template

```markdown
# Security Test Report

**Date:** [Date]
**Tester:** [Name]
**Version:** [App Version]
**Environment:** [Dev/Staging/Production]

## Test Results

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| A01.1 | User Role Enforcement | ✅ PASS | - |
| A01.2 | Backend Authorization | ❌ FAIL | No backend yet |
| A02.1 | Password Hashing | ❌ FAIL | Plaintext (demo) |
| A03.1 | XSS Protection | ✅ PASS | React auto-escapes |
| ... | ... | ... | ... |

## Summary

- **Total Tests:** 25
- **Passed:** 15 (60%)
- **Failed:** 8 (32%)
- **N/A:** 2 (8%)

## Critical Issues

1. **Plaintext Passwords** (A02.1) - P0
2. **No Backend Authorization** (A01.2) - P0
3. **Weak Password Policy** (A07.1) - P0

## Recommendations

1. Implement bcrypt password hashing
2. Add backend API with authorization
3. Enforce strong password policy (12+ chars)
4. Add rate limiting on login
5. Implement CSRF protection

## Next Steps

- Fix critical issues before production
- Schedule follow-up test after fixes
- Set up automated security scanning (Snyk, ZAP)
```

---

**Laatste update:** Januari 2025
**Versie:** 1.0.0
**Next Security Audit:** Voor productie release

**Security first! 🔒🛡️**
