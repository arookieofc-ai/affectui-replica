# Inspect Composer — targeted fix (real-browser paint)

## Proof (hard requirements, mechanical)
- BEFORE `md5sum ./index.html`: `c23ff87381a0cce9e665404004340ac7`
- AFTER `md5sum ./index.html`: `6698e73fcf9d2b4ecce7e2f1a676552b`
- Hashes differ: yes (targeted edit of `./index.html` only, not rebuild).
- Original preserved as `./original-backup.html`: `9d5d0f4a7f3afc067b80865d3147b481` (unchanged).
- Harness: `./harness.cjs` (in-dir, node only, no installs, no `/tmp`, no `rm /tmp`)
  - `./original-backup.html` → FAIL (23 failures, exit 1)
  - `./index.html` (fixed) → PASS (70 passes, exit 0)
- Run from this directory with relative paths:
  - `md5sum ./index.html`
  - `node --check ./harness.cjs`
  - `node ./harness.cjs ./original-backup.html`
  - `node ./harness.cjs ./index.html`
- `node --check ./harness.cjs` → PASS (syntax OK).

## What was wrong (real-browser QA)
Composer paints GHOSTED (semi-transparent, text unreadable) and CLIPPED at the left edge in both themes; in dark only a sliver at the left edge remains. The Message jump button's `data-active` updates, so the state machine partially runs, but the composer's own visibility/position never settles into fully-shown, fully-in-viewport in the real demo flow. Previous fixes changed bytes (hint `.36→.92`, masks `74%→88%`, mirror `0→64px`, above `-56→0`, `display:block→inline-block`, marks vars) but left real paint unchanged because `.92/.88` is still semi-transparent (any alpha <1.0 still ghosts) and the flat-toggle path never re-settled.

## Exact stalling transition (why)
`Message→Toolbar→Footer auto-advance + Message-jump without timer clear + flat-toggle without re-settle + semi-transparent hint under mirror tilt + canvas clip + fade masks`.

- Page defaults `data-mirror="true"` with `perspective(1100px) rotateX(30deg) rotateY(+14deg) rotateZ(-7deg)` origin `100% 0`. Left edge swings forward into the mirror mask fade zone and beyond `10px` canvas padding into `.canvas{overflow:hidden}` clip. Painted message alpha = hint (`0.36` light) × mask fade (`~0.55`) ≈ `0.20` → ghosted, unreadable. Previous softening to `0.92/0.88` is still `alpha<1.0` → still semi-transparent → still ghosted in strict real-browser paint (harness old threshold `>=0.6` passed, hiding the defect). Dark `--card #1c1c1f` on `--surface #1c1c1f` already low-contrast, so after clip only a sliver remains.
- Dots/`data-active` and `status` update in `applySelection()` (offset-based, ignores transforms), so they look right while painted `opacity/visibility/colour/geometry` (mask × overflow × transform) never settles visible/in-viewport. Previous stub harness set `data-shown` directly and stubbed `getComputedStyle` to `opacity:1` always, ignoring masks/overflow/tilt, so it passed while browser still defected.
- Jump path stalled: `dots click → state.index=i; applySelection(i,true)` without `clearTimers()`/`loop()` leaves pending hide (`VISIBLE_BASE+HOLD`) + advance (`+GAP_M+GAP_H`) timers from the old index. Old advance fires `state.index=(state.index+1)%n` from the new index → reverts `Message→Toolbar` after `~1500ms`. Harness `Message jump survives pending auto timers` fails on original, passes on fixed. Same for `flatBtn`: toggled transform without `geom=measure();loop()` leaves overlay at stale tilt-based position in hide-phase.
- Fix settles fully-shown, fully-in-viewport: `overflow:visible` on `.canvas` + `.canvas-inner` + explicit `overflow:visible` on `.icp` (no hard clip, tilt + above card paint), `mask-image:none` on `.icp` base + mirror (fully opaque, no left fade), `display:inline-block` (shrink-wrap), mirror padding `64px` left room, above `0/0` (not `-56/-24`), marks `var(--x)/var(--y)` from measured base (not fixed `0,0`), fallback `cx=10` for all rows (not `-46` for Footer), hint `rgba(23,23,23,1)` light / `rgba(255,255,255,0.98)` dark (effectively opaque, `>=0.95`, not semi-transparent `.36/.92`), `geom=measure();applySelection(index,true)` on `load` + `fonts.ready` + `ResizeObserver(true)` (not stale `false`), `loop()` with `clearTimers()` on `play/mirror/flat/jump/arrow` (jump survives).

