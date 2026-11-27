# REPORT — inspect-composer (targeted fix)

## Proof (mechanical)
- BEFORE `md5sum ./index.html`: `9d5d0f4a7f3afc067b80865d3147b481`
- AFTER `md5sum ./index.html`: `0542c2e5a64d787736b182960d9f3f83`
- Hashes differ: YES (targeted edit, no rebuild).
- Original kept as `./original-backup.html` (`9d5d0f4a7f3afc067b80865d3147b481`).

### Harness FAIL vs original (`node ./harness.cjs ./original-backup.html`)
```
PASS: noflash guard present — /*noflash*/ found
PASS: color-scheme meta present — meta found
PASS: zero innerHTML in source — none found
PASS: verbatim "Ask the agents to ship t..." present
PASS: verbatim "Summarize the pricing re..." present
PASS: verbatim "Auto..." present
PASS: verbatim "Work in a folder..." present
PASS: verbatim "Connect apps..." present
PASS: row label "Message" present
PASS: row label "Toolbar" present
PASS: row label "Footer" present
FAIL: light message colour readable (alpha>=0.6) — hint light=rgba(0,0,0,.36) alpha=0.36
FAIL: dark message colour readable (alpha>=0.6) — hint dark=rgba(255,255,255,.38) alpha=0.38
FAIL: scene vertical mask keeps composer opaque (>=65%) — min vertical opaque=40%
FAIL: scene horizontal mask keeps composer inside (>=85%) — min horizontal opaque=74%
FAIL: mirror padding leaves left room (>=12px) — mirror padding left=0
FAIL: above offsets not clipped far left (<-20px) — above lefts=[-56px, -24px, -24px]
PASS: app script runs without throwing
PASS: window.__icp exposed
FAIL: entrance resolves visible (data-shown true after init) — data-shown=false
PASS: composer message nodes exist (2: back+front) — found=2
PASS: back message verbatim present in DOM — Summarize the pricing research for the team
PASS: front message verbatim present in DOM — Ask the agents to ship the new pricing page
PASS: composer message node exists
PASS: message computed opacity 1 (not ghosted) — opacity=1
PASS: message computed visibility visible — visibility=visible
FAIL: message computed colour readable (alpha>=0.6) — color=rgba(0,0,0,.36) alpha=0.36
PASS: message text verbatim main — Ask the agents to ship the new pricing page
PASS: main card computed opacity 1 — opacity=1
PASS: main card computed visibility visible — visibility=visible
PASS: 3 inspection rows — rows=3
PASS: row "Message" card.x >=0 — Message card.x=10
PASS: row "Message" x >=0 — Message x=10
PASS: row "Toolbar" card.x >=0 — Toolbar card.x=10
PASS: row "Toolbar" x >=0 — Toolbar x=10
FAIL: row "Footer" card.x >=0 (not clipped left) — Footer card.x=-46
FAIL: row "Footer" x >=0 (not clipped left) — Footer x=-46
PASS: selection frame left >=0 — frame.left=10px
PASS: status Selected: Message after init — Selected: Message
PASS: tag shows Message after init
PASS: full loop cycles 3 rows — Selected: Toolbar | Selected: Footer | Selected: Message
PASS: overlay frame/tag/guide/cursor/size node identity across loop
PASS: row nodes identity across loop — row nodes stable
PASS: loop wraps to Message — Selected: Message
PASS: light theme message visible opacity 1 — opacity=1
FAIL: light theme message colour readable — color=rgba(0,0,0,.36)
PASS: dark theme message visible opacity 1 — opacity=1
FAIL: dark theme message colour readable — color=rgba(255,255,255,.38)
PASS: light/dark tokens distinct
PASS: jump to Toolbar sets Selected: Toolbar — Selected: Toolbar
PASS: Message jump sets Selected: Message immediately — Selected: Message
PASS: Message jump moves tag to Message
PASS: Message jump moves scene (frame top changes vs Toolbar)
PASS: Message jump sets dot active
FAIL: Message jump survives pending auto timers (stays Message) — after old timers: Selected: Toolbar
FAIL: Message jump stays visible after pending timers (data-shown true) — data-shown=false
PASS: zero innerHTML writes after init (runtime) — writes=0

RESULT: 14 FAILURES (47 passes) — ./original-backup.html
```

