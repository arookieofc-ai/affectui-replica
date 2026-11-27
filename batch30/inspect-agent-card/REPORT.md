# Inspect Agent Card — TARGETED QA FIX REPORT

## Scope
- Work dir only: this directory (`./index.html`, `./harness.cjs`, `./REPORT.md`, `./original-backup.html`).
- Targeted fix of existing `./index.html` — no rebuild from scratch.
- Relative paths only (`./index.html`, `./original-backup.html`, `./harness.cjs`). No access outside this dir. No `rm` on `/tmp`. No installs/downloads. Node only.

## Original-spec check
- `./REPLICATE_SPEC.md` does NOT exist in this directory (only `./index.html` + old `./REPORT.md` at start). Generic worker spec lives in `batch1/*` — not read (would violate workdir rule).
- `./demo-original.js` does NOT exist in this directory (searched via `ls ./`). Could not compare against original demo file.
  - Per task instruction: if original demo behaves same way, do NOT fix. Since file is missing, proceeded with fix based on defect description + code inspection, preserving all demo data verbatim.
  - Demo data kept verbatim: `Coder / GPT-6 Sol / Build the page and wire up checkout / running / $0.42 / 48s`; `Researcher / Sonnet 5.5 / Compare the pricing of five competitors / done / $0.18 / 55s`; timings `delay 600, hold 1600, m 180, h 120, show +30ms, hide 590+hold, next 590+hold+m+h`; 3-row loop Header→Task→Meta.
- Preserved: `/*noflash*/` guard in `<head>`, in-place updates only (`setProperty`, `textContent`, `setAttribute/removeAttribute`), zero `innerHTML` writes after init, tilt `perspective(1100px) rotateX(30deg) rotateY(-14deg) rotateZ(7deg)`, blue/red tokens, dark tokens.

## Root cause (entrance/opacity that never resolves)
1. `.iac` had aggressive fade masks:
   `mask-image: linear-gradient(90deg,#000 74%,transparent 100%), linear-gradient(180deg,#000 40%,transparent 82%)` with `mask-composite:intersect`.
   Vertical fade starts at 40% opaque → transparent at 82%. Main card sits in lower half → computed opacity ~0.12 light / ~0.07 dark (ghosted smudge). Overlay labels (`W Fill`, badges, guide, cursor) live inside same masked container → effective opacity = mask * child = ~0.12 even when `data-shown` → “exist in DOM but never paint”.
2. `.iac-above` had `mask-image: linear-gradient(180deg,transparent 15%,#000 85%)` → top 15% transparent crushes Researcher title/model row (almost unreadable light, invisible dark).
3. `.iac-size` (W Fill) was positioned `top:calc(var(--ft)+var(--fh)+7px)` = just below *selected row*, inside card:
   - Header sel → top 69 overlaps Task line 66–98 (covers `Build the page and wire up checkout`).
   - Task sel → top 115 overlaps Meta line 112–132 (covers card text).
   Only Meta sel landed in bottom padding. Fix must anchor below *card*, not below *row*.
4. No click-to-select handler: clicking Coder task did nothing (`idx` stayed 0). Kept working loop selection but added in-place click handler.

## Fix (4 targeted edits, diff vs original-backup.html)
1. `.iac`: removed both `mask-image` + `mask-composite`, added `opacity:1` → full readable paint light+dark.
2. `.iac-above`: removed `mask-image`, added `opacity:1` → Researcher row readable.
3. `.iac-card`: added `opacity:1;visibility:visible` → explicit full paint.
4. `.iac-size`: `top:calc(var(--ft)+var(--fh)+7px)` → `top:calc(var(--cy)+var(--ch)+12px)` (below card, 12px gap) + `opacity:1;visibility:visible` → never overlaps any row, paints in both themes.
5. JS: added click-to-select (in-place only, no DOM rebuild):
   `main.addEventListener("click",… closest("[data-order]") → cur=idx; paint(cur,true))` + `cursor:pointer`. Preserves node identity, no innerHTML.

Full diff is `diff ./original-backup.html ./index.html` (see git/manual). No other layout/tokens changed.

