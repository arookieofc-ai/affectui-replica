# Side Folder — replica report

## What was built
ONE self-contained `index.html` (~18KB, no network, system fonts) replicating the
**Side Folder** affectUI item: a glassy blue folder on its side with three documents
peeking out behind a frosted front pocket; on hover / focus / button / auto-play the
documents slide further out as the pocket swings open on its left hinge.

Clean-room implementation: own HTML/CSS/JS written from the observed behaviour in
`demo-original.js`. No compiled source copied; only data values (path, colours,
widths, transforms, timings, label) reused verbatim.

## Matched demo data / behaviour (verbatim from demo-original.js)
- `role="img"` + label `Blue folder on its side, with three documents peeking out behind a frosted front pocket`.
- Pocket outline path `M40 0H290Q330 0 330 40V318Q330 338 344 348L364 362Q380 372 380 396V480Q380 520 340 520H40Q0 520 0 480V40Q0 0 40 0Z` (380×520 mask, pocket width 86.3636%).
- Back panel `440×486` at `y 18`, `rx 36`, fill `#5bb7ea` + white top-light `#fff 0.65`
  (blur 4, offset dy 3), triple blue drop-shadows.
- Paper gradient `#fff → #eaf2f8`; sheet `278.8×348.8 rx 19.4`, stroke `rgba(0,0,0,0.12)`;
  7 text lines widths `78, 180, 140, 175, 126, 168, 110` at `x 30, y 87+28n, h 9 rx 4.5`.
- Doc rest transforms `(83,43 · 3°) (78,68 · 4°) (73,56 · −2°)` in a `scale(1.15)` stack;
  open transforms `(100,35 · 6°) (93,75 · 7°) (95,54 · 0°)`; doc shadow `0 3px 4px rgba(0,30,60,.18)`.
- Pocket glass: `linear-gradient(180deg, rgba(0,40,75,0) 76%, rgba(0,40,75,.26))` over
  `linear-gradient(160deg, rgba(132,214,248,.45), rgba(69,170,220,.45))`,
  `backdrop blur(4.5cqw) saturate(1.1)`, outline `rgba(255,255,255,.3) sw 4`,
  hinge `transform-origin 0 50%`, swing `translateZ(3cqw) rotateY(-12deg)`,
  `perspective 260cqw` origin `40% 50%`, icon `scale(1.03)`.
- Timing/ease: icon + pocket `0.6s`, docs `0.55s`, `cubic-bezier(0.2, 0.85, 0.25, 1)`;
  container `aspect-ratio 3/2`, icon width `37%`, `container-type: inline-size` + `cqw`;
  `prefers-reduced-motion` disables transitions.

## Page chrome / spec compliance
- Design tokens as CSS custom properties for every colour; light default
  (`--surface #ffffff, --page #fafaf9, --ink #171717…`) matching the original demo's
  light appearance; dark theme via same tokens
  (`--surface #1c1c1f, --page #101012, --ink #ededed…`); visible sun/moon toggle
  top-right switching `data-theme`, persisted in `localStorage`, falling back to
  `prefers-color-scheme`.
- `/*noflash*/` guard first in `<head>` + `html{background}` inline rule +
  `<meta name="color-scheme" content="light dark">`; dark never flashes white.
- Header shows component facts (`3 documents`, `pocket open/closed`, ease) rather than
  a fake agent dashboard. This component has **no agent identities, no token counts,
  no working/waiting states**, so the 3×3 pixel-mark grid and token bar are N/A
  (nothing invented).
- v5 polish: ALL `:hover` rules inside `@media (hover:hover) and (pointer:fine)`;
  `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`;
  concentric radii (card 16px = frame padding 6px + stage 10px); shadows for elevation,
  1px borders only on structure; inset ring on the illustration stage;
  icon-button optical nudge (asymmetric 8px/6px padding); focus-visible outlines;
  touch/keyboard equivalent via `.is-open` class + buttons (hover never required).
- Hard-won rules: DOM built once; timer/button/hover/focus update only classes,
  attributes and `textContent` in place — zero `innerHTML` writes; no dialogs;
  `[hidden]{display:none!important}` present; SVG classes only in static markup,
  JS touches only the parent HTML element's class (never `.className` on SVG);
  no broad `.x svg` rule (front-outline rule scoped to `.ui-sf-front svg`).
- Responsive: narrow screens stack the topbar; stage scales via container query units.

## Behaviour / loop
Auto-play ticks every 2600ms toggling open/closed (paused on hover, focus,
`document.hidden`, `prefers-reduced-motion`, or via Pause button). Manual
`Peek documents` button + `Enter`/`Space` on the focusable icon do the same
in-place update. Status line (`role="status"`) and header pill show VISIBLE text
(`Pocket: closed/open…`), not aria-only.

## Verification (node only, no browser)
- `node --check` on the extracted main `<script>`: passes.
- In-dir DOM-stub harness `verify-harness.cjs` (no deps, no outside reads):
  loads the page script in a `vm` sandbox with stub elements, captures the
  interval, advances two ticks (full closed→open→closed loop) plus both theme
  toggles and both peek clicks. Asserts VISIBLE status text at each state,
  `data-theme` flips light→dark→light with text intact, icon/status node
  object identity preserved across the whole loop, and zero `innerHTML` writes.
- Result: **44 passed, 0 failed**; checked in both light (default) and dark.

## How to test
Open `index.html` in a browser (or `python3 -m http.server` in this dir).
Hover the folder, tab to it and press Enter, use Peek / auto-play buttons,
and flip the moon button top-right to compare light vs dark.
Run `node ./verify-harness.cjs` to re-run the stub verification.

## Not verified / notes
- `backdrop-filter` frosted effect and `cqw` scaling need a modern browser;
  verified statically, not pixel-compared.
- No browser was launched (per instructions); animation smoothness judged from
  the matched transition values, not screenshots.
