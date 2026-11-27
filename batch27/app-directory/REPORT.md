# REPORT — dark Connect button contrast fix (app-directory)

## Defect (from real-browser QA)
- DARK theme only: every card's `Connect` button nearly invisible — dark text on dark-grey button at 100% zoom (light theme fine).
- Category filtering works — must keep working.

## Original behaviour check (`./demo-original.js`)
- Read with relative path `./demo-original.js` before editing.
- Original base rule `.ui-ad__connect` sets NO explicit `color`; it inherits via `.ui-ad button{margin:0;font:inherit;color:inherit}` + `.ui-ad{...color:var(--ui-ad-ink)}`.
- Light `--ui-ad-ink` = `#171717` on `--ui-ad-field` `#ffffff`; dark `--ui-ad-ink` = `#ededed` on `--ui-ad-field` `#2a2a2d` → clearly readable in BOTH themes.
- Conclusion: original does NOT have the bug; replica diverged. Fix aligns replica to original (do not note as wont-fix).

## Root cause in `./index.html`
- Replica `.ad-connect` base rule set `background:var(--field)` but NO `color`.
- `button` elements do NOT inherit `body{color:var(--ink)}` by default (UA `ButtonText` ≈ black).
- Light: black on `#ffffff` → readable (masks bug). Dark: black on `#26262a` → contrast ~1.39, invisible.
- Fix restores original intent with token, not ad-hoc hex.

## Fix (targeted, 1 line, CSS only)
```diff
 .ad-connect{
   ...
   background:var(--field);
+  color:var(--ink);
   font-size:13px;
```
- Dark now `#ededed` on `#26262a` (contrast 12.88). Light now `#171717` on `#ffffff` (contrast 17.93, was 21.00 with UA black — visually unchanged, still dark-on-light).
- No JS touched: `/*noflash*/` guard kept, in-place updates only, zero `innerHTML` after init, demo data verbatim, category/search/filter logic untouched.

## Hard proof — md5 BEFORE vs AFTER (must differ)
- BEFORE (`./original-backup.html`, copy of pre-fix `./index.html`): `2ff370120a97e5ae7c32265c778b1b58`
- AFTER (`./index.html` fixed): `0fcee6261841214895561b5f73ff76f1`
- Hashes differ: YES (single `color:var(--ink);` addition; see diff below).
- `md5sum ./index.html ./original-backup.html`:
```
0fcee6261841214895561b5f73ff76f1  ./index.html
2ff370120a97e5ae7c32265c778b1b58  ./original-backup.html
```

## Harness (`./harness.js`, node only, no installs)
- DOM-stub asserts VISIBLE state (resolved token fg/bg + WCAG contrast ≥4.5) in light AND dark, category filtering, full-loop node identity, zero `innerHTML` writes after init.
- Run: `node ./harness.js ./original-backup.html` (expect FAIL) and `node ./harness.js ./index.html` (expect PASS).
- `node --check ./harness.js` → OK; main JS extracted and `node --check` → OK.

### BEFORE (original-backup.html) — FAILS as required (exit 1)
```
PASS: noflash guard present
PASS: color-scheme meta present
PASS: base .ad-connect rule found
INFO: .ad-connect color decl = (none -> UA ButtonText)
INFO: .ad-connect background decl = var(--field)
INFO: light fg=#000000 bg=#ffffff | dark fg=#000000 bg=#26262a
INFO: light contrast=21.00 dark contrast=1.39
PASS: light Connect readable (contrast 21.00 >= 4.5)
FAIL: dark Connect readable (contrast 1.39 >= 4.5) [DEFECT CHECK]
PASS: light bg still var(--field) (unchanged)
FAIL: base color uses var(--ink) token (missing -> UA black fails dark)
PASS: page scripts present (noflash + main)
PASS: main JS syntax valid (node --check equivalent)
PASS: zero innerHTML writes in main JS source
PASS: stub executed build(), window.__ad exposed
PASS: default category is essentials
PASS: setCategory analytics works
PASS: category filter narrows grid (2 visible)
PASS: visible Connect buttons carry in-place label text
PASS: back to essentials
PASS: search "slack" finds slack card
PASS: filter connected shows >=1 card
PASS: full-loop node identity: card object identical
PASS: full-loop node identity: button object identical
PASS: full-loop node identity: label node identical (in-place text update)
PASS: full-loop node identity: grid children identical (no rebuild)
PASS: zero innerHTML writes after init (stub counter = 0)

== RESULT FAIL (2) for ./original-backup.html ==
exit:1
```

### AFTER (index.html fixed) — PASSES (exit 0)
```
PASS: noflash guard present
PASS: color-scheme meta present
PASS: base .ad-connect rule found
INFO: .ad-connect color decl = var(--ink)
INFO: .ad-connect background decl = var(--field)
INFO: light fg=#171717 bg=#ffffff | dark fg=#ededed bg=#26262a
INFO: light contrast=17.93 dark contrast=12.88
PASS: light Connect readable (contrast 17.93 >= 4.5)
PASS: dark Connect readable (contrast 12.88 >= 4.5) [DEFECT CHECK]
PASS: light bg still var(--field) (unchanged)
PASS: base color uses var(--ink) token (both themes readable, light unchanged)
PASS: page scripts present (noflash + main)
PASS: main JS syntax valid (node --check equivalent)
PASS: zero innerHTML writes in main JS source
PASS: stub executed build(), window.__ad exposed
PASS: default category is essentials
PASS: setCategory analytics works
PASS: category filter narrows grid (2 visible)
PASS: visible Connect buttons carry in-place label text
PASS: back to essentials
PASS: search "slack" finds slack card
PASS: filter connected shows >=1 card
PASS: full-loop node identity: card object identical
PASS: full-loop node identity: button object identical
PASS: full-loop node identity: label node identical (in-place text update)
PASS: full-loop node identity: grid children identical (no rebuild)
PASS: zero innerHTML writes after init (stub counter = 0)

== RESULT PASS for ./index.html ==
exit:0
```

## Full-loop / in-place / innerHTML
- Harness builds stub DOM, runs page JS, loops all categories + queries + connected/available filters, asserts `cards['slack']`, `buttons['slack']`, label node, and `grid.children` array are `===` identical (no rebuild).
- `innerHTML` setter counter = 0; source contains zero `innerHTML`.
- Filtering: essentials default, analytics narrows (2 visible), search `slack` finds card, connected filter ≥1 — all pass before and after (kept working).

## Light unchanged
- `background:var(--field)` untouched; light fg `#171717` vs UA black — both dark-on-light, contrast 17.93 (was 21.00), still passes; dark fixed 1.39 → 12.88.
- Verified via resolved VISIBLE contrast in harness, not just rule presence.

## Files in this dir
- `./index.html` (fixed), `./original-backup.html` (pre-fix), `./harness.js`, `./REPORT.md`
- No files outside this dir touched; no installs/downloads.
