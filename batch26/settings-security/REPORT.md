# Settings / Security — Replica Report (slug settings-security)

## What was built
Single self-contained `./index.html` (31KB, inline CSS/JS, no external deps, system fonts only):
- Topbar: Acme Corp + `Settings / Security` crumb + `SSO active` pill + live `Synced Ns ago` + sun/moon theme toggle.
- Sidebar: General / Members / Security (active) / Billing / Audit log / API keys. Clicking re-marks active in place; non-Security shows a toast (outside replica scope).
- Cards:
  1. **Verified domains** — acme.com (Verified), acme.dev (Verified), acme-internal.com (Pending). Add-domain input, Verify/Manage per row, live `N verified` count. Pending auto-verifies on tick 25 in place.
  2. **Sign-in rules** — Password / Magic link / Require-SSO switches, Session length + Idle timeout selects.
  3. **Single sign-on** — Okta (SAML 2.0, connected), Microsoft Entra ID (OIDC, off → Configure), Google Workspace (SAML 2.0, connected). Test/Configure mutates badge + detail in place, header pill `SSO active/off` updates.
  4. **Two-step verification** — segmented Off/Optional/Admins/Everyone + grace period + enrolled `312 / 348` + contextual note.
  5. **Identity provider & SCIM** — Okta SCIM 2.0, Directory sync switch, `Last synced Ns ago` ticking every second, `Sync now` resets to 0, users/groups counts.
  6. **IP allowlist** — enforcement switch, 3 CIDR rows (HQ/VPN/CI), add (CIDR validation) + remove, `N ranges enforced`.
  7. **Recent security activity** — 4-row live feed rotating every 5s by mutating the same `<li>` nodes; `MM:SS` session clock.
- Toast system for all actions.

## Demo data (verbatim rule)
`./demo-original.js` in this directory is an empty-state stub (`DemoStage empty:true`, no names/models/tools/rows). Used verbatim: page boots from an empty stage and paints Security settings (no invented original rows to copy). All workspace rows above are plausible Security-shape data created clean-room for interactivity (domains, SSO providers, SCIM, CIDRs, activity) — no compiled source copied.

## What matches the original intent
Layout (sticky topbar + settings sidebar + 2-col cards → stacked on narrow), card style (1px border + soft shadow, 16px radius, 12–16px padding), tokens, pills (999px), meta 12–13px muted, tabular numbers, focus-visible outlines, transitions 150–200ms.

## What could not be verified
No live affectUI Security screenshot/API in this directory; SSO provider logos, exact copy, DNS flow, SCIM URLs and audit events are plausible, not pixel-compared. No `.tsx` source fetched.

## Clean-room / in-place rules
Written from scratch. DOM built once at init; `tick()` only mutates `textContent/class/attributes/styles` on existing nodes. No `innerHTML` writes in app JS at all. Timers: 1s sync/clock tick, 5s activity rotation, pending→verified at tick 25, sync wraps at 120s.

## v5 polish
- All `:hover` inside `@media (hover:hover) and (pointer:fine)` (9 rules, 1 gated block, verified `HOVER_GATED_OK`).
- `html{-webkit-tap-highlight-color:transparent}`.
- `body{font-variant-numeric:tabular-nums}` + `.tick` for timers/counts.
- Concentric radius respected; shadows for elevation, borders for structure/dividers/inputs; avatar/logo inset outline via `--img-outline`; `+ Add` icon side has tighter leading padding.

## Dark mode
`data-theme="light"|"dark"` on `<html>`, noflash guard first in `<head>` + `color-scheme` meta + `html{background}` paint guard, default from stored key or `prefers-color-scheme`, toggle overrides. Tokens for dark per spec (surface #1c1c1f, page #101012, ink #ededed, amber #fbbf24/#451a03/#fde68a). Checked finished in both.

## How to test (node only, no browser)
Relative paths, in this directory:
- `node --check ./harness.cjs`
- `node ./harness.cjs` — asserts VISIBLE painted text, full-loop (20-tick) node identity, pending→verified in place, zero innerHTML writes after init, light AND dark themes, switch toggle.
- Inline JS syntax: extracted to `./inline-check.js` and `node --check ./inline-check.js` (both passed at ship time).
- Open `./index.html` in a browser for visual light/dark check.

## Verification at ship
- `HARNESS_SYNTAX_OK`, `INLINE_SYNTAX_OK`, `ALL HARNESS CHECKS PASSED`, `HOVER_GATED_OK`, 31432 bytes (<200KB).
- Light AND dark confirmed via `setTheme('dark'/'light')` + label/icon update in harness.
