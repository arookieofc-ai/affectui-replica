# Task-board Labels filter — targeted fix REPORT

## What was built / fixed
- Targeted fix of existing `./index.html` (no rebuild). One CSS-only change.
- Root cause: `.menu{display:grid}` overrides the UA `[hidden]{display:none}`, so
  `<div id="filterMenu" hidden>` was still rendered. The trigger correctly reported
  `aria-expanded="false"` while the menu was visibly open, covering the first
  Done-column card (NW-160 "Dark mode for the dashboard", title cut, avatar covered),
  in both themes, and `closeMenu()` (which only sets `hidden=true`) could never hide it.
- Fix (2 lines, in-place CSS addition next to `.menu-wrap`/`.menu`):
  ```css
  [hidden]{display:none!important}
  .menu[hidden]{display:none}
  ```
  Initial HTML/JS already correct (`hidden` + `aria-expanded="false"` on load,
  `openMenu()` sets `hidden=false`/`aria-expanded="true"`, `closeMenu()` sets
  `hidden=true`/`aria-expanded="false"`). No JS change needed. Card click -> detail
  dialog untouched.

## Original behaviour check (`./demo-original.js` — read before changing)
- Original React demo starts CLOSED: `const [D,O]=(0,r.useState)(null)` and menu is
  conditionally rendered only as `D===\`filter\` && (...)`. Trigger toggles via
  `onClick:()=>D?X():de()` with `aria-expanded:D===\`filter\``.
- The replica bug (CSS ignoring `hidden`) does NOT exist in the original, so a fix
  is warranted (not a faithful-repro of original behaviour).

## Hard proof: md5 BEFORE vs AFTER (must differ)
```
68b758d3f8d08e077b20030962302e55  ./index.html   (BEFORE — also saved as ./original-backup.html)
62d67dcbe7756e7d40e0ac3e2cd75b2b  ./index.html   (AFTER — fixed)
68b758d3f8d08e077b20030962302e55  ./original-backup.html (preserved original)
```
- Verified with: `md5sum ./index.html ./original-backup.html` run from this directory.
- Diff is exactly the 2 CSS lines above; `/*noflash*/` guard untouched, no JS/data changes.

## Harness (in-dir DOM-stub, node only, relative paths)
- Harness: `./harness.js` — uses only relative paths (`./index.html` default,
  `./original-backup.html` when passed). No installs.
- What it asserts:
  - static: `/*noflash*/` present, zero `innerHTML` in file, demo data verbatim
    (NW-160 present), dark CSS + theme toggle present, `.menu{display:grid}` noted.
  - runs the inline main script in a minimal DOM stub, checks VISIBLE state via
    effective display (`hidden` + CSS `[hidden]` override), in light AND dark.
  - real-click toggle: fires `filterBtn` click -> open (hidden=false/aria=true/visible),
    fires again -> closed (hidden=true/aria=false/not visible).
  - card click -> detail dialog: clicks `cardRefs["13"]` (NW-160), asserts
    `.panel.open` + `.scrim.open` + `aria-modal="true"`, then closes.
  - full-loop node identity: captures all `cardRefs[*].card`, runs
    `setSearch/toggleLabel/clearLabels/setCompact/sync` full loop, asserts `===`
    identity preserved (in-place updates only).
  - zero `innerHTML` writes at runtime (setter counter).
- Syntax: `node --check ./harness.js` OK, `node --check ./demo-original.js` OK,
  inline script parsed via `new vm.Script` OK.

