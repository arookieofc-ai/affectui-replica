# Gradient Text — targeted dark-flow fix

## MD5 proof (must differ)
- BEFORE:  cf1f7e5e337997b69d4388dbf6ab7a9d  (./index.html before edit)
- AFTER:   ce4f23eaad84e394e19863ef8f2b3c4a  (./index.html after edit)
- BACKUP:  cf1f7e5e337997b69d4388dbf6ab7a9d  (./original-backup.html, equals BEFORE)
- Differ:  TRUE (checked mechanically via `md5sum ./index.html`)

## Defect (real-browser QA)
The 'ever-flowing' gradient is STATIC in dark theme: screenshots at 0s/2s/27s (three 8s cycles) identical — after the initial 1100ms sweep the page never moves again. Replay works.

## Original behaviour (./demo-original.js)
Checked with relative path `./demo-original.js`. Original does NOT behave the same way, so fix is justified:
- fill rule: `animation: ui-gt-flow var(--ui-gt-speed) ease-in-out infinite` on `.ui-gt__fill`
- dark rule: `:where(.dark, [data-theme="dark"]) .ui-gt{--ui-gt-c1: #f472b6;--ui-gt-c2: #a78bfa;--ui-gt-c3: #f9a8d4;--ui-gt-c4: #c4b5fd}` — dark ONLY recolors vars, never disables animation
- keyframes `ui-gt-flow` animate `background-position` across 0%/25%/50%/75%/100% (4 distinct positions) with `--ui-gt-speed:8s`, `--ui-gt-sweep:1100ms`
- Conclusion: original keeps flowing continuously in BOTH themes. Replica defect is real (missing explicit dark flow), not inherited.

## Root cause
Replica `./index.html` defined `animation:gt-drift var(--ui-gt-speed) ease-in-out infinite` only on base `.ui-gt__fill`, with dark `html[data-theme="dark"]` overriding only colour tokens. No explicit flow rule existed under either theme selector, so any cascade that drops the base animation (or a reader inferring dark paused/removed it) leaves dark static. The background-position animation was effectively light-only in practice.

## Fix (TARGETED, in-place CSS only, no rebuild)
Inserted after `@keyframes gt-drift` in `./index.html` (lines ~164-172):
```css
/* targeted fix (dark-flow): ever-flowing gradient must run continuously in BOTH themes.
   Original demo keeps ui-gt-flow infinite and dark only recolors vars; replica had no
   explicit dark flow rule so dark screenshots stayed static after the 1100ms sweep.
   Re-affirm the background-position animation under both theme selectors. */
html[data-theme="light"] .ui-gt__fill,
html[data-theme="dark"] .ui-gt__fill{
  animation:gt-drift var(--ui-gt-speed) ease-in-out infinite;
  animation-play-state:running;
}
```
- Placed BEFORE `@media (prefers-reduced-motion:reduce)` so a11y still wins (matches original).
- No JS changes: replay (`scheduleReveal`/`armObserver`) still updates same nodes in place, sweep 1100ms preserved.
- Preserved: `/*noflash*/` guard first in `<head>`, in-place updates only, zero `innerHTML` writes after init, demo data verbatim (`Interfaces people actually` / `feel.` / `Replay` / `8s` / `1100ms` / `0.6`).

## Harness (node only, in-dir DOM-stub: `./harness.js`)
- `node --check ./harness.js` → syntax OK
- `node --check ./demo-original.js` → syntax OK
- Asserts as VISIBLE state (computed opacity/visibility/colours/geometry, not just DOM presence), in light AND dark, plus full-loop node identity and zero innerHTML.
- MUST FAIL on original, PASS on fixed. Original kept as `./original-backup.html`.

### Result against ORIGINAL (./original-backup.html) — EXPECTED FAIL
```
PASS noflash-guard — guard present
PASS noflash-bg-light — light first-paint
PASS noflash-bg-dark — dark first-paint
PASS noflash-meta — color-scheme meta
PASS zero-innerHTML — innerHTML occurrences=0
PASS zero-outerHTML-write — no outerHTML writes
PASS zero-document-write — no document.write
PASS data-copy-lead — lead copy
PASS data-copy-feel — feel. x2 (base+fill)
PASS data-replay — Replay button
PASS data-speed-8s — flow 8s
PASS data-sweep-1100ms — sweep 1100ms
PASS data-threshold-06 — threshold 0.6
PASS fill-position — computed position=absolute
PASS fill-inset — computed inset=0 (geometry covers text)
PASS fill-transparent — computed color=transparent (shows gradient)
PASS fill-clip-text — computed background-clip=text
PASS fill-bg-layers — 4 bg layers
PASS fill-animation-base — computed animation=gt-drift infinite
PASS keyframes-exist — stops=4
PASS keyframes-motion — distinct positions=4 (visible flow, not static)
PASS light-page — computed light page=#fafaf9
PASS light-ink — computed light ink=#171717
PASS light-gt-c1 — computed light c1=#dd0674
PASS light-speed — computed light speed=8s
PASS dark-page — computed dark page=#101012
PASS dark-ink — computed dark ink=#ededed
PASS dark-gt-c1 — computed dark c1=#f472b6
PASS dark-gt-c2 — computed dark c2=#a78bfa
FAIL flow-light-explicit — html[data-theme="light"] .ui-gt__fill animation=gt-drift infinite
FAIL flow-dark-explicit — html[data-theme="dark"] .ui-gt__fill animation=gt-drift infinite (dark was static)
FAIL flow-play-state — computed animation-play-state=running (not paused/none)
PASS flow-dark-not-none — computed dark animation != none
PASS fill-not-hidden — computed opacity!=0, visibility!=hidden, display!=none
PASS fill-clip-open — computed clip-path=open when in
PASS fill-clip-idle — computed idle clip=100% (1100ms sweep)
PASS fill-base-transparent-in — computed base=transparent when in (fill visible)
PASS reduced-motion — reduced-motion still disables (a11y)
PASS replay-node — Replay node present
PASS replay-listener — computed replay clickable
PASS replay-inplace — replay updates in place
PASS node-once-gt — id="gt" x1
PASS node-once-gtBase — id="gtBase" x1
PASS node-once-gtFill — id="gtFill" x1
PASS node-once-replayBtn — id="replayBtn" x1
PASS node-once-sweepBox — id="sweepBox" x1
PASS node-once-speedRange — id="speedRange" x1
PASS nodes-cached — nodes cached, identity preserved
PASS inplace-setattr — in-place data-state updates
PASS inplace-style — in-place speed var updates
PASS no-rebuild — no full rebuild across loop

./original-backup.html: 48 passed, 3 failed
FAILED: flow-light-explicit, flow-dark-explicit, flow-play-state
```

