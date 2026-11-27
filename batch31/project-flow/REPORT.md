# Project Flow — Narrow Assigned Roles Fix (steps 7–8)

## Scope
Targeted fix of existing `./index.html` (no rebuild). Prior partial fix had resolved avatar clipping and `Project Manager` overlap, but left `Assigned Roles` width-constrained: at steps 7 and 8 its title painted only `Assigned Ro` (idle badge covers `les`) and body read `Project Man…`.

## Original behaviour check (`./demo-original.js`) — checked BEFORE editing
Checked first; original does NOT have this defect, so fix is warranted (not noted as wont-fix).
- Roles: `left:1497px top:783px width:272px height:89px` → right `1769px`, bottom `872px`. Fixed geometry, full width, no step loop.
- PM: `left:1335px top:910px width:584px height:281px` → top `910px`. Gap roles-bottom→PM-top `38px`. No overlap.
- Roles block contains only card + centered `<p>Assigned Roles</p>` (`white-space:nowrap`, no badge, no body row, no ellipsis). Full `Assigned Roles` always paints. Same in `light`/`dark` blocks.
- No `Step`/`phase`/loop logic in original (static scaled stage `2312/1644` with `transform:scale`). Narrowing at steps 7–8 is replica-only (13.5% width + `nowrap`+`ellipsis` + absolute idle badge).
Conclusion: replica defect, fixed to match original intent (full width + full title at every step).

## Fix (in-place, `./index.html` only)
Kept `/*noflash*/` guard, in-place updates only, zero `innerHTML` writes after init, demo data verbatim. No JS logic changed.
- `#c-roles`: `left:64.7%→62%`, `width:13.5%→19%` (center preserved ~71.5%), `padding:8px 10px→26px 12px 10px`, `overflow:hidden` kept. Wider card gives ~207px (vs 147px) for full title+body; `padding-top:26px` clears absolute idle badge (badge height ~20px) so badge cannot overlap title.
- `#c-roles h2`: added `white-space:nowrap;overflow:visible;text-overflow:clip;padding:0 6px` (was inheriting `.card h2` ellipsis). Full `Assigned Roles` paints, no `Assigned Ro` truncation.
- `#c-roles .row`: `flex-wrap:nowrap;overflow:hidden` → `flex-wrap:wrap;justify-content:center;overflow:visible;row-gap:6px`. Body wraps instead of clipping.
- `#c-roles .meta`: `overflow:hidden;text-overflow:ellipsis` → `overflow:visible;text-overflow:clip;white-space:normal;text-align:center`. Full `Project Manager · UX Designer` paints, no `Project Man…`.
- Preserved prior fixes: `#c-task width:27.2% + wrap` (avatar `C` fits), `#c-pm top:57.8%` vs roles `[44.2%,55.20%]` gap `2.60%` (~20px) no overlap, both `opacity:1/visible` when on.

## Proof — hashes (MUST differ)
- BEFORE: `1d7b11c9787f673fc304da75c131fbb5  ./index.html`
- AFTER: `d4a25d5837e0f9cf7061e3a1b66ad30c  ./index.html`
- Backup: `1d7b11c9787f673fc304da75c131fbb5  ./original-backup.html` (identical to BEFORE)

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
Harness: `./harness.cjs` (node only, no installs, in-dir DOM stub). Asserts fixed behaviour as VISIBLE state (computed `opacity`/`visibility`/`colours`/`geometry`, not DOM presence), in light AND dark, plus full-loop node identity and zero `innerHTML` writes after init. Asserts card width + title full-text visibility at every step 1–8 in both themes, FAILING on original.

