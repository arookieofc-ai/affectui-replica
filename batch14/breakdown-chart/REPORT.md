# Breakdown Chart — replica report

## What was built
`index.html` (25 KB, self-contained, no network, system fonts only) replicating the
"Breakdown Chart: stacked bar chart with pickers, hover breakdown, and linked table".

- Header pattern: `Sprint 24` + `212 tasks` + points/dimension meta (project-style header,
  not a generic component title), theme toggle (sun/moon) top-right.
- Pickers: dimension radiogroup (Status / Priority / Team / Type) + measure radiogroup
  (Task count / Story points). All buttons work, `aria-pressed` reflects state.
- Stacked bar: one horizontal 44px bar, segment widths = value share, exact demo colours.
- Hover breakdown: hovering/focusing a segment or table row highlights both, shows an
  in-place tooltip and a live-region readout (`value: N tasks · P% …`); click pins a
  selection (others dim to opacity 0.78, still legible ≥ 0.75).
- Linked table: per-value rows (swatch, label, count/points, share bar + %) + caption
  that follows the active dimension/measure; row hover highlights the bar segment.
- Auto-tour: `setInterval(2200ms)` cycles the hover highlight through all groups
  (pausable via "Pause/Resume tour"); loop wraps and updates in place.
- Keyboard: segments and rows are focusable; focus mirrors hover, Enter/Space pins.
- Responsive: narrow screens stack; card padding 12–16px, pills fully rounded.
- No agent identities in this component, so no pixel-marks (spec: only "if the
  component has agent identities").

## Spec compliance
- Design tokens as CSS custom properties for light (`--surface #ffffff`, `--page #fafaf9`,
  `--ink #1c1917`, `--muted #78716c`, `--subtle #f5f5f4`, `--border #e7e5e4`, radii,
  shadow) and dark (`#1c1c1f / #101012 / #ededed / #a1a1aa / #26262a / #2e2e33`).
- Light AND dark themes via `data-theme` on `<html>`; default `light` (= original demo
  appearance); toggle overrides and persists to `localStorage("breakdown-chart-theme")`.
- `/*noflash*/` guard first in `<head>` + `html{background:#fafaf9} /
  html[data-theme="dark"]{background:#101012}` + `<meta name="color-scheme">`.
- IN-PLACE UPDATES ONLY: DOM (6 segments, 6 rows, legend) built once at init with
  `createElement`; timers/hover/focus/pickers only mutate text/style/class/`hidden`.
  Zero `innerHTML`/`insertAdjacentHTML` anywhere; SVG not used (no `.className` risk);
  explicit `[hidden]{display:none}` rule.

## Original data/behaviour matched (verbatim from demo-original.js)
- Title `Sprint 24`; 212 records from the exact LCG (`seed 7`, `16807`, `2147483647`)
  and weighted pick with the original weights (status `[16,30,22,12,48,6]`, priority
  `[6,18,34,22,20]`, team `[18,34,22,26]`, type `[52,30,18]`, points `[1,2,3,5,8]` /
  `[18,30,26,18,8]`).
- Dimension values/labels and all colours verbatim (status `#a3a3a3/#8f8f8f/#7bc4fe/
  #a651f0/#4fb0fe/#c4c4c4`, priority `#ee3e9e/#a651f0/#4fb0fe/#a9d9ff/#dedede`,
  team `#ee3e9e/#4fb0fe/#a651f0/#a9d9ff`, type `#4fb0fe/#ee3e9e/#d4d4d4`).
- Measures verbatim: `Task count (tasks)`, `Story points (points, field points)`.
- No timers in the demo source, so the tour interval (2.2 s, full-group loop) is an
  added showcase loop in the same in-place style; all data/behaviour it cycles is
  the verbatim aggregated data.

## Verification (node only, no browser)
- `node --check` on both extracted `<script>` blocks (noflash + main): pass.
- In-dir DOM-stub harness (temp file in this directory, removed after run):
  loaded the page script, advanced timers through a full 6-step loop and asserted —
  77/77 passed, including: 6 visible segments/rows with real text (`readout`,
  `212 tasks` header, tooltip `Canceled · 7 tasks · 3.3%`), segment widths sum ~100
  (99.99), count total 212, node identity preserved across the full loop and across
  dimension/measure switches, **zero `innerHTML` writes after init**, dark theme
  applies with readout/header still visible, light restores.
- Checked in both themes via stub (attribute switch + visibility assertions);
  please also open `index.html` in a browser and toggle sun/moon to confirm visually.

## How to test
Open `index.html` in a browser (double-click; no server needed). Switch Split by /
Show pickers, hover segments and rows, click to pin, pause/resume the tour, toggle
the ☾/☀ button for dark mode.