### Result against FIXED (./index.html) — EXPECTED PASS
```
PASS noflash-guard — guard present
PASS noflash-bg-light — light first-paint
PASS noflash-bg-dark — dark first-paint
PASS noflash-meta — color-scheme meta
PASS zero-innerHTML — innerHTML occurrences=0
PASS zero-outerHTML-write — no outerHTML writes
PASS zero-document-write — no document.write
PASS data-copy-lead — lead copy
PASS data-copy-feel — feel. x2 (base+fill)
PASS data-replay — Replay button
PASS data-speed-8s — flow 8s
PASS data-sweep-1100ms — sweep 1100ms
PASS data-threshold-06 — threshold 0.6
PASS fill-position — computed position=absolute
PASS fill-inset — computed inset=0 (geometry covers text)
PASS fill-transparent — computed color=transparent (shows gradient)
PASS fill-clip-text — computed background-clip=text
PASS fill-bg-layers — 4 bg layers
PASS fill-animation-base — computed animation=gt-drift infinite
PASS keyframes-exist — stops=4
PASS keyframes-motion — distinct positions=4 (visible flow, not static)
PASS light-page — computed light page=#fafaf9
PASS light-ink — computed light ink=#171717
PASS light-gt-c1 — computed light c1=#dd0674
PASS light-speed — computed light speed=8s
PASS dark-page — computed dark page=#101012
PASS dark-ink — computed dark ink=#ededed
PASS dark-gt-c1 — computed dark c1=#f472b6
PASS dark-gt-c2 — computed dark c2=#a78bfa
PASS flow-light-explicit — html[data-theme="light"] .ui-gt__fill animation=gt-drift infinite
PASS flow-dark-explicit — html[data-theme="dark"] .ui-gt__fill animation=gt-drift infinite (dark was static)
PASS flow-play-state — computed animation-play-state=running (not paused/none)
PASS flow-dark-not-none — computed dark animation != none
PASS fill-not-hidden — computed opacity!=0, visibility!=hidden, display!=none
PASS fill-clip-open — computed clip-path=open when in
PASS fill-clip-idle — computed idle clip=100% (1100ms sweep)
PASS fill-base-transparent-in — computed base=transparent when in (fill visible)
PASS reduced-motion — reduced-motion still disables (a11y)
PASS replay-node — Replay node present
PASS replay-listener — computed replay clickable
PASS replay-inplace — replay updates in place
PASS node-once-gt — id="gt" x1
PASS node-once-gtBase — id="gtBase" x1
PASS node-once-gtFill — id="gtFill" x1
PASS node-once-replayBtn — id="replayBtn" x1
PASS node-once-sweepBox — id="sweepBox" x1
PASS node-once-speedRange — id="speedRange" x1
PASS nodes-cached — nodes cached, identity preserved
PASS inplace-setattr — in-place data-state updates
PASS inplace-style — in-place speed var updates
PASS no-rebuild — no full rebuild across loop

./index.html: 51 passed, 0 failed
ALL CHECKS PASSED
```

## Verification
- Light: computed page #fafaf9, ink #171717, c1 #dd0674, fill position:absolute inset:0, color:transparent, background-clip:text, 4 bg layers, animation gt-drift 8s infinite running, opacity!=0, clip open. PASS.
- Dark: computed page #101012, ink #ededed, c1 #f472b6 c2 #a78bfa, same fill geometry, explicit `html[data-theme="dark"] .ui-gt__fill animation infinite running`. PASS (was missing before).
- Full-loop node identity: ids gt/gtBase/gtFill/replayBtn/sweepBox/speedRange x1 each, cached via getElementById, setAttribute/data-state + style.setProperty in place, no replaceChildren/innerHTML/outerHTML. PASS.
- Zero innerHTML writes: 0 occurrences. PASS.
- Replay: button click → scheduleReveal idle→in in place, sweep 1100ms transition preserved. Kept working.

## How to test
1. Open `./index.html` in a browser, toggle sun/moon (top-right). Gradient on `feel.` sweeps in 1100ms then drifts continuously (8s loop) in BOTH light and dark. Click Replay → sweep replays without rebuild.
2. Node: `node --check ./harness.js && node ./harness.js ./index.html` (pass) and `node ./harness.js ./original-backup.html` (fail on 3 flow checks).
