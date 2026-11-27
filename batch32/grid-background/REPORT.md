# Grid Background — replica report

## What was built
- `index.html` (self-contained, ~21KB, system fonts, no network) replicating the affectUI **Grid Background** component: fine line grid drifting slowly behind content, fading toward the edges.
- Clean-room CSS/JS: own class names (`.gb`, `.gb-grid`, `.gb-reveal`, `.gb-lines`), same observed behaviour as `demo-original.js`, no verbatim copy of the compiled bundle.
- Hero content inside the grid uses the demo copy verbatim: pill `New`, title `Build on a steady grid`, sub `A quiet backdrop that keeps moving, so your hero never feels static.`
- Interactive controls (all in-place, keyboard accessible): direction group (Diagonal/Up/Down/Left/Right), sliders for cell size (16–96, default 48), speed/loop seconds (0–8, default 3), edge fade (30–100%, default 70), Reveal on/off + Replay reveal, Reduced-motion toggle, live loop clock (`t+… · cycle …`) updating every 250ms via `textContent` only.
- Top bar with component label + live meta (`size 48 · speed 3s · diagonal · fade 70%`) and a visible sun/moon theme toggle (top-right).

## Matched data / behaviour / timings
- Defaults: `size 48`, `speed 3`, `direction diagonal`, `reveal true`, `fade 70` — from demo-original.js.
- Direction vectors verbatim: `up [0,-1]`, `down [0,1]`, `left [-1,0]`, `right [1,0]`, `diagonal [-1,1]`; drift target `dx=h*size`, `dy=g*size` (`-48px,48px` default), `animation: drift speed linear infinite`.
- Grid overscan `inset: calc(size * -1)` so a one-cell shift loops seamlessly; 1px lines via two `linear-gradient`s, `background-size: size size`.
- Edge fade: still radial mask `ellipse at center, #000 20%, transparent fade%`.
- Reveal: circle from center to corners, `1.6s cubic-bezier(0.22,1,0.36,1)` via `@property --gb-r`, `IntersectionObserver threshold 0.2`, immediate show when `reveal=false`, no IO, or `prefers-reduced-motion`.
- `data-static` when `speed<=0` (animation none); `prefers-reduced-motion` disables drift + reveal mask.
- Dark line `rgba(255,255,255,0.07)` vs light `rgba(0,0,0,0.07)`.
- No agent identities in this component, so no 3×3 pixel-marks (spec: only if the component has agent identities).

## Spec compliance (v3/v4/v5)
- Tokens via CSS vars; light `surface #ffffff/page #fafaf9/ink #171717/muted #78716c/subtle #f5f5f4/border #e7e5e4`, dark `surface #1c1c1f/page #101012/ink #ededed/muted #a1a1aa/subtle #26262a/border #2e2e33`; amber waiting adjusted for dark.
- `/*noflash*/` guard first in `<head>` (stored key `grid-background-theme` else `prefers-color-scheme`, defaults light = original demo), inline `html{background:#fafaf9}html[data-theme=dark]{background:#101012}`, `<meta name=color-scheme>`.
- In-place only: DOM built once; timer/controls update `textContent`/`setAttribute`/`style.setProperty` on cached nodes; hover/focus never re-render; `[hidden]{display:none!important}`; SVG classes via `setAttribute`; no broad `.x svg{display:block}` rule.
- v5: all `:hover` inside `@media (hover:hover) and (pointer: fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}` (clock/counters); concentric radii (`panel 16px = inner 10px + 6px padding`); shadows for elevation / borders for structure; image inset-outline rule included; icon-button optical padding nudge.

## How to test
- Open `index.html` in a browser (double-click or `python3 -m http.server` then visit). Try direction buttons, sliders, Reveal/Replay, theme toggle, narrow width, and `prefers-reduced-motion`.
- Node-only (no browser): `node ./harness.cjs` then `node --check ./extracted-main.js`.

## Verification results
- `node --check ./extracted-main.js`: OK.
- `node ./harness.cjs`: ALL CHECKS PASSED —
  - verbatim copy present and visible (not aria-only, not `display:none`);
  - tokens/noflash/polish/timings present; all `:hover` guarded;
  - stub-DOM run exposes `window.__gb`; 12s of ticks (48×0.25s) + interval/timeout flush + direction cycle + speed 0↔3 + theme light→dark→light;
  - unchanged nodes (`gb`, `stDir`, `stSize`, `liveOut`, `topMeta`) keep object identity across full loop;
  - zero `innerHTML` writes after init;
  - visible state `diagonal/48px/3s/70%/clock advancing`; light AND dark toggle verified (`data-theme`, label `Light`/`Dark`).
- Checked light and dark: harness asserts both theme paints; manual token review confirms contrast (no grey-on-grey, borders visible in both).

## What could not be verified
- Pixel-perfect screenshot diff vs the Pro site (no browser in this env); easing/mask rendering relies on real CSS engine, but values mirror the demo chunk.
- Real `IntersectionObserver` timing (stubbed as no-op + 1.7s fallback); in-browser reveal was coded to the same 0.2 threshold + 1.6s animation.
