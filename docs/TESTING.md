# SyncStream Canvas — Testing Strategy

> **Version:** 1.0
> **Date:** August 17, 2026
> **Companion To:** [PRD.md](./PRD.md) · [TDD.md](./TDD.md) · [phases.md](./phases.md)

---

## 1. Testing Philosophy

The SyncStream Canvas testing strategy prioritizes **reliability of core collaborative features**. Due to the high concurrency and real-time nature of the application (WebSocket sync, CRDTs), automated testing is critical to prevent regressions.

Our approach follows a practical testing pyramid:
1. **Unit Tests:** High coverage for complex pure logic (e.g., drift correction algorithms, CRDT state updates).
2. **Integration Tests:** Verifying API routes, security rules, and component interactions with mock services.
3. **End-to-End (E2E) Tests:** Simulating real user flows (multi-browser synchronization) in a production-like environment.

---

## 2. Testing Stack

| Tool | Purpose | Key Usage |
|---|---|---|
| **Vitest** | Unit & Integration Testing | Fast execution of pure functions, React hooks, and API request handlers. |
| **React Testing Library** | Component Testing | Rendering UI components, simulating user interactions, checking ARIA accessibility. |
| **Playwright** | End-to-End (E2E) Testing | Multi-browser synchronization testing (e.g., User A draws, User B sees it). |
| **Firebase Emulators** | Local Backend Mocking | Testing Firestore Security Rules, Cloud Storage uploads, and Auth flows locally. |
| **MSW (Mock Service Worker)** | API Mocking | Intercepting network requests during component testing. |

---

## 3. Test Categories & Guidelines

### 3.1 Unit Testing (Vitest)
- **Target Coverage:** > 80% for `src/lib/` and `src/hooks/`.
- **Focus Areas:**
  - `drift.ts` (Drift correction logic).
  - Sync protocol message parsing and validation (Zod schemas).
  - CRDT helper functions and local state transformations.
  - Custom React hooks (e.g., `useSync`, `useCanvas`) using `@testing-library/react-hooks`.
- **Convention:** Co-locate tests with implementation files (e.g., `drift.test.ts` next to `drift.ts`).

### 3.2 Component Testing (Vitest + RTL)
- **Target:** Core UI primitives and complex interactive components.
- **Focus Areas:**
  - Glass-panel components rendering correctly.
  - Toolbar state management (active tool highlights).
  - Video player control bar interactions.
- **Convention:** Test user behavior, not implementation details (e.g., click "Play", expect `onPlay` callback to fire).

### 3.3 Security Rules Testing (Firebase Emulators)
- **Target:** Firestore (`firestore.rules`) and Cloud Storage (`storage.rules`).
- **Focus Areas:**
  - Unauthorized reads/writes are denied.
  - Room members can read room data; non-members cannot.
  - Hosts can update room settings; others cannot.
  - Users can only access their own uploaded media.
- **Execution:** Run locally via `firebase emulators:exec "npm run test:rules"`.

### 3.4 End-to-End Testing (Playwright)
- **Target Coverage:** Core user journeys.
- **Focus Areas:**
  - **Upload Flow:** Sign in, upload a mock video, verify it appears in the media grid.
  - **Sync Flow:** Browser A creates a room and plays video; Browser B joins and verifies playback state is synced.
  - **Canvas Flow:** Browser A draws a stroke; Browser B verifies the SVG path is rendered.
- **Convention:** Run in CI against a staging deployment or local build with Firebase Emulators.

---

## 4. Phase-by-Phase Testing Plan

(Aligns with `phases.md`)

### Phase 1: Auth + Upload
- **Unit:** Test Zod schemas for upload initialization API.
- **Integration:** Test Firebase Auth hook states. Test Firestore rules for user profiles and media collections.
- **E2E:** Automate the drag-and-drop upload flow.

### Phase 2: Theater Mode + Sync
- **Unit:** Extensive testing of `drift.ts` (speed-up vs. hard-seek logic).
- **Component:** Test VideoPlayer controls and HLS integration (mocking network).
- **E2E:** Multi-browser test for host play/pause broadcasting to viewers.

### Phase 3: Collaborative Canvas
- **Unit:** Test Yjs schema definitions and awareness protocol throttlers.
- **Component:** Test CanvasRenderer pan/zoom transforms.
- **E2E:** Multi-browser test for concurrent drawing and cursor visibility.

### Phase 4: Discovery + Landing
- **Component:** Test Intersection Observer animations (mocking intersection).
- **E2E:** Verify SEO tags and navigation flow from Landing -> Discovery -> Room.

---

## 5. Continuous Integration (CI) Setup

Testing will be automated via **GitHub Actions** (`.github/workflows/ci.yml`).

### CI Pipeline Steps:
1. **Linting & Formatting:** `npm run lint` and `npm run format:check`.
2. **Type Checking:** `npm run typecheck` (`tsc --noEmit`).
3. **Unit & Component Tests:** `npm run test` (Vitest).
4. **Security Rules Tests:** Start Firebase emulators, run rules tests, shutdown emulators.
5. **E2E Tests:** Build the Next.js app, start local server, run Playwright tests (with sharding for speed).

---

## 6. Performance & Accessibility Testing

- **Lighthouse:** Integrated into CI to ensure Performance > 80 and Accessibility > 90.
- **Accessibility:** Ensure all interactive elements (buttons, inputs, canvas tools) have proper ARIA labels and are keyboard navigable.
- **Performance Budget:** Fail CI if initial JS bundle exceeds 200KB or if critical CSS rendering blocks for > 1.5s.
