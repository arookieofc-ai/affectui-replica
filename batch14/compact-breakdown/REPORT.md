# Compact Breakdown — replica report

## What was built
`index.html` (26.5 KB, single self-contained file, no network, system fonts only):
a clean-room replica of the **Compact Breakdown** card — "Revenue by channel" split into
ranked parts with animated numbers and bars.

- Header: title + segmented period switch (7d / 30d / 90d) with sliding pill,
  radiogroup semantics, roving tabindex, Arrow/Home/End keyboard support.
- Figure: tweened total, delta pill (up green / down red, arrow swaps), caption
  ("Total revenue" idle; swatch + label + share on hover), screen-reader line.
- Stacked share bar + ranked list with per-row swatch, value, share; hover/focus
  isolates a row (dims others, figure tweens to that part, delta hides).
- Re-rank on period change with FLIP slide; footer "Largest: X".
- Auto-cycles 7d → 30d → 90d every 2800 ms until first interaction
  (pointerenter / pointerdown / keydown / focus capture stops it permanently).
- Timings match the original: 900 ms first tween, 620 ms subsequent, 560 ms FLIP,
  easeOutQuart, snap when `prefers-reduced-motion`.

## Demo data (verbatim from demo-original.js)
- 7d, delta +12.4%: Direct 4820, Organic search 3910, Referrals 2240, Social 1680, Email 940 → $13,590
- 30d, delta +8.1%: Organic 18400, Direct 16900, Social 9800, Referrals 7300, Email 5200 → $57,600
- 90d, delta −3.2%: Organic 51200, Social 38600, Direct 36100, Email 21400, Referrals 16900 → $164,200
- Format `$` + en-US rounding; shares `<1%` / `>99%` / rounded; colour order follows
  first-seen (7d) label order, light c1/c2 both `#4fb0fe` as in the original.

## Spec compliance notes
- Design tokens as CSS custom properties; light default (the original demo's
  appearance) + dark theme via `data-theme` with a visible sun/moon toggle (top-right,
  persisted to `localStorage` key `cb-theme`).
- `/*noflash*/` guard is the first script in `<head>`, plus `html{background…}`
  paint guard and `<meta name="color-scheme" content="light dark">`.
- In-place updates only: DOM built once at init; timers/hover/focus update
  text/class/attributes/styles on existing nodes. No `innerHTML` anywhere in the
  page script. Leaving-row collapse support included (unused by this data set,
  where labels are stable across periods).
- `[hidden]{display:none !important}` present; SVG class set via `setAttribute`;
  no dialogs in this component (periods use plain buttons + click).
- No agent identities in this component, so no 3x3 pixel-marks (spec: only "if the
  component has agent identities") and no project/working-count header — the
  component header replicates the original (title + period switch).
- One deliberate deviation: dimmed rows/segments use opacity 0.75 per spec v3
  legibility rule (original used 0.45/0.25).

## Verification (node only, no browser)
- `node --check` on the extracted main script: passes.
- `node verify.js` (in-dir DOM-stub harness): **PASS (64 checks)** — asserts visible
  text/state ($13,590 / $57,600 / $164,200, rankings, deltas, footer, caption, SR
  line), hover isolation, keyboard (ArrowRight/Home + roving focus), 2800 ms timer
  advance + interaction stop, node identity across a full 7d→30d→90d→7d loop,
  **zero innerHTML writes after init**, theme flip, and both token sets.
- Light AND dark checked: token sets for both themes asserted in CSS, including the
  dark categorical palette; verified light default via the noflash guard
  (stored → prefers-color-scheme → light fallback). Contrast pairs: light ink
  #171717 on #ffffff, muted #78716c on #fafaf9; dark ink #ededed on #1c1c1f,
  muted #a1a1aa on #101012 — all legible, borders visible in both.

## How to test
Open `index.html` in a browser. Watch it auto-cycle; hover rows; switch
7d/30d/90d; toggle the moon/sun button for dark mode. `node verify.js` re-runs
the headless assertions.

## Not verified
Pixel-perfect rendering and real-browser animation smoothness (no browser
available in this environment); ResizeObserver/FLIP path is guarded and only
exercised where the API exists.
