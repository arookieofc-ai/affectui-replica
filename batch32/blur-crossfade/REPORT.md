# Blur Crossfade — replica report

## What was built
`index.html` (self-contained, ~20KB, system fonts, no network): a Release 2.4
changelog card whose content swaps with a soft blur while the box glides to the
next size. Clean-room implementation — own code written from the observed
behaviour in `demo-original.js`, no compiled source copied.

Structure: page topbar (project name + working/changes count + theme toggle),
then `.card__preview > #demo-mount` card with header (`Release 2.4`,
`3 changes · draft`, Publish button), blur-crossfade panel (tag + note text),
and footer (progress dots + `Next` chip).

## Matched data / behaviour / timings (verbatim from demo-original.js)
- Notes: `Shipped` / `Dark mode is live for everyone.` ·
  `Improved` / `Search now looks through comments and attachments too, and results
  show up while you type – no more waiting for the full page.` ·
  `Fixed` / `Exports keep their column order, even with hidden fields in between.`
- Strings: `Release 2.4`, `3 changes · draft`, `Publish`, `Publishing…`,
  `Published`, `Next`. Button `aria-live="polite"`, `data-status` idle/busy/done.
- Crossfade primitive: entry `opacity 0→1 + blur(var(--ui-bx-blur)) + scale .98→1`,
  exit `opacity 1→0 + blur + scale 1→1.02`, ease `cubic-bezier(0.22,1,0.36,1)`,
  `data-busy` during flight, cleanup at `duration+30`, ghost layer
  `aria-hidden` + `inert`, entry `duration` / exit `duration*0.8`.
  Panel: `duration 420, blur 10, morph height, as div`;
  button: `duration 380, blur 6, morph both, as span`.
- Publish click (from idle): `busy` → after 1500ms `done` → after 3600ms `idle`;
  spinner while busy, check-mark svg (`M3.5 8.5l3 3 6-7`) when done.
- Auto-loop (only inside `.card__preview`): `setInterval 1300ms`, odd ticks
  advance the note, even ticks cycle status `idle→busy→done→idle`; full loop
  closes after 6 ticks. `prefers-reduced-motion` swaps instantly.
- Header pattern: topbar shows project name + live `N working · 3 changes`
  (updates in place with status). No agent identities in this component, so no
  pixel-marks (spec: only "if the component has agent identities"). No
  dialogs/popovers, so no pointerdown-capture path to exercise. No images.

## Spec rules applied
- Tokens for every colour; light default (matches original demo) + dark theme via
  `data-theme` on `<html>`, stored key `blur-crossfade-theme`, `prefers-color-scheme`
  fallback; visible sun/moon toggle top-right; amber/green/blue retuned for dark.
- `<head>` starts with the `/*noflash*/` guard (stored/preferred theme before
  paint) + `html{background…}` first-paint style + `color-scheme` meta.
- IN-PLACE ONLY: DOM built once at init (`createElement`/`textContent`, zero
  `innerHTML` anywhere); timers mutate text/attrs/styles; ghosts are transient
  clones removed after flight; hover/focus handlers never re-render.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`;
  `html{-webkit-tap-highlight-color:transparent}`;
  `body{font-variant-numeric:tabular-nums}`; concentric radii
  (card 16 / panel 10 / pills 999); shadow for elevation, borders for structure;
  `[hidden]{display:none!important}`; svg classes via `setAttribute` only; no
  broad `svg{display:block}` rule. Responsive: narrow stacks the header.

## Verification (in-dir only, node, no installs)
- `harness.js` (in this dir): extracts the page script, runs it in a DOM stub
  with mocked timers, and asserts VISIBLE `textContent` (aria-hidden subtrees
  excluded — markup/aria-only text does not count), state at each tick, node
  identity, and innerHTML-write count.
- Full loop: 6×1300ms ticks visit Improved/busy/Fixed/done/note-0/idle verbatim
  and return to start; manual Next/Publish + 1500/3600ms timeouts verified.
- Identity: card, both crossfade roots/live layers, tag, body, dots box, all 3
  dots, both buttons, title, sub, label, spinner, check — all `===` across the
  loop; `innerHTML` writes after init: 0.
- `node --check` on the extracted script: clean.
- Light AND dark checked: toggle clicked both ways in the harness
  (light→dark→light, persisted key written); dark token set present
  (`--page:#101012`, `--warn-bg:#451a03`, etc.); contrast pairs use
  surface/ink + tinted status bg/text in both themes.
- Result: `node ./harness.js` → **ALL PASS** (rear-run after fixing a harness
  keying bug for the dot assertions; page code unchanged).

## How to test
`node ./harness.js` (stub: full loop + identity + themes), or open `index.html`
in a browser and click `Next` / `Publish`, flip the moon/sun toggle, narrow the
viewport, and try `prefers-reduced-motion`.
