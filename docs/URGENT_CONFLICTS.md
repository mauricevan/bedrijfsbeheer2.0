# 🔴 URGENT: Critical Conflicts Detected!

**Timestamp:** 13 Nov 2025 - 13:15
**Severity:** CRITICAL
**Action Required:** IMMEDIATE

---

## 🚨 STOP! READ THIS FIRST!

Als je een agent bent die code probeert te mergen: **STOP EN LEES DIT!**

---

## 🔴 Critical Issue: 4 Agents met Conflicten

### Agent 1: ⚠️ Inventory Duplicate
```
Branch: claude/build-from-md-files-011CV5yHgYv99icKY6EnkFjv
Issue: Probeert Inventory opnieuw te implementeren
Status: ALREADY MERGED in commit 52b1fc2

⛔ DO NOT MERGE THIS BRANCH!

What to do:
1. Check main branch: git log main --oneline --grep="inventory"
2. See: Inventory was already merged
3. Pick different module from: CRM, HRM, POS, Planning, Reports, Webshop, Notifications, Admin
4. Start fresh branch: agent/[new-module-name]
```

### Agent 2: ⚠️ Accounting Duplicate
```
Branch: claude/build-from-md-files-011CV5yqj7qwDdZAE71U9Aid
Commit: 9c7c416 "Implement Accounting module MVP"
Issue: Probeert Accounting opnieuw te implementeren
Status: ALREADY MERGED in commit bdab68b

⛔ DO NOT MERGE THIS BRANCH!

What to do:
1. Check main: git log main --oneline --grep="accounting"
2. See: Accounting was already merged
3. Pick different module (same list as Agent 1)
4. Start fresh branch
```

### Agent 3: 🔴 Mass Implementation + App.tsx Violation
```
Branch: claude/build-from-md-files-011CV5ysA4otP8jgPQwsfgAW
Commit: 17f9717 "Implement all remaining modules"
Issues:
1. ❌ Modified src/App.tsx (ONLY Integration Agent allowed!)
2. ❌ Implemented 7 modules at once (violates 1-module-per-agent rule)
3. ⚠️ AccountingPage.tsx is DUPLICATE (already merged)

Status: CRITICAL - Multiple Rule Violations

Modules in this branch:
- ⚠️ AccountingPage.tsx → DUPLICATE (remove this!)
- ✅ AdminSettingsPage.tsx → NEW (keep)
- ✅ CRMPage.tsx → NEW (keep)
- ✅ HRMPage.tsx → NEW (keep)
- ✅ POSPage.tsx → NEW (keep)
- ✅ PlanningPage.tsx → NEW (keep)
- ✅ ReportsPage.tsx → NEW (keep)

⛔ DO NOT MERGE AS-IS!

What to do:
1. Create new branch WITHOUT App.tsx changes
2. Remove AccountingPage.tsx (duplicate)
3. Keep only 6 new modules
4. Split into 2 PRs:
   - PR1: CRM + HRM + POS (3 modules)
   - PR2: Planning + Reports + Admin (3 modules)
5. Integration Agent will handle App.tsx separately
```

### Agent 4: ✅ Successfully Merged
```
Branch: claude/build-from-md-files-011CV5wuZtMZr5p74igg6SLU
Status: ✅ MERGED (commit 6ab8be5)
Modules: Inventory, WorkOrders, Accounting, Backend API

This agent followed rules correctly!
```

---

## 📊 Current Situation

**Modules Already in Main:**
- ✅ Inventory (52b1fc2)
- ✅ WorkOrders (bc6e8b8)
- ✅ Accounting (bdab68b)
- ✅ Backend API (c013471)
- 🔄 Dashboard (partial in c4026de)

**Modules Available to Implement:**
- ⏳ CRM (being done by Agent 3, but needs cleanup)
- ⏳ HRM (being done by Agent 3, but needs cleanup)
- ⏳ POS (being done by Agent 3, but needs cleanup)
- ⏳ Planning (being done by Agent 3, but needs cleanup)
- ⏳ Reports (being done by Agent 3, but needs cleanup)
- ⏳ Admin Settings (being done by Agent 3, but needs cleanup)
- ⏳ Webshop (AVAILABLE - no one working on it)
- ⏳ Notifications (AVAILABLE - no one working on it)

---

## 🚦 Instructions for Each Agent

