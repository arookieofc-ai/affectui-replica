# Fix: members Plan column blank — targeted fix

## Defect (real-browser QA)
- Members table Plan column BLANK for all 6 rows in both themes — only `Plan` header paints, no values.
- Search filtering works (Mara -> 1 row) — must keep working, with plan values visible in filtered results.

## demo-original.js check (before changing)
Checked `./demo-original.js` `me` array (verbatim demo data):
- `alex` / Alex Morgan / Admin / `plan:"Business"`
- `jonas` / Jonas Weber / Admin / `plan:"Business"`
- `mara` / Mara Klein / Member / `plan:"Pro"`
- `lea` / Lea Braun / Member / `plan:"Pro"`
- `tom` / Tom Fischer / Viewer / `plan:"Free"`
- `sam` / sam@acme.com / Member / `plan:"Pro"` (invited)

Original React render (`ui-smb-pick ui-smb-pick--chip`, `data-plan`, children `[e.plan, chevron]`) DOES render plan values.
So blank column in `./index.html` is a replica bug, NOT original behaviour. Fix is warranted (did not skip).

## Root cause (targeted, 1 line)
In `createMemberRow()` (`./index.html` ~line 372-388):
- `c3` = Plan cell (`span.hide-m`), `planBtn` (`button.pick.chip`) + `planMenu` created.
- `planBtn` was NEVER appended to `c3`. Only `a3`/`planMenu` (hidden) was appended:
  `var a3=el("span","anchor");c3.appendChild(a3);a3.appendChild(planMenu);`
- Hence Plan cell contained only hidden menu -> blank in both themes, header only.
- `syncMemberRow()` correctly set `planBtn.textContent` / `data-plan`, but node was detached -> invisible.
- Role column was correct (`c2.appendChild(roleBtn2)`), Usage/Actions correct. Only Plan missed append.

## Fix (in-place, no rebuild)
Single targeted insertion, nothing else changed:
```
- var a3=el("span","anchor");c3.appendChild(a3);a3.appendChild(planMenu);
+ var a3=el("span","anchor");c3.appendChild(planBtn);c3.appendChild(a3);a3.appendChild(planMenu);
```
- Keeps `/*noflash*/` guard, `meta color-scheme`, CSS tokens, demo data verbatim, in-place updates only, zero `innerHTML` writes after init.
- `planBtn` now visible in Plan cell; `planMenu` still anchored for dropdown; `data-plan` styling (`[data-plan="Business"]`) works.

## Hard proof: md5 BEFORE vs AFTER (must differ)
```
BEFORE (original): 04b2ce15d47b761f36e0026a1ac452e0  ./index.html
AFTER  (fixed)   : ed28ac229f96ec564faf41277c815dab  ./index.html
```
- BEFORE measured via `md5sum ./index.html` before edit (also `cp ./index.html ./original-backup.html`, both `04b2ce15...`).
- AFTER measured via `md5sum ./index.html` after 1-line fix (`ed28ac22...`).
- Hashes DIFFER (1 line / 24 bytes changed: `46411` -> `46435` bytes). No rewrite.

## Harness: `./harness-plan.cjs` (in-dir DOM-stub, node only, no installs)
- Verifies with `node --check` + DOM-stub asserting fixed behaviour as VISIBLE state:
  - Plan VISIBLE (attached + text + `data-plan`) for all 6 in LIGHT and DARK (`setTheme` both).
  - Search `Mara -> 1 row` with plan `Pro` visible in filtered result; reset -> 6 rows.
  - Full-loop node identity (same `row` objects across `renderMembers()`).
  - Zero `innerHTML` writes after init (counter + static `innerHTML` absent).
  - `/*noflash*/`, header `Plan`, demo data verbatim vs `./demo-original.js`.
- Run: `node ./harness-plan.cjs ./original-backup.html` (before) and `node ./harness-plan.cjs ./index.html` (after).

