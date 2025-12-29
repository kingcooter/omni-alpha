# Omni Project State

> **Last Updated**: 2025-12-28
> **Current Phase**: Phase 1 Complete, Ready for Phase 2
> **Deployment**: https://omni-nu-two.vercel.app

---

## Quick Status

| Component | Status |
|-----------|--------|
| Next.js + Tailwind + shadcn/ui | Done |
| Warm modern dark theme | Done |
| Layout (sidebar, header) | Done |
| Inbox card with auto-focus | Done |
| Database schema (Drizzle) | Done |
| Thought CRUD operations | Done |
| Vercel deployment | Done |
| Turso production database | **NOT SET UP** |
| Projects CRUD | Not started |
| Calendar integration | Not started |
| AI agents | Not started |

---

## Project Vision

Omni is a personal AI command center - a web dashboard that:
- Captures thoughts instantly (auto-focused inbox, Cmd+Enter to save)
- Organizes with AI-suggested projects
- Shows digest panes (calendar, email, news, trends)
- Dispatches scheduled AI agents to gather information

**Focus**: Making money and building things.

---

## File Structure

```
omni/
├── CLAUDE.md                    # Instructions for Claude (READ FIRST)
├── docs/
│   └── PROJECT_STATE.md         # This file - project state & next steps
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with Geist font, dark mode
│   │   ├── page.tsx             # Main dashboard
│   │   └── globals.css          # Warm modern theme CSS variables
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx      # Navigation sidebar
│   │   │   └── header.tsx       # Top header with search
│   │   ├── inbox/
│   │   │   └── inbox-card.tsx   # Main thought capture (auto-focus)
│   │   ├── thoughts/
│   │   │   ├── thought-card.tsx # Individual thought display
│   │   │   └── thought-list.tsx # List of recent thoughts
│   │   └── ui/                  # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── textarea.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts         # Database client (libsql/Turso)
│   │   │   └── schema.ts        # Drizzle schema (thoughts, projects, events, agents)
│   │   └── utils.ts             # Utility functions (cn)
│   └── actions/
│       └── thoughts.ts          # Server actions for thought CRUD
├── components.json              # shadcn/ui config
├── drizzle.config.ts            # Drizzle ORM config
├── tailwind.config.ts           # Tailwind config
├── next.config.ts               # Next.js config
├── package.json
└── .env.example                 # Environment variables template
```

---

## Database Schema

Defined in `src/lib/db/schema.ts`:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `thoughts` | Core capture | id, content, projectId, isPinned, isArchived, createdAt |
| `projects` | Organization | id, name, description, color, icon |
| `events` | Calendar | id, title, startAt, endAt, allDay, externalId |
| `agents` | Automation | id, name, type, schedule, enabled, settings |
| `agent_outputs` | Agent results | id, agentId, content, summary |
| `settings` | App config | key, value |

---

## Design System

### Colors (CSS Variables in globals.css)
```css
--background: #0c0a09;      /* Stone black */
--foreground: #fafaf9;      /* Warm white */
--card: #1c1917;            /* Elevated surface */
--primary: #d4a574;         /* Warm gold - main accent */
--secondary: #292524;       /* Muted surface */
--muted-foreground: #a8a29e; /* Secondary text */
```

### Typography
- Font: Geist (via next/font/google)
- All text uses warm whites, not pure white

### Components
Using shadcn/ui with custom warm theme. Installed:
- Button, Card, Input, Textarea

---

## Completed Work (Phase 1)

1. **Project Setup**
   - Next.js 16 with App Router
   - TypeScript + Tailwind CSS v4
   - shadcn/ui with warm dark theme
   - Geist font configured

2. **Layout**
   - Sidebar with navigation (Inbox, Recents, Calendar, Projects, Agents)
   - Header with search placeholder
   - Responsive dashboard layout

3. **Inbox Capture**
   - Auto-focused textarea on page load
   - Cmd+Enter to save
   - Loading state with spinner
   - Clears after save, refocuses

4. **Thoughts Display**
   - Recent thoughts list
   - Pin/archive/delete actions
   - Relative timestamps
   - Hover to show actions

5. **Database**
   - Full schema for all tables
   - Drizzle ORM configured
   - Local SQLite for development
   - Server actions for CRUD

6. **Deployment**
   - Vercel project linked
   - Production deployment working
   - URL: https://omni-nu-two.vercel.app

---

## Immediate Next Steps

### Priority 1: Production Database (Required)
The app works locally but needs Turso for production:

1. Create account at https://turso.tech
2. Create database: `turso db create omni`
3. Get credentials: `turso db tokens create omni`
4. Add to Vercel:
   - `TURSO_DATABASE_URL` = libsql://omni-[username].turso.io
   - `TURSO_AUTH_TOKEN` = [token]
5. Push schema: `npx drizzle-kit push`
6. Redeploy: `vercel --prod`

### Priority 2: Phase 2 - Organization
1. **Projects CRUD**
   - Create `src/app/projects/page.tsx`
   - Create `src/actions/projects.ts`
   - Project selector in inbox card
   - Project detail page

2. **Recents Page**
   - Create `src/app/recents/page.tsx`
   - Search/filter thoughts
   - Pagination or infinite scroll

3. **Command Palette (Cmd+K)**
   - Install `cmdk` package
   - Create command palette component
   - Quick navigation and actions

---

## Future Phases

### Phase 3: Calendar
- Google Calendar OAuth
- Calendar view (month/week/day)
- Today widget on dashboard
- Event creation with natural language

### Phase 4: Rich Editing
- Tiptap markdown editor
- Full thought editor page
- Auto-save with debounce

### Phase 5: AI Suggestions
- OpenAI integration
- Project suggestions as you type
- Accept/reject flow

### Phase 6-7: Agents
- Inngest for scheduling
- News scraper agent
- Email digest agent (Gmail)
- X/Twitter trends agent

### Phase 8-9: Polish & Security
- Loading states and skeletons
- Error handling
- Clerk authentication
- Credential encryption

---

## Environment Variables

```bash
# Required for production
TURSO_DATABASE_URL=libsql://omni-[username].turso.io
TURSO_AUTH_TOKEN=your-token-here

# Future phases
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## Development Commands

```bash
# Always use Node 20+
source ~/.nvm/nvm.sh && nvm use 20

# Development server
npm run dev

# Build
npm run build

# Push database schema
npx drizzle-kit push

# Deploy to Vercel
vercel --prod
```

---

## Notes for Future Context Windows

1. **Always read this file first** - it's the source of truth
2. **Check CLAUDE.md** for workflow instructions
3. **Node 20 required** - always source nvm first
4. **Database is local only** until Turso is configured
5. **Theme is dark-only** - warm blacks, gold accents
6. **User has ADHD** - prioritize low-friction, instant capture

---

## Reminders Feature (User Request)

User mentioned wanting a reminders feature with either:
- A ticker
- Something subtle that flashes reminders across the screen

Add this to Phase 3 or later when calendar is implemented.
