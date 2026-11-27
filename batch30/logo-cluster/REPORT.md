# Logo Cluster — TARGETED FIX: GitHub disc settled geometry

## Defect (real-browser QA)
GitHub disc stayed ~15–25px in both themes, tucked at the Linear disc's edge and
mostly hidden behind it (only a small "G" visible), while the other discs are
~90–110px. Replay DOES replay the entrance (orbit advances, 7/7 settle), so the
animation runs; the GitHub disc's size/position in the settled state is wrong.

## Original check (`./demo-original.js`)
Checked before changing anything. The demo chunk's bubble table is:

`a=[["Notion",-29,-97,56],["Spotify",82,-67,48],["Stripe",96,-14,72],`
`["Google Calendar",53,86,60],["Linear",-63,70,42],["GitHub",-88,64,20],["Figma",-93,-1,72]]`

with `style={"--x":t,"--y":n,"--s":a}` and
`width: calc(calc(1 * var(--ui-lc-u)) * var(--s))`.
So the chunk DOES encode GitHub as `s=20` at `(-88,64)`, i.e. the small/tucked
geometry is present in the chunk data itself:
at 420px stage (`u=420/320=1.3125`) GitHub d=20*1.3125=26.3px vs
Stripe/Figma 72*1.3125=94.5px, and GitHub–Linear center dist=25.7u vs
radii sum (20+42)/2=31u → edge gap -5.3u (overlap).
The replica had copied this entry verbatim (`["GitHub",-88,64,20]`), so it
faithfully reproduced the chunk's outlier.

Why fix anyway: the task states per the original all discs settle at comparable
size, fully visible. The chunk's `20` + `(-88,64)` 12° away from Linear
`(-63,70)` (Linear angle ~132°, GitHub ~144°, dist only 25.7u) is a data
outlier/bug — it produces the exact QA defect (tiny disc hidden behind Linear).
The 6 other entries already span 42–72 and are clear (except marginal
Spotify–Stripe 54.8u vs 60u sum, out of scope). Fixing only GitHub to the normal
band restores the intended comparable/visible cluster while keeping names,
colours, and the other 6 geometries verbatim.

## Fix (`./index.html`, one line)
- `["GitHub",-88,64,20]` → `["GitHub",-120,66,60]`
- Size 20 → 60 (matches Google Calendar 60, median 60; d=78.8px @420px, in the
  55–95px normal band, vs 26.3px before).
- Position (-88,64) → (-120,66): pushes the disc 32u left (same bottom-left
  slot, y +2) so it clears Linear with a 6.1u edge gap (was -5.3u overlap) and
  clears Figma with 6.2u. Square bounds hold (|x|+s/2=150, |y|+s/2=96 ≤158);
  centre-disc clearance holds (r=136.9u > 66+30+8).
- Nothing else changed: `/*noflash*/` guard, in-place updates only, zero
  `innerHTML` writes after init, colours/names/legend/order/delays/48s orbit
  untouched. Other 6 ITEMS entries byte-identical to `./demo-original.js`.

## Exact state transition that was stalling and why
Strictly, nothing stalled — entrance runs to 7/7 and orbit advances in both
files (see harness: `0/7 orbit 0°` → `7/7 orbit 19°` → replay `7/7 orbit 37°`).
The failing transition is the settled end-state of the per-disc bounce-out:

`cbub: cout 0% {opacity:0, translate:0 0, scale:.3} → 100% {opacity:1, translate:var(--px)*u var(--py)*u, scale:1}` gated on parent `cluster[data-on]`

For GitHub this transition *completed* but landed in the wrong painted geometry
because its per-disc variables encoded the wrong radius/size:
`--px=-88 --py=64 --sz=20` → settled translate (-88u,-64u flipped y) with
d=20u and -5.3u overlap behind Linear (z-order/DOM-adjacent, visually tucked).
A byte-only fix that rewrites the variables without changing the painted
`calc(1*var(--u)*var(--sz))` diameter and `calc(1*var(--u)*var(--px/py))`
translate leaves the computed geometry unchanged — which is why the previous
fix "changed bytes but not the painted result". This fix changes the settled
keyframe inputs themselves (`--sz=60`, `--px=-120`, `--py=66`), so the computed
painted state moves from 26.3px/overlapped to 78.8px/clear in both themes.

## Harness (`./harness-github.js`, also synced to `./harness.js`)
Timeline-driven (fake clock, no manual state-setting except through the page's
own handlers `show`-on-load / `replay()` / `setTheme()`):
load → `data-on` present → step rAF 0→2500ms → assert status `7/7` + orbit>0 →
compute painted diameters (`sz*420/320`) + edge gaps → `replay()` → re-settle
7/7 with same node objects → `setTheme("dark")` re-settle 7/7 → back to light.
Asserts in light AND dark; asserts `innerWrites===0` and node identity.
Fails on small/overlapped GitHub, passes on comparable/clear GitHub.

