# Agent Checklist ✅

**Voor:** AI Agents - Praktische checklist voor elke taak
**Versie:** 1.0.0
**Laatst bijgewerkt:** Januari 2025

---

## 🎯 Doel

Deze checklist zorgt ervoor dat je **niets vergeet** bij het uitvoeren van taken. Volg deze lijst bij elke taak om kwaliteit en consistentie te garanderen.

---

## 📋 Master Checklist

### ✅ Pre-Start Phase

**Voor je begint met werken:**

- [ ] **1. Read Documentation**
  - [ ] Gelezen: [MULTI_AGENT_WORKFLOW.md](./MULTI_AGENT_WORKFLOW.md)
  - [ ] Gelezen: [AGENT_TASK_BOUNDARIES.md](./AGENT_TASK_BOUNDARIES.md)
  - [ ] Gelezen: [AGENT_STATE_MANAGEMENT.md](./AGENT_STATE_MANAGEMENT.md)
  - [ ] Gelezen: [AI_GUIDE.md](./AI_GUIDE.md)
  - [ ] Gelezen: [CONVENTIONS.md](../CONVENTIONS.md)

- [ ] **2. Check Task Ownership**
  - [ ] Task valt binnen mijn module ownership
  - [ ] Geen overlap met andere agents
  - [ ] Dependencies zijn beschikbaar
  - [ ] Check [AGENT_TASK_BOUNDARIES.md](./AGENT_TASK_BOUNDARIES.md) voor boundaries

- [ ] **3. Check Lock Status**
  ```bash
  # Check .agent-lock.json
  cat .agent-lock.json | jq '.locks'
  ```
  - [ ] Files die ik ga bewerken zijn niet locked
  - [ ] Indien shared file: lock acquired

- [ ] **4. Pull Latest Changes**
  ```bash
  git checkout main
  git pull origin main
  ```
  - [ ] Latest code pulled
  - [ ] No merge conflicts

- [ ] **5. Create Agent Branch**
  ```bash
  git checkout -b agent/[task-name]
  git push -u origin agent/[task-name]
  ```
  - [ ] Branch created met correcte naming
  - [ ] Branch pushed naar remote

- [ ] **6. Understand Requirements**
  - [ ] Task requirements duidelijk
  - [ ] Acceptance criteria gedefinieerd
  - [ ] Integration points geïdentificeerd
  - [ ] Dependencies noted

---

### 🔨 During Work Phase

**Tijdens het werken:**

- [ ] **7. Respect Boundaries**
  - [ ] Alleen files in mijn ownership bewerken
  - [ ] Geen wijzigingen aan App.tsx (tenzij Integration Agent)
  - [ ] Geen wijzigingen aan andere module folders
  - [ ] Shared files locked via `.agent-lock.json`

- [ ] **8. Follow Conventions**
  - [ ] TypeScript types gebruikt (geen `any`)
  - [ ] PascalCase voor components
  - [ ] camelCase voor functions
  - [ ] UPPERCASE voor constants
  - [ ] Dutch language voor UI text
  - [ ] Imports correct geordend

- [ ] **9. Implement with Quality**
  - [ ] Code volgt CONVENTIONS.md
  - [ ] Permission checks toegevoegd (indien nodig)
  - [ ] Immutable state updates
  - [ ] Error handling geïmplementeerd
  - [ ] Timestamps toegevoegd (createdAt, updatedAt)

- [ ] **10. Add Documentation**
  - [ ] JSDoc comments voor complexe functies
  - [ ] Integration points gedocumenteerd
  - [ ] README.md in module folder (indien nieuw)
  - [ ] Inline comments voor complexe logica

- [ ] **11. Commit Regularly**
  ```bash
  git add .
  git commit -m "feat(module): Description"
  git push origin agent/[task-name]
  ```
  - [ ] Atomic commits (1 feature/fix per commit)
  - [ ] Clear commit messages
  - [ ] Conventional commit format
  - [ ] Pushed to remote branch

