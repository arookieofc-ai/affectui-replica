# Integration Flow — targeted pill fix REPORT

## What was fixed (targeted, CSS-only, 9 lines)
`./index.html` only. No JS logic, no rebuild. Kept `/*noflash*/` guard first in `<head>`,
in-place updates only, zero `innerHTML` writes after init, demo data verbatim
(`API Integration` + Okta/Snowflake/Slack/ClickUp/Zendesk).

**Defects (real-browser QA):**
- LIGHT: pills paint WHITE text on WHITE (1.00:1, `API Integration` worst).
- BOTH: top pill (Slack when at top) CLIPPED by card header/flow top (only lower half).
- Pills right-piled at `left:1020` overlapping dashed arc.

**Fix:**
- Light dim: `--pill-title-dim:rgba(255,255,255,.82)` -> `rgba(23,23,23,.72)` (7.12:1),
  `--pill-sub-dim:rgba(255,255,255,.45)` -> `rgba(23,23,23,.52)` (3.62:1).
  Hot keeps original `rgba(0,0,0,.8)/.42` (12.63:1).
- Dark polish: dim `.78/.45` -> `.84/.60` (11.04:1), hot sub `.5` -> `.68`.
- Layout: base `left:1020` -> `880`; phases
  `0:(480,-845)->(420,-640) 1:(240,-562)->(280,-430) 2:(80,-279)->(90,-215)`
  `4:(80,279)->(90,215) 5:(240,558)->(280,430) 6:(480,838)->(420,640)`, `3:(0,0)` kept.
  Top `stage_y -111 -> 65`, bottom `1593 -> 1422` (inside `0..1490`), `minX 1020->880`,
  `spreadY 1493->1147`. No pill clipped by header, no arc overlap, both themes
  (geometry theme-independent).

## Original check (`./demo-original.js`)
- Translates identical: `(480,-845.68) (240,-562.68) (80,-279.68) (0,0) (80,279.32) (240,558.32) (480,838.32)`
  — original also positions off-screen, but original uses two bg layers:
  dim `ghost: rgba(255,255,255,.16)->.08` + white text `.8/.4`, hot `light: rgba(255,255,255,.8)->.4`
  + dark text `rgba(0,0,0,.8)/.4` (dark hot `rgba(255,255,255,.92)/.5` on `rgba(38,38,41,.86)->.62`).
  Replica used single opaque white bg for ALL pills, so dim white-on-white is opaque
  (1.00:1) vs original translucent ghost over blobs. Hot colours match original.
  Layout: original has no `card-head` above flow; replica adds header + `overflow:hidden`
  `.card`, making top clip harsher (header boundary). Fix restores painted readability
  per original hot intent + keeps pills inside flow. Not a false fix.

## Harness (own timeline, painted state, light+dark)
`./harness.js` (pure node, no deps): fake `document/window/setTimeout/matchMedia/localStorage`,
runs page inline script via `vm`, drives OWN timers `b:0->6` (35 ticks, `cycle/charge/sweep/hubLit/focus`),
never sets `data-phase` manually, theme only via page toggle `click`. Parses THIS file CSS
(base `left/top`, `translate/opacity` per `data-phase`, `--pill-*-dim/hot` vars) and asserts
computed opacity/visibility/geometry (`stage = art*1.333-55`, `492x158` pill) + WCAG contrast
vs painted pill bg (`#ffffff` light, `rgb(38,38,41)` dark) at each `b`, light AND dark.
Also asserts `in-place` node identity, `0 innerHTML`, verbatim data, `noflash`.

**Stalling transition:** `b:N->N+1` entry `disp 0->1` (with `focused:true->false` handoff
`disp=(phase==0&&focused&&b>0)?6:phase`) stalls painted: phase-1 `translate(240,-562)`
=> `stage_y -111px`, visible `opacity:1` pill never enters flow (header/flow clips top,
only lower half paints); symmetrically phase-5 exit `(240,558)` => bottom `1593>1490`
stalls exit. Trace proves `b0:[0,1,2,3,4,5] -> b6:[6,1,2,3,4,5]` reaches all phases logically
but painted geometry stays off-screen until fix moves to `(280,-430)/(280,430)`.

## Proof (mechanical)
- `md5sum ./index.html` BEFORE: `ee7708f9b1f4dd4ba1d91f1d8d51602a`
- `md5sum ./index.html` AFTER: `77bec3917787e91aac2bd58c0c630d1e`
- MUST differ: YES (`ee77..` != `77be..`)
- `./original-backup.html` kept (BEFORE bytes).

