# KPI Board — targeted fix REPORT (2026-11-27)

Workdir: this directory only. All paths below are relative (`./index.html`, `./demo-original.js`, `./harness-fix.js`, `./original-backup.html`). No installs, no downloads, `node` only.

## Triage — checked `./demo-original.js` first

`./demo-original.js` DOES contain the reported behaviours, so the 3 defects are real replica bugs (not original behaviour). Do-NOT-fix rule does not apply.

Evidence (`./demo-original.js`):
- ranges: `[{id:'7d',label:'Last 7 days'},{id:'30d',...},{id:'90d',label:'Last 90 days'}]`
- `overview:{title:'Sales overview',...}` with `labels` like `16 Jul … 29 Aug … Today` and `current/previous` series
- `focus:{title:'Pro license',...}` with `values` sparkline
- chart component `n` with `variant:'area'/'sparkline', axis:'x'` — original distributes X labels across full width
- picker CSS: `.ui-kb__pick{max-width:60%}` as direct child of `.ui-kb__bar` (fits); replica nests picker in `.kb-controls`, so `60%` truncates
- original has no `overflow:visible` on chart svg; replica added it, causing dark overflow

Per spec: fixed replica to match original.

## Changes — `./index.html` targeted only (no rebuild)

Kept `/*noflash*/` guard first in `<head>`, in-place updates only, zero `innerHTML` writes after init, demo data verbatim.

1. **(1) Date-range selector too narrow (`Last …`):** root cause `.kb-pick{max-width:60%}` now resolves against `.kb-controls` (shrink-to-fit, ~90px) instead of bar (~568px). Fix (CSS-only):
   - `.kb-chart` / `.kb-trend` untouched for this; added:
   - `.kb-controls .kb-pick{flex:0 0 auto;min-width:max-content;max-width:none}`
   - `.kb-controls .kb-pick-btn{max-width:none;flex:0 0 auto}`
   - Result: `Last 7 days` / `Last 30 days` / `Last 90 days` fit full text. Segment picker (`.kb-wide .kb-pick{max-width:220px}`) unchanged.

2. **(2) Sales overview X labels bunched left ~110px:** `R.ovTicks` reuses `.kb-legend` (flex-start, gap 8px) so `tickA/B/C` (first/mid/last) bunch. Original `axis:'x'` spreads across ~600px. Fix (CSS-only, no JS):
   - `.kb-chart{...min-width:0;overflow:hidden;max-width:100%}` (keeps axis inside)
   - `.kb-area+.kb-legend{display:flex;justify-content:space-between;width:100%;max-width:100%;gap:8px}`
   - `.kb-area+.kb-legend>span{flex:0 0 auto;min-width:0}`
   - Result: `5 Oct/8 Oct/Today` (7d), `13 Sep/28 Sep/Today` (30d), `16 Jul/29 Aug/Today` (90d) at left/center/right across full axis, per original.

3. **(3) DARK Pro sparkline overflows right border:** `.kb-chart svg{overflow:visible}` + `.kb-trend` with no width/clip lets 300px svg overflow ~270px content. Fix:
   - `.kb-chart svg{...max-width:100%;overflow:hidden}` (was `overflow:visible`)
   - `.kb-trend{...min-width:0;overflow:hidden;max-width:100%}`
   - `.kb-trend svg{display:block;width:100%;max-width:100%;height:auto;overflow:hidden}`
   - Theme-agnostic (outside `[data-theme]`), so light AND dark clipped inside card. Card keeps `overflow:visible` so `.kb-menu` still opens. Segment dropdown + range switching untouched and verified.

Full diff is 5 CSS rules + comment `/*targeted-fix 2026-11-27...*/`; no JS logic changed, no data changed.

## HARD PROOF (a) md5 BEFORE and AFTER — MUST differ

```
8b30823cbbe406e1c32c1ac0a09caf1f  ./index.html BEFORE
c0fd2b91e9d8237cf0818821d478b265  ./index.html AFTER
8b30823cbbe406e1c32c1ac0a09caf1f  ./original-backup.html (copy of BEFORE)
```

