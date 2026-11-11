# Graphite

Graphite is a polished, offline-first task dashboard with glassmorphism UI in graphite grey tones. Tasks, focus timer, and activity stats run entirely in the browser with state persisted to `localStorage`.

## Stack

| Piece | Role |
| --- | --- |
| **React 18+ / Vite / TypeScript** | UI and static production build |
| **Tailwind CSS v4** | Layout, theme tokens, glass utilities |
| **Framer Motion** | Load stagger, card layout, modals, hover |
| **Zustand + persist** | Tasks, lists, notes, preferences (no backend) |
| **@dnd-kit** | Drag-and-drop task reorder |
| **lucide-react** | Icons |
| **date-fns** | Due dates, activity chart, NLP quick-add |

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (default port **43123**).

Copy `.env.example` to `.env` for local API testing. On Vercel, set `APP_SECRET` plus Upstash/`KV_*` Redis variables in the project **Environment Variables** settings (same `APP_SECRET` on laptop and phone).

```bash
npm run build   # typecheck + static dist/
npm run preview # serve production build
```

## Shortcuts

`N` new task · `/` or `⌘K` command palette · `J`/`K` move · `X` complete · `E` edit · `F` focus · `?` help · `Esc` close overlays
