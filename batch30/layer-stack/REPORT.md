# Layer Stack — replica report

## What was built
Standalone `index.html` (15 KB, self-contained, no external deps) replicating the
affectUI **Layer Stack** card (slug `layer-stack`, illustration / Card illustrations, Free).

Public behaviour: *isometric five-layer stack with list; chosen entry lifts its layer in colour.*

- Left: isometric SVG stack (viewBox 600x400), 5 diamond layers with glow,
  side + top faces, stroke icons, active layer tinted blue with glow.
- Right: vertical `tablist` menu with gliding white pill behind the chosen row.
- Auto-advance every 2600 ms, hover/focus pauses, click pins the selection
  (stops auto, shows “Resume auto”), ArrowUp/ArrowDown/Home/End move with
  roving tabindex, focus follows (matches original `children[r+1]` offset logic).
- Respects `prefers-reduced-motion`: no auto-loop.
- Narrow (<620 px): stack on top (300 px), list below, full width.

Demo data verbatim from the chunk (titles + hints + icon keys):
1. Triggered by events / Webhooks / bolt
2. Grounded in your data / Context / database
3. Connected to your apps / APIs / plug
4. Works with any model / Routing / spark
5. Traced at every step / Logs / pulse

Icons are hand-drawn 24px stroke equivalents (same semantics/shapes as the
chunk); no compiled CSS/JS was copied. All class names, tokens, and structure
are original (`lyr-*`, `row-*`, `menu`, `pill`).

## What matches the original
- Layer geometry: size 104, step 26, base 109, active lift 34, above-gap 58,
  x=168, side offset y+9, face matrix `1 0.5 -1 0.5 0 0`, glow ellipse
  (0,79,70,24, blur 14), icon box translate(34,34) scale(1.5).
- Motion: 560 ms layer ease `cubic-bezier(.65,0,.25,1)`, 460 ms pill glide,
  420/360/300 ms fades, above-layers turn glassy.
- Menu: pill `translateY(index*52px)`, rows 52 px, title 14 px medium ellipsis,
  hint 12 px muted ellipsis, active title blue.
- Tokens: light/dark custom properties for every colour, 16/10/6 radii,
  999 px pills, 1 px + soft shadow cards, 150–200 ms hovers, focus-visible ring.

## v3/v4/v5 compliance
- v3 Crew-specific rules (token counts, 3x3 pixel-marks, tool dots, sub-agent
  cards) are N/A to this illustration; applicable parts kept: no text under
  buttons, single-line ellipsis, legible dimmed nodes (opacity ≥ .75 via
  glassy fills, not faded text).
- v4: `<head>` starts with `/*noflash*/` script (stored key
  `layer-stack-theme` → `prefers-color-scheme`), inline
  `html{background}` + `meta color-scheme`. DOM built once in `buildOnce()`;
  `tick`/`select`/`paint` only mutate `style.transform`, attributes,
  `textContent`, `tabIndex`, `hidden` in place. No `innerHTML` anywhere.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`;
  `html{-webkit-tap-highlight-color:transparent}`;
  `body{font-variant-numeric:tabular-nums}`; concentric menu(18) =
  pill(10) + padding(8); shadows for elevation, borders only for structure;
  generic `img` inset-outline rule (no content images in this demo);
  theme button icon side has tighter padding for optical alignment.

## What could not be verified
- Pixel-exact comparison against the live affectUI page (no browser/screenshots
  in this environment; verified by geometry/behaviour parity with
  `demo-original.js` plus DOM-stub harness).
- Real container-query scaling at arbitrary widths (replica uses the same
  proportions with a grid/stacked fallback; checked via CSS review only).
- Pro `.tsx` source was not fetched or reproduced, per spec.

## How to test
- `open index.html` in a browser (or serve the directory).
- Click rows, hover the stage (pauses), use ArrowUp/ArrowDown, toggle
  sun/moon top-right, resize below 620 px, try `prefers-reduced-motion`.
- Node-only verification (no browser): `node harness.js` and
  `node --check main-check.js && node --check harness.js`.

## Checks completed
- `node --check` passes for extracted main JS, harness, and demo chunk.
- `node harness.js`: ALL CHECKS PASSED — asserts verbatim visible painted
  text (5/5 titles+hints), full-loop (5 ticks) node identity for layers/rows/
  pill, zero `innerHTML` writes after init, roving tabindex/aria-selected,
  pill transform `156px` at index 3, theme toggle switch + persistence, and
  both `data-theme="light"` and `"dark"` runs.
- Light AND dark themes confirmed via token review + harness runs in both
  modes (dark: page #101012, surface #1c1c1f; light: page #fafaf9,
  surface #ffffff).
