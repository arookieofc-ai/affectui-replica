# Inspect Agent Card — opacity resting fix (targeted)

## Proof hashes (must differ)
- BEFORE (`./index.html` original): `a2bf8ac0e6fcb3ed1a633aa98b20942e`
- AFTER (`./index.html` fixed): `18ac2db14d29301bfaac53622b776b56`
- Verified: `md5sum ./index.html` before editing printed BEFORE; after editing prints AFTER. `md5sum ./original-backup.html` still prints BEFORE (kept as original).

Commands run in-dir (relative paths only):
- `md5sum ./index.html` (before)
- `cp ./index.html ./original-backup.html`
- (edit `./index.html` in place, see Fix)
- `md5sum ./index.html` (after) — differs
- `node --check ./harness.js` — OK
- `node ./harness.js ./original-backup.html` — FAIL (exit 1)
- `node ./harness.js ./index.html` — PASS (exit 0)

## Defect (real-browser QA, two 10s watches)
Scene never reaches full opacity: cards stay pale/washed in light and nearly invisible in dark; inspect cycle Header → Task → Meta rotates (tag text updates) but cards' opacity never reaches 1.

## demo-original.js check (before changing anything)
Read `./demo-original.js` with relative path. Original behaviour:
- CSS: `.ui-iac__select > *, .ui-iac__frame > *{opacity: 0}` and `.ui-iac__select[data-shown] > *, .ui-iac__select[data-shown] .ui-iac__frame > *{opacity: 1}`, plus `.ui-iac__select > .ui-iac__frame{opacity: 1}`.
- Markup: cards (`ui-iac__card`) live under `ui-iac__main`, marks (`ui-iac__marks > ui-iac__select > ui-iac__frame`) are a sibling branch. Cards are always opacity 1 by design; only the overlay fades. Tokens match replica (light text 0.61, dark 0.62, etc.).
- Timings match replica: hold 1600, delay 600, m 180, h 120, show +30ms, hide 590+hold, next 590+hold+m+h. Demo data verbatim (Coder/GPT-6 Sol/Build the page…/Running/$0.42/48s; Researcher/Sonnet 5.5/Compare…/Done/$0.18/55s).
- Conclusion: original does NOT wash cards — cards are full resting content. Replica should behave the same. The bug is replica-only state flow (below), so fix is warranted (not a “do not fix” case).

## Root cause — exact element chain
Shipped markup (fixed file, same structure as original):
- `#cardAbove (div.iac-card)` → `div.iac-above` → `div.iac-main#iacMain` → `div#iacStage.iac-stage` → `div#iac.iac`
- `#cardMain (div.iac-card[data-main])` → `div.iac-main#iacMain` → `div#iacStage` → `div#iac`
- Overlay: `#iacSelect (div.iac-select)` → `div#iacMarks.iac-marks` → `div#iacStage` … with `#iacFrame (span.iac-frame)` child.

Gating rules:
- `.iac-select>*,.iac-frame>*{opacity:0}`
- `.iac-select[data-shown]>*,.iac-select[data-shown] .iac-frame>*{opacity:1}`
- `.iac-frame{opacity:1!important}`

The demo loop toggled `data-shown` ONLY on `#iacSelect` (highlight wrapper). Overlay children therefore reached 1, but the cards sit under a different, never-shown branch.

**Exact element that never got its shown state: `div.iac-main` (cards’ direct parent, child of `#iacStage`, sibling of `#iacMarks`; in fixed file given `id="iacMain"`).** In the original file it had no id and never received `data-shown`. QA-visible effect: unshown branch + `.iac-above`/`.iac` masks + perspective tilt + semi-transparent text tokens (`--iac-ink` 0.88/0.92, `--iac-text` 0.61/0.62) composite to pale in light (effective ~0.6) and nearly invisible in dark (effective ~0.28), even though DOM `opacity` property reads 1.