- [ ] **12. Test Continuously**
  ```bash
  npm run type-check
  npm run lint
  npm run test
  npm run build
  ```
  - [ ] TypeScript errors resolved
  - [ ] Linting errors resolved
  - [ ] Tests passing
  - [ ] Build successful

---

### ✅ Pre-Handoff Phase

**Voor je handoff naar volgende agent:**

- [ ] **13. Final Testing**
  ```bash
  npm run type-check  # ✅ No errors
  npm run lint        # ✅ No errors
  npm run test        # ✅ All passing
  npm run build       # ✅ Successful
  ```
  - [ ] All checks passing
  - [ ] No console errors in browser
  - [ ] Manual testing gedaan
  - [ ] Both roles tested (Admin + User)

- [ ] **14. Integration Tests**
  - [ ] Integration points getest
  - [ ] Cross-module communication werkt
  - [ ] State synchronization correct
  - [ ] No race conditions

- [ ] **15. Code Review Self-Check**
  - [ ] No commented-out code
  - [ ] No debug console.log statements
  - [ ] No TODO comments (resolve or create issues)
  - [ ] No hardcoded values (use constants)
  - [ ] No sensitive data (passwords, API keys)

- [ ] **16. Documentation Updated**
  - [ ] Module doc updated (docs/03-modules/[module].md)
  - [ ] Integration points documented
  - [ ] Breaking changes noted (if any)
  - [ ] Examples toegevoegd

- [ ] **17. Unlock Shared Files**
  ```bash
  ./scripts/lock-agent.sh [agent-id] [file] "" release
  ```
  - [ ] All locked files released
  - [ ] Lock history updated in `.agent-lock.json`

- [ ] **18. Tag Handoff**
  ```bash
  git commit --allow-empty -m "[HANDOFF:PHASE-DONE]

  Completed: [Description]
  Next Agent: [Agent ID]
  Integration Points: [List]
  "
  git push origin agent/[task-name]
  ```
  - [ ] Handoff tag toegevoegd
  - [ ] Next agent identified
  - [ ] Integration points listed

---

### 🔍 Pre-Merge Phase

**Voor merge naar main:**

- [ ] **19. Sync with Main**
  ```bash
  git fetch origin main
  git merge origin/main
  # Resolve conflicts
  git push origin agent/[task-name]
  ```
  - [ ] Latest main merged into branch
  - [ ] Conflicts resolved
  - [ ] Tests still passing after merge

- [ ] **20. Create Pull Request**
  ```bash
  gh pr create \
    --title "feat: [Module] - [Feature]" \
    --body "[Description]"
  ```
  - [ ] PR created
  - [ ] Description complete
  - [ ] Reviewers assigned
  - [ ] Labels toegevoegd

- [ ] **21. Wait for Approval**
  - [ ] Integration Agent reviewed
  - [ ] Comments addressed
  - [ ] Approval received

---

### 🚀 Post-Merge Phase

**Na merge naar main:**

- [ ] **22. Verify Merge**
  ```bash
  git checkout main
  git pull origin main
  npm run build
  npm run test
  ```
  - [ ] Branch merged successfully
  - [ ] Main still builds
  - [ ] Main tests still pass

- [ ] **23. Cleanup**
  ```bash
  git branch -d agent/[task-name]
  git push origin --delete agent/[task-name]
  ```
  - [ ] Local branch deleted
  - [ ] Remote branch deleted (optional)

- [ ] **24. Update Documentation**
  - [ ] Changelog updated (if release)
  - [ ] Version bumped (if needed)
  - [ ] Migration guide (if breaking changes)

- [ ] **25. Notify Stakeholders**
  - [ ] Team notified van completion
  - [ ] Dependent agents notified
  - [ ] Integration points communicated

---

## 📝 Module-Specific Checklists

### For Feature Agents

**Extra checks voor feature implementation:**

