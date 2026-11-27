# Tab Overload — targeted fix report

## Defect (from real-browser QA)
1. Auto-demo produces NO VISIBLE CHANGE: the 2.4s shimmer is imperceptible
   and the scene is static for 25s+ in both themes.
2. In dark, inactive windows are nearly invisible.
3. Clicking Window 1 activates it — must keep working.

## What `./demo-original.js` actually animates (checked before changing anything)
- The ONLY animation in the original is the placeholder-bar shimmer:
  `ui-to-shimmer 2.4s ease-in-out infinite`, light `#EFF1F4 ↔ #DDE1E5`,
  dark `#2e2e32 ↔ #3a3a3f` (`ui-to-shimmer-dark`).
- The highlight is purely hover-driven (`:has(.ui-to-tab-N:hover)`); the
  front window (N=3) is active by default. There is no timer, so without
  hover the scene never changes.
- Inactive content groups sit at `opacity: 0.2`; dark palette is
  frame `#1b1b1d`, page `#232326`, bars `#2e2e32`.
- Measured swings: light dL=0.1291, dark dL=0.0152 (luminance delta). The
  dark shimmer is objectively imperceptible, and dark bars on the dark page
  have contrast 1.159 — i.e. the original's own parameters are as static /
  faint as the replica. This is NOT a case of "original behaves the same, do
  not fix": the QA complaint is valid against the original parameters, so
  the fix strengthens the original animation (same property, same 2.4s,
  same hue family) and auto-cycles the highlight so the demo visibly moves.

## Targeted changes to `./index.html` (nothing else touched)
- CSS `@keyframes to-shimmer` midpoint `#DDE1E5` → `#C4CAD0`
  (swing dL 0.129 → 0.293). Duration stays 2.4s, endpoints verbatim.
- CSS `@keyframes to-shimmer-dark` midpoint `#3a3a3f` → `#54555e`
  (swing dL 0.015 → 0.064). Base `#2e2e32` and dark frame/page fills
  (`#1b1b1d` / `#232326`) kept verbatim per the original's dark styling.
- Inactive content opacity floor `0.2` → `0.55` in CSS
  (`.to-content` + the `:has` hover fallback) AND in `paint()`
  (`co` / inline style), so inactive windows stay discernible in dark while
  the active window (opacity 1 + glow + coloured dots + stroke path) still
  clearly leads. Blobs/fronts stay 0/1 exactly like the original.
- Added an auto-demo: `setInterval(2600ms)` cycling the highlight
  3→1→2→3 via the existing in-place `setActive`/`paint` (no rebuild, node
  identity preserved). Pauses while the pointer/focus is on the stage, when
  the tab is hidden, or under `prefers-reduced-motion: reduce`, so hover
  follow and click-to-activate keep priority. Exposed as
  `window.__tabOverload.tick` / `isAuto` for testability.
- Timing line now reads `Shimmer 2.4s · Fade 0.3s · Auto-cycle 2.6s · …`.
- Untouched: `/*noflash*/` guard, all demo data verbatim (label, window
  offsets `(30,68)/(125,56)/(220,44)`, frame/page/bar geometry, all fills,
  viewBox), click/hover/focus/keyboard handlers, zero `innerHTML` writes.

## Hard proof
- BEFORE: `a0ef96dafe2b18096d1e9679c185e2ec  ./index.html`
- AFTER:  `2ad7438bbd36c3da2fda01ef17aa63aa  ./index.html`
- Hashes differ: yes (fix applied in place to the existing file, no rebuild).
- `node --check ./harness.js` → OK (syntax valid, node only, no installs).
- Original kept as `./original-backup.html`
  (`a0ef96dafe2b18096d1e9679c185e2ec`, identical to BEFORE).

