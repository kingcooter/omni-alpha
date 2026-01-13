# Omni / Player Menu Project State

> **Last Updated**: 2026-01-13
> **Current Phase**: Player Menu (Life OS) - Phase 1 Complete
> **Deployment**: https://omni-nu-two.vercel.app

---

## Quick Status

| Component | Status |
|-----------|--------|
| Next.js + Tailwind + shadcn/ui | Done |
| Original Omni (Inbox, Thoughts) | Done |
| **Player Menu - Phase 1** | **Done** |
| Player Menu - Phase 2 (Quests) | Not started |
| Player Menu - Phase 3 (AI) | Not started |
| Player Menu - Phase 4 (Polish) | Not started |

---

## Player Menu (Life OS) - NEW

**Vision**: An RPG-inspired personal operating system modeled after game menus (Witcher 3, Baldur's Gate 3). When you open it, you see the state of your world: what you're trying to accomplish, who your key NPCs are, and what happened recently.

**Design Philosophy**:
- **Dieter Rams**: Complexity in system, not interface
- **Edward Tufte**: Maximize data-ink ratio, no decoration
- **RPG Design**: Menu is a view into a living world

### Phase 1 Complete - Core Foundation

**Database Tables Added** (`src/lib/db/schema.ts`):
- `playerContacts` - Contacts with tier system (inner_circle/close/regular/acquaintance/dormant)
- `interactions` - Log interactions with contacts
- `quests` - Goals with objectives (main/side/daily/bounty/discovery types)
- `journalEntries` - Auto-generated narrative log
- `characterProfile` - Drucker questions (strengths, values, how you perform)

**Server Actions Created**:
- `src/actions/player-contacts.ts` - Contact CRUD + tier updates
- `src/actions/player-interactions.ts` - Interaction logging with cascade triggers
- `src/actions/player-journal.ts` - Journal entry management

**Tier System** (`src/lib/player/tier-calculator.ts`):
- Computes relationship score (0-100) based on interaction frequency/recency
- Exponential decay: relationships weaken without contact
- Tier thresholds: 80+ inner_circle, 60+ close, 40+ regular, 20+ acquaintance, <20 dormant

**UI Components** (`src/components/player/`):
- Layout: `player-shell.tsx`, headers, sections, stat cards
- Contacts: `contact-card.tsx`, `contact-grid.tsx`, `add-contact-form.tsx`
- Shared: `tier-badge.tsx`, `player-avatar.tsx`, `time-ago.tsx`, `progress-bar.tsx`

**Design Tokens** (`src/app/globals.css`):
- 8px grid system
- Tier colors (gold/blue/green/gray)
- Quest type colors
- Flat cards, sharp corners (Rams aesthetic)

**Routes**:
- `/player` - Main menu (pause screen)
- `/player/contacts` - Contact list with tier summary
- `/player/contacts/[id]` - Contact detail with interaction logging

**Sidebar Updated**:
- New "Life OS" section with Player Menu links

---

## Remaining Phases

### Phase 2: Quest System + Journal
- Quest CRUD with objectives
- Objective toggle (check/uncheck)
- Journal feed view
- Quest detail pages
- Routes: `/player/quests`, `/player/quests/[id]`, `/player/journal`

### Phase 3: AI Intelligence
- Parse raw text/voice into structured interactions
- Generate tier change narratives
- Auto-generate daily summaries
- Pattern detection

### Phase 4: Character + Polish
- Character sheet with Drucker questions
- Player stats computed from activity
- Keyboard shortcuts
- Mobile responsiveness

---

## File Structure (Player Menu)

```
src/
├── lib/
│   ├── db/
│   │   └── schema.ts           # Added 5 new tables
│   └── player/
│       └── tier-calculator.ts  # Tier computation logic
├── actions/
│   ├── player-contacts.ts      # Contact CRUD
│   ├── player-interactions.ts  # Interaction logging
│   └── player-journal.ts       # Journal entries
├── components/
│   └── player/
│       ├── layout/
│       │   └── player-shell.tsx
│       ├── contacts/
│       │   ├── contact-card.tsx
│       │   ├── contact-grid.tsx
│       │   └── add-contact-form.tsx
│       └── shared/
│           ├── tier-badge.tsx
│           ├── player-avatar.tsx
│           ├── time-ago.tsx
│           └── progress-bar.tsx
└── app/
    └── player/
        ├── page.tsx                    # Main menu
        └── contacts/
            ├── page.tsx                # Contact list
            └── [id]/
                ├── page.tsx            # Contact detail
                └── log-interaction-form.tsx
```

---

## Environment Setup

To enable Player Menu:

```bash
# 1. Push schema to database
source ~/.nvm/nvm.sh && nvm use 20
export TURSO_DATABASE_URL="libsql://omni-yourusername.turso.io"
export TURSO_AUTH_TOKEN="your-token"
npx drizzle-kit push

# 2. Run dev server
npm run dev

# 3. Navigate to Player Menu
# http://localhost:3000/player
```

---

## Design Guidelines (Player Menu)

- **Dark mode** with Rams/Tufte principles
- **8px grid** for all spacing
- **Flat cards** - no shadows, minimal borders
- **Sharp corners** - no rounded corners
- **High data density** - maximize information per pixel
- **Tier colors**: Gold (inner_circle) > Blue (close) > Green (regular) > Gray (acquaintance) > Dark gray (dormant)
- **Typography**: Tabular nums for data, uppercase labels

---

## Next Steps

1. **Push schema** to production database (requires Turso credentials)
2. **Test** contact creation and interaction logging
3. **Implement Phase 2**: Quest system with objectives
4. **Add keyboard shortcuts** for power users

---

## Notes for Future Context Windows

1. **Always read this file first** - it's the source of truth
2. **Player Menu is parallel** to original Omni (both work)
3. **Schema requires push** - run `npx drizzle-kit push` after setting env vars
4. **TypeScript compiles** - all code is syntactically correct
5. **Design follows Rams/Tufte** - flat, grid-based, data-dense
