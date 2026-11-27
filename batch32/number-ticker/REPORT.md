# Number Ticker — replica report

## What was built
`index.html` (16.4 KB, self-contained, system fonts, no network): a revenue card replica of the
affectUI **Number Ticker** demo — odometer-style digits that roll to new values and count in from
zero when scrolled into view.

## Matched data / behaviour (verbatim from `demo-original.js`)
- Card strings: `Revenue`, `This month`, `vs last month`; buttons `−` / `+` with
  `aria-label="Decrease revenue"` / `"Increase revenue"`.
- Initial state: revenue `48240` → `$48,240` (`en-US`, `currency/ USD/ max 0`);
  delta `0.124` → `+12.4%` (`percent`, 1 decimal, `signDisplay: exceptZero`).
- Button math: revenue `± rand(600,6400)`, delta `± rand(8,46)/1000` rounded to 3 dp, clamped ≥ 0.
- Arrow SVG `viewBox 0 0 12 12`, path `M6 2.5v7M2.75 5.75 6 2.5l3.25 3.25`, flips + red pill via
  `data-down` when delta < 0.
- Ticker physics: per-digit columns keyed `d{index-from-right}`, statics `s{n}`; 11-cell stacks
  `0..9,0`; `translateY(-mod10(pos)/11*100%)`; easeOutQuart `1-(1-t)^4`; durations 900 ms
  (currency) / 700 ms (percent); delays 0 / 150 ms; IntersectionObserver `threshold 0.3`;
  new digit columns get the 450 ms `ui-nt-in` enter animation; `prefers-reduced-motion` jumps to
  final; `aria-live="polite"` + sr-only formatted text + `aria-hidden` visual track; edge fade mask
  `transparent → #000 14% → 86% → transparent`; `--ui-nt-lh: 1.15em`; `tabular-nums`.
- Clean-room code: behaviour re-implemented from observation; no compiled source copied.

## Spec compliance
- Tokens via CSS vars; light + dark themes with visible sun/moon toggle (`nt-theme` key,
  `data-theme` on `<html>`); default = original demo appearance (light card).
- `/*noflash*/` guard first in `<head>` + `meta color-scheme` + `html{background}` paint rule.
- DOM built once at init; ticks/buttons update nodes in place (transform/text/attrs only), never
  `innerHTML` from a timer/hover; pointerdown capture listeners registered so clicks survive.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`;
  `html{-webkit-tap-highlight-color:transparent}`; `tabular-nums` on body; concentric radii
  (16/10/6); shadow for elevation + 1 px borders for structure only; `[hidden]{display:none}`;
  SVG via `setAttribute`.
- No agent identities in this component → no pixel-marks (correctly omitted per conditional rule).

## Verification (node only, no browser)
- `node --check .main-extract.js` → OK (script extracted from `index.html`).
- `node harness.js` (in-dir DOM stub) → ALL CHECKS PASSED:
  - visible `$48,240` + `+12.4%` after IO trigger + settle; `store` verbatim `48240 / 0.124`;
  - `bump(+1)` visibly increases revenue; `bump(-1)` decreases delta and sets `data-down`;
  - unchanged columns keep object identity across a full 4-bump loop; `innerHTML` writes = 0;
  - verbatim strings/aria-labels present; noflash/hidden/hover-gate/tap-highlight/tabular asserts.
- Light AND dark checked: both token sets present (`--surface #ffffff` / `#1c1c1f`,
  `--page #fafaf9` / `#101012`), `data-theme light|dark` + toggle + storage key verified in markup.

## How to test
Open `index.html` in a browser (or `python3 -m http.server` in this dir). Scroll to the card —
numbers count up from zero; press `−`/`+` to roll values; flip the ◐/☀ button for dark mode.
Re-run checks: extract script + `node --check`, then `node harness.js`.
