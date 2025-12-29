# Omni: Personal AI Command Center

## Vision
A web-based command center for your digital life. Open the tab, cursor auto-focuses inbox, capture thoughts instantly with smart project suggestions. Dashboard panes show AI-digested email, news, and trends. Agents run on schedule to keep you informed without effort.

**Focus**: Making money and building things.

---

## Design Aesthetic

### Vibe: Warm Modern
Premium, warm, and confident. Tech-forward with subtle warmth - not cold and clinical.

### Visual Language
- **Dark mode only** - Warm blacks with subtle brown undertones (not blue-gray)
- **Typography**: Geist throughout - clean and modern
- **Accent color**: Warm gold (#d4a574) as primary accent
- **Cards**: Solid with subtle warm borders, clean and minimal
- **Spacing**: Generous - breathing room
- **Animations**: Smooth 200ms transitions
- **Shadows**: Soft, warm-tinted for subtle depth

### Typography Scale
```css
--font-sans: 'Geist', system-ui, sans-serif;
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 2rem;      /* 32px */
```

### Color Palette
```css
/* Background layers - warm blacks */
--bg-base: #0c0a09;
--bg-elevated: #1c1917;
--bg-card: #292524;
--bg-hover: #44403c;

/* Text hierarchy - warm whites */
--text-primary: #fafaf9;
--text-secondary: #a8a29e;
--text-muted: #78716c;

/* Accents */
--accent-primary: #d4a574;   /* Warm gold */
--accent-secondary: #a78bfa; /* Soft purple */
--accent-success: #22c55e;
--accent-warning: #f59e0b;
--accent-error: #ef4444;

/* Borders */
--border-subtle: rgba(255,255,255,0.06);
--border-default: rgba(255,255,255,0.1);
--border-accent: rgba(212,165,116,0.2);  /* Subtle gold tint */
```

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Next.js 15 (App Router) | Server components, server actions, Vercel deploy |
| **Styling** | Tailwind CSS v4 | Utility-first, great dark mode |
| **Components** | shadcn/ui | Accessible, customizable, dark-mode ready |
| **Database** | Turso (SQLite edge) | Single-user, low latency, free tier |
| **ORM** | Drizzle | Type-safe, lightweight |
| **Agent Scheduler** | Inngest | Serverless cron, reliable, free tier |
| **AI** | OpenAI GPT-4o | Function calling, cost-effective |
| **Editor** | Tiptap | Headless, markdown support |
| **Auth** | Clerk (optional) | Protect deployed instance |

---

## Core UI

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  OMNI                    [⌘K Search]              [⚙️] [👤] │
├────────────┬────────────────────────────────────────────────┤
│            │                                                │
│  INBOX     │   ┌─────────────────────────────────────────┐  │
│  RECENTS   │   │  💭 INBOX                               │  │
│  CALENDAR  │   │  ┌─────────────────────────────────────┐│  │
│  PROJECTS  │   │  │ What's on your mind?            ⌘⏎ ││  │
│            │   │  └─────────────────────────────────────┘│  │
│  ────────  │   │  Suggest: [Project A] [Project B] [+]   │  │
│  AGENTS    │   └─────────────────────────────────────────┘  │
│   Email    │                                                │
│   News     │   ┌──────────────┐  ┌──────────────┐          │
│   Trends   │   │ 📅 TODAY     │  │ 📧 EMAIL     │          │
│            │   │ 3 events     │  │ 3 important  │          │
│  ────────  │   │ Next: 2pm    │  │ Last: 8am    │          │
│  SETTINGS  │   └──────────────┘  └──────────────┘          │
│            │                                                │
└────────────┴────────────────────────────────────────────────┘
```

### Calendar Features
- **Dashboard widget**: Today's events at a glance, next event countdown
- **Full calendar view**: Month/week/day views with smooth navigation
- **Quick event creation**: Natural language input ("meeting tomorrow 2pm")
- **Google Calendar sync**: Two-way sync with primary calendar
- **Event linking**: Connect events to projects and thoughts

### Key Interactions
- **Tab opens** → cursor auto-focused in inbox input
- **Type thought** → AI suggests matching projects in real-time
- **Cmd+Enter** → save thought, clear input, stay focused
- **Cmd+K** → command palette for navigation/actions
- **Click pane** → expand to see full digest

---

## Data Model

```sql
-- Core tables
thoughts (id, content, project_id, tags[], pinned, archived, created_at)
projects (id, name, description, color, icon, archived, sort_order)
events (id, title, description, start_at, end_at, all_day, location,
        project_id, external_id, external_source, created_at)
agents (id, name, type, enabled, schedule, settings{}, last_run, status)
agent_outputs (id, agent_id, content, summary, metadata{}, created_at)
settings (key, value{})
credentials (id, name, encrypted_value, expires_at)
```

---

## Agents

### 1. Email Digest Agent
- **Schedule**: Daily 7am
- **Source**: Gmail API
- **Output**: Important emails summarized, action items extracted

### 2. News Scraper Agent
- **Schedule**: Daily 6am
- **Sources**: Configurable RSS feeds / sites (HN, TechCrunch, etc.)
- **Output**: Top 10 headlines with one-paragraph summaries

### 3. X/Twitter Trends Agent
- **Schedule**: Every 4 hours
- **Source**: X API
- **Output**: Trending topics with context and why they matter

### 4. Project Suggester (Event-driven)
- **Trigger**: On thought save
- **Action**: Analyze content, suggest matching projects

---

## Implementation Phases

### Phase 1: Foundation
**Goal**: Inbox capture working, deployed to Vercel

1. Initialize Next.js 15 + TypeScript + Tailwind v4
2. Set up shadcn/ui with dark theme customization
3. Configure Geist font
4. Create Turso database + Drizzle schema
5. Build layout shell (sidebar, header)
6. Build inbox card with auto-focus
7. Implement thought save (server action)
8. Display recent thoughts on dashboard
9. Deploy to Vercel

**Files**:
- `src/app/layout.tsx` - Root with fonts, theme
- `src/app/page.tsx` - Dashboard
- `src/components/inbox/inbox-card.tsx` - Core capture UI
- `src/lib/db/schema.ts` - Database schema
- `src/actions/thoughts.ts` - Server actions

### Phase 2: Organization
**Goal**: Projects and recents page

1. Projects CRUD (create, edit, archive)
2. Project selector on thoughts
3. Recents page with search/filter
4. Command palette (Cmd+K)
5. Keyboard shortcuts throughout

**Files**:
- `src/app/recents/page.tsx`
- `src/app/projects/page.tsx`
- `src/components/command-palette.tsx`

### Phase 3: Calendar
**Goal**: Rich calendar interface with Google Calendar sync

1. Calendar data model and schema
2. Dashboard "Today" widget with events
3. Full calendar page (month/week/day views)
4. Quick event creation with natural language
5. Google Calendar OAuth and two-way sync
6. Link events to projects

**Files**:
- `src/app/calendar/page.tsx`
- `src/components/calendar/calendar-view.tsx`
- `src/components/calendar/event-card.tsx`
- `src/components/calendar/today-widget.tsx`
- `src/lib/calendar/google-sync.ts`
- `src/actions/events.ts`

### Phase 4: Rich Editing
**Goal**: Markdown editor for thoughts

1. Integrate Tiptap with markdown
2. Full thought editor page
3. Auto-save with debounce
4. Formatting toolbar

**Files**:
- `src/components/editor/thought-editor.tsx`
- `src/app/thought/[id]/page.tsx`

### Phase 5: AI Suggestions
**Goal**: Smart project suggestions as you type

1. OpenAI integration
2. Real-time project suggestion on input
3. Accept/reject flow
4. Learning from choices

**Files**:
- `src/lib/openai.ts`
- `src/components/inbox/project-suggester.tsx`

### Phase 6: Agent Infrastructure
**Goal**: Inngest + first agent (news)

1. Configure Inngest
2. Build agent management UI
3. Implement news scraper agent
4. Display news digest pane on dashboard

**Files**:
- `src/lib/inngest/client.ts`
- `src/lib/agents/news-scraper.ts`
- `src/components/agents/agent-pane.tsx`

### Phase 7: More Agents
**Goal**: Email and Twitter agents

1. Gmail OAuth + email digest agent
2. X API + trends agent
3. Agent status dashboard
4. Manual run buttons

**Files**:
- `src/lib/agents/email-digest.ts`
- `src/lib/agents/twitter-trends.ts`
- `src/app/agents/page.tsx`

### Phase 8: Polish
**Goal**: Production ready

1. Loading states and skeletons
2. Error handling with toasts
3. Optimistic updates
4. Performance optimization
5. Mobile responsiveness (basic)

### Phase 9: Security
**Goal**: Protected deployment

1. Add Clerk auth
2. Encrypt stored credentials
3. Production environment config

---

## Folder Structure

```
omni/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, fonts, providers
│   │   ├── page.tsx                # Dashboard
│   │   ├── globals.css             # Tailwind + custom properties
│   │   ├── recents/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── thought/[id]/page.tsx
│   │   ├── agents/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── settings/page.tsx
│   │   └── api/inngest/route.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── command-palette.tsx
│   │   ├── inbox/
│   │   │   ├── inbox-card.tsx
│   │   │   └── project-suggester.tsx
│   │   ├── thoughts/
│   │   │   ├── thought-card.tsx
│   │   │   └── thought-list.tsx
│   │   ├── calendar/
│   │   │   ├── calendar-view.tsx
│   │   │   ├── event-card.tsx
│   │   │   └── today-widget.tsx
│   │   ├── editor/
│   │   │   └── thought-editor.tsx
│   │   ├── agents/
│   │   │   ├── agent-card.tsx
│   │   │   └── agent-pane.tsx
│   │   └── ui/                     # shadcn components
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   └── schema.ts
│   │   ├── inngest/
│   │   │   ├── client.ts
│   │   │   └── functions.ts
│   │   ├── calendar/
│   │   │   └── google-sync.ts
│   │   ├── agents/
│   │   │   ├── news-scraper.ts
│   │   │   ├── email-digest.ts
│   │   │   └── twitter-trends.ts
│   │   └── openai.ts
│   │
│   ├── actions/
│   │   ├── thoughts.ts
│   │   ├── projects.ts
│   │   ├── events.ts
│   │   └── agents.ts
│   │
│   └── hooks/
│       └── use-keyboard-shortcuts.ts
│
├── drizzle.config.ts
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "@libsql/client": "^0.5.0",
    "drizzle-orm": "^0.36.0",
    "inngest": "^3.0.0",
    "openai": "^4.75.0",
    "@tiptap/react": "^2.10.0",
    "@tiptap/starter-kit": "^2.10.0",
    "tailwindcss": "^4.0.0",
    "cmdk": "^1.0.0",
    "lucide-react": "^0.460.0",
    "zod": "^3.23.0",
    "geist": "^1.0.0"
  }
}
```

Note: Geist is Vercel's font - install via `geist` package, load via `next/font/local`.

---

## Success Criteria

After 30 days:
- Open tab → capture thought in < 3 seconds
- Find any thought via search
- Calendar synced with Google, events visible at a glance
- Email/news/trends digests populated daily
- Feel like a "command center" not a "notes app"