Verified:
```
$ md5sum ./index.html ./original-backup.html
c0fd2b91e9d8237cf0818821d478b265  ./index.html
8b30823cbbe406e1c32c1ac0a09caf1f  ./original-backup.html
```
Hashes differ — file change is real (previous no-change failure avoided by keeping `./original-backup.html`).

## HARD PROOF (b) harness MUST FAIL on original, PASS on fixed

Harness: `./harness-fix.js` (in-dir DOM-stub, `node --check` clean, no deps).
Verifies as VISIBLE state in light AND dark, full-loop node identity, zero `innerHTML` writes after init.

```
$ node --check ./harness-fix.js && echo HARNESS_SYNTAX_OK
HARNESS_SYNTAX_OK
$ node --check ./demo-original.js && echo DEMO_SYNTAX_OK
DEMO_SYNTAX_OK
```

### FAIL case — original

```
$ node ./harness-fix.js ./original-backup.html; echo "fail_exit=$?"
FAIL [./original-backup.html]: 14 check(s) failed
  FAIL: FIX1: .kb-controls .kb-pick max-width:none
  FAIL: FIX1: .kb-controls .kb-pick min-width:max-content (fits Last 90 days)
  FAIL: FIX1: .kb-controls .kb-pick-btn max-width:none (no truncation)
  FAIL: FIX2: .kb-area+.kb-legend justify-content:space-between (ticks spread)
  FAIL: FIX2: ticks container width:100% (full axis)
  FAIL: FIX3: no overflow:visible on .kb-chart svg
  FAIL: FIX3: .kb-chart overflow:hidden
  FAIL: FIX3: .kb-chart svg overflow:hidden
  FAIL: FIX3: .kb-trend overflow:hidden (clips pro sparkline)
  FAIL: FIX3: .kb-trend min-width:0
  FAIL: FIX3: .kb-trend svg width:100% (inside card)
  FAIL: FIX3: .kb-trend svg max-width:100%
  FAIL: FIX3: .kb-trend svg overflow:hidden
  FAIL: targeted-fix comment present
  PASS: 36 check(s) passed
    ok: noflash guard present
    ok: noflash theme key
    ok: noflash prefers-color-scheme
    ok: noflash light bg
    ok: noflash dark bg
    ok: meta color-scheme
    ok: zero innerHTML writes after init
    ok: zero outerHTML writes
    ok: zero replaceChildren
    ok: zero document.write
    ok: demo verbatim contains "Sales overview"
    ok: demo verbatim contains "Pro license"
    ok: demo verbatim contains "Last 7 days"
    ok: demo verbatim contains "Last 30 days"
    ok: demo verbatim contains "Last 90 days"
    ok: demo verbatim contains "16 Jul"
    ok: demo verbatim contains "29 Aug"
    ok: demo verbatim contains "Today"
    ok: demo verbatim contains "DEMO_DATA"
    ok: demo verbatim contains "Licenses sold"
    ok: light theme tokens
    ok: dark theme tokens
    ok: range picker present
    ok: segment picker present
    ok: setRange/setSegment present
    ok: __kb API present
    ok: range/segment refs
    ok: stub: __kb API live
    ok: stub: light theme VISIBLE
    ok: stub: light full-loop identity kept (7d,30d,90d)
    ok: stub: light ticks VISIBLE 5 Oct/8 Oct/Today ; 13 Sep/28 Sep/Today ; 16 Jul/29 Aug/Today
    ok: stub: light range labels full text (Last 7/30/90 days)
    ok: stub: segment dropdown works (pro/team/all, nodes kept)
    ok: stub: dark theme VISIBLE
    ok: stub: dark full-loop identity kept + ticks VISIBLE
    ok: stub: zero innerHTML writes after init (got 0)
exit=1
```

### PASS case — fixed

