# Files — Folders / Overview (`files`) — TARGETED FIX

Single file `index.html` (inline CSS + JS, no external deps, system fonts only).
This is a targeted fix of the existing file, not a rebuild.

## Defects fixed (from real-browser QA)

### (1) Four blank grey SKELETON cards above Folders NEVER resolve
`./demo-original.js` check: the original DOES have a skeleton row, but ONLY as the
loading state: `n ? skeleton(4x ui-as-folder-card data-skel) : B.length ? grid : empty`.
It is never an extra row above real cards — when `loading` is false the original
renders real folder cards, not skeleton + cards.

Replica root cause: `<div class="skel-wrap" id="folderSkel" hidden>` was always
visible in a real browser because author CSS `.skel-wrap{display:grid}` overrides
the UA `[hidden]{display:none}` rule. JS never touches `folderSkel`, so the 4 grey
cards sat above the real grid forever (25s+, both themes).

Fix: one CSS line `[hidden]{display:none!important}` so `hidden` works. The dead
row is now correctly hidden (loading=false default, matching the original's
non-loading state). No div deleted, no data changed, no JS re-render.

### (2) Shared filter desync (count 4 -> 2 but list still shows 4)
`./demo-original.js` check: `B=A.filter(M All or access===M)`, count=`B.length`,
key=`M|P|I|R`. Filtering MUST hide non-matching folders; original does not show
Private folders under Shared.

Replica root cause: same CSS bug. `.folders{display:grid}` and
`.folder-card{display:flex}` override `[hidden]`, so `updateFolders()` setting
`rec.node.hidden=true` had no visual effect. Count updated (textContent) but all
4 cards stayed visible.

Fix: same one-line `[hidden]` fix. Existing `updateFolders()` logic was already
correct (verified by reading it); with `hidden` honoured, visible rows match the
count for every filter: All=4, Shared=2 (Q3 Campaign, Brand assets),
Private=2 (Hiring, Research). Same fix also repairs `.templates` hiding and
empty states. In-place updates only, node identity preserved.

### SECONDARY: template author names truncate ('Jonas Web…', 'Jo…', 'Al…')
`./demo-original.js` check: template meta is single-line with ellipsis by design:
`.ui-as-files-meta{overflow:hidden;min-width:0;white-space:nowrap;text-overflow:ellipsis}`
plus `.ui-as-files-access{display:inline-flex;flex:none}` with `·` separator.
The replica already does the same (`.tpl-name` + `.tpl-meta .clip` ellipsis,
`.tpl-access{flex:none}`). Card width (200px) matches the wrap/gap language of the
original; no width is specified in `demo-original.js` to prove the replica wrong.
Per instructions ("fix widths only if the replica's are wrong"), widths were NOT
changed. Truncation on narrow cards matches the original's single-line ellipsis
behaviour.

## Change (one line)
- `index.html`: after `html{-webkit-tap-highlight-color:transparent}` added
  `[hidden]{display:none!important}` + fix comment.
- Preserved: `/*noflash*/` guard first in `<head>`, in-place updates only, zero
  `innerHTML`/`outerHTML`/`insertAdjacentHTML` writes after init, demo data verbatim
  (Q3 Campaign/Brand assets/Hiring/Research + Design-Book/Brand-Guidelines/
  Campaign-Budget/Weekly-Report + Alex Morgan/Jonas Weber), all `:hover` inside
  `@media (hover:hover) and (pointer:fine)`, `tabular-nums`, tokens, light+dark.

## HARD PROOF — md5 BEFORE vs AFTER (must differ)
```
ff3e453c9a1c9e039c3da057291d56d3  ./original-backup.html
0f229caccbad382361189638df19dc2c  ./index.html
```
BEFORE (`./index.html` before edit) = `ff3e453c9a1c9e039c3da057291d56d3`
AFTER (`./index.html` after edit) = `0f229caccbad382361189638df19dc2c`
They differ (one-line CSS fix, 33894 -> 34042 bytes).

## HARD PROOF — harness FAIL on original, PASS on fixed
Harness: `./harness-targeted.js` (in-dir DOM-stub, node only, no installs).
Models real-browser visibility (author `display:grid/flex` overriding `[hidden]`
unless `[hidden]{display:none!important}` exists), asserts skeleton hidden +
visible folder rows == count in light AND dark, plus full-loop node identity and
zero innerHTML writes after init.

BEFORE (original-backup.html) — FAIL as required:
```
ok [original-backup.html]: bytes=33894
ok [original-backup.html]: noflash guard first in head
ok [original-backup.html]: noflash meta+bg present
ok [original-backup.html]: v5 hover gated + polish tokens
ok [original-backup.html]: design tokens present
ok [original-backup.html]: zero innerHTML writes (static)
ok [original-backup.html]: app JS syntax valid
ok [original-backup.html]: hidden-fix rule ABSENT
ok [original-backup.html]: app init executed
FAIL [original-backup.html]: defect(1) skeleton row VISIBLE in light (4 grey cards never resolve; hidden is overridden by display:grid)
```

AFTER (index.html fixed) — PASS:
```
ok [index.html]: bytes=34042
ok [index.html]: noflash guard first in head
ok [index.html]: noflash meta+bg present
ok [index.html]: v5 hover gated + polish tokens
ok [index.html]: design tokens present
ok [index.html]: zero innerHTML writes (static)
ok [index.html]: app JS syntax valid
ok [index.html]: hidden-fix rule PRESENT
ok [index.html]: app init executed
ok [index.html]: defect(1) skeleton hidden in light
ok [index.html]: defect(1) skeleton hidden in dark
ok [index.html]: defect(2) [light/All] count=4 rows=[Brand assets,Hiring,Q3 Campaign,Research]
ok [index.html]: defect(2) [light/Shared] count=2 rows=[Brand assets,Q3 Campaign]
ok [index.html]: defect(2) [light/Private] count=2 rows=[Hiring,Research]
ok [index.html]: defect(2) [dark/All] count=4 rows=[Brand assets,Hiring,Q3 Campaign,Research]
ok [index.html]: defect(2) [dark/Shared] count=2 rows=[Brand assets,Q3 Campaign]
ok [index.html]: defect(2) [dark/Private] count=2 rows=[Hiring,Research]
ok [index.html]: full-loop node identity preserved (4 folders, 4 templates)
ok [index.html]: zero innerHTML writes after init
ok [index.html]: light AND dark verified (toggle light -> dark)

PASS [index.html]: skeleton hidden, filters match count, identity kept, zero writes, light+dark
```

## Verify with node only (no installs/downloads)
- `node --check ./harness-targeted.js` -> ok (`HARNESS_TARGETED_CHECK_OK`)
- `node --check ./harness.js` -> ok (`HARNESS_CHECK_OK`)
- `node --check` on `.html` is N/A (unknown extension); inline app JS syntax is
  validated inside the harness via `new vm.Script(appCode)`.
- `node ./harness-targeted.js ./original-backup.html` -> FAIL (exit 1, above)
- `node ./harness-targeted.js ./index.html` -> PASS (exit 0, above)
- Legacy `node ./harness.js` still passes (visible text, identity, light+dark).

## How to test (browser)
- Open `index.html` (any static server, no build). No skeleton row above Folders.
- Folders tabs: All=4, Shared=2 (Brand assets, Q3 Campaign), Private=2 (Hiring, Research).
- Toggle theme top-right: light + dark both finished, no grey-on-grey.
- Try sort, grid/list, searches (`q3`, `brand`), Create folder, Add template, Escape.
