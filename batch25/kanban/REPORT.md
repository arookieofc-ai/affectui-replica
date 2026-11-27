# Kanban repair — REPORT

Targeted fix of existing `./index.html` (no rebuild). Work confined to this directory. Node only, no installs.

## Hard proof: hashes differ

- BEFORE (`./original-backup.html`, copy of original `./index.html` before edits): `c4194e5e6c298e347e66346ac951abba`
- AFTER (`./index.html` after edits): `65222287f459108874b2ae09424d2ab2`
- Command: `md5sum ./index.html` before editing, `cp ./index.html ./original-backup.html`, then `md5sum ./index.html` after editing. Hashes MUST differ — they do.
- `node --check` on extracted app JS: OK (`node --check ./.check-app.js` → pass; `node --check ./index.html` expectedly fails with `ERR_UNKNOWN_FILE_EXTENSION` because it is HTML, so JS was extracted and checked).

## demo-original.js checked BEFORE changing anything

Read `./demo-original.js` (minified React) and `./REPLICATE_SPEC.md` with relative paths. Original behaviour:

- Columns: `low/medium/high/done` (Low priority, Medium priority, High priority, Completed). Cards: 11 (`k1..k11`: 3+3+3+2).
- Scope filter: `$/visible = columns.filter(!hidden && (scope==='all' || (scope==='done' ? tone==='done' : tone!=='done')))`. I.e. **Open hides the Completed column; Completed shows only Completed**. Counts: All 11, Open 9, Completed 2.
- Layout CSS: `.ui-kbn{height:100%;min-height:0}`, `.ui-kbn__board{flex:1;min-height:0}`, `.ui-kbn-col{min-height:0}`, `.ui-kbn-col__cards{flex:1;min-height:0;overflow-y:auto}` — board fills available height, cards scroll inside column, never sliced mid-card.
- Therefore the reported defects are real replica bugs, NOT original behaviour. Fix matches original (hide columns by scope, fill frame). No `do NOT fix` case.

Constraints kept: `/*noflash*/` guard untouched, in-place updates only (existing nodes updated via `textContent`/`hidden`/attrs, `appendChild` moves preserve identity), zero `innerHTML` writes after init (file contains 0× `innerHTML`), demo data verbatim (11 cards, 4 cols unchanged).

## Defects + root causes + targeted fixes (all in `./index.html`)

### (1) Board only top ~1/3, cards sliced, blank grey + white line below
Root: missing `[hidden]{display:none!important}`. CSS `.list/.issue/.nonedisplay/.modal/.menu` use `display:flex/grid`, which overrides the `hidden` attribute in real browsers, so hidden list/issue/empty/modal/menu all stayed visible and stacked in `.main` (flex column, 4× `flex:1` siblings → board got ~1/4 height, inner scroll sliced card 2, rest was blank grey + stray white menu/line). Plus `.app/.main` used only `min-height:100vh` (no fixed height) and `.col{min-height:200px}` / `.cards{min-height:60px}` instead of original `min-height:0`.
Fix (CSS only):
- Add `[hidden]{display:none!important}` right after `*{box-sizing:border-box}`.
- `.app{...min-height:100vh}` → `...min-height:100vh;height:100vh`.
- `.main{...min-height:100vh}` → `...height:100vh;min-height:0;overflow:hidden`.
- `.col{...min-height:200px}` → `...min-width:0;min-height:0`.
- `.cards{...min-height:60px}` → `...min-height:0`.

### (2) Theme toggle half off-screen / covered
Root: same `[hidden]` bug. Hidden `prev/next/close/pos` buttons in `.bar` (`display:inline-grid` overrides `hidden`) stayed visible, occupying space and pushing the theme button past the right edge; hidden `modal` (`position:fixed;inset:0;z-index:70;display:flex` overrides `hidden`) covered the page, intercepting clicks.
Fix: `[hidden]` rule above hides them; theme button (`aria-label="Toggle theme"`) is then last visible item, `hidden==false`, rect within viewport, no overlay. Verified in harness as VISIBLE state.