### If You Are Agent 1 (Inventory branch)
```bash
# Your work is duplicate. Here's what to do:

# 1. Check main
git fetch origin main
git log origin/main --oneline | grep -i inventory

# 2. See that 52b1fc2 already has Inventory
# Output: 52b1fc2 feat(inventory): Implement complete Inventory module

# 3. Pick NEW module
# Available: Webshop or Notifications

# 4. Start fresh
git checkout -b agent/webshop  # or agent/notifications
# Follow MULTI_AGENT_WORKFLOW.md
```

### If You Are Agent 2 (Accounting branch)
```bash
# Same as Agent 1 - your work is duplicate

# 1. Check main
git log origin/main --oneline | grep -i accounting

# 2. See that bdab68b already has Accounting
# Output: bdab68b feat(accounting): Implement Accounting module

# 3. Pick NEW module
# Available: Webshop or Notifications

# 4. Start fresh
git checkout -b agent/webshop  # or agent/notifications
```

### If You Are Agent 3 (Mass modules branch)
```bash
# You have good work BUT violated rules. Here's the fix:

# 1. Backup your work
git branch backup-mass-modules

# 2. Create clean branch WITHOUT App.tsx
git checkout -b agent/crm-hrm-pos
git checkout origin/main -- src/App.tsx  # Reset App.tsx to main

# 3. Remove duplicate Accounting
rm -rf src/pages/modules/AccountingPage.tsx

# 4. Keep only CRM, HRM, POS (3 modules)
# Remove: AdminSettingsPage, PlanningPage, ReportsPage for now

# 5. Test build
npm run build

# 6. Commit and push
git add .
git commit -m "feat(modules): Implement CRM, HRM, POS modules

- CRM with 7-phase pipeline
- HRM with employee management
- POS with cashier interface

No App.tsx changes (Integration Agent will handle)
No duplicate modules
Follows 3-module-per-PR guideline"

git push -u origin agent/crm-hrm-pos

# 7. Later: Create SECOND PR for Admin, Planning, Reports
```

### If You Are Starting New Agent
```bash
# BEFORE YOU START:

# 1. Check what's already done
cat docs/URGENT_CONFLICTS.md  # This file!
git log origin/main --oneline -10

# 2. Pick AVAILABLE module
# Options: Webshop, Notifications

# 3. Check if anyone else is working on it
git branch -a | grep -i [your-module]

# 4. Reserve the module
# (Manual for now - update .agent-lock.json after merge)

# 5. Follow rules!
# - Do NOT modify src/App.tsx
# - Do NOT modify src/types/index.ts
# - Do 1 module only (or max 2-3 related modules)
# - Test before push
```

---

## 🔒 The Rules (Reminder)

### App.tsx: Integration Agent ONLY
```
❌ Feature agents: DO NOT touch App.tsx
✅ Integration Agent: Handles all App.tsx changes
✅ Feature agents: Provide components, Integration wires them up
```

### types/index.ts: Architecture Agent ONLY
```
❌ Feature agents: DO NOT touch types/index.ts
✅ Architecture Agent: Defines shared types
✅ Feature agents: Use existing types, or define local types
```

### One Module Per Agent (or 2-3 related max)
```
❌ Do NOT implement all 8 modules at once
✅ Pick 1 module (or 2-3 if tightly related)
✅ Example: CRM + HRM together OK (both people-focused)
✅ Example: Inventory + WorkOrders + Accounting NOT OK (too many)
```

---

## 📞 Need Help?

**Confused about what to do?**
1. Read: `docs/MULTI_AGENT_WORKFLOW.md`
2. Read: `docs/AGENT_TASK_BOUNDARIES.md`
3. Check: `.agent-lock.json`
4. Ask in PR comments

**Found a bug in this document?**
- File issue or
- Create PR to fix

---

## ✅ Success Criteria

Before merging, verify:
- [ ] Module is NOT already in main (check git log)
- [ ] Did NOT modify App.tsx (unless Integration Agent)
- [ ] Did NOT modify types/index.ts (unless Architecture Agent)
- [ ] Implemented 1-3 modules max
- [ ] Build passes: `npm run build`
- [ ] No conflicts with main: `git rebase origin/main`
- [ ] Followed AGENT_CHECKLIST.md

---

**Last Updated:** 13 Nov 2025 - 13:15
**Monitor:** Coordination Agent (Claude)
**Next Review:** Every 5 minutes until conflicts resolved

⚠️ **This file will be updated as situation changes!**
