# Clazino Agent Dashboard — Logic & Authority Fixes

This document summarizes the fixes applied to restore **agent authority**, **userflow**, and **API architecture** per the attached PDFs. **UI/UX remains 100% unchanged.**

---

## 1. Summary of Fixes

- **API layer**: All data access goes through a single API client that switches between **mock** and **real HTTP** via `VITE_USE_MOCK_API`.
- **Auth**: Token-based login (mocked or real), session persistence, auto-logout on token expiry.
- **Permissions**: Agent permission matrix and `can(permission)` action guard.
- **Stores**: `useAuthStore`, `useAgentStore`, `usePermissionStore`; auth drives permissions and agent profile.
- **Route guards**: Auth required + token expiry check; redirect to login when not authenticated or expired.
- **Windows**: Dev script uses fixed port (no Linux-only syntax).

---

## 2. Permission Matrix (from PDFs)

Agent role has the following permissions (enforced via `usePermissionStore().can(...)`):

| Permission           | Description                              |
|----------------------|------------------------------------------|
| `view_dashboard`     | Home overview                            |
| `view_wallet`        | Wallet balance & ledger                  |
| `deposit_usdt`       | Deposit USDT (top-up)                    |
| `view_ledger`        | Wallet ledger history                    |
| `view_players`       | Player list (assigned only)               |
| `view_player_detail` | Player detail panel                      |
| `reclaim_credit`     | Reclaim credit (under rules)              |
| `view_invites`       | Invite list                              |
| `create_invite`      | Create invite                            |
| `resend_invite`      | Resend invite                            |
| `view_payouts`       | Payouts (read-only)                       |
| `view_commissions`   | Commissions & statements                 |
| `view_clan_goals`    | Clan goals                               |
| `view_clan_wars`     | Clan wars                                |
| `register_war`       | Register for war                         |
| `cofund_bonus`       | Co-fund bonus pool                       |
| `view_settings`      | Settings                                 |
| `view_alerts`        | Alerts                                   |

**Agent does not have**: manual ad-hoc credit grant, approve/reject/retry payouts (read-only), or withdraw (unless enabled in a future phase).

---

## 3. Mock API Explanation

- **Location**: `src/services/mock/` (auth.mock, agent.mock, players.mock, payouts.mock).
- **Behavior**: Returns **Promises**, simulates **latency** (delay), uses the same **response shapes** as the real API. No HTTP when mock is used.
- **State**: Mock state lives in `src/services/mock/state.ts` (wallet, ledger, invites, etc.). Only used when `VITE_USE_MOCK_API=true`.
- **Auth mock**: `auth.mock.ts` — `login(credentials)` returns `{ user, token, expiresAt }` after delay; accepts any email (demo).
- **No direct mock data in components**: All UI uses `api` from `src/services/client.ts` or auth from `authClient.ts`; no imports of mock JSON or mock data inside components/stores except the service layer.

---

## 4. How to Switch to Real API

1. **Set env**  
   - `VITE_USE_MOCK_API=false`  
   - `VITE_API_BASE_URL=https://your-backend.com` (no trailing slash).

2. **Backend**  
   - Implement the same endpoints and response shapes as in `src/services/api/` and the existing `Api` type in `src/services/api.ts`.

3. **No code changes**  
   - Components and stores keep using `api` and `authApi`; the client and auth client switch implementation based on `VITE_USE_MOCK_API`.

---

## 5. Architecture (Component → Store → Service → API)

```
Component / Page
    → uses api from client.ts (or authApi from authClient.ts)
        → client.ts: VITE_USE_MOCK_API ? createMockApi() : createApi()
            → Mock: services/mock/* (Promises + delay)
            → Real: services/api/* (HTTP via http.client.ts)
```

- **Stores** (Pinia): `useAuthStore`, `useAgentStore`, `usePermissionStore`. Auth store calls `authApi` for login/logout. Permissions and agent profile are derived from auth.
- **Guards**: Route guard checks `auth.token` and `auth.isExpired`; use `useCan()` or `useCanPermission('create_invite')` for action-level checks.

---

## 6. Assumptions Made from PDFs

- **Registration**: Multi-channel copy and structure from PDF; login remains email + password; mock auth accepts any email for demo.
- **Agent authority**: Agent sees only assigned players (invite-only clan); credit is deposit-backed; no manual ad-hoc credit; reclaim only under safe conditions (no active bets).
- **Payouts**: Agent has read-only visibility; no approve/reject/retry in UI.
- **Wallet**: Deposit USDT (TRC-20), ledger history, no withdraw in current scope unless specified later.
- **Invites**: Create/resend/copy link; quota from agent profile; expiry and status per PDF.
- **Clan**: Goals and wars; agent can register for wars (entry fee deducted from wallet in mock).

---

## 7. Files Touched (Logic Only)

- **New**: `src/services/api/` (http.client, auth.service, agent.service, players.service, payouts.service, index), `src/services/mock/` (delay, state, auth.mock, agent.mock, players.mock, payouts.mock, index), `src/services/authClient.ts`, `src/stores/permission.ts`, `src/stores/agent.ts`, `src/composables/useCan.ts`, `README_FIXES.md`.
- **Updated**: `src/services/client.ts` (mock/real switch), `src/stores/auth.ts` (authApi, async login, expiry, logout), `src/router/index.ts` (expiry check), `src/pages/auth/LoginPage.vue` (await auth.login(credentials)), `.env.example` (VITE_USE_MOCK_API).

---

## 8. Windows Compatibility

- **Dev script**: `npm run dev` uses `vite --host 0.0.0.0 --port 5174 --strictPort` (no `${PORT:-5000}` or other shell-specific syntax). Runs in PowerShell.

---

## 9. QA Checklist (Manual)

- [ ] Login with email + password → redirect to dashboard; token persisted.
- [ ] Logout → session cleared; redirect to login if visiting protected route.
- [ ] Token expiry (or manual expiry in LS) → next navigation redirects to login.
- [ ] All dashboard widgets load data via `api` (mock or real).
- [ ] Create invite / resend invite (with mock or real API).
- [ ] Permission checks: `can('create_invite')` etc. can be used to hide/disable actions.
- [ ] `VITE_USE_MOCK_API=false` + `VITE_API_BASE_URL` → same UI, data from real backend (once implemented).
