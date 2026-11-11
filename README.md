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

Copy `.env.example` to `.env` for local API testing.

### Vercel deploy checklist

1. Import the repo, leave **Build Command** `npm run build` and **Output Directory** `dist` (or use repo `vercel.json`).
2. Set **Environment Variables** for Production (and Preview if needed): `APP_SECRET`, `KV_REST_API_URL`, `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_*`), `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`.
3. Enable **Vercel Cron** on the project (Hobby+: daily job in `vercel.json` → `/api/files/cleanup`).
4. Deploy; confirm `/api/sync` and static routes work. SPA rewrites skip `/api/*`.
5. Use the same `APP_SECRET` in the access-key screen on each device.

```bash
npm run build   # typecheck + static dist/
npm run preview # serve production build
```

## Shortcuts

`N` new task · `/` or `⌘K` command palette · `J`/`K` move · `X` complete · `E` edit · `F` focus · `?` help · `Esc` close overlays