### (3) `Open 9` does nothing
Root (two parts):
- (a) `[hidden]` bug: `sec.hidden=true` had no effect (`display:flex` overrides), so hiding Completed never hid anything; `modal` overlay also blocked clicks in a real browser.
- (b) Logic bug: `visibleCols()` ignored scope (`return COLS.filter(hidden only)`), while original filters by scope+tone. `renderBoard`/`renderList` only hid by `hidden`, and never hid stale card/row nodes (only `appendChild` list items, leaving filtered-out nodes visible). `renderList` hid groups only by `hidden`, not scope.
Fix (JS only, in place):
- `visibleCols()` → `return COLS.filter(c => hidden<0 && (scope==='all' || (scope==='done' ? tone==='done' : tone!=='done')))`.
- `renderBoard`: track `seen={}`, `n.art.hidden=false;seen[id]=1` for visible, then `for(id in cardEls) if(!seen[id]) hidden=true`.
- `renderList`: replace two-line hide with `Object.keys(groupEls).forEach(k => hidden = vis2.indexOf(colOf(k))<0)`, plus `n.row.hidden=false;seenR[id]=1` and trailing hide loop.

## Harness (in-dir, node only, DOM-stub, light AND dark, identity, zero writes)

`./harness.js` (run: `node ./harness.js ./index.html` or `./original-backup.html`):
- Static: noflash, color-scheme, zero `innerHTML` in file, `[hidden]` rule, layout heights, scope-aware `visibleCols`, light+dark tokens, 11 cards verbatim.
- Dynamic stub (`vm` + minimal `document/localStorage/window`): boots app, asserts VISIBLE state via effective visibility (`hidden` + `[hidden]` rule, so stub matches real-browser cascade), clicks All/Open/Completed tabs, toggles theme light→dark→light, re-asserts filters in dark, full-loop (`scopes×sorts×views`) node identity (`===`) and `innerHTMLWrites===0`.

### Before (original) — MUST FAIL — `node ./harness.js ./original-backup.html` (exit 1)

```
== static [./original-backup.html] ==
  PASS noflash guard present
  PASS color-scheme meta present
  PASS noflash bg css present
  PASS zero innerHTML writes in file
  FAIL [hidden]{display:none!important} rule present
  FAIL .app height:100vh (fills frame)
  FAIL .main height:100vh/min-height:0/overflow:hidden
  FAIL .col min-height:200px removed (was height bug)
  FAIL .col min-height:0 + min-width:0
  FAIL .cards min-height:60px removed
  FAIL visibleCols scope-aware (all/done/open)
  PASS light AND dark tokens present
  PASS demo data: 11 cards verbatim
== dynamic light ==
  PASS app booted, window.__kbn exposed
  PASS board visible at init
  FAIL list hidden in board view (effective, no blank grey area)
  FAIL issue hidden at init (effective)
  FAIL modal hidden at init (no overlay, effective)
  FAIL menu hidden at init (no stray line, effective)
  FAIL empty hidden when cards exist (effective)
  PASS 4 columns visible when scope=all
  PASS 11 cards visible when scope=all
  PASS 3 scope tabs present
  PASS All tasks selected at init
  PASS Open not selected at init
  PASS All tasks shows 11
  PASS Open shows 9
  PASS theme toggle present
  PASS theme toggle not hidden
  PASS theme toggle fully on-screen (rect within 1280)
  FAIL theme clickable: no modal/menu overlay (effective)
  PASS prev/next/close hidden when not in issue (not pushing theme off)
  FAIL board is sole visible main child (fills frame, no blank grey area) :: visible=4
  PASS click Open sets scope=open
  PASS Open selected after click
  PASS All tasks deselected after Open click
  FAIL Open shows 3 columns (Completed hidden) :: found=4
  FAIL Completed column hidden when Open :: Low priority,Medium priority,High priority,Completed
  FAIL Open shows 9 visible cards :: found=11
  PASS click Completed sets scope=done
  PASS Completed selected after click
  FAIL Completed shows 1 column :: found=4
  FAIL Completed shows 2 visible cards :: found=11
  PASS click All restores scope=all
  PASS All restores 4 columns
  PASS All restores 11 cards
== dynamic dark ==
  PASS theme toggle switches to dark
  PASS theme persisted to localStorage
  PASS [dark] 4 columns visible
  PASS [dark] 11 cards visible
  PASS [dark] Open filter works
  FAIL [dark] Open hides Completed :: found=4
  FAIL [dark] Open shows 9 cards :: found=11
  PASS theme toggles back to light
== identity + zero writes ==
  PASS node identity preserved across full loop (cards)
  PASS node identity preserved across full loop (rows)
  PASS zero innerHTML writes after init

RESULT 36 pass / 21 fail
```