### Harness PASS vs fixed (`node ./harness.cjs ./index.html`)
```
PASS: noflash guard present
PASS: color-scheme meta present
PASS: zero innerHTML in source — none found
PASS: verbatim x5 + Message/Toolbar/Footer
PASS: light message colour readable — hint light=rgba(23,23,23,.92) alpha=0.92
PASS: dark message colour readable — hint dark=rgba(255,255,255,.88) alpha=0.88
PASS: scene vertical mask keeps composer opaque — min vertical opaque=70%
PASS: scene horizontal mask keeps composer inside — min horizontal opaque=88%
PASS: mirror padding leaves left room — mirror padding left=64px
PASS: above offsets not clipped far left — above lefts=[0, 0, 0]
PASS: app script runs without throwing
PASS: window.__icp exposed
PASS: entrance resolves visible (data-shown true after init) — data-shown=true
PASS: composer message nodes exist (2: back+front)
PASS: back/front verbatim present in DOM
PASS: message computed opacity 1, visibility visible, colour readable alpha=0.92
PASS: message text verbatim main — Ask the agents to ship the new pricing page
PASS: main card computed opacity 1, visibility visible
PASS: 3 inspection rows, all card.x>=0, x>=0 (Footer card.x=10)
PASS: selection frame left >=0 — frame.left=10px
PASS: status Selected: Message, tag Message
PASS: full loop cycles 3 rows, overlay + row node identity stable, wraps to Message
PASS: light theme visible opacity 1 + readable, dark theme visible opacity 1 + readable, tokens distinct
PASS: jump to Toolbar sets Selected: Toolbar
PASS: Message jump sets Selected: Message, moves tag + scene, sets dot active
PASS: Message jump survives pending auto timers (stays Message)
PASS: Message jump stays visible (data-shown true)
PASS: zero innerHTML writes after init — writes=0

RESULT: ALL CHECKS PASSED (61 passes) — ./index.html
```
- `node --check ./harness.cjs`: PASS
- app JS `node --check` (extracted script): PASS

## What was checked in original
- `./REPLICATE_SPEC.md` and `./demo-original.js` do NOT exist in this directory (`test -f` both miss). Noted per instructions: could not diff against original demo file. Proceeded per real-browser QA description only; did not invent a new demo or copy outside files. Work stayed in `./batch30/inspect-composer` with relative `./` paths; no `/tmp` rm; no installs.

## Defects fixed (targeted, in-place)
1. Ghosting (unresolved entrance/opacity):
   - `state.shown:false` + `step()` hid immediately (`apply false`, show after 30ms) → init `data-shown=false` ghosted. Fixed to `shown:true` + `step()` starts `apply true`, hides after `VISIBLE_BASE+HOLD`, no initial flash.
   - Scene masks `180deg #000 40%/82%` faded the main card (card sits ~172-280px in 344px height → semi-transparent blank). Fixed to `70%/97%` so composer stays opaque.
   - `--hint` `rgba(0,0,0,.36)` / `rgba(255,255,255,.38)` unreadable. Fixed to `rgba(23,23,23,.92)` / `rgba(255,255,255,.88)` + explicit `opacity:1;visibility:visible` on `.icp-body/.icp-message`.
2. Left clipping (positioning):
   - Default `data-mirror=true` used `padding … 0` left + `270deg #000 74%` (fades left edge) → `Ask` lost. Fixed padding to `150px 64px 64px 64px` both modes, masks to `88%/100%` so only far edge fades.
   - `.icp-above left:-56px/right:-24px` (mirror `-24px/-56px`) pushed back card negative. Fixed to `left:0;right:0` both.
   - JS fallback `cx=-46` for Footer → `card.x=-46` clipped. Fixed to `cx=10`.
3. Jump buttons dead:
   - `Number(goto)||0` + `apply true` without `clearTimers/loop` left stale auto timers → Message immediately overwritten back to Toolbar (`Selected stays Toolbar`, `data-shown=false`). Fixed to robust parse + `clearTimers(); apply true; if(playing) loop()` so jump moves `Selected`, tag, frame/guide/cursor/size scene and survives pending timers.

Preserved: `/*noflash*/` guard first, `color-scheme` meta, in-place `textContent/style/attr` updates only, zero `innerHTML` writes (source + runtime), demo strings verbatim (`Ask…`, `Summarize…`, `Auto`, `Work in a folder`, `Connect apps`).

## How to test (node only, in-dir)
- `node --check ./harness.cjs`
- `node ./harness.cjs ./original-backup.html` → FAIL (14 failures, proves harness sensitivity)
- `node ./harness.cjs ./index.html` → ALL CHECKS PASSED
- All runs use relative `./` paths inside this directory.