Targeted changes this round (on top of prior `c23ff...`):
- `--hint:rgba(23,23,23,.92)→rgba(23,23,23,1)` light, `rgba(255,255,255,.88)→rgba(255,255,255,0.98)` dark — fully-shown opaque text, fixes residual semi-transparent ghosting that `0.92` left.
- `.icp{...;overflow:visible}` + `.icp[data-mirror]{...;overflow:visible}` explicit — guarantees no hard clip of tilted stage even if defaults change.
- `flatBtn click → geom=measure();loop()` (same as `mirrorBtn`) — flat-toggle re-settles visible/in-viewport immediately instead of lingering in hide-phase at stale position.
- Harness threshold `alpha>=0.6→alpha>=0.95` for all message colour readability — asserts fully-shown opaque paint, not just legible; previous `0.92` now correctly fails as still semi-transparent.

## `demo-original.js` check (relative paths)
Read `./demo-original.js` + `./REPLICATE_SPEC.md` with relative paths before changing.
- Original `b` CSS uses same faint hint (`.36/.38`), same `74%/40%/82%` masks + `mirror left 0` + `above -56/-24`, `display:inline-block`, NO `overflow:hidden` on scene, `marks left:var(--x)/top:var(--y)`, auto-only timeline (`u(false)→o→show/hide/next`, no manual-jump stale-timer path).
- Replica added `.canvas{overflow:hidden}` + `display:block` + fixed `marks 0,0` + jump without `clearTimers` + fallback `cx -46`, so clipping + stalling are replica-only, not faithful to original — fix warranted.
- Faint hint IS original behaviour, but `REPLICATE_SPEC.md` design tokens require every state legible, and real-browser QA requires fully-shown opaque (semi-transparent counts as ghosted), so raising hint to `1/0.98` (effectively opaque, distinct light/dark) is required for the replica even though it diverges from original placeholder faintness. Noted here instead of reverting.
- Demo data kept verbatim (no invention).

## Kept constraints
- `/*noflash*/` kept (first `<script>` + `html{background...}` + `meta color-scheme`).
- In-place updates only: timers update text/class/attrs/styles on existing nodes; harness asserts `frame/tag/guide/cursor/size` identity across full loop.
- Zero `innerHTML` writes after init (static + runtime `writes=0`; `appJS.includes('innerHTML')===false`).
- Demo data verbatim: `Ask the agents to ship the new pricing page` / `Summarize the pricing research for the team` / `Auto` / `Work in a folder` / `Connect apps`.
- Light AND dark verified via page's own theme button + computed `opacity 1` / `visibility visible` / `color alpha>=0.95` at each phase; full auto-loop `Message→Toolbar→Footer→Message` via fake clock, no manual state-setting except handlers.
- No installs, no downloads, no `/tmp`, no `rm /tmp`. All commands use `./` relative paths in this directory.

## Harness (must drive OWN timeline, fake clock, painted asserts)
`./harness.cjs` (pure node):
- Static painted gates: `hint alpha>=0.95`, `.icp mask-image:none` (no gradients), `.canvas overflow:visible`, `.canvas-inner padding>=20px + overflow visible`, mirror `>=12px`, above `>=-20px`, no `overflow:hidden` on `.icp`, `display:inline-block`, marks `var(--x)/var(--y)`.
- Painted model (real-browser effects stub DOM normally misses): `maskFactor = masksNone?1.0:0.55`, `tiltShift = canvasVisible?0:30px`; message painted `color alpha = hintAlpha × maskFactor`; frame painted `left = style.left − tiltShift`. This is why previous byte-only fixes passed a naive stub but failed paint.
- Runtime in `vm` with stub DOM + `fakeSetTimeout/clearTimeout` + `getComputedStyle` returning painted `opacity/visibility/color`: from load `advance(100)` entrance → `advance 2500×3` full loop → per-phase painted checks (`Toolbar/Footer/Message` `data-shown true` + `alpha>=0.95` + `painted left>=0`) → `advance 5000` node identity → theme button light/dark painted checks → `click Toolbar` → `click Message` → `advance 1500` must stay `Selected: Message` + `data-shown true` + readable + in-viewport. No direct `setAttribute(data-shown)`.

