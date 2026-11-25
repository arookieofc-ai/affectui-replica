# agent-state-machine — replica report

## What was built
`index.html` (52 KB, self-contained, no network, system fonts only): a clean-room
replica of the affectUI Pro **agent-state-machine** component — an agent rendered as
a state diagram with transitions, counts, and a current-state glow.

- **Header**: 3x3 pixel-mark identity + agent name + model, right side shows the
  live transition total ("N transitions") and a status badge with pulse while running.
- **Diagram**: 10 state cards on a 4x3 grid with per-state accent colours, routed SVG
  edges (straight / elbow / same-column verticals / top back-lane / self-loop),
  origin dots, a start marker, and count chips (`N×`, dashed when never taken).
- **Current-state glow**: agent-coloured ring + sheen sweep; waiting/error/final
  variants tint amber/red/green; a 4-beam light animation runs along the most
  recently taken edge.
- **Interactions**: states auto-advance on the original dwell schedule; hover/focus
  a state to trace its chain (connected edges/nodes light up, the rest dim to
  0.78/0.5 — never below the v3 legibility floor); click a state for its card
  (kind chip, Now chip, description, tool icons, Time here / Entered, leaves-to
  list); click a count chip for the transition card (Retry/Back/Transition chip,
  route, detail, Taken / Share of exits); waiting + current card offers
  **Approve** (advance) / **Reject** (restart); Esc closes; keyboard-focusable
  throughout; `prefers-reduced-motion` disables animation.
- **Page frame**: run title "Billing fix" + "1 working · 1 agent" + sun/moon theme
  toggle (top-right, `data-theme` on `<html>`, stored choice wins, otherwise follows
  `prefers-color-scheme`).

## Original data used (transcribed from demo-original.js, not copied as code)
- Agent: id `atlas`, name `Atlas`, model `Claude Opus 5.5`.
- 10 states with exact labels/colours/descriptions/tools/positions, e.g.
  `Planning #8b5cf6`, `Recalling memory #6366f1`, `Calling tool #0ea5e9`,
  `Waiting for you` (waiting) `#e8a200`, `Delegating #f97316`,
  `Reading results #14b8a6`, `Running tests #84cc16`, `Fixing error` (error)
  `#e5484d`, `Writing answer #ec4899`, `Done` (final) `#1fa855`.
- All 16 transitions with labels and the three detail strings
  ("The test runner timed out after 30s …", "The first search found the caller …",
  "test_invoice_totals: expected 104.99, got 105.00").
- The 18-step visit timeline with exact dwell times
  (2000…3800 ms, 33.8 s loop + 420 ms fade) and per-state average times
  (plan 6 s … ask 41 s); same time/count formatters (`3s`, `2m 05s`, `12.5K`).
- Pixel-mark: deterministic hash → ≥5-on 3×3 pattern with per-cell delays
  0/120/240/120/240/360/240/360/480 ms and twinkle while busy; glyph set
  (ring / clock / cross / bullseye); kind labels ("Waits for a person" etc.).

## Interactions verified (headless harness, not just syntax)
`verify.cjs` (temporary, removed after the run) stubbed `document/window/
localStorage/timers`, loaded the page script, and drove its real timers:
boot on `plan` with glow + "Running · Planning"; all 19 dwell/fade timings match;
loop resets to plan; `ask` shows "Waiting for you" + Approve/Reject;
Approve advances `ask→tool`; reset returns to zero; counts accumulate
(`plan→tool` ×1, self `tool→tool` ×1); beam overlay present on latest edge;
state/edge cards render original titles/descriptions/details; theme toggle flips
`data-theme` and persists; Esc clears selection; every pixel-mark contains
**exactly 9 cells** and no stray `<i>` exists. Result: **ALL PASS**
(38 assertions). `node --check` on the extracted script: clean.

## Token audit
All colours are CSS custom properties under `html[data-theme]`; no hard-coded
hex on elements. Light: surface `#ffffff`, page `#fafaf9`, ink `#171717`,
muted `#6e6862`, subtle `#f5f5f4`, border `#e7e5e4`, radii 16/10/6 px (pills 999),
status amber `#f59e0b`/`#fef3c7`/`#92400e`. Dark: surface `#1c1c1f`,
page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`,
border `#2e2e33`, amber `#fbbf24`/`#451a03`/`#fde68a`.

## Contrast results (WCAG, computed)
Light — ink 17.9, soft 11.1, muted 5.5 (surface) / 5.0 (subtle) / 4.9 (tag),
waiting 6.4, running 5.2, ok 5.3, failed 5.9. Dark — ink 14.5, soft 11.5,
muted 6.6 (surface) / 5.9 (box) / 5.5 (tag), waiting 12.0, running 7.7 / 6.9 (box),
ok 9.3, failed 8.5. All ≥ 4.5:1. (Light muted was raised `#78716c→#6e6862`
after the audit to clear the tag/subtle backgrounds.)

## What could not be verified / notes
- The original uses React + Popover API + WAAPI; this replica uses vanilla JS,
  an absolutely-positioned card, and CSS/SMIL-free beam paths — same look and
  behaviour, own code.
- Tool logos in the original are brand SVGs; here they are small circular icons
  with per-tool colours + initials (per v3: circular, not pills).
- Narrow screens: the diagram scales to fit and the track scrolls horizontally;
  node titles/meta are single-line ellipsis, popover clamps inside the canvas.

## How to test
Open `index.html` in a browser (double-click works, no server needed). Watch one
33.8 s loop, click states and count chips, hover to trace chains, toggle the
sun/moon button, and check both themes.