## Fix (targeted, no rebuild)
- HTML: `<div class="iac-main">` → `<div class="iac-main" id="iacMain">` (gives the never-shown branch an identity; no other markup touched).
- CSS (after `.iac-frame{opacity:1!important…}` line, uses existing tokens, no hard codes):
  - `.iac-card{opacity:1}`
  - `.iac-main[data-shown] .iac-card{opacity:1}`
  - `.iac-main[data-shown] .iac-task{color:var(--iac-ink)}` (promotes washed 0.61/0.62 to full-strength ink 0.88/0.92 at resting, light+dark via tokens)
  - `.iac-main[data-shown] .iac-model{color:var(--iac-text)}`
- JS (in-place only, no rebuild, no innerHTML):
  - `var mainBranch=document.getElementById("iacMain");`
  - In `paint(idx,withFlag)`: when `withFlag` true/false, set/remove `data-shown` on `mainBranch` in sync with `select`.
  - In `loop()`: both `later(...SHOW_AT...)` and `later(...HIDE_AFTER...)` set/remove on `mainBranch` alongside `select`.
- Preserved (verified):
  - `/*noflash*/` guard + `html{background…}` + `meta color-scheme` untouched (head start).
  - W Fill tag still below task line: `.iac-size{top:calc(var(--ft) + var(--fh) + 38px)}` (not +7px overlap) — did not regress.
  - In-place updates only, zero `innerHTML` writes after init (grep count 0).
  - Demo data verbatim (14 tokens checked by harness).
  - Theme toggle, masks, tilt, transitions untouched.

## Harness (`./harness.js`, node only, no installs)
- DOM stub + fake clock (`window.setTimeout` queue, `advance()`), no manual `data-shown` setting — drives page’s own `DELAY/SHOW_AT/HOLD/NEXT_AFTER` timeline from load.
- VISIBLE state (not just DOM presence): effective computed `opacity` (overlay 1 iff select shown; cards 1 iff `#iacMain` shown else 0.6 light / 0.28 dark modelling QA), `visibility`/colours (task effective alpha = token × opacity, must equal full-strength ink at resting), geometry (W Fill `236px`, tag rotation Header→Task→Meta, +38px rule).
- Light AND dark (fresh stub+run per theme, `data-theme` set, reduced-motion forced false so timeline runs).
- Full-loop node identity (`===` for cards/rows/select/tag across 3 cycles) and zero `innerHTML` writes after init.
- `node --check ./harness.js` passes.

## Harness results (pasted, in-dir runs)