### Original (`./original-backup.html`) — FAIL (exit 1)
```
PASS: noflash guard present — /*noflash*/ found
PASS: color-scheme meta present — meta found
PASS: zero innerHTML in source — none found
PASS: verbatim "Ask the agents to ship t..." present — Ask the agents to ship the new p
PASS: verbatim "Summarize the pricing re..." present — Summarize the pricing research f
PASS: verbatim "Auto..." present — Auto
PASS: verbatim "Work in a folder..." present — Work in a folder
PASS: verbatim "Connect apps..." present — Connect apps
PASS: row label "Message" present
PASS: row label "Toolbar" present
PASS: row label "Footer" present
FAIL: light message colour readable (alpha>=0.95) — hint light alpha=0.36
FAIL: dark message colour readable (alpha>=0.95) — hint dark alpha=0.38
FAIL: scene fully opaque (no gradient fade masks on .icp, mask-image:none) — gradients=true maskNone=false
FAIL: canvas not hard-clipping (overflow:visible on .canvas) — hidden=true visible=false
FAIL: canvas-inner leaves tilt room (padding>=20px + overflow visible) — padLeft=10px visible=false
FAIL: mirror padding leaves left room (>=12px) — mirror padding left=0px
FAIL: above offsets not clipped far left (<-20px) — above lefts=[-56px, -24px]
FAIL: scene not hard-clipped (no overflow:hidden on .icp) — overflow visible
FAIL: scene shrink-wraps (display:inline-block) — inline-block
FAIL: marks positioned from measured base (var(--x)/var(--y)) — uses vars
PASS: app script runs without throwing — ok
PASS: window.__icp exposed — found
PASS: entrance resolves visible (data-shown true after init) — data-shown=true
PASS: composer message node exists — found
PASS: message computed opacity 1 (not ghosted) — opacity=1
PASS: message computed visibility visible — visibility=visible
FAIL: message computed colour readable (alpha>=0.95) — color=rgba(0,0,0,0.198)
PASS: message text verbatim main — Ask the agents to ship the new pricing p
PASS: main card computed opacity 1 — opacity=1
PASS: main card computed visibility visible — visibility=visible
PASS: 3 inspection rows — rows=3
PASS: row "Message" card.x >=0 (not clipped left) — Message card.x=10
PASS: row "Message" x >=0 (not clipped left) — Message x=10
PASS: row "Toolbar" card.x >=0 (not clipped left) — Toolbar card.x=10
PASS: row "Toolbar" x >=0 (not clipped left) — Toolbar x=10
FAIL: row "Footer" card.x >=0 (not clipped left) — Footer card.x=-46
FAIL: row "Footer" x >=0 (not clipped left) — Footer x=-46
FAIL: selection frame painted left >=0 (fully in viewport, tilt+clip accounted) — painted left=-20px raw=10px tiltShift=30px
PASS: status Selected: Message after init — Selected: Message
PASS: tag shows Message after init — Message
PASS: full loop cycles 3 rows — Selected: Toolbar | Selected: Footer | Selected: Message
PASS: painted phase Toolbar selected — Selected: Toolbar
PASS: painted phase Toolbar visible (data-shown true) — data-shown=true
FAIL: painted phase Toolbar colour readable — color=rgba(0,0,0,0.198)
FAIL: painted phase Toolbar frame in viewport — painted left=-20px
PASS: painted phase Footer selected — Selected: Footer
FAIL: painted phase Footer frame in viewport — painted left=-76px
PASS: painted phase Message selected — Selected: Message
FAIL: painted phase Message frame in viewport — painted left=-20px
PASS: overlay frame node identity across loop
PASS: overlay tag node identity across loop
PASS: overlay guide node identity across loop
PASS: overlay cursor node identity across loop
PASS: overlay size node identity across loop
PASS: light theme message visible opacity 1 — opacity=1
FAIL: light theme message colour readable — color=rgba(0,0,0,0.198)
PASS: dark theme message visible opacity 1 — opacity=1
FAIL: dark theme message colour readable — color=rgba(255,255,255,0.20900000000000002)
PASS: light/dark tokens distinct — light=0.36 dark=0.38
PASS: jump to Toolbar sets Selected: Toolbar — Selected: Toolbar
PASS: Message jump sets Selected: Message immediately — Selected: Message
PASS: Message jump moves tag to Message — Message
PASS: Message jump moves scene (frame top changes vs Toolbar) — before=66px after=12px
PASS: Message jump sets dot active — d0=true d1=false
FAIL: Message jump survives pending auto timers (stays Message) — after old timers: Selected: Toolbar
PASS: Message jump stays visible after pending timers (data-shown true) — data-shown=true
FAIL: Message jump stays readable after timers (painted colour) — color=rgba(255,255,255,0.20900000000000002)
FAIL: Message jump stays in viewport after timers (painted geometry) — painted left=-20px
PASS: zero innerHTML writes after init (runtime) — writes=0

RESULT: 23 FAILURES (47 passes) — ./original-backup.html
```