### Harness result against ORIGINAL (must FAIL) — `node ./harness.js ./original-backup.html`
```
target: ./original-backup.html
--- static ---
  PASS: /*noflash*/ guard present
  PASS: zero innerHTML writes in file (found 0)
  PASS: demo data verbatim (NW-160 Dark mode for the dashboard present)
  PASS: dark mode support present (theme toggle + dark CSS)
  PASS: .menu sets display:grid (so [hidden] needs explicit override)
  INFO: hiding rule present=false (global=false menu=false)
  INFO: initial HTML filterMenu hidden attr=true filterBtn aria-expanded=false
  PASS: inline main script parses (node syntax OK)
  PASS: inline script init OK, __tb exposed
--- initial state (must be CLOSED) ---
  PASS: filterMenu.hidden === true on load (got true)
  PASS: filterBtn aria-expanded === "false" on load (got "false")
  FAIL: menu NOT visible on load (effective display none via [hidden] rule)
  FAIL: menu NOT visible on load in light theme
  FAIL: menu NOT visible on load in dark theme
--- trigger toggle (real clicks) ---
  PASS: after 1st click filterMenu.hidden === false (opened)
  PASS: after 1st click aria-expanded === "true" (got "true")
  PASS: menu IS visible after opening click
  PASS: open menu stays visible in light theme
  PASS: open menu stays visible in dark theme
  PASS: after 2nd click filterMenu.hidden === true (closed again)
  PASS: after 2nd click aria-expanded === "false" (got "false")
  FAIL: menu NOT visible after closing click (nothing covers Done-column card)
--- card click -> detail dialog ---
  PASS: cardRefs has NW-160 (id 13)
  PASS: detail panel opens on card click (has .open)
  PASS: scrim opens on card click
  PASS: panel aria-modal === "true" when open (got "true")
  PASS: panel closes again (card dialog not broken)
--- full loop: node identity + zero innerHTML ---
  PASS: card node identity preserved across full loop (in-place updates only)
  PASS: zero innerHTML writes at runtime (counted 0)
---
RESULT: FAIL ./original-backup.html (4 failures)
```
- exit code 1 (FAIL as required — bug reproduced as VISIBLE state despite hidden attr).

### Harness result against FIXED (must PASS) — `node ./harness.js ./index.html`
```
target: ./index.html
--- static ---
  PASS: /*noflash*/ guard present
  PASS: zero innerHTML writes in file (found 0)
  PASS: demo data verbatim (NW-160 Dark mode for the dashboard present)
  PASS: dark mode support present (theme toggle + dark CSS)
  PASS: .menu sets display:grid (so [hidden] needs explicit override)
  INFO: hiding rule present=true (global=true menu=true)
  INFO: initial HTML filterMenu hidden attr=true filterBtn aria-expanded=false
  PASS: inline main script parses (node syntax OK)
  PASS: inline script init OK, __tb exposed
--- initial state (must be CLOSED) ---
  PASS: filterMenu.hidden === true on load (got true)
  PASS: filterBtn aria-expanded === "false" on load (got "false")
  PASS: menu NOT visible on load (effective display none via [hidden] rule)
  PASS: menu NOT visible on load in light theme
  PASS: menu NOT visible on load in dark theme
--- trigger toggle (real clicks) ---
  PASS: after 1st click filterMenu.hidden === false (opened)
  PASS: after 1st click aria-expanded === "true" (got "true")
  PASS: menu IS visible after opening click
  PASS: open menu stays visible in light theme
  PASS: open menu stays visible in dark theme
  PASS: after 2nd click filterMenu.hidden === true (closed again)
  PASS: after 2nd click aria-expanded === "false" (got "false")
  PASS: menu NOT visible after closing click (nothing covers Done-column card)
--- card click -> detail dialog ---
  PASS: cardRefs has NW-160 (id 13)
  PASS: detail panel opens on card click (has .open)
  PASS: scrim opens on card click
  PASS: panel aria-modal === "true" when open (got "true")
  PASS: panel closes again (card dialog not broken)
--- full loop: node identity + zero innerHTML ---
  PASS: card node identity preserved across full loop (in-place updates only)
  PASS: zero innerHTML writes at runtime (counted 0)
---
RESULT: PASS ./index.html
```
- exit code 0 (PASS).

## Constraints kept
- `/*noflash*/` guard kept verbatim (head first script + meta + bg style untouched).
- In-place updates only: no full re-render added; `sync*` still mutates existing nodes;
  harness proves card object identity across full loop.
- Zero `innerHTML` writes after init: `grep -c innerHTML ./index.html` = 0, runtime
  counter = 0 in both runs.
- Demo data verbatim: TASKS/LABELS/STATUSES/PEOPLE/PATH unchanged (NW-160 kept,
  `grep -c NW-160` = 1 in both files).
- Light AND dark verified: initial-closed + open-visible asserted under
  `data-theme="light"` and `data-theme="dark"`; theme toggle + dark tokens untouched.
- Card click -> detail dialog preserved (verified in harness, no panel code touched).

## How to test
- Open `./index.html` in a browser (light + dark via sun/moon toggle).
- On load the Labels menu must be closed; NW-160 fully visible in Done column.
- Click filter button -> menu opens; click again / Escape / outside -> closes.
- Click any card (e.g. NW-160) -> detail dialog opens; scrim click / Escape / Close closes.
- Or run: `node --check ./harness.js && node --check ./demo-original.js && node ./harness.js ./index.html && node ./harness.js ./original-backup.html` (second must fail).
