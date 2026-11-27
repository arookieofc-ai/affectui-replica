# Gradient Floor — replica report

## What was built
ONE self-contained `index.html` (26 KB, no network, system fonts) replicating the affectUI **Gradient Floor** decorative panel: blurred colour gradient glowing from the bottom edge, with drifting + morphing layers.

- Hero empty floor panel (`gradient-floor-demo__panel`, height 300px) matching the original demo first frame, plus a second mini instance (190px) demonstrating the `children`/`content` slot with overlay text.
- Clean-room JS: own `floorPath(geom, phase)` implementing the observed wave math (`110*sin(t)`, `-110*sin(t+0.5)`, `110*sin(t+1)`, `80*sin(t±PI/2+…)`), same path template `M…C…V(bottom)H…V…L…H…V…L…H…V…L…H…V…Z`.
- Two geometries verbatim: color `k:1, v1 [926.8,565.8], c [302.1,297.3], l [291.3,291.3], bottom 1222.8, r [3155.8,361.3], v4 [2493.8,565.8], v3 [2189.3,565.8], m2 [1898.8,428.8], m1 [1510.8,428.8], v2 [1230.8,565.8]`; light `k:0.8427, v1 [781.039,476.815], …` etc.
- Gradient verbatim: `linearGradient x1 1723.8 y1 423.3 x2 1723.8 y2 894.3 userSpaceOnUse`, stops `0 #FF7700 / 0.302885 #FF0055 / 0.673077 #0073FF`; viewBoxes `0 0 3447.1 1514.1` and `0 0 2904.96 1275.97`; `mix-blend-mode: plus-lighter` on light layer; blurs `145.65`/`122.74` in `100cqw/2200` units; drift keyframes `2.5s ease-in-out infinite` with translates `-120/-20, 100/12, -100/-10, 85/10`.
- Clock: `requestAnimationFrame` throttled to 32ms, `phase = now/(speed*1000)*2PI`, default `speed 3` (3s loop), `IntersectionObserver` toggling `data-paused`, `prefers-reduced-motion` disables JS morph + CSS drift.
- Controls (in-place only): Sunset/Ocean/Mint presets, Speed range 0–6 step 0.5, Pause/Play, theme toggle. No `innerHTML` anywhere after init; hover/focus never re-render.

## Matched data / behaviour
- Colours, stops, coords, geometries, viewBoxes, timings (morph 3s, drift 2.5s, throttle 32ms), blend mode, container-query sizing, dark bg `#111113` vs light `#fafafa` — all verbatim from `demo-original.js`.
- First frame `paint(0)` matches demo `d(path,0)`; loop is periodic (`phase 0 == 2PI`).
- Header adapted: no agent identities in this component, so no fake working/agent counts or pixel-marks (spec v3 pixel-mark rule N/A — correctly omitted rather than inventing agents). Page header shows component title + live status pill + theme toggle.
- Design tokens, light+dark via `data-theme`, default `light` (original demo appearance), toggle top-right with sun/moon icons.
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric `seg 10px = button 6px + 4px padding`; shadows for elevation / borders for dividers/inputs; `img` inset outline rule; icon optical nudge (`margin-right:-2px`); `[hidden]{display:none!important}`; SVG via `setAttribute` only.

## What could not be verified
- Pixel-perfect blur rendering vs original GPU compositing (no browser in this env — verified numbers/structure only with node).
- Real `IntersectionObserver` off-screen pause and `prefers-reduced-motion` OS behaviour (stubbed in harness; code paths match original).

## How to test
Open `index.html` in a browser (double-click, no server needed). Toggle sun/moon (top-right) for light/dark. Try Sunset/Ocean/Mint, drag Speed, press Pause. Disconnect network — glow still renders.

## Verification results (node only, no browser)
- `node --check extracted-main.js` → PASS.
- In-dir stub harness `verify-harness.cjs` → ALL CHECKS PASSED:
  - visible h1/description/controls, verbatim data (41 strings), noflash guard + bg style + color-scheme meta, hover gating, tap-highlight, tabular-nums, `[hidden]` rule, tokens, default light, no external assets, <200KB.
  - script eval zero `innerHTML` writes; visible motion/speed/loop status; default speed 3 + colours + stops; morph changes mid-loop; full 3s loop periodic; node identity preserved across full loop; zero `innerHTML` after init; `d` attributes painted (`M926.8…`, `M781.039…`); pause/speed/presets update in place; `applyTheme('dark')` + `applyTheme('light')` both verified; no SVG `className` assignment; no `innerHTML` in source.
- Light AND dark checked via `applyTheme` + token presence.
