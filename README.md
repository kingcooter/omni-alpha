# Omni

A personal AI command center for capturing thoughts, organizing projects, and dispatching AI agents.

## Features

- **Instant Capture**: Auto-focused inbox with Cmd+Enter to save
- **Thought Management**: Pin, archive, and delete thoughts
- **Warm Modern Design**: Dark mode with warm blacks and gold accents
- **Fast**: Built with Next.js 16 and React 19

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: SQLite (local) / Turso (production)
- **ORM**: Drizzle

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/omni.git
cd omni

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

**Local Development**: Uses SQLite automatically, no setup needed.

**Production (Turso)**:
1. Create account at [turso.tech](https://turso.tech)
2. Create database: `turso db create omni`
3. Get token: `turso db tokens create omni`
4. Set environment variables:
   ```
   TURSO_DATABASE_URL=libsql://omni-[username].turso.io
   TURSO_AUTH_TOKEN=[your-token]
   ```

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Push database schema
npx drizzle-kit push
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Enter` | Save thought |
| `Cmd+K` | Open command palette (coming soon) |

## Project Structure

```
src/
├── app/              # Next.js pages
├── components/       # React components
│   ├── layout/       # Layout components
│   ├── inbox/        # Inbox components
│   ├── thoughts/     # Thought components
│   └── ui/           # shadcn/ui components
├── lib/              # Utilities and database
└── actions/          # Server actions
```

## License

MIT
