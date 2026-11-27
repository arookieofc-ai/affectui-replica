# Progress Pill — Report

## What was built
`index.html` (self-contained, 18.8KB, no network, system fonts) replicating the
"Progress Pill" component: a slim pill showing an agent building a report —
pixel-mark, title, progress %, agent + step line with shimmer, thin progress
track with sheen, and a coloured glow underneath with a right-edge fade mask.

Clean-room implementation: own class names (`pill-*`), own CSS/JS written from
observed behaviour. No verbatim copy of the compiled demo source.

## Demo data matched verbatim
- Title `Q3 revenue report`, agent name `Analyst`, agent id `analyst`
- Steps `["Read 24 sources", "Pull the numbers", "Draft the report"]`,
  done label `Report ready`
- Step units `[4, 11, 9, 6]`, cell delays `[0,120,240,120,240,360,240,360,480]`
- Pixel-mark: deterministic hash per agent id → exactly 9 cells; for
  `analyst` the pattern is `[0,1,0,0,1,0,1,1,1]` (5 on), matching the original
  algorithm (re-implemented, same bit layout)
- Timings: `hold 2600ms`, done hold `2080ms` (`2600*0.8`), progress tick
  `250ms`, initial step index `1` then loop from `0`
- Progress formula: `done ? 1 : min(0.97, (g + min(1, b/(units[g]+2))) / 3)`
- Loop: step 0 → 1 → 2 (2600ms each) → done `Report ready` 100% (2080ms) →
  restart; `prefers-reduced-motion` renders statically

## Behaviour / visuals matched
- 68px pill card, 48px circular tile, 3×3 mark (3px cells, 1.5px gap,
  scale 1.25), 210px body, 4px track, `clip-path` fill with 600ms ease,
  label shimmer + rise-in, track/bar sheens hidden when done, busy mark
  twinkles at 1.2s with per-cell delays, glow drifts 9s alternate
- Header pattern: project name + working count + agent count
  (`1 building · 1 agent · Analyst`, `0 building…` when done)
- Controls: Pause/Play, Restart loop, step meta line; theme toggle top-right
- Default theme = original demo appearance (light white card);
  toggle switches `data-theme="light"|"dark"` on `<html>`, persisted to
  `progress-pill-theme`, falling back to `prefers-color-scheme`
- `/*noflash*/` guard first in `<head>` + `html{background}` inline style +
  `<meta name="color-scheme" content="light dark">`
- In-place updates only: DOM built once at init (9 `<i>` cells created once);
  timers update `textContent`/attributes/`--pill-fill` on cached nodes only;
  zero `innerHTML` writes anywhere; hover/focus never re-render

## v5 polish
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`
- `html{-webkit-tap-highlight-color:transparent}`
- `body{font-variant-numeric:tabular-nums}` (+ pct explicitly)
- Concentric radii (pill 999px → 50% tile; track 999px), shadows for
  elevation / borders only for structure, `[hidden]{display:none}`,
  no global SVG rules, no external assets

## How to test
Open `index.html` in a browser. Watch the 3 steps → `Report ready` → restart
loop; try Pause/Restart and the Theme toggle; narrow the window for stacking.

## Verification (node only, no browser)
- `node --check` on the extracted page script: **OK** (main + noflash guard)
- In-dir harness `verify-harness.js` (`node verify-harness.js`): **PASS**
  - advances fake timers through the full ~9880ms loop in 250ms steps
  - asserts visible text contains `Q3 revenue report`, `Analyst`, `%`, and
    each of `Read 24 sources` / `Pull the numbers` / `Draft the report` /
    `Report ready`, plus a `100%` done state
  - asserts exactly 9 mark cells, pattern `0,1,0,0,1,0,1,1,1`, delays
    `0,120,240,120,240,360,240,360,480`
  - asserts core nodes + all 9 cells keep object identity across the full
    loop with **zero `innerHTML` writes after init**
  - asserts light + dark tokens, `data-theme` CSS, theme-key storage, theme
    toggle click switches `light → dark`, hover media, tap-highlight,
    `tabular-nums`, `[hidden]`, `/*noflash*/`, `color-scheme`, no `http` URLs
- Light AND dark checked: toggle handler verified in stub; dark token block
  (`html[data-theme="dark"]`, glow opacity, card/fill/mark colours) present.
  Visually confirm in a real browser (could not screenshot here).

## Not verified in a real browser
Pixel-perfect blur/glow, Inter-vs-system font metrics, and actual paint
timing — structure, data, timings, and state transitions are asserted in the
harness instead.
