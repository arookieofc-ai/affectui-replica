# REPORT — fix-assistant-overview (Files made for you expansion)

## What was built
- Targeted fix of existing `./index.html` (no rebuild). Static painting untouched.
- `Files made for you` now expands in place: 3 visible initially, 14 visible after `11 more`.

## Root cause
- `Files` card wired both the `11 more` button and every file row to the same
  `data-nav="Folders"` toast (`Opened Folders` / `Opening Folders: <name>`).
- Clicking `11 more` never touched the list: still 3 `<li>`, button still `11 more`.
- `demo-original.js` (checked before changing):
  - `O` has exactly 3 files: `q3-launch-plan.md`, `budget-by-channel.csv`,
    `competitor-pricing.csv`. There are **no other 11 file names in the original**.
  - Both the `11 more` button (`children: '11 more'`) and each file row
    (`O.map ... onClick:()=>B('Folders')`) call `onNavigate('Folders')`.
    The original does **not** expand in place and has no `Show less` state;
    it navigates to Folders. File click does **not** open a detail, same navigation.
- Standalone replica has no Folders destination, so pure navigation reads as dead.
  Fix keeps file-click navigation toast (faithful to original) but makes `11 more`
  a real in-place disclosure, with toast `Showing all 14 files` / `Showing fewer files`.

## Fix (in-place, noflash kept)
- `./index.html` only:
  - `11 more` button: `id="filesMore" aria-expanded="false" aria-controls="fileList"`
    (removed `data-nav` so generic nav toast no longer hijacks it).
  - Added `FILES[14]` (first 3 verbatim from `O`, same `name/at/where`; remaining 11
    plausible to satisfy `Files made 14`: see list below). Built remaining 11 `<li>`
    once at init via `createElement`, `li.hidden=true`, appended to `#fileList`.
  - `toggleFiles()` flips `filesExpanded`, unhides/hides rows via `hidden`,
    swaps button `11 more` <-> `Show less` + `aria-expanded`/`aria-label`, `say()` status.
  - File rows (static + new) keep `data-nav="Folders"`; click still
    `Opening Folders: <name>` (original behaviour preserved).
  - Exposed for test: `window.__ov.{files,fileRows,filesMore,filesExpanded,toggleFiles,filesVisibleCount,fileList}`.
  - Zero `innerHTML` writes; heat loop untouched (in-place `setAttribute` only).
- `/*noflash*/` guard, `<meta name=color-scheme>`, theme tokens, hover media query,
  `tabular-nums` all untouched.

## 14 files (demo data verbatim + plausible remainder)
Verbatim (from `O`): `q3-launch-plan.md|1 hour ago|Q3 Campaign`,
`budget-by-channel.csv|Yesterday|Q3 Campaign`, `competitor-pricing.csv|Tue|Research`.
Added (noted as invention — original supplies no names for the other 11):
`creative-brief-v2.docx|Wed|Q3 Campaign`, `landing-hero-copy.md|Mon|Q3 Campaign`,
`ad-hooks-linen.csv|Last week|Research`, `partner-logo-guidelines.pdf|Last week|Brand`,
`email-drip-sequence.md|Sep 28|Content`, `pricing-one-pager.pdf|Sep 22|Research`,
`social-cutdowns-list.csv|Sep 18|Q3 Campaign`, `homepage-refresh-notes.md|Sep 12|Content`,
`campaign-retro-deck.pdf|Sep 5|Q3 Campaign`, `audience-segments.csv|Aug 29|Research`,
`launch-checklist.md|Aug 21|Q3 Campaign`.

## What matches / could not verify
- Matches: layout, 3-file first paint, `This month: Files made 14`, file-row toast,
  heat/activity, usage, theme toggle, light+dark.
- Could not verify: real Folders destination (does not exist standalone);
  original's `h` chat list length (imported, not in `demo-original.js`) — recent chats left as-is.
- Deliberate deviation: original has no expand/`Show less`; added here per QA defect
  (standalone page needs disclosure; navigation alone looks broken).

## How to test (node only, in-dir)
From this directory:
```
node --check ./harness.js && node ./harness.js
```
Harness (`./harness.js`, DOM-stub, no installs):
- static: noflash, color-scheme, zero `innerHTML`, verbatim 3 files, 14 stat, dark tokens.
- VISIBLE: 3 rows visible initially; click `11 more` -> 14 rows `hidden=false`,
  button `Show less`, `aria-expanded=true`, toast `Showing all 14 files`;
  file click -> `Opening Folders: q3-launch-plan.md`; second click collapses to 3.
- light AND dark: `applyTheme('light')` expand -> 14 visible; `applyTheme('dark')` -> still 14 visible.
- full-loop node identity (280 heat cells stable across 280 `step(1)`), file-row identity across toggles, zero `innerHTML` writes after init.
- Open `./index.html` in a browser for visual light/dark check (sun/moon toggle).

Checked: light ✓ / dark ✓ (stub + visual tokens; no grey-on-grey, borders visible).
