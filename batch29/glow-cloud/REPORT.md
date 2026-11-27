# Glow Cloud — replica report

## What was built
Single self-contained `index.html` (~24 KB, inline CSS + JS, no external deps) replicating the affectUI
"Glow Cloud" (slug `glow-cloud`): a glowing cloud with eyes in red-orange (default) or blue, floating,
looking around, blinking, and winking when poked.

- Cloud body: five merged circles (`115,93 r43 · 163,111 r39 · 156,155 r31 · 107,155 r35 · 72,126 r34`)
  plus belly rect (`80,100 80×65`) fused through a goo filter (`blur 3.5 + colormatrix 28 −12`),
  rim gradient + soft body gradient (`scale 0.9 0.87` at `120,120`), top shine ellipse, ground shadow.
- Eyes: rects at `y 106, w 18, h 31, left 96.5 / right 127.5` with eye gradient, clipped shade stroke,
  lids scaling around each eye centre; right eye additionally winks.
- Motion: sine bob (`sin(T·1.1)·5`) + squash spring on poke, gaze springs toward wander targets
  (`(0,0) (−1,.05) (1,−.05) (0,0) (.65,−.55) (−.7,.35)`) or the pointer, blink timer with 25% double-blink,
  shadow shrink/fade with height — all values verbatim from `demo-original.js`.
- Controls: Red-orange / Blue segmented switch, sky-background toggle, follow-pointer toggle,
  motion toggle, "Poke + wink" and "Blink now" buttons, live status line + blink/wink/look counters,
  keyboard (`Space/Enter` poke, `B` blink, `W` wink, `C` colour), focus-visible outlines, responsive stack.
- Page chrome per spec: token-driven light/dark themes, sun/moon toggle (`data-theme` on `<html>`,
  `localStorage glow-cloud-theme`, `prefers-color-scheme` default), noflash guard as first `<head>` node,
  hover rules only inside `@media (hover: hover) and (pointer: fine)`, `tabular-nums` counters,
  concentric radii, shadow-for-elevation, 1px inset outline on the artwork.

## What matches the original
Palette variables (blue + `data-color="orange"` + dark variants), geometry, filters, gradients, label
("A glowing cloud with eyes that floats, looks around and blinks"), and the full animation state machine
(float, gaze springs, blink/wink envelopes, poke squash, pointer tracking, offscreen pause).

## What could not be verified
Pixel-exact rendering vs the original site (no browser available in this environment — verification was
node-only by constraint). Timing feel (spring constants copied verbatim, so behaviour should match).

## How to test
1. Open `index.html` in a browser.
2. Watch it float, look around, and blink; hover to steer its gaze; click it to squash + wink.
3. Switch Red-orange/Blue, toggle sky background, follow-pointer, and motion; use keyboard shortcuts.
4. Click the sun/moon button — confirm the whole page (not just the cloud) looks finished in both themes.

## Verification (node only, in-dir stub)
- `node --check verify.js` — harness syntax OK.
- `node -e` + `vm.Script` over each inline `<script>` — both syntax OK.
- `node verify.js` — **ALL CHECKS PASSED (48/48)**: noflash guard, color-scheme meta, v5 polish
  (hover media, tap-highlight, tabular-nums), design tokens, zero `innerHTML` writes in source and at
  runtime, node identity preserved across a 400-tick full loop with no nodes added/removed, non-empty
  visible painted status text, blink/wink counters updating in place, blue↔orange switching,
  light→dark→light theme toggle, keyboard handler present.
- Checked light **and** dark themes (token blocks + runtime toggle both directions).
