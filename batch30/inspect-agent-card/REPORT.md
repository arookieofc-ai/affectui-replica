# Inspect Agent Card — targeted ghost + W-Fill overlap fix

## Proof hashes (must differ)
- BEFORE: `215a4eb8d53fd98731a594be26cb171c` (`./index.html` before editing, copied to `./original-backup.html`)
- AFTER:  `a2bf8ac0e6fcb3ed1a633aa98b20942e` (`./index.html` after fix)
- Command: `md5sum ./index.html` before and after. They differ (CSS gap + 3 JS lines changed, no rebuild).

## What was wrong (real-browser QA)
- Scene painted as semi-transparent GHOST in light+dark: overlay children (`box/tag/handles/badges/cursor/guide/size`) start at `opacity:0` behind `[data-shown]` gate, never reached `opacity:1`.
- In dark, blue `W Fill 236px` tag overlapped Coder task line (`Build the page and wire up checkout`).
- Two previous fixes changed bytes but not painted result.

## demo-original.js check (required)
- Read `./demo-original.js` (React `_` hook + CSS string `b`).
- Original timing: `c(a)` (row change, no immediate show) → show after `30ms` → hide after `590+hold (2190ms)` → next after `590+hold+M+H (2490ms)`. Visible ~2160ms, hidden ~330ms. `shown` starts false, `u(!0)` only after delay.
- Original remeasure: `ResizeObserver` only re-measures (`o({x...})`), never touches `shown`. No `paint(cur,false)` on RO/resize.
- Replica bug: `loop(){paint(cur,true);...}` shows immediately while updating geometry (jump-while-visible, vs original delayed show), and `RO/resize → paint(cur,false)` removes `data-shown` mid-transition.
- Original CSS: `.ui-iac__select>*,.ui-iac__frame>*{opacity:0}` gated on `[data-shown]`, frame override `opacity:1`, per-element `--d` delays 0/90/160/200/250/300ms + 220/260ms durations → needs ~520-560ms continuous present to reach full. Original provides 2160ms. Replica would too, except RO/resize hides mid-transition.
- W-Fill: original also uses `top:calc(var(--ft)+var(--fh)+7px);left:calc(var(--rx)+var(--rw)-50px)` with same 236px width, same `row-gap:14px`, same `padding-bottom:72px`. So 7px gap exists in original source. In replica real flow the stall makes the overlapping tag linger (Header size 49-63px overlaps Task 46-78px; Task size 95-109px overlaps Meta 92-112px), hiding task end in dark. Fix keeps 236px text verbatim, only moves vertical gap to guarantee no overlap while still fitting in 72px padding for last row.

## Exact stalled transition (why)
- Stalled: `hidden → shown` (`data-shown` absent → present, `shown=false→true`) never keeps fully-shown.
- Why: any real-browser layout shift (font load, zoom, RO initial fire, window resize) calls `paint(cur,false)` which deletes `data-shown` and sets `shown=false`, resetting the 0-300ms delayed opacity transitions before they complete. With repeated shifts the overlay hovers at ~0.3-0.6 = ghost. DOM-stub without RO keeps attribute, so naive harness that sets attributes directly passes while browser fails.
- Previous fixes kept `paint(cur,false)` on remeasure (or changed attribute string but CSS `[data-shown]` presence still matched), so bytes differed, painted result same.
- Fix (state machine, not just CSS):
  - `paint(cur,true)` in `loop()` → `paint(cur)` (update geometry/text while hidden, then show after `SHOW_AT=30ms`, matching original `c(a)` + delayed show).
  - `paint(cur,false)` in RO + resize → `paint(cur)` (preserve current `shown`/attribute on remeasure, like original).
  - Keeps hide at `HIDE_AFTER=2190ms`, next at `NEXT_AFTER=2490ms`, `reduce` path `paint(0,true)` unchanged.
- W-Fill: `.iac-size` `+7px` → `+38px`. Math: Header frame bottom = H+10, Task top = H+14, Task bottom = H+46 (22+32+gap14). Old size  H+17→H+31 overlaps. New size H+48→H+62 clears by 2px. Task→Meta: old T+17→T+31 overlaps Meta T+14→T+34, new T+48→T+62 clears. Meta last: new Meta+48→Meta+62 fits in 72px bottom padding (10px spare). Left `rx+rw-50` and `236px` text unchanged. Red edge badge left at +12px (far-left, 1.5px overlap, not covering text).

## Changes (targeted, no rebuild)
1. `./index.html` CSS: `.iac-size{...top:calc(var(--ft)+var(--fh)+38px)...}` (was 7px).
2. `./index.html` JS RO: `paint(cur,false)` → `paint(cur)`.
3. `./index.html` JS resize: `paint(cur,false)` → `paint(cur)`.
4. `./index.html` JS loop: `paint(cur,true)` → `paint(cur)` (delayed show via existing `SHOW_AT` timer).
- Kept: `/*noflash*/` guard first in `<head>`, `meta color-scheme`, `html{background...}` style, in-place updates only (text/attrs/styles on existing nodes), zero `innerHTML` (static count 0), demo data verbatim (Researcher/Sonnet 5.5, Coder/GPT-6 Sol, tasks, $0.18/55s, $0.42/48s, 236px), theme toggle `iac-theme` key.

