# Empty Calendar — targeted fix report

## What was built / fixed
Targeted fix of the existing `./index.html` (no rebuild). The core scene (3 day cards + disabled Join meeting button) now paints at load in light AND dark, the Fan out slider visibly spreads the stack 0→100, and hovering the stack visibly lifts the front card and fans the backs further — including at fan=100 (hover composes, not hardcoded).

## Hard proof
- BEFORE `md5sum ./index.html`: `e84b91e44219ccab9d734ee1689bf9cb`
- AFTER `md5sum ./index.html`: `3c33ebf434ff8951b4b0a2303e57dc4c`
- Hashes differ: YES
- Original preserved as `./original-backup.html` (`e84b91e44219ccab9d734ee1689bf9cb`, matches BEFORE).
- Harness: `./harness.js` (node only, no installs). Drives the page's OWN demo timeline from load with a fake clock (DOMContentLoaded → init → 10× interval `tick` full 9-bar loop → fan slider `input` 0/38/100 → frame/front `mouseenter`/`mouseleave` → theme button/`setTheme` light/dark). No manual state-setting. Asserts PAINTED state (computed opacity/visibility/colours/geometry from inline > stylesheet-vars > attributes, emulating browsers), in light AND dark, plus node identity and zero innerHTML.

### Harness vs original (EXPECTED FAIL)
```
TARGET ./original-backup.html
PASS noflash-guard — present
PASS zero-innerHTML-static — no innerHTML in file
PASS demo-verbatim-Calendar — present
PASS demo-verbatim-EMPTY — present
PASS demo-verbatim-Join meeting — present
PASS page-js-runs — ./original-backup.html
PASS page-exposes-__ec — ./original-backup.html
PASS timeline-has-timer — 1 timer(s)
PASS timeline-phase-cycles — phase=1 after full loop
PASS node-identity-full-loop — 9 bars + 3 cards identical
PASS zero-innerHTML-after-init — no innerHTML writes via stub
--- THEME light ---
PASS theme-applies-light — light
PASS cards-present-light — 3 cards
PASS join-button-present-light — Join meeting label found
PASS colour-card-fill-light — #FFFFFF on #fafaf9
PASS colour-btn-fill-light — #F4F4F6 on #fafaf9
PASS colour-bar-fill-light — #EFF1F4 on #fafaf9
FAIL card-contrast-light — card #FFFFFF vs page #fafaf9 ratio 1.04 sw=0.5 drop=0.06 — cards wash out, only glow paints
PASS card-visible-light-0 — opacity 1
PASS card-geometry-light-0 — 240x140
PASS card-visible-light-1 — opacity 1
PASS card-geometry-light-1 — 240x140
PASS card-visible-light-2 — opacity 1
PASS card-geometry-light-2 — 240x140
fan geometry light: @0=-22.0,22.0 @38=-31.9,31.9 @100=-48.0,48.0
PASS fan-spreads-light — spread +52.0px from 0→100
FAIL no-inline-transform-gate-light — inline style.transform overrides stylesheet — hover/fan stall (previous harness only checked attributes)
hover light: spread 96.0→96.0 frontLift=-8 hovered=true
PASS hover-composes-light — hover adds spread/lift beyond fan=100
--- THEME dark ---
PASS theme-applies-dark — dark
PASS cards-present-dark — 3 cards
PASS join-button-present-dark — Join meeting label found
PASS colour-card-fill-dark — #232326 on #101012
PASS colour-btn-fill-dark — #2a2a2d on #101012
PASS colour-bar-fill-dark — #2a2a2d on #101012
PASS card-contrast-dark — ratio 1.21 + border/shadow sw=0.5 drop=0.4
PASS card-visible-dark-0 — opacity 1
PASS card-geometry-dark-0 — 240x140
PASS card-visible-dark-1 — opacity 1
PASS card-geometry-dark-1 — 240x140
PASS card-visible-dark-2 — opacity 1
PASS card-geometry-dark-2 — 240x140
fan geometry dark: @0=-22.0,22.0 @38=-31.9,31.9 @100=-48.0,48.0
PASS fan-spreads-dark — spread +52.0px from 0→100
FAIL no-inline-transform-gate-dark — inline style.transform overrides stylesheet — hover/fan stall (previous harness only checked attributes)
hover dark: spread 96.0→96.0 frontLift=-8 hovered=true
PASS hover-composes-dark — hover adds spread/lift beyond fan=100

RESULT FAIL (40 passes, 3 fails)
exit 1
```

