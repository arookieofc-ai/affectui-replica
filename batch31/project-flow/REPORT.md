# Project Flow — Targeted Fix Report

## Scope
Targeted fix of existing `./index.html` (no rebuild). Two defects from real-browser QA:
1. Task card last `C` avatar half-clipped by card right edge (avatar row overflows) — both themes.
2. Steps 5–7/8: `Assigned Roles` card mostly covered by `Project Manager` card (only top strip, title cut to `Assigned F`). Per original both fully visible.

Card click → detail dialog kept working.

## Original behaviour check (`./demo-original.js`)
Checked before editing. Original does NOT have these defects — fix is warranted (replica-only):
- Task: card `left:841px top:359px width:584px` → right `1425px`. Avatars at `1035.71px` and `1092px` (`50.285px` wide) → second right `1142.285px`. Spare `~282px`. Tech-row (`pill + 5 icons`) ends ~`1352px` < `1425px`. Fits.
- Roles: `left:1497px top:783px width:272px height:89px` → bottom `872px`. PM: `left:1335px top:910px width:584px height:281px` → top `910px`. Gap `38px`. No overlap. Same in `light`/`dark` blocks.
- UX top `1235px`, PM bottom `1191px`, gap `44px`. No overlap.
Conclusion: defects introduced by replica responsive reinterpretation (auto-height cards, `%` positions, nowrap flex rows), not present in original. Fixed replica to match original intent.

## Fix (in-place, `index.html` only)
- Kept `/*noflash*/` guard, in-place updates only, zero `innerHTML` writes after init, demo data verbatim.
- (1) Task overflow:
  - `#c-task` `36.4%/25.4%` → `35.2%/27.2%` + `overflow:hidden`.
  - `.card .row` added `max-width:100%;flex-wrap:wrap`; `.tools` added `flex-wrap:wrap;min-width:0`.
  - Added `#c-task .row{flex-wrap:wrap;row-gap:6px;max-width:100%}` and `#c-task .tools{flex-wrap:wrap;row-gap:6px;min-width:0}` — full row wraps inside, no horizontal overflow, last `C` fully visible.
- (2) Roles/PM overlap:
  - `#c-roles` `top:47.6%/width:11.8%` → `top:44.2%/width:13.5%;overflow:hidden`.
  - `#c-pm` `top:55.4%` → `top:57.8%`.
  - Added `#c-roles .row{flex-wrap:nowrap;overflow:hidden}` + `#c-roles .meta{min-width:0;flex:1 1 auto;overflow:hidden;text-overflow:ellipsis}` to keep height single-line.
  - Computed: roles `[44.2%, 53.24%]` (est `9.04%` height) vs PM top `57.8%` → gap `4.56%` (~35px). Original replica was `[47.6%, 56.64%]` vs `55.4%` → overlap. Both cards `opacity:1/visible` at steps 5–7.
- No JS logic changed; `openDetail`/hover/highlight/loop timers untouched.

## Proof — hashes (must differ)
- BEFORE: `7dfefb5aa1f02435fb01a397d277b501  ./index.html`
- AFTER: `1d7b11c9787f673fc304da75c131fbb5  ./index.html`
- Backup: `7dfefb5aa1f02435fb01a397d277b501  ./original-backup.html` (identical to BEFORE)

Commands (relative paths, in-dir only):
```
md5sum ./index.html
cp ./index.html ./original-backup.html
# ... edit ...
md5sum ./index.html ./original-backup.html
node --check ./demo-original.js
node --check ./harness.cjs
node ./harness.cjs ./original-backup.html
node ./harness.cjs ./index.html
```

## Proof — harness
Harness: `./harness.cjs` (node only, no installs, in-dir DOM stub). Asserts fixed behaviour as VISIBLE state (computed `opacity`/`visibility`/`colours`/`geometry`, not DOM presence), in light AND dark, plus full-loop node identity and zero `innerHTML` writes after init.

