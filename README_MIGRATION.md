# Migration Notes: React → Vue 3 + TypeScript + Pinia + Vue Router + Vite

This document describes the in-place migration from the original React (Zustand, React Router, Recharts) stack to Vue 3 (Composition API) + TypeScript + Pinia + Vue Router + Vite. **No UI/UX changes** were made; layout, styling, and behavior are preserved.

---

## How to install dependencies

```bash
npm install
```

---

## How to run dev / build

- **Development:** `npm run dev` — Vite dev server (default port 5000, configurable via `PORT`).
- **Build:** `npm run build` — TypeScript check + Vite production build.
- **Preview:** `npm run preview` — Serve the production build locally.

---

## Route map summary

| Path | Description |
|------|-------------|
| `/` | Redirects to `/invite` |
| `/invite` | Invite code entry (unauthenticated) |
| `/login` | Login page |
| `/register` | Registration (invite-only) |
| `/auth/login` | Redirects to `/login` |
| `/auth/register` | Redirects to `/register` |
| `/dashboard` | Layout wrapper (requires auth); redirects to `/dashboard/home` |
| `/dashboard/home` | Home dashboard |
| `/dashboard/wallet` | Wallet & ledger |
| `/dashboard/players` | Player list |
| `/dashboard/players/:playerId` | Player detail |
| `/dashboard/invites` | Invites list & create |
| `/dashboard/payouts` | Payouts list |
| `/dashboard/commissions` | Commission statements |
| `/dashboard/commissions/statements/:statementId` | Statement detail |
| `/dashboard/clan` | Clan overview |
| `/dashboard/clan/goals` | Clan goals |
| `/dashboard/clan/wars` | Clan wars list |
| `/dashboard/clan/wars/:warId` | War detail |
| `/dashboard/settings` | Settings |
| `/404` | Not found page |
| `*` | Redirects to `/404` |

**Router mode:** Hash history (`createWebHashHistory`) to match the original React HashRouter behavior.

---

## Key decisions

1. **Quasar:** Not used in the migrated app to avoid any visual divergence. The project is set up so Quasar can be added later for non-visual utilities (e.g. dialogs/plugins) if needed.
2. **Charts:** Recharts (React-only) was replaced with **vue-chartjs** + **Chart.js** for the Home dashboard (Deposits vs Withdrawals, GGR Trend). Styling and behavior were kept as close as possible.
3. **State:** Zustand auth store → **Pinia** `auth` store; React Context for theme and toasts → **Pinia** `theme` and `toast` stores. Same persistence (localStorage) and behavior.
4. **Forms:** React Hook Form + Zod → manual refs + **Zod** `safeParse` in Vue (Login, Register, InviteEntry).
5. **Icons:** lucide-react → **lucide-vue-next** (same icon set).
6. **Styling:** All existing **Tailwind** and `styles.css` (including `:root` / `.dark` variables) were kept; no visual changes.

---

## File structure (migrated)

- `src/main.ts` — Vue app entry; Pinia, router, theme init, styles.
- `src/App.vue` — Root: `<router-view />` + toast container.
- `src/router/index.ts` — Vue Router (hash) + `requiresAuth` guard.
- `src/stores/auth.ts` — Auth (user, token, login, logout).
- `src/stores/theme.ts` — Theme (light/dark) + `applyThemeClass`.
- `src/stores/toast.ts` — Toast queue and `push`.
- `src/composables/useAsync.ts` — Async data helper (replaces React `useAsync`).
- `src/utils/cn.ts` — `clsx` + `tailwind-merge` (unchanged).
- `src/components/ui/*.vue` — Button, Card, Input, Select, Badge, Table, Modal, Drawer, Tabs, etc.
- `src/components/common/Logo.vue`, `ThemeToggle.vue`.
- `src/components/charts/TimeRangeControl.vue`.
- `src/components/ui/ToastContainer.vue` — Renders toasts from store.
- `src/layouts/DashboardLayout.vue`, `Sidebar.vue`, `nav.ts`.
- `src/pages/auth/*.vue` — InviteEntry, Login, Register.
- `src/pages/dashboard/*.vue` — Home, Wallet, Players, Invites, Payouts, Commissions, Clan, Settings, etc.
- `src/pages/misc/NotFoundPage.vue`.
- `src/types.ts`, `src/services/`, `src/data/`, `src/utils/` (format, csv, print) — Unchanged.

---

## Quality checklist

- [x] UI kept identical (same Tailwind classes, layout, copy).
- [x] Routes and navigation match original (hash mode, same paths).
- [x] Auth and theme persistence (localStorage) preserved.
- [x] Wallet support and flows preserved (deposit modal, ledger, drawer).
- [x] Build and run commands work (`npm run dev`, `npm run build`).
