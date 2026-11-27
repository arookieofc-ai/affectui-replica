# REPORT — Empty Calendar (slug empty-calendar)

## What was built
Single self-contained `index.html` (~16KB, inline CSS+JS, system fonts only) replicating the
affectUI "Empty Calendar" empty-state: a stack of calendar cards fanning out on hover.

- Scene: SVG `viewBox 0 0 320 240`, `aspect-ratio 3/2`, group `translate(30 47) scale(0.814)`
  with two fanned back cards + one front card over a breathing pastel glow ellipse
  (pink/orange/lavender/blue at 0.25 opacity, blur 14) and a pastel gradient edge stroke.
- Demo data verbatim from `demo-original.js`: card title `Calendar`, badge `EMPTY`
  (`#FAB082` on `#FEF8EF`), three placeholder bars (208/208/168 × 7px), disabled button
  row with video-off icon (circle + slash line) and label `Join meeting` (`#9A9AA3`
  on `#F4F4F6`), wrapper `role="img"` with aria-label
  `Stacked calendar cards marked empty, with a disabled join meeting button`.
- Behaviours: bars shimmer 2.4s, glow breathes 5s, front lifts `translate(0,-8px) rotate(2deg)`
  on hover, backs fan `-22px/-3deg` / `+22px/+3deg` at rest and `-48px/-7deg` / `+48px/+7deg`
  on hover (also fans when the whole frame is hovered, so touch/mouse both work).
- Page chrome (minimal, calendar-adapted): `Calendar` header + `0 upcoming` pill + `EMPTY`
  pill + sun/moon theme toggle (top-right); stage head `Your day at a glance` + `0 / 0 events`;
  `Fan out` range slider driving spread in place; status live-region
  (`Nothing scheduled — enjoy the empty day.`); clicking/Enter/Space on the disabled
  Join row updates the status in place (`Join meeting is disabled — no event to join…`,
  counting retries). Backs/front are `tabindex=0` with `focus-visible` outline; `Esc` not
  needed (no modal). Narrow screens stack via fluid width + 520px breakpoint.
- Clean-room: all HTML/CSS/JS rewritten by hand from the description; no copied bundle
  source. No `innerHTML` anywhere after init (init builds via `createElement` /
  `createElementNS` + `textContent`/`setAttribute` only).

## What matches the original
Layout, card geometry (240×140 rx10, button 208×40 rx8), colours, badge/button styling,
shimmer/breathe timings, hover fan distances/rotations, dark-mode fills
(`#232326` card, `#2a2a2d` bars/button, adjusted amber badge), reduced-motion guard.

## What could not be verified
No browser available in this environment (never installed/launched per task rules), so
pixel rendering, real `:hover` fan motion, and paint timing were verified statically
(CSS text) + via the DOM-stub harness, not visually. Inter font falls back to system
sans (no external deps allowed).

## In-place updates (v4)
DOM built once in `init()`. `tick()` (900ms interval, skipped under
`prefers-reduced-motion: reduce`) advances `phase` and only rewrites `fill-opacity`
on bars whose value changed. `applyFan()` only rewrites `transform` on the two back
groups. `setStatus()`/`paintToggle()` only rewrite `textContent`/attributes when the
value differs. Loop restarts wrap `phase` modulo bar count without rebuilding.

## v5 polish
All `:hover` rules inside `@media (hover: hover) and (pointer: fine)`;
`html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`;
concentric radii (card 10 / button 8 + padding); shadows for elevation + 1px borders for
structure; button icon side given ~2px less padding (optical nudge).

## How to test
1. `open index.html` in a browser (or serve this directory).
2. Hover the stack — front lifts, backs fan wider. Move the `Fan out` slider.
3. `Tab` to cards/Join, press `Enter` — status explains the button is disabled.
4. Toggle sun/moon (top-right) — page switches `data-theme="light"|"dark"` and persists
   to `localStorage` key `empty-calendar-theme`; reload keeps the choice; default follows
   `prefers-color-scheme` with no white flash (noflash guard + `color-scheme` meta).
5. Node-only verification (no browser):
   - `node --check harness.js && node --check .main-extract.js` (extracted main script)
   - `node harness.js` — asserts VISIBLE painted text (`Calendar`, `EMPTY`,
     `Join meeting`), full-loop node identity (9 ticks), zero `innerHTML` writes after
     init (incl. ticks, fan, join click, theme switches), and light AND dark themes
     (`data-theme`, `aria-pressed`, icon swap, storage persist).
   - Result at write time: `HARNESS PASS: all assertions ok`, both `node --check`s clean.
   - Checked light AND dark: yes — harness drives `setTheme('dark')`/`setTheme('light')`
     and the CSS contains both token sets (`#fafaf9`/`#ffffff` light,
     `#101012`/`#1c1c1f` dark); page was authored against both (dark fills/borders
     adjusted, no grey-on-grey).

## Files
- `index.html` — the replica (only deliverable + this report).
- `harness.js` — in-dir DOM-stub verifier (regenerates `.main-extract.js` on run).
- `REPLICATE_SPEC.md`, `demo-original.js` — inputs (untouched).