### After (fixed) — MUST PASS — `node ./harness.js ./index.html` (exit 0)

```
== static [./index.html] ==
  PASS noflash guard present
  PASS color-scheme meta present
  PASS noflash bg css present
  PASS zero innerHTML writes in file
  PASS [hidden]{display:none!important} rule present
  PASS .app height:100vh (fills frame)
  PASS .main height:100vh/min-height:0/overflow:hidden
  PASS .col min-height:200px removed (was height bug)
  PASS .col min-height:0 + min-width:0
  PASS .cards min-height:60px removed
  PASS visibleCols scope-aware (all/done/open)
  PASS light AND dark tokens present
  PASS demo data: 11 cards verbatim
== dynamic light ==
  PASS app booted, window.__kbn exposed
  PASS board visible at init
  PASS list hidden in board view (effective, no blank grey area)
  PASS issue hidden at init (effective)
  PASS modal hidden at init (no overlay, effective)
  PASS menu hidden at init (no stray line, effective)
  PASS empty hidden when cards exist (effective)
  PASS 4 columns visible when scope=all
  PASS 11 cards visible when scope=all
  PASS 3 scope tabs present
  PASS All tasks selected at init
  PASS Open not selected at init
  PASS All tasks shows 11
  PASS Open shows 9
  PASS theme toggle present
  PASS theme toggle not hidden
  PASS theme toggle fully on-screen (rect within 1280)
  PASS theme clickable: no modal/menu overlay (effective)
  PASS prev/next/close hidden when not in issue (not pushing theme off)
  PASS board is sole visible main child (fills frame, no blank grey area)
  PASS click Open sets scope=open
  PASS Open selected after click
  PASS All tasks deselected after Open click
  PASS Open shows 3 columns (Completed hidden)
  PASS Completed column hidden when Open
  PASS Open shows 9 visible cards
  PASS click Completed sets scope=done
  PASS Completed selected after click
  PASS Completed shows 1 column
  PASS Completed shows 2 visible cards
  PASS click All restores scope=all
  PASS All restores 4 columns
  PASS All restores 11 cards
== dynamic dark ==
  PASS theme toggle switches to dark
  PASS theme persisted to localStorage
  PASS [dark] 4 columns visible
  PASS [dark] 11 cards visible
  PASS [dark] Open filter works
  PASS [dark] Open hides Completed
  PASS [dark] Open shows 9 cards
  PASS theme toggles back to light
== identity + zero writes ==
  PASS node identity preserved across full loop (cards)
  PASS node identity preserved across full loop (rows)
  PASS zero innerHTML writes after init

RESULT 57 pass / 0 fail
```

## How to test

- Browser: open `./index.html` in a browser. Board fills viewport (no blank grey, no stray line, cards not sliced). Theme toggle top-right fully visible/clickable, toggles `data-theme` light/dark (persisted `kanban-theme`). Click `Open 9` → Completed hides, 9 cards, `All tasks` deselected; `Completed` → only Completed (2); `All tasks 11` → 4 cols/11. Check both themes.
- Node: `node ./harness.js ./index.html` (pass) and `node ./harness.js ./original-backup.html` (fail). JS syntax: extract longest `<script>` and `node --check` it.
- Light AND dark verified via toggle in harness (same visible assertions in both) + both token blocks present.