### BEFORE (`./original-backup.html`) — MUST FAIL (exit 1)
```
PASS: noflash guard present
PASS: meta color-scheme present
PASS: visible title text present
PASS: dark theme CSS present
PASS: inline script executed, __cluster exposed
PASS: zero innerHTML writes at init
PASS: entrance starts: cluster has data-on after load
INFO: phase=entrance-start status="0 / 7 logos landed · orbit 0°"
INFO: phase=settled status="7 / 7 logos landed · orbit 19°"
PASS: settled: status shows 7/7 "7 / 7 logos landed · orbit 19°"
PASS: orbit advancing at settled (orbit 19deg)
PASS: 7 disc items present
INFO: computed painted diameters @420px container (px = sz*420/320):
INFO:   Notion: units(x=-29,y=-97,s=56) => d=73.5px
INFO:   Spotify: units(x=82,y=-67,s=48) => d=63.0px
INFO:   Stripe: units(x=96,y=-14,s=72) => d=94.5px
INFO:   Google Calendar: units(x=53,y=86,s=60) => d=78.8px
INFO:   Linear: units(x=-63,y=70,s=42) => d=55.1px
INFO:   GitHub: units(x=-88,y=64,s=20) => d=26.3px
INFO:   Figma: units(x=-93,y=-1,s=72) => d=94.5px
FAIL: GitHub settled size outlier: s=20 => 26.3px (defect: 15-25px while others 90-110px); median=56
FAIL: GitHub painted diameter too small: 26.3px (expect ~55px+, others up to ~95px)
INFO: GitHub-Linear center dist=25.7u gap(edge-to-edge)=-5.3u
FAIL: GitHub tucked at Linear edge: edge gap -5.3u < 4u (overlaps/hidden behind Linear)
INFO: GitHub min edge gap vs all discs: -5.3u (vs Linear)
FAIL: GitHub overlaps Linear (gap -5.3u)
PASS: replay preserves 7/7 node identity (in-place updates)
PASS: replay re-settles to 7/7 "7 / 7 logos landed · orbit 37°"
PASS: zero innerHTML writes after full loop
PASS: dark theme applied
PASS: dark settled painted: "7 / 7 logos landed · orbit 43°"
FAIL: dark GitHub still small s=20
PASS: light theme applied
PASS: light settled painted: "7 / 7 logos landed · orbit 46°"
HARNESS RESULT: FAIL (5 failures) target=./original-backup.html
```

### AFTER (`./index.html`) — MUST PASS (exit 0)
```
PASS: noflash guard present
PASS: meta color-scheme present
PASS: visible title text present
PASS: dark theme CSS present
PASS: inline script executed, __cluster exposed
PASS: zero innerHTML writes at init
PASS: entrance starts: cluster has data-on after load
INFO: phase=entrance-start status="0 / 7 logos landed · orbit 0°"
INFO: phase=settled status="7 / 7 logos landed · orbit 19°"
PASS: settled: status shows 7/7 "7 / 7 logos landed · orbit 19°"
PASS: orbit advancing at settled (orbit 19deg)
PASS: 7 disc items present
INFO: computed painted diameters @420px container (px = sz*420/320):
INFO:   Notion: units(x=-29,y=-97,s=56) => d=73.5px
INFO:   Spotify: units(x=82,y=-67,s=48) => d=63.0px
INFO:   Stripe: units(x=96,y=-14,s=72) => d=94.5px
INFO:   Google Calendar: units(x=53,y=86,s=60) => d=78.8px
INFO:   Linear: units(x=-63,y=70,s=42) => d=55.1px
INFO:   GitHub: units(x=-120,y=66,s=60) => d=78.8px
INFO:   Figma: units(x=-93,y=-1,s=72) => d=94.5px
PASS: GitHub settled size comparable: s=60 => 78.8px (median=60)
PASS: GitHub painted diameter visible: 78.8px
INFO: GitHub-Linear center dist=57.1u gap(edge-to-edge)=6.1u
PASS: GitHub fully visible vs Linear: edge gap 6.1u >= 4u
INFO: GitHub min edge gap vs all discs: 6.1u (vs Linear)
PASS: GitHub clear of all discs (min gap 6.1u vs Linear)
PASS: replay preserves 7/7 node identity (in-place updates)
PASS: replay re-settles to 7/7 "7 / 7 logos landed · orbit 37°"
PASS: zero innerHTML writes after full loop
PASS: dark theme applied
PASS: dark settled painted: "7 / 7 logos landed · orbit 43°"
PASS: dark GitHub geometry holds (s=60)
PASS: light theme applied
PASS: light settled painted: "7 / 7 logos landed · orbit 46°"
HARNESS RESULT: PASS target=./index.html
ALL HARNESS CHECKS PASSED
```

## Proof hashes (must differ)
- BEFORE: `43d062cd12f7d035408737a2c285a158  ./index.html`
- AFTER:  `65fdad471f790bcc8e130bc28a5802ec  ./index.html`
- `./original-backup.html` retains BEFORE bytes: `43d062cd12f7d035408737a2c285a158`.

## Invariants kept
- `/*noflash*/` guard + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `color-scheme` meta untouched.
- In-place updates only: DOM built once in `build()`; `tick()` touches only existing `statusEl.textContent`; `replay()` reuses same 7 bubble nodes (harness asserts identity).
- Zero `innerHTML` writes after init (harness counts setter; 0 in both themes/loops).
- Colours/names/order/delays/orbit/legend text unchanged; hover still gated in `@media (hover:hover) and (pointer:fine)`; `tabular-nums`, tap-highlight kept.
- No installs or downloads (node stdlib only).

## How to test
1. `md5sum ./index.html` → AFTER hash above; `md5sum ./original-backup.html` → BEFORE hash.
2. `node ./harness-github.js ./original-backup.html` → FAIL (5 failures, exit 1).
3. `node ./harness-github.js ./index.html` → PASS (exit 0). Same via `node ./harness.js <file>`.
4. Open `./index.html` in a browser, light + dark: all 7 discs comparable (GitHub ~79px, no tuck behind Linear), Replay re-runs entrance to 7/7, orbit advances, hover lifts.
