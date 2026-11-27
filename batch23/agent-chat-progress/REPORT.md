# fix-agent-chat-progress — targeted fix report

## Defects (from real-browser QA)
1. All tool-call titles paint GLUED without spaces in both themes:
   `directory.match_peopleChecked the call's people…`, `notion.searchSearched…`, `drive.read_fileRead…` — tool name and description run together.
2. Progress step 5 paints truncated: `Fix how team and customer are told a…` — cut off mid-word.
3. `3 earlier steps` expand works — must keep working.

## Original behaviour (checked ./demo-original.js before changing)
- Tools are rendered via a dedicated component with separate `name` + `summary` props (`re({...e.tool})`, e.g. `name:'notion.search'`, `summary:'Searched your call notes in Notion'`, `name:'directory.match_people'`, `summary:'Checked the call's people…'`).
  Skeleton for the same card (`ui-prg-skel-card`) is `display:flex; align-items:center; gap:10px` with name and summary as separate flex children — i.e. separate elements with a visible gap, never one concatenated string. The replica gluing does NOT match the original, so it is a real defect.
- Step labels in the original CSS (`F` in ./demo-original.js):
  `.ui-prg-step__label{min-width: 0;overflow-wrap: anywhere}`
  No `white-space:nowrap`, no `text-overflow:ellipsis` — labels wrap to two lines, never single-line ellipsis. The replica's single-line ellipsis truncating step 5 mid-word does NOT match the original, so it is a real defect.

## Root causes (in ./index.html)
1. Glued tools: `.tool__main{flex:1;min-width:0;}` had no layout for its children. `.tool__name` and `.tool__sum` are two inline `<span>`s inside an inline-context container with no `gap`/`margin`, so they paint as one concatenated run `name+summary` with zero separation.
2. Truncated step 5: `.ui-prg-step__label{display:block;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}` forced every step to a single ellipsis line. At `--side:300px` the 38-char `Fix how team and customer are told apart` overflows and ellipsizes mid-word. Original wraps.

## Fixes (targeted, everything else identical)
- `.tool__main` → `flex:1;min-width:0;display:flex;align-items:baseline;gap:6px;`
- `.tool__name` → added `flex:none;max-width:45%;` (keeps existing font/ellipsis, truncates individually, never glues)
- `.tool__sum` → added `flex:1;min-width:0;` (keeps existing font/ellipsis)
- `.ui-prg-step__label` → `display:block;min-width:0;overflow-wrap:anywhere;` (matches original; removes wrong nowrap/ellipsis, restores wrap so step 5 shows in full)
- No other CSS/JS/HTML touched. Kept `/*noflash*/` guard + `html{background…}` + `color-scheme` meta, in-place updates only, zero `innerHTML` writes after init, demo data verbatim, `title` attrs kept.

## Verification (node only, in-dir)
- `node --check ./verify-fix.cjs` — syntax OK.
- Extracted main `<script>` from ./index.html and `node --check` — syntax OK.
- `node ./verify-fix.cjs` (DOM-stub harness, no deps) — ALL CHECKS PASSED:
  - static: noflash/meta/bg kept, zero `innerHTML` in file, demo data verbatim, original wrap/gap confirmed, CSS gap + wrap present;
  - runtime stub runs the real page script: 3 tool cards each have 1×`.tool__name` + 1×`.tool__sum` as separate children under flex+gap; name nodes equal exactly `notion.search` / `drive.read_file` / `directory.match_people` (not glued);
  - step-5 node text + `title` equal full `Fix how team and customer are told apart`;
  - VISIBLE state re-asserted in `light` AND `dark` via `__prg.setTheme` (structure unchanged, tokens switch);
  - `3 earlier steps` collapsed shows 2 rows, click expands to 5 rows including step 5, click collapses again;
  - full loop `__prg.send(...)` → timer → same-card/same-row in-place updates; old card + step-row nodes keep `===` identity; `innerHTML` writes = 0 before and after.

## What matches / could not verify
- Matches: chat messages, 3 tool cards + args/results bodies, 5 progress steps + rail, outputs preview + 3 files, used-in-session 4 rows, panel open/close + Escape-narrow, composer full loop, sections collapse, light/dark tokens, tabular-nums, hover-guarded styles.
- Could not verify pixels (no browser here): exact 6px vs original tool gap width and two-line step wrap height were judged by code (original `gap:10px` skeleton / `overflow-wrap:anywhere`), not screenshot. Open ./index.html in a real browser (toggle sun/moon, expand `3 earlier steps`, click tool headers, send a message) for final visual sign-off in light + dark.

## How to test
- Open `./index.html` in a browser; confirm tool headers show `name + gap + summary` in light and dark; confirm step 5 reads in full; expand/collapse `3 earlier steps`.
- `node --check ./verify-fix.cjs && node ./verify-fix.cjs`
