# REPORT — Agent Team targeted scene-visibility fix

## Defect (real-browser QA)
Main scene never paints readably: across loops 1–12 in both themes the big card
under the prompt box is BLANK almost all the time; at the branching moment only
the connector lines flash briefly, and the three agents (Lead Researcher, Inbound
Qualifier, Outbound SDR) with overlapping tool icons NEVER appear in readable
form. Loop itself runs (Loop counter, Typing prompt… -> Prompt sent — branching…
-> Team of 3 working -> Resetting…). Replay works.

## Original behaviour (checked ./demo-original.js BEFORE changing)
`./demo-original.js` line ~99:

```
i=22,a=420,o=700,s=2600,c=600
t=500+e.length*i
sent at t+a
team at t+a+o*.55 (=+385)
l=t+a+o+480+500
reset at l+s (=l+2600)
restart r at l+s+c (=+600)
```

So per the original the `team` phase HOLDS through `s=2600ms`:
team visible = (o+480+500-o*.55)+s = 1295+2600 = 3895ms,
reset(blank) = c = 600ms.
The original does NOT have the blank-always behaviour — fix restores it.
Demo data verbatim: prompt `Build a team to work my inbound pipeline`,
paths `M300 110C300 162 102 152 102 196` / `M300 110V196` /
`M300 110C300 162 498 152 498 196`, x=102/300/498, members/tools as in harness.

## Root cause in ./index.html
```
var tReset=tSent+REVEAL_MS+480+500;              // = l (missing +HOLD_MS)
later(reset, tReset);
later(nextLoop, tReset+HOLD_MS+GAP_MS);          // blank lasts 3200ms
```
HOLD_MS (2600) was added AFTER reset instead of BEFORE it. Total loop length
stayed 6680ms, but team was cut to 1295ms (160ms stagger + 520ms pop + 360ms dot
leaves ~500ms fully readable before fade) and reset(blank) stretched to 3200ms.
Lines (reveal 700ms) also vanished early. Hence blank-almost-always.

## Targeted fix (in-place, no rebuild)
One timing change only, in `runLoop()`:
```
-  var tReset=tSent+REVEAL_MS+480+500;
+  var tReset=tSent+REVEAL_MS+480+500+HOLD_MS;   // = l+s per original
   later(reset, tReset);
-  later(nextLoop, tReset+HOLD_MS+GAP_MS);
+  later(nextLoop, tReset+GAP_MS);               // = l+s+c per original
```
Now team=3895ms, reset=600ms, total unchanged (6680ms). Loop counter,
phases, replay (`Replay loop` button + `R` key -> `runLoop()`), reduced-motion
path untouched and preserved.
Kept: `/*noflash*/` guard + `html{background…}` + `color-scheme` meta,
in-place updates only (no full `innerHTML` render; script contains zero
`innerHTML`), demo prompt/roles/tools/timings verbatim, tokens/light+dark,
v5 hover guard, tabular-nums.

## Hard proof — md5 BEFORE vs AFTER (must differ)
```
BEFORE: 31ac863c7415c2817e3c6e1a740962cb  ./original-backup.html
        31ac863c7415c2817e3c6e1a740962cb  ./index.html (pre-edit)
AFTER:  24a8bd467505bacce1dc4512a190d965  ./index.html (post-fix)
```
Different: YES. Original kept as `./original-backup.html`.

## Hard proof — harness FAIL (original) vs PASS (fixed)
Harness: `./harness.js` (in-dir DOM-stub, virtual clock, node only).
Run: `node ./harness.js ./original-backup.html` (expect FAIL),
`node ./harness.js ./index.html` (expect PASS).

