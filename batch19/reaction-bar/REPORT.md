# Reaction Bar — replica report

## What was built
`index.html` (18KB, self-contained, system fonts, no network) replicates the
Reaction Bar pill: Like / Comment / Repost / Share in one pill with popping
icons and rolling counts.

- Page chrome: `affectUI / Reaction Bar` header with `4 actions · N reactions`
  live total, sun/moon theme toggle top-right, centered demo card, behaviour
  notes, footer.
- Component: `div.rb[role=group][aria-label=Reactions]` with 4
  `button.rb__btn[data-kind]` children, each with `span.rb__icon > svg` and
  `span.rb__count > span.rb__digits > span.rb__digit*`.
- Clean-room code: own class names (`rb*`), own CSS/JS written from observed
  behaviour. SVG path data reused for identical glyphs (heart, bubble,
  repost arrows, paper plane). No copied bundle code.

## Matched data / behaviour (verbatim from `demo-original.js`)
- Labels: `Like/likes`, `Comment/comments`, `Repost/reposts`, `Share/shares`.
- Initial: `like 128`, `comment 24`, `repost 9`, `share 0`, all inactive.
- Toggle: active flip + count ±1, clamped ≥0.
- Format: `Intl compact 1dp`; `>=10k && <1M` rounds to nearest 1k first;
  display empty when 0; `aria-label` = `Singular` or
  `Singular, <full> <plural|singular>`; `title` only when `>=1000`.
- Animations: icon pop 320ms `cubic-bezier(.65,0,.35,1)`
  (1 → .75 → 1.12 → 1); count width glide 400ms
  `cubic-bezier(.85,0,.15,1)` with `data-smooth` enabled after first paint via
  double-rAF; digits roll from `opacity:0 / translateY(70%)`;
  `prefers-reduced-motion` disables both.
- Colours: like `#ee3e9e`, comment `#4fb0fe`, repost `#a651f0`,
  share ink; dark variants `#f06db5/#4fb0fe/#b98af0/#ededed`;
  pill `25px` radius, buttons `999px`, `42px` height, `min-width 42px`.

## v5 / v4 compliance
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`.
- `html{-webkit-tap-highlight-color:transparent}`.
- `body{font-variant-numeric:tabular-nums}` + digits inherit.
- Concentric radii: pill `25px` (half row height) with fully-rounded `999px`
  buttons inside; page card `16px` with inner preview `10px` treated as
  separate surface (no even-inset nesting besides pill/buttons).
- Shadows for elevation (`--shadow`, `--shadow-card` layered ring), real
  `1px` borders only for card/dividers/inputs/toggle.
- `img` inset outline rule for both themes; button asymmetric padding
  `0 10px 0 8px` for optical alignment.
- `/*noflash*/` guard first in `<head>`: stored key
  `affectui-reaction-bar-theme` else `prefers-color-scheme`, plus
  `html{background:#fafaf9}` / dark `#101012` and `meta color-scheme`.
- In-place only: DOM built once in `build()`; `toggle`/`reset` update
  `aria-pressed/label/title`, `data-pop`, digit `textContent`, `style.width`
  in place. No `innerHTML` anywhere. SVG classes via `setAttribute` only.
  `[hidden]{display:none!important}` present.
- No agent identities in this component, so no 3×3 pixel-marks (correctly omitted).
- Default theme light = original demo appearance; toggle overrides + persists.

## Verification
- `node --check` on extracted main script: PASS.
- In-dir stub harness `harness.verify.cjs` (no deps): loads page script in a
  minimal DOM stub, asserts visible text (`128`/`24`/`9`/collapsed share,
  `161 total`), exact `aria-label`s, toggle `128↔129`, pop flag, compact
  `1500→1.5K` / `10000→10K`, theme light→dark→light, node identity kept for
  pill/buttons/count-wraps/digits across a full toggle loop, zero
  `innerHTML` writes after init: ALL PASS (light AND dark checked).
- How to test: open `index.html` in a browser, click each reaction, toggle
  theme, check narrow width wraps gracefully.

## Not verified / notes
- No auto-play loop in the original (interaction-only); harness simulates the
  loop via toggles. No pixel-marks / token counts apply to this component.