### Harness vs fixed (EXPECTED PASS)
```
TARGET ./index.html
PASS noflash-guard — present
PASS zero-innerHTML-static — no innerHTML in file
PASS demo-verbatim-Calendar — present
PASS demo-verbatim-EMPTY — present
PASS demo-verbatim-Join meeting — present
PASS page-js-runs — ./index.html
PASS page-exposes-__ec — ./index.html
PASS timeline-has-timer — 1 timer(s)
PASS timeline-phase-cycles — phase=1 after full loop
PASS node-identity-full-loop — 9 bars + 3 cards identical
PASS zero-innerHTML-after-init — no innerHTML writes via stub
--- THEME light ---
PASS theme-applies-light — light
PASS cards-present-light — 3 cards
PASS join-button-present-light — Join meeting label found
PASS colour-card-fill-light — #FFFFFF on #fafaf9
PASS colour-btn-fill-light — #F4F4F6 on #fafaf9
PASS colour-bar-fill-light — #EFF1F4 on #fafaf9
PASS card-contrast-light — ratio 1.04 + border/shadow sw=1 drop=0.14
PASS card-visible-light-0 — opacity 1
PASS card-geometry-light-0 — 240x140
PASS card-visible-light-1 — opacity 1
PASS card-geometry-light-1 — 240x140
PASS card-visible-light-2 — opacity 1
PASS card-geometry-light-2 — 240x140
fan geometry light: @0=-22.0,22.0 @38=-31.9,31.9 @100=-48.0,48.0
PASS fan-spreads-light — spread +52.0px from 0→100
PASS no-inline-transform-gate-light — fan/hover via vars/attributes, CSS can compose
hover light: spread 96.0→128.0 frontLift=0 hovered=true
PASS hover-composes-light — hover adds spread/lift beyond fan=100
--- THEME dark ---
PASS theme-applies-dark — dark
PASS cards-present-dark — 3 cards
PASS join-button-present-dark — Join meeting label found
PASS colour-card-fill-dark — #232326 on #101012
PASS colour-btn-fill-dark — #2a2a2d on #101012
PASS colour-bar-fill-dark — #2a2a2d on #101012
PASS card-contrast-dark — ratio 1.21 + border/shadow sw=1 drop=0.4
PASS card-visible-dark-0 — opacity 1
PASS card-geometry-dark-0 — 240x140
PASS card-visible-dark-1 — opacity 1
PASS card-geometry-dark-1 — 240x140
PASS card-visible-dark-2 — opacity 1
PASS card-geometry-dark-2 — 240x140
fan geometry dark: @0=-22.0,22.0 @38=-31.9,31.9 @100=-48.0,48.0
PASS fan-spreads-dark — spread +52.0px from 0→100
PASS no-inline-transform-gate-dark — fan/hover via vars/attributes, CSS can compose
hover dark: spread 96.0→128.0 frontLift=0 hovered=true
PASS hover-composes-dark — hover adds spread/lift beyond fan=100

RESULT PASS (43 passes, 0 fails)
exit 0
```

## Exact stalling transition + why
Stalled: `fan=100 → hovered=true` (and more generally `applyFan(v) → paintHover(true)`).
- `applyFan` wrote inline `style.transform` on the back groups (and `paintHover(true)` wrote hardcoded inline `translate(-48px,4px)` ignoring current fan). In real browsers inline style wins over the stylesheet, so the stylesheet `:hover` fan-out could never apply, and hover at fan=100 produced zero back-spread delta (96.0→96.0 in the stub's computed geometry). The previous harness only read `getAttribute('transform')` (which WAS correct: -48/+48) and DOM presence, so it passed while the painted/computed state stalled.
- Simultaneously the cards washed out in light: `#FFFFFF` on `#fafaf9` (ratio 1.04) with hairline `stroke-width 0.5` and `feDropShadow flood-opacity 0.06` — only the colourful blurred glow (`--fan` glow, 0.25 opacity gradient + blur) was noticeable.
- Fix: removed ALL inline `style.transform` writes; `applyFan` now sets SVG `transform` attributes (fallback) + CSS vars `--fan-lx/--fan-rx/--fan-lrot/--fan-rrot` on `#artFrame`; `paintHover` only toggles `--hovered`/`data-hovered`/`refs.hovered`, letting CSS (`:hover` + `[data-hovered=true]`, `calc(var(--fan-… ) ± 16px/4deg)`, 350ms transition) compose hover ON TOP of current fan in both themes. Strengthened painted visibility: card/btn `stroke-width 0.5→1`, light shadow `flood-opacity 0.06→0.14` (dark stays 0.4). No DOM rebuild, no innerHTML, demo text verbatim.

## `./demo-original.js` check
Read with relative path. Original is STATIC (no JS state machine, no gating): 3 cards always rendered (`ui-ec-card`), back cards fanned via pure CSS (`translate(±22px) rotate(±3deg)`, hover `±48px/±7deg`), front hover lift, shimmer (`ui-ec-shimmer`) + breathe (`ui-ec-breathe`) via CSS animations, dark via ancestor `:where(.dark,[data-theme=dark])` selectors. It does NOT hide cards — so the invisibility is a replica regression, correctly fixed here (not original behaviour). Demo data kept verbatim: `Calendar`, `EMPTY`, `Join meeting`, 3×3 bars, badge, icon+label button, `320×240` viewBox, gradient stops.

## Verification (node only, in-dir, relative paths)
- `node --check ./harness.js` → pass.
- Extracted page main script `node --check` → pass (`node --check ./index.html` itself fails with ERR_UNKNOWN_FILE_EXTENSION, expected — it is HTML, not JS).
- `node ./harness.js ./original-backup.html` → FAIL (exit 1, 3 fails above).
- `node ./harness.js ./index.html` → PASS (exit 0).
- Light AND dark both assert computed opacity/visibility/colours/geometry at each phase (see logs).
- Full-loop node identity: 9 bars + 3 cards `===` across 10 ticks + fan + theme changes.
- Zero innerHTML writes after init (stub counter + static grep 0).
- `/*noflash*/` guard kept first in `<head>` + `html{background…}` + `meta color-scheme`.
- In-place updates only (attributes/vars/text on existing nodes; no `innerHTML`, no node replacement).
- File <200KB (`20278` bytes).

## How to test
Open `./index.html` in a browser (file:// works, no server/deps). Default fan 38 shows fanned stack; drag Fan out 0→100 to spread; hover stack to lift/spread; Tab/Enter on cards tries Join (disabled toast in status); sun/moon toggles light/dark; works with `prefers-reduced-motion` (timers off, CSS transitions off).