### FAIL (original) `node ./harness.js ./original-backup.html` EXIT:1
```
PASS noflash-guard :: /*noflash*/ present at head start
PASS inline-script :: inline demo script 5491 chars
PASS zero-innerHTML-static :: no .innerHTML= in inline script
PASS demo-data-verbatim :: API Integration + 5 subs present
PASS css-parse-base :: base left=1020 top=520
PASS css-parse-phase :: phases 0..6 parsed: 0:(480,-845,o0) 1:(240,-562,o1) 2:(80,-279,o1) 3:(0,0,o1) 4:(80,279,o1) 5:(240,558,o1) 6:(480,838,o0)
INFO light-contrast dimT=rgba(255,255,255,.82) => 1.00:1 | dimS=rgba(255,255,255,.45) => 1.00:1 | hotT=rgba(0,0,0,.8) => 12.63:1
INFO dark-contrast dimT=rgba(255,255,255,.78) => 9.72:1 | hotT=rgba(255,255,255,.92) => 12.97:1
FAIL light-contrast-title :: dim title 1.00:1 <4.5 white-on-white (unreadable, API Integration worst)
FAIL light-contrast-sub :: dim sub 1.00:1 <3.0 white-on-white
PASS light-hot-contrast :: hot title 12.63:1 readable
PASS dark-contrast :: dark dim 9.72:1 readable
INFO phase1 art(1260,-42) stage(1680,-111-100) op=1
INFO phase2 art(1100,241) stage(1467,266-477) op=1
INFO phase3 art(1020,520) stage(1360,638-849) op=1
INFO phase4 art(1100,799) stage(1467,1010-1221) op=1
INFO phase5 art(1260,1078) stage(1680,1382-1593) op=1
FAIL layout-top-not-clipped :: phase1 top -111px <0 CLIPPED by header/flow (only lower half shows)
FAIL layout-bottom-not-clipped :: phase5 bottom 1593px >1490 CLIPPED bottom
FAIL layout-arc-spread :: base left 1020 >950 right-piled at 1020, overlaps arc
INFO spreadY stage=1493 minX art=1020
PASS timeline-init :: own timeline starts b=0 from load (sweeps=0)
PASS timeline-full-loop :: own timers drove b 0->6 (7 distinct b, 35 timer ticks)
PASS timeline-phases-painted :: all visible phases painted via own timeline: 0,1,2,3,4,5,6
PASS in-place-identity :: 6 pill nodes same objects across full loop (in-place updates only)
PASS zero-innerHTML-runtime :: 0 innerHTML writes during own timeline
PASS theme-own-handler :: theme toggled light->dark via page toggle handler
FAIL dark-geometry :: dark clipped (top -111, bottom 1593)
INFO trace b0:[0,1,2,3,4,5] b1:[1,2,3,4,5,6] b2:[2,3,4,5,6,1] b3:[3,4,5,6,1,2] b4:[4,5,6,1,2,3] b5:[5,6,1,2,3,4] b6:[6,1,2,3,4,5]
RESULT 14 pass 6 fail :: ./original-backup.html

EXIT:1
```

### PASS (fixed) `node ./harness.js ./index.html` EXIT:0
```
PASS noflash-guard :: /*noflash*/ present at head start
PASS inline-script :: inline demo script 5491 chars
PASS zero-innerHTML-static :: no .innerHTML= in inline script
PASS demo-data-verbatim :: API Integration + 5 subs present
PASS css-parse-base :: base left=880 top=520
PASS css-parse-phase :: phases 0..6 parsed: 0:(420,-640,o0) 1:(280,-430,o1) 2:(90,-215,o1) 3:(0,0,o1) 4:(90,215,o1) 5:(280,430,o1) 6:(420,640,o0)
INFO light-contrast dimT=rgba(23,23,23,.72) => 7.12:1 | dimS=rgba(23,23,23,.52) => 3.62:1 | hotT=rgba(0,0,0,.8) => 12.63:1
INFO dark-contrast dimT=rgba(255,255,255,.84) => 11.04:1 | hotT=rgba(255,255,255,.92) => 12.97:1
PASS light-contrast-title :: dim title 7.12:1 >=4.5 on white pill
PASS light-contrast-sub :: dim sub 3.62:1 >=3.0
PASS light-hot-contrast :: hot title 12.63:1 readable
PASS dark-contrast :: dark dim 11.04:1 readable
INFO phase1 art(1160,90) stage(1547,65-276) op=1
INFO phase2 art(970,305) stage(1293,352-562) op=1
INFO phase3 art(880,520) stage(1173,638-849) op=1
INFO phase4 art(970,735) stage(1293,925-1136) op=1
INFO phase5 art(1160,950) stage(1547,1212-1422) op=1
PASS layout-top-not-clipped :: phase1 top 65px >=0 inside flow (not clipped by header)
PASS layout-bottom-not-clipped :: phase5 bottom 1422px <=1490 inside
PASS layout-arc-spread :: base left 880 <=950, pills spread left of arc, no overlap/right-pile
INFO spreadY stage=1147 minX art=880
PASS timeline-init :: own timeline starts b=0 from load (sweeps=0)
PASS timeline-full-loop :: own timers drove b 0->6 (7 distinct b, 35 timer ticks)
PASS timeline-phases-painted :: all visible phases painted via own timeline: 0,1,2,3,4,5,6
PASS in-place-identity :: 6 pill nodes same objects across full loop (in-place updates only)
PASS zero-innerHTML-runtime :: 0 innerHTML writes during own timeline
PASS theme-own-handler :: theme toggled light->dark via page toggle handler
PASS dark-geometry :: dark painted geometry inside (top 65, bottom 1422)
INFO trace b0:[0,1,2,3,4,5] b1:[1,2,3,4,5,6] b2:[2,3,4,5,6,1] b3:[3,4,5,6,1,2] b4:[4,5,6,1,2,3] b5:[5,6,1,2,3,4] b6:[6,1,2,3,4,5]
RESULT 20 pass 0 fail :: ./index.html

EXIT:0
```

## How to test
- Open `./index.html` in browser, toggle Light/Dark (top-right). Check pills readable,
  Slack never half-clipped, no arc overlap, sweep/charge still animates.
- `node ./harness.js ./index.html` -> `20 pass 0 fail EXIT:0`
- `node ./harness.js ./original-backup.html` -> `14 pass 6 fail EXIT:1`
- `md5sum ./index.html ./original-backup.html` differ. No installs, no `/tmp`, all `./` relative.

## Files in dir
- `./index.html` (fixed), `./original-backup.html` (original), `./harness.js`,
  `./harness-fail.txt`, `./harness-pass.txt`, `./REPORT.md`
- Checked `./REPLICATE_SPEC.md` + `./demo-original.js` (relative only). Light AND dark verified.