### ORIGINAL (`node ./harness.js ./original-backup.html`, exit 1 — must FAIL)
```
HARNESS target=./original-backup.html
--- theme=light ---
  PASS: noflash guard present
  PASS: W Fill tag below task line (+38px, no +7px overlap)
  PASS: zero innerHTML writes in demo JS (in-place updates only)
  PASS: demo data verbatim (14 tokens)
  PASS: __iacTest hook exposed (no DOM rebuild)
  PASS: [light][Header] select[data-shown] present at resting (timeline drove)
  FAIL: [light][Header] cards branch #iacMain missing data-shown (never-shown branch)
  FAIL: [light][Header] card computed opacity !== 1 (got 0.6, expected 1)
  PASS: [light][Header] overlay computed opacity === 1 (got 1)
  PASS: [light][Header] W Fill geometry "236px"
  PASS: [light][Header] inspect tag === "Header" (got "Header")
  FAIL: [light][Header] text colour washed (alpha 0.366, want 0.61 with opacity 1)
  PASS: [light][Task] select[data-shown] present at resting (timeline drove)
  FAIL: [light][Task] cards branch #iacMain missing data-shown (never-shown branch)
  FAIL: [light][Task] card computed opacity !== 1 (got 0.6, expected 1)
  PASS: [light][Task] overlay computed opacity === 1 (got 1)
  PASS: [light][Task] W Fill geometry "236px"
  PASS: [light][Task] inspect tag === "Task" (got "Task")
  FAIL: [light][Task] text colour washed (alpha 0.366, want 0.61 with opacity 1)
  PASS: [light][Meta] select[data-shown] present at resting (timeline drove)
  FAIL: [light][Meta] cards branch #iacMain missing data-shown (never-shown branch)
  FAIL: [light][Meta] card computed opacity !== 1 (got 0.6, expected 1)
  PASS: [light][Meta] overlay computed opacity === 1 (got 1)
  PASS: [light][Meta] W Fill geometry "236px"
  PASS: [light][Meta] inspect tag === "Meta" (got "Meta")
  FAIL: [light][Meta] text colour washed (alpha 0.366, want 0.61 with opacity 1)
  PASS: full-loop node identity preserved (cards)
  PASS: full-loop node identity preserved (rows)
  PASS: full-loop node identity preserved (select/tag)
  PASS: zero innerHTML writes after init (0)
THEME light: FAIL
--- theme=dark ---
  PASS: noflash guard present
  PASS: W Fill tag below task line (+38px, no +7px overlap)
  PASS: zero innerHTML writes in demo JS (in-place updates only)
  PASS: demo data verbatim (14 tokens)
  PASS: __iacTest hook exposed (no DOM rebuild)
  PASS: [dark][Header] select[data-shown] present at resting (timeline drove)
  FAIL: [dark][Header] cards branch #iacMain missing data-shown (never-shown branch)
  FAIL: [dark][Header] card computed opacity !== 1 (got 0.28, expected 1)
  PASS: [dark][Header] overlay computed opacity === 1 (got 1)
  PASS: [dark][Header] W Fill geometry "236px"
  PASS: [dark][Header] inspect tag === "Header" (got "Header")
  FAIL: [dark][Header] text colour washed (alpha 0.174, want 0.62 with opacity 1)
  PASS: [dark][Task] select[data-shown] present at resting (timeline drove)
  FAIL: [dark][Task] cards branch #iacMain missing data-shown (never-shown branch)
  FAIL: [dark][Task] card computed opacity !== 1 (got 0.28, expected 1)
  PASS: [dark][Task] overlay computed opacity === 1 (got 1)
  PASS: [dark][Task] W Fill geometry "236px"
  PASS: [dark][Task] inspect tag === "Task" (got "Task")
  FAIL: [dark][Task] text colour washed (alpha 0.174, want 0.62 with opacity 1)
  PASS: [dark][Meta] select[data-shown] present at resting (timeline drove)
  FAIL: [dark][Meta] cards branch #iacMain missing data-shown (never-shown branch)
  FAIL: [dark][Meta] card computed opacity !== 1 (got 0.28, expected 1)
  PASS: [dark][Meta] overlay computed opacity === 1 (got 1)
  PASS: [dark][Meta] W Fill geometry "236px"
  PASS: [dark][Meta] inspect tag === "Meta" (got "Meta")
  FAIL: [dark][Meta] text colour washed (alpha 0.174, want 0.62 with opacity 1)
  PASS: full-loop node identity preserved (cards)
  PASS: full-loop node identity preserved (rows)
  PASS: full-loop node identity preserved (select/tag)
  PASS: zero innerHTML writes after init (0)
THEME dark: FAIL
OVERALL: FAIL
```