### ORIGINAL (`node ./harness.cjs ./original-backup.html`, exit 1) — FAIL as required
```
Testing ./original-backup.html
  PASS noflash-guard — guard present
  PASS zero-innerHTML-static — 0 occurrences
  PASS colours-computed — light surface #ffffff vs dark surface #1c1c1f
  PASS colours-amber — amber tokens present both themes
  INFO roles left=64.7% top=44.2% w=13.5% padTop=8 | pm top=57.8% w=25.4%
  INFO roles h2=[font-size:12px;color:var(--muted);font-weight:600] row=[flex-wrap:nowrap;overflow:hidden] meta=[min-width:0;flex:1 1 auto;overflow:hidden;text-overflow:ellipsis]
  FAIL roles-width-static — width 13.5% (~147px) <17% narrow, title/body constrained
  FAIL roles-badge-clear-static — avail 127px < title 106+badge 52 (paints 'Assigned Ro', badge covers 'les') — idle badge overlaps title
  FAIL roles-body-static — nowrap+ellipsis, avail 127px < need ~211px (paints 'Project Man…')
  FAIL roles-title-rule-static — h2 still ellipsis/hidden, title truncates to Assigned Ro
  PASS node-identity-light — 8 cards identical across full loop
  PASS zero-innerHTML-runtime-light — 0 writes after init
  PASS colours-light — computed surface #ffffff (tokens distinct)
  FAIL roles-width-step1-light — computed width 13.5% (~147px) narrow at step 1/8, opacity=0 visibility=hidden
  FAIL roles-width-step2-light — computed width 13.5% (~147px) narrow at step 2/8, opacity=0 visibility=hidden
  FAIL roles-width-step3-light — computed width 13.5% (~147px) narrow at step 3/8, opacity=1 visibility=visible
  FAIL roles-width-step4-light — computed width 13.5% (~147px) narrow at step 4/8, opacity=1 visibility=visible
  FAIL roles-width-step5-light — computed width 13.5% (~147px) narrow at step 5/8, opacity=1 visibility=visible
  FAIL roles-width-step6-light — computed width 13.5% (~147px) narrow at step 6/8, opacity=1 visibility=visible
  FAIL roles-width-step7-light — computed width 13.5% (~147px) narrow at step 7/8, opacity=1 visibility=visible
  FAIL roles-width-step8-light — computed width 13.5% (~147px) narrow at step 8/8, opacity=1 visibility=visible
  PASS geometry-roles-pm-light — computed roles [44.2%, 53.24%] vs pm top 57.8% gap 4.56% opacity=1 visible
  PASS visible-roles-light — computed opacity=1 visibility=visible
  PASS dialog-light — card click -> detail opens (computed visibility visible)
  PASS node-identity-dark — 8 cards identical across full loop
  PASS zero-innerHTML-runtime-dark — 0 writes after init
  PASS colours-dark — computed surface #1c1c1f (tokens distinct)
  FAIL roles-width-step1-dark — computed width 13.5% (~147px) narrow at step 1/8, opacity=0 visibility=hidden
  FAIL roles-width-step2-dark — computed width 13.5% (~147px) narrow at step 2/8, opacity=0 visibility=hidden
  FAIL roles-width-step3-dark — computed width 13.5% (~147px) narrow at step 3/8, opacity=1 visibility=visible
  FAIL roles-width-step4-dark — computed width 13.5% (~147px) narrow at step 4/8, opacity=1 visibility=visible
  FAIL roles-width-step5-dark — computed width 13.5% (~147px) narrow at step 5/8, opacity=1 visibility=visible
  FAIL roles-width-step6-dark — computed width 13.5% (~147px) narrow at step 6/8, opacity=1 visibility=visible
  FAIL roles-width-step7-dark — computed width 13.5% (~147px) narrow at step 7/8, opacity=1 visibility=visible
  FAIL roles-width-step8-dark — computed width 13.5% (~147px) narrow at step 8/8, opacity=1 visibility=visible
  PASS geometry-roles-pm-dark — computed roles [44.2%, 53.24%] vs pm top 57.8% gap 4.56% opacity=1 visible
  PASS visible-roles-dark — computed opacity=1 visibility=visible
  PASS dialog-dark — card click -> detail opens (computed visibility visible)

Result: FAIL (16 passed, 20 failed)
orig exit:1
```

