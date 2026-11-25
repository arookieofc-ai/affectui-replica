# flow-builder — clean-room replica report

## What was built
Single self-contained `index.html` (47KB, no network, system fonts) replicating the
affectUI Pro **flow-builder**: a visual agent-workflow builder with nodes + connections.
Open `index.html` in a browser. A theme toggle (top-right) switches
`<html data-theme="light|dark">`; default follows `prefers-color-scheme`.

Layout matches the original: header (`Onboard new signups` + live `N steps` count +
`Run test`/`Stop` button), vertical flow of node cards joined by connectors with `+`
insert buttons, an `If / else` fork with two side-by-side lanes
(`Enterprise` / `Self-serve`), and a footer status line (`Running …` /
`Passed — 6 steps ran` / `Removed X + Undo` / keyboard hints).
Narrow screens stack lanes vertically.
Canvas viewport is 680px tall (CSS cap 760px): `Company size` and both branch
lanes are visible in the initial view without scrolling inside the canvas.
(The original's `height` prop defaults to 420 in demo-original.js with the same
side-by-side lane layout; the replica keeps that layout but uses a taller
viewport per visual QA so the fork is not cut off.)

## Original data used (extracted from demo-original.js, re-encoded — not copied)
- Workflow `Onboard new signups`: `signup` trigger (`form`, `New signup`,
  `Signup form`, `Someone signs up on the website`); `research` agent
  (`Research the company`, `Claude · web search`, `Reads their site, finds size
  and industry`); `size` branch (`Company size`, `employees > 200`) with
  `Enterprise` lane (`ping` slack `Tell sales` / `Slack · #new-accounts`;
  `deal` database `Create deal` / `CRM · Inbound pipeline`) and `Self-serve`
  lane (`welcome` mail `Send welcome email` / `Gmail · from Flo`;
  `wait` `Wait` / `2 days`; `tips` mail `Send tips email` / `Gmail · 3 quick wins`).
- Add-step templates + triggers with exact titles/details/notes (`Ask an agent`,
  `Send email`, `Post message`, `Update record`, `HTTP request`, `If / else`
  (`Yes`/`No`), `Wait` (`1 hour`); `Webhook`, `Schedule` (`Every day at 9:00`),
  `Form submitted`).
- Timings: agent 1700ms, wait 1000ms, others 650ms; first step at +300ms,
  +120ms gaps; auto-run at +1200ms; active path = second lane (`Self-serve`,
  index `min(1, len-1)`), other lane marked skipped; reduced-motion renders
  everything `done` immediately with Enterprise skipped.
- Behaviours: click-to-select + trash remove (blocked for the root trigger while
  other steps exist) with 6s `Removed X` toast + Undo (20-deep stack),
  Alt+↑↓ reorder (branch nodes and index 0 locked), Delete/Backspace remove,
  arrows/Home/End navigate, Ctrl/Cmd+Z undo, Esc closes menu/deselects,
  `+` insert menu with templates, drag-to-pan canvas, auto-scroll to the running
  node, live elapsed timer (`1.2s` / `1m 05s` format) + 3px meter bar.

## Interactions
Run/Stop, select/deselect, remove/undo, insert via `+` menu (mouse via
pointerdown-capture so the click survives the rebuild; keyboard via Enter/Space),
reorder, pan, theme toggle, full auto-played run animation on load.
`render()` preserves the canvas `scrollTop`/`scrollLeft` across the innerHTML
rebuild (which otherwise resets scroll to 0) and, when a step is selected while
idle, keeps it in view via the existing `scrollToId` (scroll-if-needed) plus a
`scrollIntoView({block:"nearest"})` fallback — clicking `Send tips email` below
the fold no longer snaps back to the top.

## Pixel-mark
Agent identity is a deterministic 3×3 pixel-mark per agent id (own hash, ≥5 of 9
cells on, per-cell twinkle delays 0–480ms); running agents get the `busy` pulse.
Rendered markup verified: **every mark has exactly 9 `<i>` cells** (headless
assertion). Tools are small circular SVG icons, not pills.

## Token audit
All colours are CSS custom properties. Light: page `#fafaf9`, surface `#ffffff`,
ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`,
radii 16/10/6px, shadow soft 2-layer; working blue `#0284c7`/`#e0f2fe`/`#0c4a6e`,
waiting `#f59e0b`/`#fef3c7`/`#92400e`, idle grey, failed red; pills 999px;
150–200ms transitions; selected ring + hover lift; focus-visible outline.
Dark: page `#101012`, surface `#1c1c1f`, ink `#ededed`, muted `#a1a1aa`,
subtle `#26262a`, border `#2e2e33`; waiting `#fbbf24` on `#451a03`, text `#fde68a`.
Dimmed/skipped opacity is 0.78 (≥0.75, still legible). Card details/notes stay
single-line ellipsis; card **titles wrap** (`white-space:normal`, no ellipsis)
so `Research the company` renders in full (the original's CSS also declares
`white-space:nowrap` titles, but visual QA requires the full title — the
replica face uses `min-height` so a two-line title grows the card instead of
clipping). Lane labels sit above lanes with reserved space. Checked in both
themes (token-level + headless run); dark keeps the same structure, not just
inverted text.

## Contrast (computed, AA ≥ 4.5 for text)
Light — ink 17.9, muted 4.8, work tag 8.2, ok 6.5, wait 6.4, fail 6.8 (all pass).
Dark — ink 14.5, muted 6.6, work 12.8, ok 14.0, wait 12.0, fail 11.8 (all pass).
`--link` (4.1 light / 7.3 dark) is used only for thin connectors/meters, never
for text.

## Verification
- `node --check` on the extracted page script: OK.
- Real headless run: `node harness.cjs` (DOM-stub in this directory) loads the
  page script in `vm`, advances fake timers through auto-run → Running → Passed
  (`6 steps ran`, skipped Enterprise lane), asserting exact demo data, timings,
  sequence, 9-cell marks, bounded re-renders (13 writes for the whole run —
  the 100ms tick only touches elapsed text nodes, never rebuilds), and the
  pointerdown-capture menu opener. All checks pass.
- Visual-QA regression checks (same harness): canvas viewport height ≥600px
  (680px, old 520px cap removed) with `Company size` + both lane labels in the
  initial markup; render saves/restores canvas scroll and selection calls
  `scrollToId(state.selected)` + `scrollIntoView({block:"nearest"})` (plus a
  scroll save/restore round-trip assertion); `.fb-title` uses
  `white-space:normal` with no ellipsis and `Research the company` renders in
  full. Run/Stop, 8 steps, progress footer still asserted — no regressions.

## What was not verified
Pixel-perfect match against the proprietary rendered demo (no browser screenshot
run in this sandbox); the demo's decorative animated gradient floor was
approximated with the meter/shimmer language instead of a full canvas effect;
token-count context bars (a Crew-component pattern) do not exist in this
flow-builder demo, which uses elapsed-time meters — kept as in the original.
