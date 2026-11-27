# Tilt Card — replica report

## What was built
ONE self-contained `index.html` (22 KB, no network, system fonts) replicating the
**Tilt Card** demo: a premium `affectUI Pro` member card that tilts in 3D toward the
pointer, with a following glare and a spring return. Clean-room code written from the
observed behaviour in `demo-original.js` — no copied bundle source.

Layout: page header → centered demo card + caption → physics panel (Max tilt / Scale /
Perspective / Glare / Reset) → live `rotateX / rotateY / glare-x / glare-y` readout.
Narrow viewports stack to one column.

## Matched data (verbatim from demo-original.js)
- Props: `maxTilt 10`, `glare true`, `scale 1.02`, `perspective 900`.
- Strings: `affectUI ` + bold `Pro`, card number `•••• •••• •••• 4821`,
  `Member` / `Alex Morgan`, `Since` / `10/26`, caption `Move your pointer over the card`.
- Wave icon path verbatim:
  `M8.5 7.5a7 7 0 0 1 0 9M12 5a10.5 10.5 0 0 1 0 14M15.5 2.5a14 14 0 0 1 0 19`.
- Behaviour: `pointermove` (touch ignored) sets `data-active`, stores
  `{x: clientX, y: clientY}`, one `requestAnimationFrame` per frame computes
  clamped `a=(x-left)/w`, `o=(y-top)/h`, then
  `--rx=((0.5-o)*2*maxTilt)deg`, `--ry=((a-0.5)*2*maxTilt)deg`,
  `--gx=a*100%`, `--gy=o*100%`.
  `pointerleave`/`pointercancel` cancel the frame, remove `data-active`,
  reset `--rx/--ry` to `0deg` (glare/scale fade via CSS).
- Timings/CSS: idle `transform 700ms cubic-bezier(0.34,1.36,0.64,1)`,
  active `140ms ease-out`, glare `opacity 400ms`, shadows
  `0 1px 2px rgba(0,0,0,.06), 0 8px 24px -12px rgba(0,0,0,.18)` →
  active `0 2px 4px rgba(0,0,0,.05), 0 24px 48px -16px rgba(0,0,0,.3)`,
  dark variants + glare `rgba(255,255,255,.32)` / dark `.24`,
  radius `20px`, `perspective` var, lift `-2px` active / `-4px` focus-visible,
  coarse pointers force scale `1`, `prefers-reduced-motion` disables transform + glare.

## Spec compliance
- Design tokens as CSS vars (light + dark), visible sun/moon toggle top-right
  switching `data-theme` on `<html>` with localStorage override; default follows
  `prefers-color-scheme` (page default light matches the original demo's light page;
  the card face stays a dark premium gradient in both themes).
- `/*noflash*/` guard is the first thing in `<head>` + inline
  `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` +
  `<meta name="color-scheme" content="light dark">`.
- Header follows the project pattern: `affectUI Pro` + `Tilt Card` pill + live
  tilt/glare readout (this component has no agent roster, so no 3×3 pixel-marks —
  correctly omitted per "if the component has agent identities").
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`,
  `html{-webkit-tap-highlight-color:transparent}`,
  `body{font-variant-numeric:tabular-nums}`, concentric radii
  (outer card 20px → inner chip 6px/labels), shadows for elevation + 1px borders
  only for structure, focus-visible outlines, 150–200ms control transitions
  (tilt itself keeps the original 140/700ms physics).
- Hard-won rules: DOM built once in markup; timers/pointer frames update only
  existing nodes (`style.setProperty`, `textContent`, attrs) — never `innerHTML`
  (page script contains zero `innerHTML`/`outerHTML` writes); reset uses
  `pointerdown`+`mousedown` capture so the click survives; hover/focus never
  re-render; `[hidden]{display:none!important}` present; no `className` assignment
  on SVG (only `setAttribute`, and icons are static markup).

## How to test
Open `index.html` in a browser. Move the pointer over the card → it tilts and the
glare follows; leave → it springs back. Focus the card with Tab and use arrow keys
to nudge, `Esc` to release. Try the sliders, glare checkbox, reset, and the sun/moon
toggle in both OS light and dark modes. Reduced-motion / touch emulation should show
no tilt, matching the original.

## Verification results
`verify-harness.js` (in-dir DOM stub, no deps) loads the extracted page script,
simulates the full loop, and asserts **visible** text/state + node identity:
**66 passed, 0 failed** (`node ./verify-harness.js`).
- `node --check` on the extracted page script: passes.
- Visible text asserted: `4821`, `Alex Morgan`, `Move your pointer over the card`,
  `Member`, `Since`, `10/26`, `affectUI` (plus exact number + wave path).
- Tilt math asserted: 10% point → `rx 8.00deg / ry -8.00deg / gx 10.0% / gy 10.0%`;
  90% point flips sign; touch ignored; leave resets to `0deg`; readout + status
  update visibly; keyboard nudge + `Escape` work.
- Node identity held across the full loop; `innerHTML` writes = 0.
- Theme toggle flips `light→dark→light` with label update; light tokens
  (`#ffffff/#fafaf9/#e7e5e4/#f5f5f4`) and dark tokens
  (`#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33`) both present; both themes
  checked via toggle + token/contrast review (amber waiting tokens kept for the
  status row in both themes).

## Notes / not verified
- Exact page background/typography around the demo card is reconstructed (the demo
  chunk only ships `.ui-tc*` CSS); card-face gradients are a plausible premium-card
  interpretation in the same shape as the demo markup.
- No package installs or downloads; no browser available — verified with node only.
