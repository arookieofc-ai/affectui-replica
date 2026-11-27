# World Map Continental — replica report

## What was built
- Single self-contained `index.html` (24.9 KB, <200 KB) in this directory. Inline CSS + JS, no network, no external assets, system fonts only.
- Page: top bar (`World Map` + live meta `Europe highlighted · 6 continents` + sun/moon theme toggle top-right), card with title `World map with Europe highlighted` + sub `pastel coastline · switchable`, stage with the map, hint row with keyboard help.
- Component `ui-wm`: `div.ui-wm` aspect `540/242`, `div.ui-wm-map[role=img]` + `svg.ui-wm-art` (land group + highlight layer group), pill trigger + morphing listbox menu. Clean-room code, own structure/names where possible, same look/behaviour.

## Matched data / behaviour (verbatim from demo-original.js)
- Continents (order + strings): `north-america/North America`, `south-america/South America`, `europe/Europe`, `africa/Africa`, `asia/Asia`, `oceania/Oceania`. Default `europe`.
- Aria: `World map with {Name} highlighted`, trigger `Continent: {Name}`, listbox `Select a continent`.
- Transform origins: `[141,49] [181,162] [302,36] [296,121] [385,56] [462,185]`.
- Shine gradient stops: `#FFA0AB #FFB89E #C8A8E5 #A8B5FF`; land `#E8E8E8`, focus `#FFFFFF/#E2E2E2`; dark land `#2a2a2d`, focus `#46464c`.
- Bands: widths `6 / 1.4`, dasharrays `180 820 / 200 800 / 140 860 (-30) / 80 920 (-60)`, opacities `.45/.32/.55/1`, blur `4`, travel `14s linear infinite` delays `-0.42s/-0.84s`.
- Layers: `enter 520ms cubic-bezier(0.22,1,0.36,1) scale(.94)`, `exit 320ms cubic-bezier(0.4,0,1,1)`, cleanup `480ms`.
- Switcher: `28px` pill, `172px` panel, morph `420ms cubic-bezier(0.32,0.72,0,1)`, close `300ms`, fill `190ms`, check `160/260ms`, scale `min(1,max(.62,min(w/540,h/260)))`, outside-close on `pointerdown` capture, keys `ArrowDown/Up/Home/End/Enter/Space/Escape/Tab`.
- Geometry note: map outlines are simplified clean-room silhouettes at the same placements (not the 40 KB minified path dump), so coastline detail differs by design. All names/numbers/strings/timings match.

## v5 polish + spec rules
- Tokens for every colour; light default (original demo appearance) + dark via `html[data-theme]`, toggle overrides stored `ui-wm-theme` else `prefers-color-scheme`.
- `/*noflash*/` guard first in `<head>` + `html{background}` + `<meta name=color-scheme>`.
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`; `tap-highlight transparent`; `tabular-nums` on body; concentric radii (panel 16 / pad 5 / option 10); borders for structure + layered shadows for elevation; `focus-visible` rings; `[hidden]{display:none}`; SVG classes only via `setAttribute`; no `innerHTML` anywhere.
- No agent identities in this component, so no 3×3 pixel-marks (spec: only if the component has agent identities).
- In-place only: DOM built once at init; timers update text/attrs/styles on existing nodes; no full `innerHTML` render from any handler.

## Verification (node only, no browser)
- `node --check` on the extracted page script: OK.
- In-dir stub harness `harness.cjs` (no installs): loads `index.html`, runs the page script in a DOM stub, advances real timers past the 480 ms exit cleanup through the sequence `europe → north-america → south-america → europe → africa → asia → oceania → europe`:
  - visible trigger/title text correct at every step (textContent, not just aria),
  - `layers.length===1` after each cleanup,
  - trigger/panel/option/map/title keep `===` identity across the full loop,
  - `innerHTML` writes after init `===0`,
  - light AND dark checked (`data-theme=light/dark` both keep visible text; CSS contains both token sets).
- Result: `ALL HARNESS CHECKS PASSED`.
- Manual: open `index.html` in a browser, switch continents, toggle theme, test keyboard, resize narrow.

## What could not be verified
- Pixel-exact coastline vs original (intentional clean-room simplification).
- Real `ResizeObserver`/layout offsets (stub returns fixed sizes; browser path uses live measurements with the same formula).
