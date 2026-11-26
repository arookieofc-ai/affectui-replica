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
  in-place tooltip and a live-region readout; click pins a selection (others dim to
  opacity 0.78, still legible >= 0.75).
- Linked table: per-value rows (swatch, label, count/points, share bar + %) + caption
  that follows the active dimension/measure; row hover highlights the bar segment.
- Auto-tour: `setInterval(2200ms)` cycles the hover highlight through all groups
  (pausable via "Pause/Resume tour"); loop wraps and updates in place.
- Keyboard: segments and rows are focusable; focus mirrors hover, Enter/Space pins.
- Responsive: narrow screens stack; card padding 12-16px, pills fully rounded.
- No agent identities in this component, so no pixel-marks (spec: only "if the
  component has agent identities").

## Spec compliance
- Design tokens as CSS custom properties for light and dark.
  Light: surface #ffffff, page #fafaf9, ink #1c1917, muted #78716c, subtle #f5f5f4,
  border #e7e5e4, radii and shadow. Dark: #1c1c1f / #101012 / #ededed / #a1a1aa /
  #26262a / #2e2e33.
- Light AND dark themes via data-theme on html; default light (= original demo
  appearance); toggle overrides and persists to localStorage breakdown-chart-theme.
- noflash guard first in head plus html background style plus meta color-scheme.
- IN-PLACE UPDATES ONLY: DOM (6 segments, 6 rows, legend) built once at init with
  createElement; timers/hover/focus/pickers only mutate text/style/class/hidden.
  Zero innerHTML/insertAdjacentHTML anywhere; SVG not used; explicit hidden rule.

## Original data/behaviour matched (verbatim from demo-original.js)
- Title Sprint 24; 212 records from the exact LCG (seed 7, 16807, 2147483647)
  and weighted pick with the original weights (status 16,30,22,12,48,6 etc.).
- Dimension values/labels and all colours verbatim (status greys/blues/purple,
  priority pink/purple/blue, team pink/blue/purple, type blue/pink/grey).
- Measures verbatim: Task count (tasks), Story points (points, field points).
- No timers in the demo source, so the tour interval (2.2 s, full-group loop) is an
  added showcase loop in the same in-place style; all data it cycles is verbatim.

## QA fix — light-theme tooltip overlap (2026-11-26)
- Symptom (browser QA, painted pixels): in LIGHT theme during auto-tour the black
  tooltip painted OVER the detail line below the bar, covering its text
  (click to pin hidden; Backlog segment covered the line start). Dark theme sat
  above the bar and did not overlap.
- Root cause: barwrap had no top reserve (padding-bottom only) and tip was top 0
  with translate -50%,-100%, so the tooltip hung over the readout area above the
  bar with zero guaranteed gap. Same paintHover path serves tour hover and
  real-mouse hover, so both were affected.
- Fix (same placement both themes, in-place only, no theme fork):
  barwrap padding-top 38px reserves a tooltip lane above the 44px bar;
  tip top 30px with translate -50%,-100% parks the tooltip bottom at 30px
  (8px clearance above bar top at 38px, about 12px below the readout margin),
  and tip.style.top 30px in paintHover keeps it there for tour plus
  pointerenter/mouseenter/focus. No data-theme override for top/transform, so
  light and dark share the identical above-bar slot; tooltip never reaches the
  legendline/table below the bar.
- Preserved: light AND dark tokens/toggle, noflash guard first in head,
  in-place updates only (zero innerHTML writes).

## Verification (node only, no browser)
- node --check on both extracted script blocks (noflash + main): pass.
- In-dir DOM-stub harness (temp file in this directory, removed after run):
  81/81 passed, asserting VISIBLE PAINTED content only (textContent of
  non-hidden, non-display-none, non-opacity-0 nodes — markup/aria-only text
  does NOT count):
  - CSS geometry: barwrap padding-top 38px (>=32px), tip top 30px with
    translate -50%,-100%, 30px < 38px with 8px clearance above bar,
    no dark-theme top/transform fork, pointer-events none.
  - JS: tip.style.top 30px, no zero fallback, zero innerHTML writes.
  - Light-theme full 6-step tour: each step tooltip painted visible
    (Backlog value text, Canceled 7 tasks 3.3pct) AND readout detail still
    painted visible (hovering / click to pin), distinct nodes simultaneously
    visible; legend below-bar line keeps Backlog painted; tip top 30px with
    left clamped 8-92pct.
  - Real-mouse path: pointerenter on Backlog segment shows tooltip painted
    with Backlog, readout keeps click to pin painted, same 30px slot;
    mouseleave hides tooltip.
  - Dark theme: same 30px slot, tooltip + readout both painted visible,
    clearance holds; light restores.
  - Prior checks retained: 6 visible segments/rows, widths about 100,
    count 212, node identity across loop/switches, dark/light header/readout.
- Checked in both themes via stub (attribute switch + visibility assertions);
  please also open index.html in a browser and toggle sun/moon to confirm visually.

## How to test
Open index.html in a browser (double-click; no server needed). Switch Split by /
Show pickers, hover segments and rows, click to pin, pause/resume the tour, toggle
the moon/sun button for dark mode.