### ORIGINAL (`node ./harness.cjs ./original-backup.html`, exit 1) — FAIL as required
```
Testing ./original-backup.html
  PASS noflash-guard — guard present
  PASS zero-innerHTML-static — 0 occurrences
  PASS colours-computed — light surface #ffffff vs dark surface #1c1c1f
  PASS colours-amber — amber tokens present both themes
  INFO task width=25.4% wrapRow=false wrapTools=false
  FAIL task-row-fits — computed overflow: row ~303px > card ~276px (width 25.4%), last 'C' clipped
  INFO roles top=47.6% left=64.7% w=11.8% | pm top=55.4% left=57.7% w=25.4%
  FAIL roles-pm-no-overlap — computed overlap: roles [47.6%, 56.64%] overlaps pm top 55.4% (only top strip visible, title cut)
 Runtime (light):
  PASS node-identity-light — 8 cards identical across full loop
  PASS zero-innerHTML-runtime-light — 0 writes after init
  PASS visible-light-c-task — computed opacity=1 visibility=visible
  PASS visible-light-c-roles — computed opacity=1 visibility=visible
  PASS visible-light-c-pm — computed opacity=1 visibility=visible
  PASS visible-light-c-ux — computed opacity=1 visibility=visible
  FAIL geometry-visible-light — overlap while both opacity=1: roles bottom 56.64% > pm top 55.4%
  PASS dialog-light — card click -> detail opens (computed visibility visible)
 Runtime (dark):
  PASS node-identity-dark — 8 cards identical across full loop
  PASS zero-innerHTML-runtime-dark — 0 writes after init
  PASS visible-dark-c-task — computed opacity=1 visibility=visible
  PASS visible-dark-c-roles — computed opacity=1 visibility=visible
  PASS visible-dark-c-pm — computed opacity=1 visibility=visible
  PASS visible-dark-c-ux — computed opacity=1 visibility=visible
  FAIL geometry-visible-dark — overlap while both opacity=1: roles bottom 56.64% > pm top 55.4%
  PASS dialog-dark — card click -> detail opens (computed visibility visible)

Result: FAIL (18 passed, 4 failed)
```

### FIXED (`node ./harness.cjs ./index.html`, exit 0) — PASS
```
Testing ./index.html
  PASS noflash-guard — guard present
  PASS zero-innerHTML-static — 0 occurrences
  PASS colours-computed — light surface #ffffff vs dark surface #1c1c1f
  PASS colours-amber — amber tokens present both themes
  INFO task width=27.2% wrapRow=true wrapTools=true
  PASS task-row-fits — computed: wrap enabled, row max-width 100%, no horizontal overflow; card width 27.2%
  INFO roles top=44.2% left=64.7% w=13.5% | pm top=57.8% left=57.7% w=25.4%
  PASS roles-pm-no-overlap — computed geometry: roles bottom 53.24% <= pm top 57.8% (gap 4.56%)
 Runtime (light):
  PASS node-identity-light — 8 cards identical across full loop
  PASS zero-innerHTML-runtime-light — 0 writes after init
  PASS visible-light-c-task — computed opacity=1 visibility=visible
  PASS visible-light-c-roles — computed opacity=1 visibility=visible
  PASS visible-light-c-pm — computed opacity=1 visibility=visible
  PASS visible-light-c-ux — computed opacity=1 visibility=visible
  PASS geometry-visible-light — roles bottom 53.24% < pm top 57.8% while both opacity=1
  PASS dialog-light — card click -> detail opens (computed visibility visible)
 Runtime (dark):
  PASS node-identity-dark — 8 cards identical across full loop
  PASS zero-innerHTML-runtime-dark — 0 writes after init
  PASS visible-dark-c-task — computed opacity=1 visibility=visible
  PASS visible-dark-c-roles — computed opacity=1 visibility=visible
  PASS visible-dark-c-pm — computed opacity=1 visibility=visible
  PASS visible-dark-c-ux — computed opacity=1 visibility=visible
  PASS geometry-visible-dark — roles bottom 53.24% < pm top 57.8% while both opacity=1
  PASS dialog-dark — card click -> detail opens (computed visibility visible)

Result: PASS (22 passed, 0 failed)
```

## Verification checklist
- `node --check ./demo-original.js` OK; inline script `node --check` OK; `node --check ./harness.cjs` OK.
- `/*noflash*/` present; `innerHTML` count `0`; demo strings verbatim (`Client: Unify`, `Task: Web Design`, `Assigned Roles`, `Project Manager`, `UX Designer`, `Subtasks: List Below`, `Subtask 1: Create Wireframe`, `Onboarded: 25 Jun`, `Updated: Today`).
- Light AND dark: tokens distinct (`#ffffff` vs `#1c1c1f`), amber adjusted, harness runs both themes, geometry passes both.
- Full-loop node identity: 8 cards identical across loop, both themes, both files.
- Detail dialog: card `pointerdown` → `detail.hidden=false`, verified light+dark.
- No installs/downloads; no `/tmp` access; all ops in-dir with relative paths.

## How to test
Open `./index.html` in a browser, toggle sun/moon (light/dark), press Replay, watch steps 1–8: Task row never clips, Roles + PM fully visible steps 5–7, click any card for details, Esc closes. Or `node ./harness.cjs ./index.html` (should PASS) vs `node ./harness.cjs ./original-backup.html` (should FAIL).

## Could not verify
Real-browser pixel measurement (no browser here); geometry asserted via computed `%` + estimated heights in DOM-stub. Narrow `<720px` stacked mode not changed.