- [ ] **Module Structure**
  ```
  src/features/[module]/
  ├── hooks/
  ├── services/
  ├── utils/
  ├── types/
  └── index.ts (barrel file)
  ```
  - [ ] Folder structure correct
  - [ ] Barrel files present
  - [ ] Types exported

- [ ] **Component Structure**
  ```
  src/components/[module]/
  ├── [Component].tsx
  ├── [Component2].tsx
  └── index.ts (barrel file)
  ```
  - [ ] Components in module folder
  - [ ] Barrel file exports

- [ ] **State Management**
  - [ ] State received via props (centralized)
  - [ ] OR Context created (if complex)
  - [ ] Immutable updates gebruikt
  - [ ] No direct mutations

- [ ] **Integration Exports**
  - [ ] Public functions exported
  - [ ] JSDoc with @consumer tag
  - [ ] Types exported
  - [ ] Examples in docs

---

### For Integration Agent

**Extra checks voor integration tasks:**

- [ ] **Merge Strategy**
  - [ ] Merge order determined
  - [ ] Conflict resolution plan
  - [ ] Backup branch created

- [ ] **Cross-Module Integration**
  - [ ] State connections correct
  - [ ] Props flow correct
  - [ ] Context providers wrapped
  - [ ] Routes configured

- [ ] **Conflict Resolution**
  - [ ] All conflicts resolved
  - [ ] No duplicate code
  - [ ] No broken imports
  - [ ] All tests passing post-merge

- [ ] **Integration Testing**
  - [ ] Cross-module flows tested
  - [ ] State synchronization verified
  - [ ] Navigation working
  - [ ] Permissions correct

---

### For Testing Agent

**Extra checks voor testing tasks:**

- [ ] **Test Coverage**
  ```bash
  npm run test -- --coverage
  ```
  - [ ] Coverage > 80% (target)
  - [ ] Critical paths covered
  - [ ] Edge cases tested

- [ ] **Test Types**
  - [ ] Unit tests voor services
  - [ ] Unit tests voor hooks
  - [ ] Component tests
  - [ ] Integration tests
  - [ ] E2E tests (critical flows)

- [ ] **Test Quality**
  - [ ] Tests are readable
  - [ ] Tests are maintainable
  - [ ] No flaky tests
  - [ ] Fast execution time

---

### For Documentation Agent

**Extra checks voor documentation tasks:**

- [ ] **Documentation Completeness**
  - [ ] All modules documented
  - [ ] All features documented
  - [ ] API documented
  - [ ] Examples provided

- [ ] **Documentation Quality**
  - [ ] No typos
  - [ ] Clear language
  - [ ] Screenshots (if applicable)
  - [ ] Code examples tested

- [ ] **Cross-Links**
  - [ ] Links between docs correct
  - [ ] No broken links
  - [ ] INDEX.md updated
  - [ ] TOC updated

- [ ] **Changelog**
  - [ ] Version bumped
  - [ ] Changes documented
  - [ ] Breaking changes highlighted
  - [ ] Migration guide (if needed)

---

## 🚨 Red Flags Checklist

**STOP en fix als je ziet:**

- ⛔ **TypeScript Errors**
  ```bash
  npm run type-check
  # Must be ZERO errors
  ```

- ⛔ **Linting Errors**
  ```bash
  npm run lint
  # Must be ZERO errors
  ```

- ⛔ **Failing Tests**
  ```bash
  npm run test
  # Must be 100% passing
  ```

- ⛔ **Build Failures**
  ```bash
  npm run build
  # Must succeed
  ```

- ⛔ **Console Errors**
  - Open browser console
  - Must be ZERO errors (warnings OK)

- ⛔ **Permission Violations**
  - Admin checks ontbreken
  - Users kunnen restricted actions doen

- ⛔ **State Mutations**
  ```typescript
  // ❌ NIET DOEN
  obj.field = value;
  arr.push(item);

  // ✅ WEL DOEN
  setObj({ ...obj, field: value });
  setArr([...arr, item]);
  ```

- ⛔ **Boundary Violations**
  - Bewerken van andere agent's files
  - Wijzigen van shared files zonder lock

