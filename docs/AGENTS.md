# AGENTS.md — SyncStream Canvas AI Context File

> This file provides context for AI coding assistants (Copilot, Antigravity, Cursor, etc.) working on the SyncStream Canvas codebase. Read this file first before making any changes.

---

## Project Identity

| Field | Value |
|---|---|
| **Name** | SyncStream Canvas |
| **Type** | Real-time collaborative media platform (web app) |
| **Repo Root** | `c:\dev\New folder\` (will become `syncstream-canvas/`) |
| **Design Source** | Stitch Project `17540314284874410208` |
| **PRD** | [PRD.md](./PRD.md) |
| **Technical Design** | [TDD.md](./TDD.md) |
| **Build Phases** | [phases.md](./phases.md) |

---

## Tech Stack Summary

```
Frontend:       Next.js 15 (App Router) + React 19
Styling:        TailwindCSS v4 (custom "Obsidian Flow" design tokens)
Icons:          Google Material Symbols Outlined (variable font)
Fonts:          Geist (headlines), Inter (body), JetBrains Mono (mono/labels)
Auth:           Firebase Authentication (Google, GitHub, email/password)
Database:       Cloud Firestore (persistent) + Firebase Realtime Database (ephemeral sync)
Storage:        Firebase Cloud Storage (GCS-backed) — pre-signed URL uploads
CDN:            Cloud CDN / Cloudflare (HLS video delivery)
Real-Time:      Custom WebSocket server (Node.js + ws library)
Canvas CRDT:    Yjs + y-websocket
Transcoding:    Cloud Run + FFmpeg (HLS multi-bitrate output)
Shaders:        Raw WebGL + custom GLSL (no Three.js)
Deployment:     Vercel (frontend) + Cloud Run (WebSocket server, transcoder)
Testing:        Vitest (unit) + Playwright (e2e) + Firebase Emulators
```

---

## Project Structure (Target)

```
syncstream-canvas/
├── .github/
│   └── workflows/
│       └── ci.yml                    # Lint, type-check, test, audit
├── public/
│   └── fonts/                        # Self-hosted font fallbacks
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (nav, providers, fonts)
│   │   ├── page.tsx                  # Landing page ("The Journey")
│   │   ├── (app)/                    # Authenticated app group
│   │   │   ├── layout.tsx            # App shell (top nav, session provider)
│   │   │   ├── theater/
│   │   │   │   └── [roomId]/
│   │   │   │       └── page.tsx      # Theater mode (video + sidebar)
│   │   │   ├── canvas/
│   │   │   │   └── [roomId]/
│   │   │   │       └── page.tsx      # Collaborative canvas
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Upload dashboard
│   │   │   └── discovery/
│   │   │       └── page.tsx          # Discovery hub
│   │   └── api/                      # API routes
│   │       ├── auth/
│   │       ├── rooms/
│   │       ├── upload/
│   │       ├── media/
│   │       └── discovery/
│   ├── components/
│   │   ├── ui/                       # Primitives (Button, Input, Card, Badge)
│   │   ├── nav/                      # TopNav, MobileNav, SideNav
│   │   ├── theater/                  # VideoPlayer, ControlsBar, ChatPanel
│   │   ├── canvas/                   # CanvasRenderer, ToolBar, CursorOverlay
│   │   ├── dashboard/                # UploadDropzone, MediaGrid, StorageMeter
│   │   ├── discovery/                # HeroSection, RoomCard, LivePreview
│   │   └── landing/                  # HeroSection, ProblemSection, SolutionSection
│   ├── hooks/
│   │   ├── useAuth.ts                # Firebase auth state
│   │   ├── useRoom.ts                # Room data + membership
│   │   ├── useSync.ts                # WebSocket playback sync
│   │   ├── useCanvas.ts              # Yjs document + awareness
│   │   ├── useUpload.ts              # Pre-signed URL upload flow
│   │   └── useMediaLibrary.ts        # User's media assets
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── client.ts             # Firebase client SDK init
│   │   │   ├── admin.ts              # Firebase Admin SDK (server-side)
│   │   │   └── rules/                # Firestore + Storage security rules
│   │   ├── sync/
│   │   │   ├── protocol.ts           # Sync message types
│   │   │   ├── drift.ts              # Drift correction algorithm
│   │   │   └── client.ts             # WebSocket client wrapper
│   │   ├── canvas/
│   │   │   ├── document.ts           # Yjs canvas document schema
│   │   │   ├── provider.ts           # y-websocket provider setup
│   │   │   └── cursors.ts            # Awareness protocol helpers
│   │   ├── shader/
│   │   │   ├── engine.ts             # WebGL shader lifecycle manager
│   │   │   └── nebula.glsl           # Landing page shader source
│   │   └── utils/
│   │       ├── cn.ts                 # Tailwind class merge utility
│   │       └── format.ts             # Byte/time formatters
│   ├── styles/
│   │   └── globals.css               # Tailwind imports + custom scrollbar + keyframes
│   └── types/
│       ├── room.ts                   # Room, ChatMessage types
│       ├── media.ts                  # MediaAsset types
│       ├── sync.ts                   # SyncMessage union type
│       └── canvas.ts                 # CanvasNode, DrawingStroke, CursorState
├── server/                           # Standalone WebSocket server (Cloud Run)
│   ├── index.ts                      # Entry point
│   ├── room-manager.ts               # Room lifecycle + participant tracking
│   ├── sync-handler.ts               # Playback sync logic (host-authority)
│   ├── auth.ts                       # JWT verification middleware
│   ├── rate-limiter.ts               # Per-client message rate limiting
│   └── Dockerfile                    # Cloud Run container
├── transcoder/                       # FFmpeg transcoding service (Cloud Run)
│   ├── index.ts                      # Cloud Storage trigger handler
│   ├── transcode.ts                  # FFmpeg HLS pipeline
│   └── Dockerfile
├── firestore.rules                   # Firestore security rules
├── storage.rules                     # Cloud Storage security rules
├── tailwind.config.ts                # Obsidian Flow design tokens
├── next.config.ts
├── tsconfig.json
├── package.json
├── AGENTS.md                         # ← This file
├── PRD.md
├── TDD.md
└── phases.md
```

---

## Design System Quick Reference ("Obsidian Flow")

### Colors — Use These Semantic Names

```
Background/Base:   bg-[#050505]  or  bg-background (#131318)
Surface:           bg-surface, bg-surface-container, bg-surface-container-high
Text:              text-on-surface (#E4E1E9), text-on-surface-variant (#C2C6D6)
Primary:           text-primary (#ADC6FF), bg-primary-container (#4D8EFF)
Secondary:         text-secondary (#D0BCFF), bg-secondary-container (#571BC1)
Tertiary:          text-tertiary (#4CD7F6), bg-tertiary-container (#009EB9)
Error:             text-error (#FFB4AB), bg-error-container (#93000A)
Borders:           border-white/10 (default), border-primary/30 (hover), border-primary/50 (active)
```

### Typography Tokens

```
Display:    font-display-lg text-display-lg      → Geist 64px/800/-0.04em
Headline:   font-headline-lg text-headline-lg    → Geist 40px/700/-0.02em
            font-headline-md text-headline-md    → Geist 24px/600
Body:       font-body-lg text-body-lg            → Inter 18px/400
            font-body-md text-body-md            → Inter 16px/400
Labels:     font-label-caps text-label-caps      → Inter 11px/700/0.1em
Mono:       font-label-mono text-label-mono      → JetBrains Mono 12px/500/0.05em
```

### Glassmorphism Pattern

```css
/* Level 2 glass panel */
.glass-panel {
  background: rgba(15, 15, 20, 0.7);
  backdrop-filter: blur(30px);
  border: 0.5px solid rgba(255, 255, 255, 0.1);
}

/* Bloom hover effect */
.bloom-hover:hover {
  box-shadow: 0 0 20px rgba(173, 198, 255, 0.3);
  border-color: rgba(173, 198, 255, 0.5);
}
```

---

## Coding Conventions

### General

- **Documentation Sync:** Whenever we change something from the plan in the docs, update it in the docs immediately to keep the AI Context up to date.
- **Environment Files:** NEVER read or write files with `.env*`. Keep secrets secure and never output them.
- **Phase Completion:** Whenever a phase has been completed, first review it (provide a brief in steps and ask if it is okay or if anything else is needed), and ONLY THEN mark it as done in `phases.md`.
- **Version Control:** After every phase, provide the user with the git commands to commit and push to GitHub. Do NOT run the git commit or push commands yourself.
- **Language:** TypeScript (strict mode, no `any`)
- **React:** Function components only. No class components.
- **State:** React hooks + context. No Redux/Zustand unless complexity demands it.
- **Naming:** `camelCase` for variables/functions, `PascalCase` for components/types, `SCREAMING_SNAKE` for constants
- **Exports:** Named exports only. No default exports (except Next.js pages).
- **Imports:** Use `@/` path alias for `src/` directory

### Components

```typescript
// ✅ Correct pattern
interface VideoPlayerProps {
  mediaId: string
  roomId: string
  isHost: boolean
}

export function VideoPlayer({ mediaId, roomId, isHost }: VideoPlayerProps) {
  // ...
}
```

- Props interfaces named `{ComponentName}Props`
- Destructure props in function signature
- Co-locate component-specific types in the component file
- Shared types go in `src/types/`

### CSS / Styling

- **Always use Tailwind utility classes.** No inline `style={}` except for dynamic values (positions, transforms).
- **Use the design system tokens** (`text-primary`, `bg-surface-container`, `font-label-mono`). Never hardcode hex colors.
- **Class merging:** Use `cn()` utility (clsx + tailwind-merge) for conditional classes.
- **Animations:** Only animate `transform` and `opacity`. Use `will-change` sparingly on fixed elements.

### API Routes

```typescript
// ✅ Correct pattern for API routes
import { z } from 'zod'

const CreateRoomSchema = z.object({
  title: z.string().min(1).max(100),
  visibility: z.enum(['public', 'private', 'invite_only']),
  canvasEnabled: z.boolean().default(true),
})

export async function POST(request: Request) {
  // 1. Authenticate (verify Firebase JWT)
  // 2. Validate body with Zod schema
  // 3. Business logic
  // 4. Return typed response
}
```

- Always validate request bodies with Zod
- Always verify auth before any data access
- Return consistent error shapes: `{ error: string, code: string }`

### WebSocket Messages

- All messages use the `SyncMessage` union type from `src/types/sync.ts`
- Server validates message shape before processing
- Client reconnects with exponential backoff (1s, 2s, 4s, 8s, max 30s)

### Security Rules

- **Never trust the client.** All access control enforced server-side (API middleware + Firestore rules).
- **No `dangerouslySetInnerHTML`.** Chat messages and notes sanitized with DOMPurify.
- **Pre-signed URLs** expire in 15 minutes, enforce type and size constraints.

---

## Environment Variables

```env
# Firebase Client (public — prefixed NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_RTDB_URL=

# Firebase Admin (server-only — NEVER expose to client)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# WebSocket Server
NEXT_PUBLIC_WS_URL=ws://localhost:8080        # wss://sync.syncstream.dev in prod

# CDN
NEXT_PUBLIC_CDN_BASE_URL=
```

---

## Common Pitfalls — Read Before Coding

> [!WARNING]
> **Do NOT:**
> - Route video uploads through API routes — use pre-signed URLs (see TDD §3.1)
> - Let any client send `play`/`pause`/`seek` — only the host can (see TDD §3.2)
> - Use `useState` for canvas state — it's managed by Yjs (see TDD §3.3)
> - Animate `width`, `height`, `left`, `top` — only `transform` and `opacity` (see TDD §3.5)
> - Hardcode colors — always use Tailwind design tokens
> - Use `useEffect` for data fetching — use React Server Components or `useSWR`
> - Store secrets in `.env.local` and commit it — it's in `.gitignore`

> [!TIP]
> **DO:**
> - Run `firebase emulators:start` for local development (Auth, Firestore, Storage)
> - Use the `cn()` utility for conditional Tailwind classes
> - Lazy-load heavy modules: `dynamic(() => import('./CanvasRenderer'), { ssr: false })`
> - Test Firestore rules with the emulator before deploying
> - Check `prefers-reduced-motion` before enabling parallax/shader animations