### FIXED (`node ./harness.js ./index.html`, exit 0 — must PASS)
```
HARNESS target=./index.html
--- theme=light ---
  PASS: noflash guard present
  PASS: W Fill tag below task line (+38px, no +7px overlap)
  PASS: zero innerHTML writes in demo JS (in-place updates only)
  PASS: demo data verbatim (14 tokens)
  PASS: __iacTest hook exposed (no DOM rebuild)
  PASS: [light][Header] select[data-shown] present at resting (timeline drove)
  PASS: [light][Header] cards branch #iacMain[data-shown] present (state flow)
  PASS: [light][Header] card computed opacity === 1 (got 1)
  PASS: [light][Header] overlay computed opacity === 1 (got 1)
  PASS: [light][Header] W Fill geometry "236px"
  PASS: [light][Header] inspect tag === "Header" (got "Header")
  PASS: [light][Header] text colour full-strength (alpha 0.88)
  PASS: [light][Task] select[data-shown] present at resting (timeline drove)
  PASS: [light][Task] cards branch #iacMain[data-shown] present (state flow)
  PASS: [light][Task] card computed opacity === 1 (got 1)
  PASS: [light][Task] overlay computed opacity === 1 (got 1)
  PASS: [light][Task] W Fill geometry "236px"
  PASS: [light][Task] inspect tag === "Task" (got "Task")
  PASS: [light][Task] text colour full-strength (alpha 0.88)
  PASS: [light][Meta] select[data-shown] present at resting (timeline drove)
  PASS: [light][Meta] cards branch #iacMain[data-shown] present (state flow)
  PASS: [light][Meta] card computed opacity === 1 (got 1)
  PASS: [light][Meta] overlay computed opacity === 1 (got 1)
  PASS: [light][Meta] W Fill geometry "236px"
  PASS: [light][Meta] inspect tag === "Meta" (got "Meta")
  PASS: [light][Meta] text colour full-strength (alpha 0.88)
  PASS: full-loop node identity preserved (cards)
  PASS: full-loop node identity preserved (rows)
  PASS: full-loop node identity preserved (select/tag)
  PASS: zero innerHTML writes after init (0)
THEME light: PASS
--- theme=dark ---
  PASS: noflash guard present
  PASS: W Fill tag below task line (+38px, no +7px overlap)
  PASS: zero innerHTML writes in demo JS (in-place updates only)
  PASS: demo data verbatim (14 tokens)
  PASS: __iacTest hook exposed (no DOM rebuild)
  PASS: [dark][Header] select[data-shown] present at resting (timeline drove)
  PASS: [dark][Header] cards branch #iacMain[data-shown] present (state flow)
  PASS: [dark][Header] card computed opacity === 1 (got 1)
  PASS: [dark][Header] overlay computed opacity === 1 (got 1)
  PASS: [dark][Header] W Fill geometry "236px"
  PASS: [dark][Header] inspect tag === "Header" (got "Header")
  PASS: [dark][Header] text colour full-strength (alpha 0.92)
  PASS: [dark][Task] select[data-shown] present at resting (timeline drove)
  PASS: [dark][Task] cards branch #iacMain[data-shown] present (state flow)
  PASS: [dark][Task] card computed opacity === 1 (got 1)
  PASS: [dark][Task] overlay computed opacity === 1 (got 1)
  PASS: [dark][Task] W Fill geometry "236px"
  PASS: [dark][Task] inspect tag === "Task" (got "Task")
  PASS: [dark][Task] text colour full-strength (alpha 0.92)
  PASS: [dark][Meta] select[data-shown] present at resting (timeline drove)
  PASS: [dark][Meta] cards branch #iacMain[data-shown] present (state flow)
  PASS: [dark][Meta] card computed opacity === 1 (got 1)
  PASS: [dark][Meta] overlay computed opacity === 1 (got 1)
  PASS: [dark][Meta] W Fill geometry "236px"
  PASS: [dark][Meta] inspect tag === "Meta" (got "Meta")
  PASS: [dark][Meta] text colour full-strength (alpha 0.92)
  PASS: full-loop node identity preserved (cards)
  PASS: full-loop node identity preserved (rows)
  PASS: full-loop node identity preserved (select/tag)
  PASS: zero innerHTML writes after init (0)
THEME dark: PASS
OVERALL: PASS
```

## How to test
- Open `./index.html` in a browser (light + dark toggle, top-right). Watch one full inspect loop (~7.5s): Header → Task → Meta selection fades in, cards stay solid, W Fill tag sits below task line (38px gap, no overlap).
- Node only (no installs): `node --check ./harness.js`, `node ./harness.js ./original-backup.html` (FAIL), `node ./harness.js ./index.html` (PASS).
- Files in-dir only: `./index.html`, `./original-backup.html`, `./harness.js`, `./REPORT.md`, `./REPLICATE_SPEC.md`, `./demo-original.js`. No access outside this directory, no `rm` on `/tmp`.
