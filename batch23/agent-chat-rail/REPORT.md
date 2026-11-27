# fix-agent-chat-rail — Findings table Price/m clipped + page horizontal scroll

## Defect (real-browser QA)
- Findings `fabric-comparison.csv` table: `Price / m` column (`€14/€11/€8/€10`) exists in DOM but never paints in default view (light + dark).
- `Creases` column sits at the panel's right edge.
- Page shows a PAGE-LEVEL horizontal scrollbar.

## Original check (`./demo-original.js`)
- Read `./demo-original.js` (relative path): it defines the same 5-column table
  `Fabric | Weight (gsm) | Breathes | Creases | Price / m` with rows
  `€14 / €11 / €8 / €10` — data is identical to the replica.
- The bundle is data + components; it carries no `white-space:nowrap` table rule.
  Per the task brief the original fits its panel with all columns visible and no
  page overflow, so this is a replica-introduced width bug — fixed (not noted as wontfix).

## Root cause (`./index.html` CSS)
- `table.cmp thead th { ... white-space:nowrap }` made the header row unbreakable.
  `Weight (gsm)` + `Price / m` forced a min-content width larger than the
  `336px` findings panel (inner ≈ `286px` after `12px` aside + `12px` card padding).
- `table.cmp` used default `table-layout:auto` with `width:100%`, so the wide
  min-content overflowed the `.find-card` / `.findings` column instead of wrapping.
- Result: 5th column painted outside the panel (needs page scroll to see),
  page-level `scrollWidth > clientWidth` → horizontal scrollbar.
- Same in light and dark (rule was theme-agnostic).

## Fix (targeted, everything else identical)
In `./index.html` `<style>` only (no JS/data/DOM changes, Brand filter untouched):
1. `table.cmp { ...; table-layout:fixed; max-width:100% }` — columns share the
   panel width instead of sizing to unbreakable content.
2. `table.cmp thead th { white-space:normal }` (was `nowrap`) — headers may wrap
   (`Weight (gsm)`, `Price / m`) so min-content fits.
3. `table.cmp th, table.cmp td { overflow-wrap:anywhere; min-width:0 }` —
   long tokens (`Linen-cotton 55/45`) break instead of forcing overflow.
4. `.find-card { min-width:0; max-width:100%; overflow:hidden }` — card contains
   the table; with the table fixed this changes nothing visually when it fits.
5. `html,body { max-width:100%; overflow-x:clip }` — guard against any subpixel
   rounding causing page-level scroll; does not clip the column (column now fits).
- Kept: `/*noflash*/` guard + paint style + `color-scheme` meta, in-place updates
  only (no `innerHTML`), demo data verbatim, all other layout/JS identical.

## Verify (node only, in-dir)
- `node --check harness.js` → OK
- `node --check` on extracted inline script → OK, `innerHTML` count `0`
- `node harness.js` (cwd = this dir, reads `./index.html` relative):
  - `56 passed, 0 failed`
  - VISIBLE state in light AND dark: 5 headers incl `Price / m`, `€14/€11/€8/€10`
    in body, card+table `display !== none`, est `286px <= panelInner 286px`.
  - Brand filter: `Brand` button exists, click shows 2 chats (Brand + active),
    table still visible; reset works.
  - Full-loop node identity: `4/4` msg nodes identical, findings cards identical,
    `u1` identity preserved (in-place `textContent`/`classList` tick + `send()` loop).
  - Zero `innerHTML` writes after init (static `0`, dynamic stub counter `0`).
  - `/*noflash*/`, light tokens + `html[data-theme="dark"]` block present.

Open `./index.html` in a browser to eyeball: no page scrollbar at `>1180px`,
all 5 columns inside the Findings panel in both themes; Brand project filters chats.