- ⛔ **Missing Documentation**
  - Complex code zonder comments
  - Integration points niet gedocumenteerd
  - No module README

- ⛔ **Hardcoded Values**
  ```typescript
  // ❌ NIET DOEN
  const url = 'http://localhost:3000';

  // ✅ WEL DOEN
  const url = import.meta.env.VITE_API_URL;
  ```

---

## 💡 Quick Tips

### Productivity Tips

1. **Use Scripts**
   ```bash
   # Create alias in ~/.bashrc or ~/.zshrc
   alias agentlock='./scripts/lock-agent.sh'
   alias agentcheck='npm run type-check && npm run lint && npm run test && npm run build'
   ```

2. **Template Commits**
   ```bash
   # Save frequent commit message patterns
   git config alias.feat '!git commit -m "feat($1): $2"'

   # Usage: git feat accounting "Add quote management"
   ```

3. **Watch Mode**
   ```bash
   # Run tests in watch mode during development
   npm run test -- --watch
   ```

4. **Pre-Commit Hook**
   ```bash
   # .husky/pre-commit
   npm run type-check
   npm run lint
   ```

### Common Mistakes

1. ❌ Forgetting to lock shared files
2. ❌ Not pulling latest changes
3. ❌ Committing without testing
4. ❌ Missing handoff tags
5. ❌ Not documenting integration points
6. ❌ Violating boundaries
7. ❌ Using `any` types
8. ❌ Direct state mutations
9. ❌ Missing permission checks
10. ❌ Incomplete testing

---

## 📊 Checklist Summary

### Quick Reference

**Pre-Start:** 6 items ✅
- Read docs, check ownership, lock status, pull latest, create branch, understand requirements

**During Work:** 6 items 🔨
- Respect boundaries, follow conventions, implement quality, document, commit regularly, test continuously

**Pre-Handoff:** 6 items 🎯
- Final testing, integration tests, self-review, update docs, unlock files, tag handoff

**Pre-Merge:** 3 items 🔍
- Sync with main, create PR, wait for approval

**Post-Merge:** 3 items 🚀
- Verify merge, cleanup, notify

**Total:** 24 checklist items

---

## 🎯 Daily Workflow

### Morning Routine

```bash
# 1. Check notifications
gh pr list --state open

# 2. Check locks
cat .agent-lock.json | jq '.locks | to_entries[] | select(.value.locked_by != null)'

# 3. Pull latest
git checkout main
git pull origin main

# 4. Review tasks
cat TODO.md  # Or your task tracker

# 5. Plan day
# Prioritize tasks, identify dependencies
```

### End of Day Routine

```bash
# 1. Commit all work
git add .
git commit -m "wip: End of day checkpoint"
git push origin agent/[task-name]

# 2. Release locks
# (if any)

# 3. Update progress
# Mark completed items in task tracker

# 4. Tag handoffs
# (if phase complete)

# 5. Document blockers
# Create issues for blockers encountered
```

---

## 📚 Gerelateerde Documentatie

- [MULTI_AGENT_WORKFLOW.md](./MULTI_AGENT_WORKFLOW.md) - Complete workflow
- [AGENT_TASK_BOUNDARIES.md](./AGENT_TASK_BOUNDARIES.md) - Task boundaries
- [AGENT_STATE_MANAGEMENT.md](./AGENT_STATE_MANAGEMENT.md) - State management
- [AI_GUIDE.md](./AI_GUIDE.md) - Development guidelines
- [CONVENTIONS.md](../CONVENTIONS.md) - Code conventions

---

## 🆘 Help

**Stuck op een checklist item?**

1. Re-read relevant documentation
2. Check examples in codebase
3. Ask Integration Agent
4. Create GitHub Issue

**Found a mistake?**

Update this checklist en submit PR!

---

**Laatste update:** Januari 2025
**Versie:** 1.0.0
**Status:** Productie-ready

**Check, check, double-check! ✅✅**
