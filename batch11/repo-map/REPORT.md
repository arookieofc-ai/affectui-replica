# Repo Map — replica report (fix pass 2026-11-25)

## What was built / fixed
ONE self-contained `index.html` (39.5 KB, no network, system fonts):
codebase treemap (`acme/web`, branch `feat/token-refresh`), 3 agents hopping
between files, loop 1→7 + hold + wrap via 0. Clean-room implementation; no
compiled source copied.

Fix pass for the visual-QA failures (half-cut labels, missing conflict sighting):
1. **Tiles never overflow the container.** `computeLayout()` now clamps every
   folder/tile rect into `[2, W-2]×[2, H-2]` (`clampRect`), so
   `x+w ≤ W-2` and the CSS tile right edge (`x+1.5 + (w-3)`) is always `< W`,
   even under float rounding. Harness asserts this for every tile at every
   step (0–7) and widths 928/938/948/700/560.
2. **Labels are fully readable or fully hidden — never half-cut.**
   - `.rpm-label` changed from `right:0` to `right:8px` (8px left + 8px right
     inset), so text never touches the tile edge.
   - New `textW()` / `labelFits()` check measures the FULL label block at the
     real CSS sizes: basename at 12.5px semibold AND the sub-line (`Conflict` /
     `+add −del` / `N lines`) at 12px regular, plus 2px safety. The estimate is
     deliberately conservative (per-glyph classes + margin) so a "fits" verdict
     never clips in a real browser.
   - `showName`/`showLines` = old height gates (`w≥56`, `h≥28/44`, pins
     `50/66`) AND width fit; when the two-line block is wanted, BOTH lines must
     fit or the whole label hides (`showLines ⇒ showName`; a failing width
     hides both). Reported tiles (`tests/login.spec.ts` w≈68,
     `src/components/Sidebar.tsx` w≈71, `src/components/Toast.tsx` w≈49,
     `docs/setup.md` w≈49) now hide instead of rendering `login.spe` /
     `Sidebar.ts` / `80 line` / half-cut `0`.
3. **Conflict badge kept exactly as the original.** No trigger change, no data
   change.

## Original conflict behaviour (checked in `demo-original.js`)
- The original **HAS a header badge** (not tile-only). Trigger, verbatim:
  `R = files.filter(f => I(f.path).length > 1)` where
  `I(path) = current positions on path with (action ?? "edit") === "edit"`.
  Appearance: `<span class="ui-rpm__sum-warn">1 conflict / N conflicts</span>`
  next to `X of 23 files changed`, plus tile `data-state="conflict"` (amber
  blink), sub-line text `Conflict`, and tooltip row `Conflict` +
  `Two agents are editing this file at once`.
- It fires at exactly **one loop instant: e=3** (`auth: session.ts edit` +
  `ui: session.ts edit`, `tests: session.test.ts edit`), i.e. 1.5 s per
  ~13.6 s loop (`1500 ms` steps, `3600 ms` hold on 7). Cumulative co-edits do
  NOT retrigger it (steps 4–7 show `session.ts` changed by two agents in the
  tooltip history but no badge — same in replica).
- So the QA sighting (`3/23, 13/23, 15/23, 18/23` changed counts = steps
  0/1, 5, 6, 7; step 3 is `8 of 23 changed`) simply never sampled the 1.5 s
  window. Replica reproduces the exact trigger/appearance; harness asserts
  badge `["1 conflict"]` at step 3 and absent at 0,1,2,4,5,6,7, and tile
  `session.ts` in conflict state at step 3.

## Verification (node only — no browser available)
- `node --check` on the extracted inline script: passed.
- `node verify-harness.js` (kept in this dir): **ALL 4416 CHECKS PASSED** —
  per-step/per-width overflow asserts, per-tile full-block width asserts using
  the same `textW`/`labelFits`/`computeLayout` shipped in `index.html`, badge
  trigger asserts, and regression asserts that the four reported tiles hide.
- Light + dark: layout/label logic is theme-independent; tokens unchanged from
  the verified pass (light default matching original; dark via sun/moon toggle,
  amber `#fbbf24`/`#451a03`/`#fde68a`, surface `#1c1c1f`, page `#101012`).
  No browser was available to screenshot; node asserts cover geometry and
  visibility decisions in both themes' shared code path.

## How to test
Open `index.html` in a browser. Watch agents hop every 1.5 s; at the
`8 of 23 changed` instant the header shows `1 conflict` and `src/lib/session.ts`
blinks amber with sub-line `Conflict`. No tile label is ever half-cut in either
theme; small tiles show no label at all. Top-right sun/moon button switches
themes; shrink below 560 px for the stacked list.