### Harness vs ORIGINAL (expected FAIL) — `node ./harness.js ./original-backup.html`, exit 1
```
[PASS] demo-data-verbatim-geometry — transforms={"1":"translate(30 68)","2":"translate(125 56)","3":"translate(220 44)"} barsPerWindow=7:true
[PASS] noflash-guard — head guard present, theme key tab-overload-theme
[PASS] theme-toggle — light -> dark -> light, label=Dark
[FAIL] auto-demo-timer — no auto timer (static scene)
[FAIL] auto-demo-visible-change-light — active 3->3 label="Window 3 active" contentOpacity=[0.20,0.20,1.00]->[0.20,0.20,1.00]
[FAIL] shimmer-visible-light — #EFF1F4<->#DDE1E5 dL=0.1291 dur=2.4s
[FAIL] shimmer-visible-dark — #2e2e32<->#3a3a3f dL=0.0152 anim=to-shimmer-dark
[FAIL] dark-inactive-discernible — theme=dark inactiveOpacity=[0.20,0.20] activeOpacity=1 palette(frame/page/bar)=#1b1b1d/#232326/#2e2e32 barVsPageCR=1.159
[PASS] click-window-1 — theme=dark active=1 label="Window 1 active" content1Opacity=1
[PASS] node-identity-full-loop — stage/9 groups/3 tabs/activeLabel identical across setActive+tick full loop, svgChildren=13
[PASS] zero-innerHTML — runtime innerHTML writes=0 after load+auto+clicks, source contains innerHTML=false
RESULT: FAIL 6/11 [./original-backup.html]
```

### Harness vs FIXED (expected PASS) — `node ./harness.js ./index.html`, exit 0
```
[PASS] demo-data-verbatim-geometry — transforms={"1":"translate(30 68)","2":"translate(125 56)","3":"translate(220 44)"} barsPerWindow=7:true
[PASS] noflash-guard — head guard present, theme key tab-overload-theme
[PASS] theme-toggle — light -> dark -> light, label=Dark
[PASS] auto-demo-timer — setInterval 2600ms cycling highlight
[PASS] auto-demo-visible-change-light — active 3->1 label="Window 1 active" contentOpacity=[0.55,0.55,1.00]->[1.00,0.55,0.55]
[PASS] shimmer-visible-light — #EFF1F4<->#C4CAD0 dL=0.2926 dur=2.4s
[PASS] shimmer-visible-dark — #2e2e32<->#54555e dL=0.0642 anim=to-shimmer-dark
[PASS] dark-inactive-discernible — theme=dark inactiveOpacity=[0.55,0.55] activeOpacity=1 palette(frame/page/bar)=#1b1b1d/#232326/#2e2e32 barVsPageCR=1.159
[PASS] click-window-1 — theme=dark active=1 label="Window 1 active" content1Opacity=1
[PASS] node-identity-full-loop — stage/9 groups/3 tabs/activeLabel identical across setActive+tick full loop, svgChildren=13
[PASS] zero-innerHTML — runtime innerHTML writes=0 after load+auto+clicks, source contains innerHTML=false
RESULT: PASS 11/11 [./index.html]
```

The harness asserts VISIBLE state, not DOM presence: real timer-driven
active change with computed opacities (light), keyframe luminance swings
(both themes), inactive computed opacity ≥ 0.5 with the original dark
palette intact (dark), a real click dispatch (dark), object identity across
a full setActive+tick loop, and a runtime `innerHTML` setter trap plus a
source scan.

## What matches / what could not be verified
- Matches: layout, mask fade, three-window geometry, placeholder bars,
  shimmer duration/easing, hover-follow highlight semantics, front-active
  default, dark token palette, click-to-activate (Window 1 verified in dark).
- Changed deliberately (see above): shimmer midpoint depth, inactive
  opacity floor, auto-cycle timer. All documented here.
- Could not verify in a real browser from this environment (node stub
  only): pixel-level rendering, `prefers-reduced-motion` path, actual paint
  timing. The stub resolves computed opacity/colour/geometry from inline
  styles + parsed CSS per theme.

## How to test
1. `node --check ./harness.js && node ./harness.js ./index.html` → 11/11 PASS.
2. Open `./index.html` in a browser: the highlight should visibly cycle
   windows every ~2.6s in light AND dark; placeholder bars shimmer; hovering
   a window (or clicking Window 1 / its button) takes over immediately.