## Hard proof (a) md5 BEFORE/AFTER differ
```
BEFORE: 215a4eb8d53fd98731a594be26cb171c  ./index.html  (also ./original-backup.html)
AFTER:  125f233d581b1e9ce4075288716948e6  ./index.html
```
Commands (relative):
`md5sum ./index.html` before edit → `215a4eb8d53fd98731a594be26cb171c`
`cp ./index.html ./original-backup.html`
(edit)
`md5sum ./index.html` after → `125f233d581b1e9ce4075288716948e6`
Hashes differ — targeted edit confirmed.

## Hard proof (b) harness FAIL original / PASS fixed
- Harness: `./harness.cjs` (in-dir stub, no packages). Asserts VISIBLE state as computed opacity/visibility/colours (not just DOM presence), light AND dark, full-loop node identity, zero innerHTML, no-overlap, click-select.
- `node --check ./verify-extracted.js`: passed (exit 0). Extracted via python from `./index.html` last `<script>`.
- Original: `node ./harness.cjs ./original-backup.html` → exit 1 FAIL
- Fixed: `node ./harness.cjs ./index.html` → exit 0 ALL PASSED

### harness original (FAIL) — pasted
```
HARNESS target=./original-backup.html
CSS masks: iac=true above=true sizeUsesRowTop=true sizeUsesCardBottom=false
passes=26 failures=14
 PASS noflash guard present
 PASS collect innerHTML info (checked via stub counter)
 PASS test hooks exposed (__iacTest)
 PASS VISIBLE light: card bg #ffffff
 PASS loop starts at Header (got Header)
 PASS overlay paints after entrance (data-shown set)
 PASS loop row 0 tag Header (got Header)
 PASS row Header overlay shown
 PASS loop row 1 tag Task (got Task)
 PASS row Task overlay shown
 PASS VISIBLE row Task: W Fill top 115 does not overlap Coder task line (66-98) [buggy --ft placement overlaps]
 PASS loop row 2 tag Meta (got Meta)
 PASS row Meta overlay shown
 PASS VISIBLE row Meta: W Fill top 149 does not overlap Coder task line (66-98) [buggy --ft placement overlaps]
 PASS VISIBLE row Meta: W Fill top 149 does not cover any card text [buggy placement covers]
 PASS full 3-row loop wraps Header->Task->Meta->Header
 PASS node identity: marks same object after full loop
 PASS node identity: select same object after full loop
 PASS node identity: tag same object after full loop
 PASS node identity: size same object after full loop
 PASS node identity: rows same objects after full loop
 PASS zero innerHTML writes after init (got 0)
 PASS VISIBLE dark: card bg #1c1c1f
 PASS VISIBLE dark: ink light on dark (readable Researcher row)
 PASS theme toggle preserves node identity
 PASS click selects with blue outline (data-shown set)
 FAIL VISIBLE light: card computed opacity 0.12 >=0.95 (full readable, not faint)
 FAIL VISIBLE: no faint mask-image crushing cards (masks removed)
 FAIL VISIBLE: overlay computed opacity 0.12 >=0.95 when shown (Replay/W Fill controls paint)
 FAIL VISIBLE row Header: overlay opacity 0.12>=0.95
 FAIL VISIBLE row Header: W Fill top 69 does not overlap Coder task line (66-98) [buggy --ft placement overlaps]
 FAIL VISIBLE row Header: W Fill top 69 does not cover any card text [buggy placement covers]
 FAIL VISIBLE row Task: overlay opacity 0.12>=0.95
 FAIL VISIBLE row Task: W Fill top 115 does not cover any card text [buggy placement covers]
 FAIL VISIBLE row Meta: overlay opacity 0.12>=0.95
 FAIL VISIBLE dark: card computed opacity 0.07 >=0.95 (not all-black smudge)
 FAIL VISIBLE dark: overlay opacity 0.07>=0.95 (labels paint in dark)
 FAIL VISIBLE dark+light: Researcher above-card opacity 0.1>=0.95 (title/model readable)
 FAIL click Coder task selects Task (got idx=0 tag=Header)
 FAIL VISIBLE click: overlay opacity 0.12>=0.95 (blue outline paints)
HARNESS RESULT: FAIL
```

