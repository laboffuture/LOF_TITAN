# LOF TITAN — Kit Entitlement & Auth Design

**Date:** 2026-08-28
**Status:** Approved, implementing testing-phase (mock) version

## Goal

The LOF TITAN site is publicly browsable and open source. Kit *content* is paid:
a customer who buys the Invisible Line Patrol kit can open that kit's lessons and
code, while every other kit remains visible but locked. Payment happens in a
separate CRM, integrated later.

This phase builds the **UX and the seam** using dummy logins. No backend.

## Non-goal (important)

This phase does **not** provide real access control. Kit content currently lives in
`webapp/src/projects.js`, which is compiled into the public JS bundle and published
to a public GitHub repository. Frontend gating hides content; it does not withhold it.

Before charging money, kit content must move out of the bundle and behind an API that
checks entitlement server-side. The seam below is designed so that migration replaces
one module rather than the whole feature.

## Routes

| URL | Public | Requires login | Requires that kit |
|---|---|---|---|
| `/` | full grid, locked kits badged | — | — |
| `/login` | yes | — | — |
| `/kit/:id` | hero, tagline, description, safety, components | — | assembly, code, FAQ, challenges, upload |
| `/code` | — | yes | any kit |
| `/ai` | — | yes | any kit |
| `/monitor` | — | yes | any kit |
| `/flash` | — | yes | any kit |

**Tool gating = model B:** owning *any* kit unlocks all four tools. Tools are not
gated per-kit.

## Entitlement model

```js
User { id, email, name, entitlements: ['invisible-line', ...] }
```

Entitlements are a flat array of kit IDs. Deliberately CRM-agnostic: when the CRM
lands it returns the same array shape and nothing downstream changes.

## Kit registry

`src/auth/kits.js` is the single authoritative list of kits that can be owned.

This resolves an existing inconsistency: the carousel advertises five kits
(`axes3`, `aquanova`, `invisible-line`, `heat-seek-rover`, `heartbeat`) but
`projects.js` defines only three. `App.jsx` previously fell back with
`projects.find(...) || projects[index] || projects[0]`, so clicking "Axes 3"
silently opened Invisible Line Patrol. Kits without content are now marked
`status: 'coming-soon'` and are not purchasable or openable.

## The seam

All gating flows through two hooks:

```
useAuth()          -> { user, entitlements, loading, signIn, signOut }
useEntitlement(id) -> boolean
```

Guards and UI call only these. Today they read a mock table in `mockUsers.js`;
later they read the CRM API. `AuthProvider` is the only module that knows where
users come from.

- `RequireAuth` — redirects to `/login`, preserving the attempted URL.
- `RequireKit` — renders a locked state with a purchase CTA rather than redirecting.
  A hard redirect would hurt conversion; the customer should see what they're missing.

## Dummy accounts (testing phase)

| Email | Entitlements | Case under test |
|---|---|---|
| *(signed out)* | — | public browsing, locked badges, login redirect |
| `none@test` | `[]` | signed in, owns nothing |
| `single@test` | `['invisible-line']` | core case: one unlocked, rest locked |
| `multi@test` | `['invisible-line','heartbeat']` | partial ownership |
| `all@test` | all available kits | full access |

Session persists in `localStorage` under `titan_auth_session`. No password check —
this is a fixture, not authentication.

## Hosting

GitHub Pages serves static files and knows nothing about client-side routes, so a
deep link like `/LOF_TITAN/code` would 404. Two mitigations:

1. `public/404.html` captures the path, stashes it in `sessionStorage`, and bounces
   to `index.html`, which restores it.
2. `vite.config.js` `base` changes from `'./'` to `'/LOF_TITAN/'`.

The `base` change is required, not cosmetic. With relative `base` and nested routes,
`./firmware/x.bin` resolves against the *current* URL — correct from `/LOF_TITAN/`
but wrong from `/LOF_TITAN/kit/invisible-line`. Absolute base makes
`import.meta.env.BASE_URL` a stable `/LOF_TITAN/`, which also fixes the pre-existing
firmware-flasher 404 on the deployed site.

## Connection preservation

`useDevice()` owns the live BLE/serial connection. If a route change remounted its
owner, an active connection would drop mid-upload. `useDevice()` therefore moves into
a `DeviceProvider` mounted *above* the router outlet, so navigation never disturbs it.
This must be verified, not assumed.

## Testing

The webapp has no test runner. Verification for this phase:

- `npm run build` clean
- walk all seven routes in dev
- browser back/forward
- deep-link reload on each guarded route
- signed-out / `none` / `single` / `multi` / `all` against every route
- connection survives navigation

Automated tests would require adding a runner — deliberately out of scope here.