### BEFORE run (original — MUST FAIL) — `node ./harness-plan.cjs ./original-backup.html`, exit=1
```
Target: ./original-backup.html
  PASS: noflash guard present
  PASS: color-scheme meta present
  PASS: Plan header paints
  PASS: demo-original has plan Business (for alex) [x2] / Pro (mara,lea,sam) / Free (tom)
  PASS: index.html demo data has alex -> Business, jonas -> Business, mara -> Pro, lea -> Pro, tom -> Free, sam -> Pro
  PASS: found inline scripts (noflash + main) = 2
  PASS: main script length 27189
  PASS: zero innerHTML writes in main script (static)
  PASS: zero innerHTML in whole file
  PASS: page script executed, window.__st exposed
  PASS: 6 member rows built (got 6)
  PASS: light theme applied
  FAIL: planBtn ATTACHED to DOM for alex [light]
  FAIL: planBtn ATTACHED to DOM for jonas [light]
  FAIL: planBtn ATTACHED to DOM for mara [light]
  FAIL: planBtn ATTACHED to DOM for lea [light]
  FAIL: planBtn ATTACHED to DOM for tom [light]
  FAIL: planBtn ATTACHED to DOM for sam [light]
  (... same 6 FAILs repeated in [dark] ...)
  PASS: search "Mara" filters to 1 row (got mara)
  FAIL: filtered Mara planBtn ATTACHED
  PASS: filter reset shows 6 rows
  PASS: full-loop node identity preserved (same row objects)
  PASS: zero innerHTML writes after init (got 0)
RESULT: FAIL (13 failures)
```
Note: `planBtn.textContent` was `"Business ▾"` etc. on detached node, but NOT attached -> blank column. Matches QA.

### AFTER run (fixed — MUST PASS) — `node ./harness-plan.cjs ./index.html`, exit=0
```
Target: ./index.html
  PASS: noflash guard present
  PASS: color-scheme meta present
  PASS: Plan header paints
  PASS: demo-original has plan Business (for alex) / etc. (all 6)
  PASS: index.html demo data has alex -> Business ... sam -> Pro (all 6 verbatim)
  PASS: found inline scripts (noflash + main) = 2
  PASS: main script length 27213
  PASS: zero innerHTML writes in main script (static)
  PASS: zero innerHTML in whole file
  PASS: page script executed, window.__st exposed
  PASS: 6 member rows built (got 6)
  PASS: light theme applied
  PASS: Plan VISIBLE for alex contains "Business" (got "Business ▾") [light]
  PASS: data-plan="Business" for alex [light]
  PASS: planBtn ATTACHED to DOM for alex [light]
  ... (all 6 PASS in light) ...
  PASS: dark theme applied
  PASS: Plan VISIBLE for alex contains "Business" (got "Business ▾") [dark]
  PASS: planBtn ATTACHED to DOM for alex [dark]
  ... (all 6 PASS in dark) ...
  PASS: search "Mara" filters to 1 row (got mara)
  PASS: row visibility for mara after Mara filter is visible, others hidden
  PASS: filtered Mara plan VISIBLE contains "Pro" (got "Pro ▾")
  PASS: filtered Mara planBtn ATTACHED
  PASS: filter reset shows 6 rows
  PASS: full-loop node identity preserved (same row objects)
  PASS: zero innerHTML writes after init (got 0)
RESULT: PASS
```

## Other verifications (node only)
- `node --check ./harness-plan.cjs` -> OK.
- Extracted main `<script>` to temp file + `node --check` -> OK (27213 bytes, no syntax error), temp removed.
- `rg -c "innerHTML" ./index.html` -> 0 (zero writes).
- `rg -n "noflash" ./index.html` -> 1 (guard kept, line 4).
- `rg -n "plan:" ./index.html` still shows 6 verbatim MEMBERS + invite default `plan:"Pro"` (unchanged).
- Light AND dark both verified via `setTheme('light'/'dark')` in harness with VISIBLE attached checks.

## How to test (browser)
- Open `./index.html` in browser, toggle sun/moon (top-right) light/dark.
- Members tab shows 6 rows with Plan chips: Business/Business/Pro/Pro/Free/Pro.
- Search `Mara` -> 1 row (Mara Klein, Pro visible). Clear -> 6 rows.
- Plan chip dropdown still changes plan + toast; Export CSV includes Plan; invite adds Pro.

## Files
- `./index.html` (fixed, 1-line targeted edit)
- `./original-backup.html` (pre-fix copy for before-run)
- `./harness-plan.cjs` (DOM-stub harness, `node ./harness-plan.cjs ./index.html`)
- `./REPORT.md` (this file)
