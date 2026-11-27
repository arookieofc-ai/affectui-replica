# Stat Card — rebuild report

Rebuilt the `Stat Card` component in this directory as ONE self-contained `index.html`
(~31KB, inline CSS + JS, system fonts only, no network). Clean-room code written from the
observed behaviour of `demo-original.js`; no source copied verbatim.

## What was built

- Header bar exactly as the demo: `Usage` title + `Range` segmented control (`7D` / `30D`,
  `radiogroup` with `role="radio"` + `aria-checked`), plus a visible sun/moon theme toggle
  (top-right). Root keeps `class="stat-demo"` / `data-style="classic"`.
- Four linkable stat cards, each with label, animated total, change pill + `vs …` caption,
  and an inline chart (`height=40`, axis off, `aria-label "<Metric> per day"`):
  `Spend` (sparkline), `Tokens` (bar), `Avg. latency` (sparkline, lower-is-better),
  `Error rate` (sparkline, lower-is-better). Whole card is clickable (`pointerdown` +
  `mousedown` capture + `click`, idempotent) and keyboard operable (`Enter`/`Space`
  opens, `Esc`/backdrop/Close closes) and opens a per-day breakdown dialog.
- Hovering any chart sets one shared hover index: every chart moves its marker in place
  and shows a tooltip with `<Day> · <formatted value>`. `mouseleave` clears it.
- Range switch: pending selection paints immediately, cards show a skeleton shimmer with
  `aria-busy="true"`, and the committed dataset swaps after exactly **650ms** (old timeout
  is cleared if the user flips back quickly).

## Matched demo data / behaviour (verbatim from `demo-original.js`)

- Anchor `Date.UTC(2026,2,9)`, day step `864e5`, `en-US` `month:short day:numeric` UTC labels.
- Series generator `(base, seed, growth)` with weekend `0.72` factor and the same
  `sin`/`cos` oscillation: Spend `(412, 1)`, Tokens `(384e5, 2)`, Latency `(1.31, 3, -0.004)`,
  Errors `(0.38, 4, 0.01)`; totals via sum, latency/errors via mean.
- Formatters `$x.xk` / `x.xM` / `x.xxB` / `x.xxs` / `x.xx%` reproduced exactly.
- Verified visible values: 7D `Spend $2.7k`, `Tokens 257.7M`, `Avg. latency 1.18s`,
  `Error rate 0.35%` with changes `+16.5% / +8.2% / ▼6.1% / +12.3%` and `vs last week`;
  30D `$13.4k`, `1.25B`, `1.14s`, `0.40%` with `+24.1% / +11.7% / ▼9.4% / 0.0%` and
  `vs last month`. Labels `Mar 3–Mar 9` (7D) and `Feb 8–Mar 9` (30D); dialog first row `Feb 8`.
- Change colour rule: `lowerIsBetter` inverts good/bad (latency drop = green,
  error rise = red, `0.0%` = flat grey).

## Spec compliance

- Tokens for every colour; default theme **light** = the original `classic` appearance;
  toggle flips `data-theme` on `<html>` and persists to `affectui-stat-card-theme`.
- `<head>` starts with the `/*noflash*/` guard + `color-scheme` meta + inline
  `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}`.
- DOM built once at init (charts, 30 dialog rows, markers); timers/hover/focus only set
  `textContent`/attributes/classes/styles on existing nodes — **no `innerHTML` anywhere**.
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`,
  `html{-webkit-tap-highlight-color:transparent}`, `tabular-nums` on `body`,
  concentric radii (`16px` shell / `10px` inner / `6px` chip), shadows for elevation +
  borders for structure, `[hidden]{display:none}`, SVG classes via `setAttribute` only,
  responsive `4 → 2 → 1` column grid, `prefers-reduced-motion` respected.
- No agent identities in this component, so no pixel-marks (rule applies only where the
  component has agent identities).

## Verification (node only, no browser — all files in this directory)

- `node --check ./page-extract.js` (main script extracted from `index.html`) — OK.
- `node ./harness.js` — **ALL CHECKS PASSED** (103 assertions): stub DOM loads the page
  script, steps rAF through mount animation, clicks `30D`, advances `700ms`, asserts
  visible totals/changes/`vs` labels, hover tooltip show/hide, dialog open (30 rows) /
  close / `Enter` / `Esc`, full loop back to 7D, node identity of cards/values/pills/
  SVGs/seg buttons/dialog rows across the loop, **zero `innerHTML` writes**, and values
  re-checked visibly in both **light and dark** themes (toggle + persistence asserted).
- Static audits in the harness: no external URLs/imports/`src`, size < 200KB,
  every `:hover` inside the hover media query.

## How to test

Open `index.html` in a browser: flip `7D`/`30D`, hover the charts, click (or keyboard-open)
a card for per-day details, and toggle the sun/moon button. Re-run checks any time with
`node ./harness.js` from this directory.

## Not verified

Pixel-perfect match against the proprietary rendered original (no browser installed here);
chart geometry is a faithful clean-room approximation (same data, same shape language).