```
$ node ./harness-fix.js ./index.html; echo "pass_exit=$?"
PASS [./index.html]: 51 checks passed (light+dark VISIBLE, identity kept, zero writes)
  ok: noflash guard present
  ok: noflash theme key
  ok: noflash prefers-color-scheme
  ok: noflash light bg
  ok: noflash dark bg
  ok: meta color-scheme
  ok: zero innerHTML writes after init
  ok: zero outerHTML writes
  ok: zero replaceChildren
  ok: zero document.write
  ok: demo verbatim contains "Sales overview"
  ok: demo verbatim contains "Pro license"
  ok: demo verbatim contains "Last 7 days"
  ok: demo verbatim contains "Last 30 days"
  ok: demo verbatim contains "Last 90 days"
  ok: demo verbatim contains "16 Jul"
  ok: demo verbatim contains "29 Aug"
  ok: demo verbatim contains "Today"
  ok: demo verbatim contains "DEMO_DATA"
  ok: demo verbatim contains "Licenses sold"
  ok: FIX1: .kb-controls .kb-pick max-width:none
  ok: FIX1: .kb-controls .kb-pick min-width:max-content (fits Last 90 days)
  ok: FIX1: .kb-controls .kb-pick-btn max-width:none (no truncation)
  ok: FIX2: .kb-area+.kb-legend justify-content:space-between (ticks spread)
  ok: FIX2: ticks container width:100% (full axis)
  ok: FIX3: no overflow:visible on .kb-chart svg
  ok: FIX3: .kb-chart overflow:hidden
  ok: FIX3: .kb-chart svg overflow:hidden
  ok: FIX3: .kb-trend overflow:hidden (clips pro sparkline)
  ok: FIX3: .kb-trend min-width:0
  ok: FIX3: .kb-trend svg width:100% (inside card)
  ok: FIX3: .kb-trend svg max-width:100%
  ok: FIX3: .kb-trend svg overflow:hidden
  ok: light theme tokens
  ok: dark theme tokens
  ok: targeted-fix comment present
  ok: fix applies light+dark (not dark-only)
  ok: range picker present
  ok: segment picker present
  ok: setRange/setSegment present
  ok: __kb API present
  ok: range/segment refs
  ok: stub: __kb API live
  ok: stub: light theme VISIBLE
  ok: stub: light full-loop identity kept (7d,30d,90d)
  ok: stub: light ticks VISIBLE 5 Oct/8 Oct/Today ; 13 Sep/28 Sep/Today ; 16 Jul/29 Aug/Today
  ok: stub: light range labels full text (Last 7/30/90 days)
  ok: stub: segment dropdown works (pro/team/all, nodes kept)
  ok: stub: dark theme VISIBLE
  ok: stub: dark full-loop identity kept + ticks VISIBLE
  ok: stub: zero innerHTML writes after init (got 0)
exit=0
```

## Verify

- `/*noflash*/` first, `html{background:#fafaf9}` + `html[data-theme="dark"]{background:#101012}` + `meta color-scheme` kept.
- In-place only: `build()` once, `paintStatic/paintNumbers/paintChanges/paintFocusSel` update text/attrs; single `while(root.firstChild)` in `build` (init), zero `innerHTML/outerHTML/replaceChildren/document.write`.
- Demo verbatim: `DEMO_DATA` with `Sales overview`, `Pro license`, `Last 7/30/90 days`, `16 Jul/29 Aug/Today` unchanged.
- Light AND dark: harness sets `data-theme` light→dark, loops `7d/30d/90d` + `pro/team/all`, asserts same node objects (`===`), ticks non-empty, range labels full, `overflow:hidden` theme-agnostic.
- Segment dropdown + range switching work (stub `__kb.setRange/setSegment`, nodes kept).

## How to test

```
md5sum ./index.html ./original-backup.html
node --check ./harness-fix.js
node ./harness-fix.js ./original-backup.html   # expect FAIL exit 1
node ./harness-fix.js ./index.html             # expect PASS exit 0
# open ./index.html in browser, toggle sun/moon, switch Last 7/30/90 days + All/Pro/Team
```