## Harness (in-dir, node only, fake clock, no installs)
- File: `./harness.js`, run: `node ./harness.js ./original-backup.html` (expect FAIL) and `node ./harness.js ./index.html` (expect PASS).
- Drives page's OWN timeline from load (no manual state-setting): fake `setTimeout` queue, initial RO fire at 10ms, `loop` at 600ms, show at 630ms, simulated font/layout RO+resize at 800ms (via page's own RO callback + resize handler), steady check at 1500ms (needs >600ms continuous present to complete 300ms delay+260ms duration → opacity 1).
- Asserts PAINTED state, not DOM presence: `hasAttribute(data-shown)` at 630/800/1500 + computed effective opacity (1 only if continuously present), geometry overlap (size rect vs Task/Meta rects from `__iacTest.geom()` with realistic stub offsets: Header 10/22, Task 46/32, Meta 92/20, card 320x184), light AND dark (runs full timeline twice with `data-theme` light/dark), full-loop node identity (rows/marks/select `===` after 3×2490ms), zero `innerHTML` writes after init (setter count).
- Verifies: `node --check` on extracted main script + harness.

### BEFORE (original-backup.html) — must FAIL
```
=== harness testing: ./original-backup.html ===
sizeGap detected: 7
hasPaintFalseOnRemeasure (buggy): true
hasLoopImmediateShow (buggy immediate): true
--- theme light ---
 at600 shown=true at630 shown=true at800afterRO shown=false at1500 shown=false state={"idx":0,"shown":false,"tag":"Header","size":"236px"}
 overlap check: sizeTop0=49 sizeBot0=63 task 46-78 overlap0=true overlap1=true
 identityOk=true innerWrites=0
--- theme dark ---
 at600 shown=true at630 shown=true at800afterRO shown=false at1500 shown=false state={"idx":0,"shown":false,"tag":"Header","size":"236px"}
 overlap check: sizeTop0=49 sizeBot0=63 task 46-78 overlap0=true overlap1=true
 identityOk=true innerWrites=0

passes: 23 failures: 10
FAILURES:
 - FAIL: [light] painted: still shown after RO/resize at 800ms (preserves fully-shown, no stall)
 - FAIL: [light] painted: still shown at 1500ms steady (fully-shown, opacity 1, delays 300+260 completed)
 - FAIL: [light] computed opacity == 1 at steady (visible, not ghost)
 - FAIL: [light] geometry: Header W-Fill (top 49) does not overlap Task line (46-78)
 - FAIL: [light] geometry: Task W-Fill does not overlap Meta
 - FAIL: [dark] painted: still shown after RO/resize at 800ms (preserves fully-shown, no stall)
 - FAIL: [dark] painted: still shown at 1500ms steady (fully-shown, opacity 1, delays 300+260 completed)
 - FAIL: [dark] computed opacity == 1 at steady (visible, not ghost)
 - FAIL: [dark] geometry: Header W-Fill (top 49) does not overlap Task line (46-78)
 - FAIL: [dark] geometry: Task W-Fill does not overlap Meta
HARNESS RESULT: FAIL
```

### AFTER (index.html fixed) — must PASS
```
=== harness testing: ./index.html ===
sizeGap detected: 38
hasPaintFalseOnRemeasure (buggy): false
hasLoopImmediateShow (buggy immediate): false
--- theme light ---
 at600 shown=false at630 shown=true at800afterRO shown=true at1500 shown=true state={"idx":0,"shown":true,"tag":"Header","size":"236px"}
 overlap check: sizeTop0=80 sizeBot0=94 task 46-78 overlap0=false overlap1=false
 identityOk=true innerWrites=0
--- theme dark ---
 at600 shown=false at630 shown=true at800afterRO shown=true at1500 shown=true state={"idx":0,"shown":true,"tag":"Header","size":"236px"}
 overlap check: sizeTop0=80 sizeBot0=94 task 46-78 overlap0=false overlap1=false
 identityOk=true innerWrites=0

passes: 33 failures: 0
HARNESS RESULT: PASS
```

## Verify
- `md5sum ./index.html` → `a2bf8ac0e6fcb3ed1a633aa98b20942e` (differs from BEFORE).
- `node --check` on extracted main script: OK. `node --check ./harness.js`: OK.
- Open `./index.html` in browser, toggle sun/moon (light/dark), watch Inspect loop Header→Task→Meta: selection reaches full opacity, stays ~2s, W Fill stays below frame, never covers `Build the page...`, nodes stable, no flicker on resize.