### FIXED (`node ./harness.cjs ./index.html`, exit 0) — PASS
```
Testing ./index.html
  PASS noflash-guard — guard present
  PASS zero-innerHTML-static — 0 occurrences
  PASS colours-computed — light surface #ffffff vs dark surface #1c1c1f
  PASS colours-amber — amber tokens present both themes
  INFO roles left=62% top=44.2% w=19% padTop=26 | pm top=57.8% w=25.4%
  INFO roles h2=[font-size:12px;color:var(--muted);font-weight:600;white-space:nowrap;overflow:visible;text-overflow:clip;padding:0 6px] row=[flex-wrap:wrap;justify-content:center;overflow:visible;row-gap:6px] meta=[min-width:0;flex:1 1 auto;overflow:visible;text-overflow:clip;white-space:normal;text-align:center]
  PASS roles-width-static — width 19% (~207px) >=17% full width
  PASS roles-badge-clear-static — card padding-top 26px clears badge
  PASS roles-body-static — row wraps, meta visible+normal, full body paints
  PASS roles-title-rule-static — h2 overflow:visible+clip, no ellipsis
  PASS node-identity-light — 8 cards identical across full loop
  PASS zero-innerHTML-runtime-light — 0 writes after init
  PASS colours-light — computed surface #ffffff (tokens distinct)
  PASS roles-full-step1-light — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=0 visibility=hidden
  PASS roles-full-step2-light — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=0 visibility=hidden
  PASS roles-full-step3-light — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=1 visibility=visible
  PASS roles-full-step4-light — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=1 visibility=visible
  PASS roles-full-step5-light — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=1 visibility=visible
  PASS roles-full-step6-light — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=1 visibility=visible
  PASS roles-full-step7-light — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=1 visibility=visible
  PASS roles-full-step8-light — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=1 visibility=visible
  PASS geometry-roles-pm-light — computed roles [44.2%, 55.20%] vs pm top 57.8% gap 2.60% opacity=1 visible
  PASS visible-roles-light — computed opacity=1 visibility=visible
  PASS dialog-light — card click -> detail opens (computed visibility visible)
  PASS node-identity-dark — 8 cards identical across full loop
  PASS zero-innerHTML-runtime-dark — 0 writes after init
  PASS colours-dark — computed surface #1c1c1f (tokens distinct)
  PASS roles-full-step1-dark — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=0 visibility=hidden
  PASS roles-full-step2-dark — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=0 visibility=hidden
  PASS roles-full-step3-dark — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=1 visibility=visible
  PASS roles-full-step4-dark — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=1 visibility=visible
  PASS roles-full-step5-dark — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=1 visibility=visible
  PASS roles-full-step6-dark — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=1 visibility=visible
  PASS roles-full-step7-dark — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=1 visibility=visible
  PASS roles-full-step8-dark — computed width 19% full, title 'Assigned Roles' fully visible (badge clear), body full, opacity=1 visibility=visible
  PASS geometry-roles-pm-dark — computed roles [44.2%, 55.20%] vs pm top 57.8% gap 2.60% opacity=1 visible
  PASS visible-roles-dark — computed opacity=1 visibility=visible
  PASS dialog-dark — card click -> detail opens (computed visibility visible)

Result: PASS (36 passed, 0 failed)
fixed exit:0
```

## Verification checklist
- `node --check ./demo-original.js` OK; inline script `node --check` OK; `node --check ./harness.cjs` OK.
- `/*noflash*/` present; `innerHTML` count `0`; demo strings verbatim (`Client: Unify`, `Task: Web Design`, `Assigned Roles`, `Project Manager`, `UX Designer`, `Subtasks: List Below`, `Subtask 1: Create Wireframe`, `Onboarded: 25 Jun`, `Updated: Today`).
- Light AND dark: tokens distinct (`#ffffff` vs `#1c1c1f`), amber adjusted, harness runs both themes, width/title/body pass all steps 1–8 both themes, geometry passes both (`gap 2.60%`).
- Full-loop node identity: 8 cards identical across loop, both themes, both files.
- Detail dialog: card `pointerdown` → `detail.hidden=false`, verified light+dark.
- No installs/downloads; no `/tmp` access; all ops in-dir with relative paths.

## How to test
Open `./index.html` in a browser, toggle sun/moon (light/dark), press Replay, watch steps 1–8: Assigned Roles keeps full width, full `Assigned Roles` title (idle badge above, not overlapping) and full `Project Manager · UX Designer` body at every step, including 7–8; Task row never clips; Roles+PM never overlap; click any card for details, Esc closes. Or `node ./harness.cjs ./index.html` (should PASS) vs `node ./harness.cjs ./original-backup.html` (should FAIL).

## Could not verify
Real-browser pixel measurement (no browser here); geometry asserted via computed `%` + estimated heights in DOM-stub. Narrow `<720px` stacked mode not changed.
