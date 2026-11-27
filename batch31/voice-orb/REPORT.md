# Voice Orb — Replica Report

## What was built
`index.html` (18.8 KB, self-contained, no network, system fonts) replicating the Voice Orb assistant sphere:
- Canvas sphere of dots: breathing idle, level-driven listening swell, thinking ring collapse with travelling bright arc, speaking ripple, depth shading + radial glow, pointer repel.
- Label below orb with `aria-live="polite"`: `Tap to speak` / `Listening` / `Thinking` / `Speaking`, animated `...` dots when not idle.
- Orb is a `<button>` (click advances state); segmented `radiogroup` with `Idle / Listening / Thinking / Speaking`; auto-cycle loop with manual override pausing auto-cycle.
- Page chrome: top bar with `Voice Assistant` + working count (`0 working` idle / `1 working` active) + `1 agent`, theme toggle (sun/moon, top-right). Footer note.

## Matched data / behaviour (verbatim from demo-original.js)
- Labels: `Tap to speak`, `Listening`, `Thinking`, `Speaking`; button labels `Idle`, `Listening`, `Thinking`, `Speaking`.
- Order: `idle → listening → thinking → speaking → loop`.
- Timings: idle 2000 ms, listening 3200 ms, thinking 2600 ms, speaking 3600 ms.
- Geometry: size 220, dots 520, Fibonacci sphere with golden angle `PI*(3-sqrt(5))`, DPR cap 2.5.
- Speeds: idle 0.16, listening 0.3, thinking 1.9, speaking 0.42 (blended spin).
- Level synthesis: listening `0.35+0.35*sin(2.1t)*sin(5.3t)+0.3*sin(9.7t+1)*sin(0.9t)`; others `0.3+0.7*|sin(4.1t)|*(0.5+0.5*sin(1.3t+2))`; smoothing `12/s`, spin blend `5/s`, pointer `8/s`.
- Displacements: idle breath `0.022*sin(1.3t+y*2)`; listening `level*0.3*max(0,noise)^1.4`; speaking `level*0.13*sin(y*7.5-7t)`; thinking ring (`y*0.2`, xz normalised, `cos^6` arc).
- Glow: `(listening+speaking)*level*0.16 + thinking*0.05`; colours ink `#171717`→accent `#2f6bff` (dark `#ededed`→`#6f9bff`).
- Reduced-motion, IntersectionObserver + visibility pause, pointer repel radius `0.2*size`.
- Clean-room: own variable names/structure; no verbatim copy of compiled source.

## What was not / could not be verified
- Pixel-exact canvas vs original (no browser; verified behaviour markers + code formulas only).
- No agent identities in this component, so 3x3 pixel-marks N/A (spec requires them only if identities exist).
- No content images, so image outline rule N/A; no SVG used (setAttribute rule vacuously satisfied); no dialogs (pointerdown-capture listeners added on orb + radiogroup so clicks survive).

## Spec compliance
- Tokens via CSS vars; light (`surface #ffffff`, `page #fafaf9`, `ink #171717`, `muted #78716c`, `subtle #f5f5f4`, `border #e7e5e4`) and dark (`#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33`); amber waiting tokens present; radius-lg 16 / radius 10 / radius-sm 6; soft shadows; 14 px base, 15–16 px titles, 12–13 px muted meta; pills 999 px; card 1 px border + shadow, focus-visible outline, 150–200 ms transitions.
- Default theme = original demo (light); toggle overrides via `localStorage voice-orb-theme`, else `prefers-color-scheme`.
- `/*noflash*/` guard first in `<head>` + `html{background…}` + `meta color-scheme`.
- In-place updates only: DOM built once; timers update text/attrs/classes/styles; zero `innerHTML` after init; harness asserts node identity across full loop.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (card 16 px = stage 10 px + 6 px padding); shadows for elevation / borders for structure; theme button optical nudge (icon side 6 px vs 10 px).
- `[hidden]{display:none !important}`; no broad `svg{display:block}` rule.

## How to test
- Open `index.html` in a browser. Orb auto-cycles; click orb or state buttons (manual pauses auto-cycle). Toggle theme top-right; reload persists.
- Node only: `node --check` on extracted script + `node ./harness-check.js` (in-dir DOM stub, advances timers through full loop, asserts visible text/state, node identity, zero innerHTML writes, light+dark).

## Verification results
- `node --check` on extracted main script: PASS.
- `node ./harness-check.js`: ALL CHECKS PASSED — initial idle/`Tap to speak`, loop `idle>listening>thinking>speaking>idle`, visible labels `Tap to speak | Listening | Thinking | Speaking | Tap to speak`, per-state dots/working/radiogroup, node identity preserved, zero `innerHTML` writes, timings 2000/3200/2600/3600 + 520 dots, theme toggle light↔dark with persistence, dark tokens present. Light AND dark checked.
