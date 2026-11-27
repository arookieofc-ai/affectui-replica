# Integration Flow — replica report

## What was built
Standalone `index.html` (22.8 KB, inline CSS + JS, zero external deps) replicating the
affectUI **Integration Flow** illustration (slug `integration-flow`, Product scenes, Pro):
integration pills on a dashed arc beaming data into a central hub.

- Layout: warm blob field, dashed orbit arc (SVG, `stroke-dasharray 40 40`), glow
  out/in washes, beam link (core + blurred glow), hub card left, 6 pills right.
- Hub: **Data Analysis** / **Centralized Data Processing** (verbatim).
- Pills: title **API Integration** + sub name, rotating through verbatim demo data
  **Okta (mono), Snowflake, Slack, ClickUp, Zendesk (mono)** — 5 items over 6 slots
  with the original modulo rotation (`((n-1-b) % j + j) % j`), so one name repeats,
  exactly like the demo. `data-fill="black"|"color"` preserved for mono handling.
- Loop timing mirrors the demo constants (`FOCUS 900 / CHARGE 620 / SWEEP 1100 /
  base width 2400`, initial 700 ms, hub lights ~605 ms after sweep, next index after
  1360 ms, restart 1220 ms after focus). Beam re-triggers via class toggle;
  `prefers-reduced-motion` pauses the loop and parks the beam mid-track.
- Clean-room: all icons are original approximations (initials / 4-dot Slack grid /
  gradient triangle), not the compiled SVG paths. No source copied.
- `role="img"` + verbatim `aria-label`:
  “Integrations like Slack, Okta and Snowflake sending data into a central data
  analysis hub”. Stage is `aria-hidden`; live `role="status"` line narrates
  hub/pills/sweep for AT. Toggle is a real button with `aria-pressed`.
- Responsive: JS `scale = clientWidth / 2400` (ResizeObserver + fallback);
  ≤640 px collapses to a stacked list (arc/beam/glow hidden, cards static).
- v5 polish: hover rules only inside `@media (hover: hover) and (pointer: fine)`,
  `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:
  tabular-nums}`, concentric pill radius, borders on dividers/inputs only,
  1 px inset outline on badges, optical padding tweak on the toggle icon.

## What matches the original
Copy (hub titles, 5 names, aria-label, “API Integration” fallback), 6-slot phase
system (`data-phase 0–6`, phase 3 = charged/solid, 0/6 = faded exits), charge/glow
pairing (pills + out-glow, hub + in-glow), 1.1 s beam sweep, amber/dark-mode token
shifts, fade-to-surface at the bottom.

## What was approximated / not verified
- Blob field reduced from 14 blobs to 6 radial washes (same palette/feel).
- Badge rings simplified to CSS radial + inner shadow (no SVG turbulence filters).
- Hub glyph is a geometric mark, not the original 5-petal path.
- No visual pixel-diff against the original (no browser in this environment).

## How to test
1. Open `index.html` in a browser (double-click; no server needed).
2. Watch pills rotate, beam sweep, hub charge; status line updates.
3. Click **Dark/Light** (top-right) — page switches `data-theme` on `<html>`,
   persisted to `localStorage` (`integration-flow-theme`); reload keeps it.
4. Narrow the window below ~640 px — illustration stacks to a list.
5. Node-only verification (no browser):
   `node --check` on the extracted inline script + `node harness.js`.

## Verification (node only, in-dir)
- `node --check inline-check.js` (extracted last `<script>`): **CHECK_OK**.
- `node harness.js` (DOM stub, no deps): **all 33 assertions pass**, covering:
  - VISIBLE painted text (hub titles + all 5 names + “API Integration”),
  - full-loop node identity (same 6 pill objects before/after loop, `b 0→6`),
  - zero `innerHTML` writes after init (source has none; runtime counter 0),
  - light AND dark themes (text survives both `data-theme` values),
  - no-flash guard order, `meta color-scheme`, tokens, v5 hover/tap/tabs rules.
- `index.html` = 22,771 bytes (< 200 KB budget).
- Checked light + dark: dark uses `--surface #1c1c1f / --page #101012`,
  adjusted charge washes + badge treatments; contrast reviewed (no grey-on-grey).