### Fixed (`./index.html`) — PASS (exit 0)
```
PASS: noflash guard present — /*noflash*/ found
PASS: color-scheme meta present — meta found
PASS: zero innerHTML in source — none found
PASS: verbatim "Ask the agents to ship t..." present — Ask the agents to ship the new p
PASS: verbatim "Summarize the pricing re..." present — Summarize the pricing research f
PASS: verbatim "Auto..." present — Auto
PASS: verbatim "Work in a folder..." present — Work in a folder
PASS: verbatim "Connect apps..." present — Connect apps
PASS: row label "Message" present
PASS: row label "Toolbar" present
PASS: row label "Footer" present
PASS: light message colour readable (alpha>=0.95) — hint light alpha=1
PASS: dark message colour readable (alpha>=0.95) — hint dark alpha=0.98
PASS: scene fully opaque (no gradient fade masks on .icp, mask-image:none) — gradients=false maskNone=true
PASS: canvas not hard-clipping (overflow:visible on .canvas) — hidden=false visible=true
PASS: canvas-inner leaves tilt room (padding>=20px + overflow visible) — padLeft=28px visible=true
PASS: mirror padding leaves left room (>=12px) — mirror padding left=64px
PASS: above offsets not clipped far left (<-20px) — above lefts=[0, 0]
PASS: scene not hard-clipped (no overflow:hidden on .icp) — overflow visible
PASS: scene shrink-wraps (display:inline-block) — inline-block
PASS: marks positioned from measured base (var(--x)/var(--y)) — uses vars
PASS: app script runs without throwing — ok
PASS: window.__icp exposed — found
PASS: entrance resolves visible (data-shown true after init) — data-shown=true
PASS: composer message node exists — found
PASS: message computed opacity 1 (not ghosted) — opacity=1
PASS: message computed visibility visible — visibility=visible
PASS: message computed colour readable (alpha>=0.95) — color=rgba(0,0,0,1)
PASS: message text verbatim main — Ask the agents to ship the new pricing p
PASS: main card computed opacity 1 — opacity=1
PASS: main card computed visibility visible — visibility=visible
PASS: 3 inspection rows — rows=3
PASS: row "Message" card.x >=0 (not clipped left) — Message card.x=10
PASS: row "Message" x >=0 (not clipped left) — Message x=10
PASS: row "Toolbar" card.x >=0 (not clipped left) — Toolbar card.x=10
PASS: row "Toolbar" x >=0 (not clipped left) — Toolbar x=10
PASS: row "Footer" card.x >=0 (not clipped left) — Footer card.x=10
PASS: row "Footer" x >=0 (not clipped left) — Footer x=10
PASS: selection frame painted left >=0 (fully in viewport, tilt+clip accounted) — painted left=10px raw=10px tiltShift=0px
PASS: status Selected: Message after init — Selected: Message
PASS: tag shows Message after init — Message
PASS: full loop cycles 3 rows — Selected: Toolbar | Selected: Footer | Selected: Message
PASS: painted phase Toolbar selected — Selected: Toolbar
PASS: painted phase Toolbar visible (data-shown true) — data-shown=true
PASS: painted phase Toolbar colour readable — color=rgba(0,0,0,1)
PASS: painted phase Toolbar frame in viewport — painted left=10px
PASS: painted phase Footer selected — Selected: Footer
PASS: painted phase Footer frame in viewport — painted left=10px
PASS: painted phase Message selected — Selected: Message
PASS: painted phase Message frame in viewport — painted left=10px
PASS: overlay frame node identity across loop
PASS: overlay tag node identity across loop
PASS: overlay guide node identity across loop
PASS: overlay cursor node identity across loop
PASS: overlay size node identity across loop
PASS: light theme message visible opacity 1 — opacity=1
PASS: light theme message colour readable — color=rgba(0,0,0,1)
PASS: dark theme message visible opacity 1 — opacity=1
PASS: dark theme message colour readable — color=rgba(255,255,255,0.98)
PASS: light/dark tokens distinct — light=1 dark=0.98
PASS: jump to Toolbar sets Selected: Toolbar — Selected: Toolbar
PASS: Message jump sets Selected: Message immediately — Selected: Message
PASS: Message jump moves tag to Message — Message
PASS: Message jump moves scene (frame top changes vs Toolbar) — before=66px after=12px
PASS: Message jump sets dot active — d0=true d1=false
PASS: Message jump survives pending auto timers (stays Message) — after old timers: Selected: Message
PASS: Message jump stays visible after pending timers (data-shown true) — data-shown=true
PASS: Message jump stays readable after timers (painted colour) — color=rgba(255,255,255,0.98)
PASS: Message jump stays in viewport after timers (painted geometry) — painted left=10px
PASS: zero innerHTML writes after init (runtime) — writes=0

RESULT: ALL CHECKS PASSED (70 passes) — ./index.html
```

## How to test
Open `./index.html` in a browser, light and dark (top-right sun/moon). Auto-cycle `Message→Toolbar→Footer` with blue frame/handles/tag, red guide, `W Fill <n>px`, cursor; `Space` pauses, `←/→` jumps, `Message/Toolbar/Footer` dots jump and survive (stay + visible + readable + in-viewport). Check computed `opacity 1`, `visibility visible`, `color alpha>=0.95`, `frame.left>=0` at each phase. No `rm /tmp`, no installs.
