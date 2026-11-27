# Pagination replica — targeted row fix REPORT

## Defect (real-browser QA)
Every run row collapsed into three stacked left-aligned lines:
line 1 `#4821Summarise Q3 support tickets` (id glued to title, no space),
line 2 agent icon+name, line 3 duration alone, ~60% of row width empty on the right,
in BOTH themes. Pagination controls worked (Page 2: `26–50 of 1,284`).

## Root cause
Class mismatch between JS and CSS in `./index.html`:
- JS `buildOnce()` created rows as `el("li","pgn-democ__row")` (copied from `./demo-original.js` naming: `pgn-democ__row` / `pgn-democ__id` / …).
- CSS defined the single-line layout only for `.row`:
  `display:grid; grid-template-columns:64px minmax(0,1fr) auto 64px; gap:10px`.
- No rule ever styled `.pgn-democ__row`, so `<li>` fell back to `display:list-item`/block:
  `row__id`+`row__name` stayed inline with no `gap` (glued `#4821Summarise…`),
  `row__agent{display:flex}` became a block flex (forced line 2),
  `row__time` wrapped to line 3. Right-side columns never formed.
- Not a broader-rule override and not theme-specific — the container simply never got its display mode, so both themes broke identically.

Per `./demo-original.js` each row is one horizontal line with 4 columns:
`span.pgn-democ__id (#id)` + `span.pgn-democ__name (title)` + `span.pgn-democ__agent` + `span.pgn-democ__time`.

## Fix (in-place, `index.html` only)
- JS: `el("li","pgn-democ__row")` → `el("li","row pgn-democ__row")` (keeps original name, gains layout).
- CSS aliases so either name gets the layout, desktop + responsive + hover:
  - `.row{…}` → `.row,.pgn-democ__row{ display:grid; grid-template-columns:64px minmax(0,1fr) auto 64px; gap:10px; … }`
  - `.rows .row:last-child` → `.rows .row:last-child,.rows .pgn-democ__row:last-child`
  - `@media(max-width:640px) .row{…}` → `.row,.pgn-democ__row{…}`
  - `.row:hover` → `.row:hover,.pgn-democ__row:hover`
- `gap:10px` restores the proper visible space between id and title; `white-space:nowrap` on name/agent keeps one line.
- Rule is theme-independent (CSS vars only), so light AND dark are fixed together.

Preserved: `/*noflash*/` guard + paint style + `color-scheme` meta untouched; in-place updates only (`textContent`/`attributes`/`style`, no `innerHTML` writes after init); demo data verbatim (`TOTAL=1284`, 12 titles, 4 agents, `rowFor`/`fmtDur` same as original).

## Verification (node only, in-dir)
- `node --check ./verify-rows.js` + extracted app/noflash scripts `--check` — syntax OK.
- `node ./verify-rows.js` (DOM-stub harness, relative `./index.html` / `./demo-original.js`):
  - static: `/*noflash*/` present, zero `innerHTML` writes in source;
  - css: combined `.row,.pgn-democ__row` is `display:grid`, 4 cols, `gap:10px`; name `nowrap`, agent `flex`;
  - themes: no dark override to `block`; same rule applies light+dark;
  - data: 12 titles + 4 agents verbatim;
  - VISIBLE light AND dark: `li` has `row pgn-democ__row`, 4 `SPAN` cells in one container, `#4821` / `Summarise Q3 support tickets` as separate columns, pix 3×3, `18s`, 25 rows visible page 1, `goTo(2)` → first id `#4796` (`26–50 of 1,284`);
  - full-loop identity: `1..pageCount` + back, all `li/id/name` nodes `===` before;
  - zero `innerHTML` setter calls after init through full loop.
  - `ALL CHECKS PASSED` in light and dark.

## Test manually
Open `./index.html` in a browser, toggle sun/moon (light/dark): rows are one horizontal line (id title … agent … time), gap between `#id` and title, no stacking. Click pages / change `Rows per page`; Page 2 reads `26–50 of 1,284`.

## Not verified
Pixel screenshot vs original Pro bundle (no browser here); touch `pointer:coarse` 40px targets and reduced-motion rely on CSS only, stub-asserted.
