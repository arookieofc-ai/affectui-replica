# REPORT — inspect-composer

## What was built
Standalone `index.html` (<200KB, inline CSS+JS, system fonts only) replicating the affectUI **Inspect Composer** Pro illustration: a chat composer rendered as a design-tool selection — tilted 3D stage, blue selection frame with hatch + dashed inset, spacing badges `10`/`10`, red dashed guide with `0` edge badge, hand cursor, and `W Fill {width}px` size pill. A dimmed back copy of the composer sits above/behind the main card.

Demo data is verbatim from `demo-original.js` defaults: `Ask the agents to ship the new pricing page`, `Summarize the pricing research for the team`, mode `Auto`, `Work in a folder`, `Connect apps`, rows `Message` (order 0) / `Toolbar` (order 1) / `Footer` (order 2). Clean-room code: all markup/CSS/JS rewritten by hand; no bundle source copied.

## What matches the original
- Layout: 320px composer (write card + 36px foot), back card offset above with fade mask, stage `perspective(1100px)` tilt, mirror variant flips Y/Z tilt and badge/tag anchoring, flat-2D switch removes tilt.
- Selection loop: cycles Message → Toolbar → Footer with staggered fade/scale-in (`--d` delays), show ~30ms in, hide after `590+hold`, step every `590+hold+180+120`; reduced-motion shows a static selection.
- Marks: blue `#4f8ff7` (dark `#3b82f6`) frame/handles/tag/badges, red `#ff3b30` guide with end ticks, white hand cursor, `W Fill NNNpx` pill, edge `0` badge hidden on the last row.
- Tokens, card borders + soft shadows, hover lift, focus-visible rings, 150–200ms transitions, tabular numerals.
- v5 polish: hover rules only inside `@media (hover: hover) and (pointer: fine)`, `tap-highlight-color: transparent`, `tabular-nums`, concentric 16px/15px radii, shadows for elevation + real borders for structure, SVG logo inset outlines, optical nudge on send/approval icon padding.

## What could not be verified
- Pixel-exact geometry vs the original site (no screenshots; offsets measured live via offset chains with deterministic fallbacks in the stub).
- Real font rendering (Inter in original vs system sans here) and exact gradient hues of the three app logos (redrawn as simple glyphs).
- Touch-tap latched-hover behavior and narrow-screen stacking beyond a 640px stacked/scroll fallback (no browser launch per task rules).

## How to test
- Open `index.html` in a browser. Controls: Pause/Play, Mirror, Flat 2D, row jump pills, theme sun/moon, approval pill cycles Auto→Manual→Ask, arrow keys move selection when the scene is focused.
- Node-only verification (no browser): `node -e "...extract script..."; node --check script.check.js; node --check harness.cjs; node harness.cjs` — all run inside this directory.

## Checks confirmed
- `node --check` passes for app JS and harness.
- Harness asserts VISIBLE painted text (all five verbatim strings + Message/Toolbar/Footer + W Fill/10/0), full-loop (3-step) node identity for all overlay nodes and row nodes, zero `innerHTML` writes after init, and light AND dark themes (toggle flips `data-theme`, painted text intact in both, distinct page/accent tokens per theme).
- Checked 2026-11-27: light theme legible (ink on page/surface, muted secondary), dark theme legible (no grey-on-grey, borders visible). PASS.
