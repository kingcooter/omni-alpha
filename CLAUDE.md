# Claude Code Instructions for Omni

## CRITICAL: First Steps in Every New Context Window

**STOP. Before doing ANY work on this project, you MUST read the project state.**

```bash
cat docs/PROJECT_STATE.md
```

This file contains:
- Current phase and status
- Completed work summary
- Immediate next steps
- File structure reference
- Design system details

**DO NOT** start coding until you understand where the project left off.

---

## Methodology for Context Continuity

### Starting a New Session
1. Read `docs/PROJECT_STATE.md` completely
2. Check for any existing todo list in the conversation
3. Confirm understanding with the user if unclear
4. Pick up from the documented next steps

### During Work
1. Use TodoWrite to track progress on multi-step tasks
2. Commit frequently with clear messages
3. Test builds before considering work complete

### Ending a Session
1. **Update `docs/PROJECT_STATE.md`** with:
   - What was completed
   - Current status
   - Any blockers or notes
   - Updated next steps
2. Commit the updated PROJECT_STATE.md
3. Summarize for the user

---

## Project Overview

**Omni** is a personal AI command center - a web-based dashboard for:
- Capturing thoughts instantly (auto-focused inbox)
- Organizing with AI-suggested projects
- Viewing digest panes (calendar, email, news, trends)
- Dispatching scheduled AI agents

**Owner**: Ellis Brown
**Stack**: Next.js 16, TypeScript, Tailwind v4, shadcn/ui, Drizzle ORM, SQLite/Turso
**Deployment**: https://omni-nu-two.vercel.app

---

## Key Files Reference

| Purpose | Path |
|---------|------|
| **Project state (READ FIRST)** | `docs/PROJECT_STATE.md` |
| Full implementation plan | `docs/IMPLEMENTATION_PLAN.md` |
| Database schema | `src/lib/db/schema.ts` |
| Server actions | `src/actions/` |
| UI components | `src/components/` |
| Main dashboard | `src/app/page.tsx` |
| Theme/CSS variables | `src/app/globals.css` |

---

## Design Guidelines

- **Dark mode only** - warm blacks (#0c0a09), not cold blue-gray
- **Primary accent**: Warm gold (#d4a574)
- **Typography**: Geist font throughout
- **Aesthetic**: "Warm Modern" - premium, confident, tech-forward with subtle warmth
- **No emojis** in code unless user requests

---

## Commands

```bash
# IMPORTANT: Always use Node 20+
source ~/.nvm/nvm.sh && nvm use 20

# Development
npm run dev

# Build (always test before deploying)
npm run build

# Database schema push
npx drizzle-kit push

# Deploy to Vercel
vercel --prod
```

---

## User Context

- User has ADHD - prioritize low-friction, instant capture experiences
- Focus is on "making money and building things"
- Prefers power-user features (keyboard shortcuts, CLI-like efficiency)
- Not a developer - comfortable with config but not writing code

---

## Common Gotchas

1. **Node version**: Must use Node 20+, always source nvm first
2. **Database**: Local SQLite in dev, needs Turso setup for production
3. **Theme**: Dark mode is default (class="dark" on html element)
4. **Imports**: Use `@/` alias for all imports from src/