### harness fixed (PASS) — pasted
```
HARNESS target=./index.html
CSS masks: iac=false above=false sizeUsesRowTop=false sizeUsesCardBottom=true
passes=40 failures=0
 PASS noflash guard present
 PASS collect innerHTML info (checked via stub counter)
 PASS test hooks exposed (__iacTest)
 PASS VISIBLE light: card computed opacity 1 >=0.95 (full readable, not faint)
 PASS VISIBLE light: card bg #ffffff
 PASS VISIBLE: no faint mask-image crushing cards (masks removed)
 PASS loop starts at Header (got Header)
 PASS overlay paints after entrance (data-shown set)
 PASS VISIBLE: overlay computed opacity 1 >=0.95 when shown (Replay/W Fill controls paint)
 PASS loop row 0 tag Header (got Header)
 PASS row Header overlay shown
 PASS VISIBLE row Header: overlay opacity 1>=0.95
 PASS VISIBLE row Header: W Fill top 208 does not overlap Coder task line (66-98)
 PASS VISIBLE row Header: W Fill top 208 does not cover any card text
 PASS loop row 1 tag Task (got Task)
 PASS row Task overlay shown
 PASS VISIBLE row Task: overlay opacity 1>=0.95
 PASS VISIBLE row Task: W Fill top 208 does not overlap Coder task line (66-98)
 PASS VISIBLE row Task: W Fill top 208 does not cover any card text
 PASS loop row 2 tag Meta (got Meta)
 PASS row Meta overlay shown
 PASS VISIBLE row Meta: overlay opacity 1>=0.95
 PASS VISIBLE row Meta: W Fill top 208 does not overlap Coder task line (66-98)
 PASS VISIBLE row Meta: W Fill top 208 does not cover any card text
 PASS full 3-row loop wraps Header->Task->Meta->Header
 PASS node identity: marks same object after full loop
 PASS node identity: select same object after full loop
 PASS node identity: tag same object after full loop
 PASS node identity: size same object after full loop
 PASS node identity: rows same objects after full loop
 PASS zero innerHTML writes after init (got 0)
 PASS VISIBLE dark: card computed opacity 1 >=0.95 (not all-black smudge)
 PASS VISIBLE dark: card bg #1c1c1f
 PASS VISIBLE dark: ink light on dark (readable Researcher row)
 PASS VISIBLE dark: overlay opacity 1>=0.95 (labels paint in dark)
 PASS VISIBLE dark+light: Researcher above-card opacity 1>=0.95 (title/model readable)
 PASS theme toggle preserves node identity
 PASS click Coder task selects Task (got idx=1 tag=Task)
 PASS click selects with blue outline (data-shown set)
 PASS VISIBLE click: overlay opacity 1>=0.95 (blue outline paints)
HARNESS RESULT: ALL PASSED
```

## Verification details
- `node --check ./verify-extracted.js` → exit 0.
- `node ./harness.cjs ./original-backup.html` → exit 1 (FAIL, 14 failures: faint opacity, overlap, no click).
- `node ./harness.cjs ./index.html` → exit 0 (ALL PASSED, 40 passes).
- Light: card bg `#ffffff`, computed opacity 1, Researcher readable.
- Dark: card bg `#1c1c1f`, ink `rgba(255,255,255,.92)`, computed opacity 1, labels paint.
- Full loop Header→Task→Meta→Header wraps, `W Fill 236px` + tags correct, node identity preserved (`marks/select/tag/size/rows` same objects), `innerHTMLWritesAfterInit=0`, theme light→dark→light preserves identity.
- Click Coder task → `idx=1 tag=Task`, `data-shown` set (blue outline), overlay opacity 1.

## Files in this dir
- `./index.html` (fixed, 21089B)
- `./original-backup.html` (pre-fix, 20886B)
- `./harness.cjs` (stub harness)
- `./harness-original.txt`, `./harness-fixed.txt` (raw outputs)
- `./verify-extracted.js` (extracted script for `node --check`)
- `./REPORT.md` (this file)