### FAIL against original (`./original-backup.html`, exit 1)
```
TARGET: original-backup.html
PASS: noflash guard present
PASS: color-scheme meta present
PASS: noflash inline bg present
PASS: design tokens present
PASS: dark theme overrides present
PASS: v5 hover guard present
PASS: tap highlight present
PASS: tabular-nums present
PASS: hover rules guarded (3 :hover refs)
PASS: verbatim prompt present
PASS: all three roles verbatim
PASS: all five tools present
PASS: timing constants present
PASS: zero innerHTML in page script (static)
PASS: inline script syntax valid (vm.Script ~ node --check)
PASS: 3 agent nodes built at init
PASS: phase reaches team @2185ms (loop text: Loop 2 · 3 agents)
PASS: full loop restarts (Loop 2 · 3 agents @6680ms)
TIMING: team visible 1295ms, reset(blank) 3200ms
FAIL: MAIN SCENE blank almost all the time: team visible only 1295ms, expected >=3000ms per original (hold 2600ms through team)
```

### PASS against fixed (`./index.html`, exit 0)
```
TARGET: index.html
PASS: noflash guard present
PASS: color-scheme meta present
PASS: noflash inline bg present
PASS: design tokens present
PASS: dark theme overrides present
PASS: v5 hover guard present
PASS: tap highlight present
PASS: tabular-nums present
PASS: hover rules guarded (3 :hover refs)
PASS: verbatim prompt present
PASS: all three roles verbatim
PASS: all five tools present
PASS: timing constants present
PASS: zero innerHTML in page script (static)
PASS: inline script syntax valid (vm.Script ~ node --check)
PASS: 3 agent nodes built at init
PASS: phase reaches team @2185ms (loop text: Loop 2 · 3 agents)
PASS: full loop restarts (Loop 2 · 3 agents @6680ms)
TIMING: team visible 3895ms, reset(blank) 600ms
PASS: VISIBLE team holds for proper duration per original (3895ms >= 3000ms)
PASS: reset blank is short per original (600ms)
PASS: loop timing matches original: typing->sent->team(hold)->reset(600)->Loop 2
PASS: agents stay VISIBLE through hold (team still at +2000ms)
PASS: VISIBLE roles painted: Lead Researcher / Inbound Qualifier / Outbound SDR (light+dark share DOM)
PASS: overlapping tool icons: 2 per agent
PASS: full-loop node identity preserved (in-place updates only)
PASS: zero innerHTML writes after init
PASS: light theme tokens ok
PASS: dark theme tokens ok
PASS: dark VISIBLE (toggle light->dark, label Dark)
PASS: light VISIBLE (toggle dark->light)

ALL CHECKS PASSED
```

## Verification (node only, no installs)
- `node --check ./harness.js` — OK
- `node --check ./inline-check.js` (extracted inline page script) — OK
- `node ./harness.js ./index.html` — ALL CHECKS PASSED (VISIBLE typed/roles/tools,
  team holds 3895ms, reset 600ms, Loop 2 restart, node identity, zero post-init
  innerHTML, light AND dark toggle verified via stub)
- `node ./harness.js ./original-backup.html` — FAILs as above (proves harness
  discriminates the defect)
- No `innerHTML` in page script (static grep + runtime write counter).
- Full-loop node identity: same `typedText`/`phasePill`/agent nodes across Loop 1->2.
- No installs or downloads; all in-dir, relative paths.

## What matches / could not verify
Matches: 3:2 stage, prompt pill, halo pink→violet, dashed connectors, 84u nodes +
online dot + role pills with 2 overlapping tools, transitions/delays, accent
`#2f6bff`, dark tokens, aria-label.
Could not verify pixels in a real browser (node-only per instructions); VISIBLE
state asserted as DOM text + phase + timing + CSS token presence in stub, in
both themes. Replay button/`R` code path unchanged — kept working.

## How to test
Open `./index.html` in a browser. Watch: typing (~1380ms) -> send press ->
lines draw (700ms) -> 3 agents pop with dots -> HOLD readable ~2600ms ->
fade 500ms -> Resetting… 600ms blank -> Loop 2. Toggle theme (top-right) for
dark; press `R` or `Replay loop` to restart.
