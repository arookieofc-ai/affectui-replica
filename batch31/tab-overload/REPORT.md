# Tab Overload — Replica Report

## What was built
- ONE self-contained `index.html` (19.6KB, no network, system fonts only).
- Clean-room replica of “Tab Overload: Overlapping browser windows where the highlight follows the hovered tab”.
- Layout: page header + card with SVG illustration (viewBox `0 0 360 240`, aspect `3/2`, right/bottom fade mask), status row, window buttons, timing meta, footer.
- Interaction: highlight follows hovered/focused window; front window (3) active by default; buttons + keyboard (arrows/Home/End) + touch (`pointerdown` capture) update active window in place.
- Theme toggle (◐ Dark/Light) top-right, `data-theme` on `<html>`, persisted as `tab-overload-theme`. Default = original light appearance; respects `prefers-color-scheme` when no stored value.

## Matched data / behaviour (verbatim from demo-original.js)
- Label: `Three overlapping browser windows full of placeholder content` (used as visible H1 sub + `aria-label`).
- Windows: `{n:1,x:30,y:68}`, `{n:2,x:125,y:56}`, `{n:3,x:220,y:44}`.
- Frame `380×300 rx6 #F4F5F7 / #E4E7EC sw0.7`; dots `(14,14),(24,14),(34,14) r3 #CCCCCC`; page `x4 y24 372×272 rx5 #FFFFFF / #E4E7EC`.
- 7 placeholder bars per window: `(12,36,30,30,rx4)`, `(52,38,100,6)`, `(52,46,100,6)`, `(52,54,35,6)`, `(12,72,140,6)`, `(12,80,140,6)`, `(12,88,55,6)` fill `#EFF1F4`.
- Blobs: `rx90 ry14` + `rx14 ry90`, blur `stdDeviation 12`, gradients `#FFB89E/#C8A8E5/#A8B5FF` (h) and `#FF6B5C→#FFB89E` (v), opacities `0.3`.
- Front highlight dots `#FF6B5C,#FFB89E,#A8B5FF` + stroke gradient `#B5C0FF,#D5BBEF,#FFC5AB,#FFB5BC sw0.8`, path `M t 240 L t n+6 A 6 6 0 0 1 t+6 n L (n==3?360:t+95) n`.
- Timings: shimmer `2.4s ease-in-out infinite` (`#EFF1F4↔#DDE1E5`, dark `#2e2e32↔#3a3a3f`), fade `opacity 0.3s ease`.
- Opacity rules: blobs/front `0`, content `0.2`; `-3` = `1`; `:has(.to-tab-1/2:hover)` swaps highlight; dark fills `frame #1b1b1d`, `dot #3a3a3f`, `page #232326`, `bar #2e2e32`.
- No invented agents/data. No 3×3 pixel-marks: component has no agent identities (illustration only), so marks omitted by design.

## Spec compliance notes
- Tokens via CSS vars, light + dark, card `1px border + soft shadow`, pills `999px`, `14px` base / `15–16px` titles / `12–13px` meta.
- `/*noflash*/` guard + `color-scheme` meta + `html{background}` in `<head>`.
- DOM built once at init (`buildOnce`), all later updates in place (`style.opacity`, `textContent`, `setAttribute`); zero `innerHTML` in page script.
- Hover rules only inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric `outer 16 = inner 10 + 6 pad`; shadows for elevation / borders for structure; art-well `inset 0 0 0 1px rgba(0,0,0,.1)` (dark white 10%); toggle optical padding `6px 12px 6px 10px`.
- Hard-won: `pointerdown/mousedown` capture for activation; hover/focus never re-renders; `[hidden]{display:none!important}`; SVG `setAttribute("class",…)` only; narrow SVG selectors so hide rules keep working.
- Responsive: `≤560px` stacks header/status.

## How to test
- Open `index.html` in a browser. Hover windows 1/2 → highlight + `Window N active` follows; leave → back to Window 3. Tab-focus + arrows works. Toggle Dark/Light, reload persists.
- No installs. Verify only with node (no browser launch).

## Verification (node only, in-dir files)
- `node --check` on extracted main script: PASS.
- `node verify-harness.js` (in-dir DOM stub, no deps): PASS.
  - Visible text asserted (not aria-only): Title, exact label string, `Window 3 active`, `Window 1/2/3`, `highlight follows`, `Shimmer 2.4s`, `Fade 0.3s`.
  - State: default `active==3`, verbatim offsets/labels/colors.
  - Full loop `1→2→3→1→2→3`: SVG/blobs/fronts/contents/tabs/label keep object identity; `activeLabel` text updates in place; zero `innerHTML` writes after init (0 total).
  - Theme: `light→dark→light` toggles `data-theme`, persists, dark tokens present. Light AND dark checked.
