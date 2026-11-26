# Change Summary — replica report

## What was built
`index.html` (12.3 KB, single self-contained file, no network, system fonts only).
Clean-room re-implementation of the Change Summary demo: a gray tray card holding a
white summary card — header with list icon + accent title + muted period, then one
metric per row (`dt` label left, `dd` change right) with a small colored trend badge
(up / down / minus arrow). Narrow widths stack each metric above its change.

## Original data / behaviour matched (from demo-original.js, verbatim)
- Title `What's changed`, period `This week`, default list icon paths
  (`M2.5 4h4`, `M2.5 8h8`, `M6.5 12h7`, `M9.5 4h1`).
- All four rows verbatim: `Active users` / `Up 6.1% to 18.2K` (good),
  `Activation` / `Climbed to 41%, up 3 pts` (good),
  `Churn` / `Down to 2.1% from 2.6%` (good + down),
  `Support tickets` / `Up 14% to 312` (bad + up); tone→direction default rule kept.
- Trend icons verbatim: up `M6 9.5v-7M3 5.5l3-3 3 3`, down `M6 2.5v7M3 6.5l3 3 3-3`,
  neutral `M3 6h6`; tone colors (green/red/neutral fills) in both themes.
- Timings: staggered entrance `120 + min(i,12) * 70 ms` per row.
- `dir="auto"` + `title` attributes, `aria-label` on the section, `aria-hidden` icons.

## Spec compliance notes
- Design tokens as CSS custom properties; light default (= the original demo's
  appearance) + dark theme via `data-theme` on `<html>`, visible sun/moon toggle
  top-right, persisted under `affectui-change-summary-theme`, falls back to
  `prefers-color-scheme`. `/*noflash*/` guard first in `<head>` + paint-matched
  `html` background + `color-scheme` meta.
- v3 agent-specific patterns (pixel-marks, working/agent counts, context bar) do
  not apply: this component has no agent identities.
- In-place updates only: DOM built once at init; timers flip classes on existing
  nodes; toggle sets attributes/`hidden` in place. Hover/focus are CSS-only
  (no re-render). No dialogs/popovers exist. `[hidden]{display:none}` present.
  No `.className` assignment on SVG (all `setAttribute`).

## Verification (node only, no browser — headless Chrome can't run here)
- `node --check` passes on both inline scripts (extracted to temp files in this dir).
- `verify-harness.js` (in-dir DOM stub, `PREFERS=light|dark node verify-harness.js`):
  loads real markup + scripts, advances virtual timers through the full reveal loop.
- Light run: 41/41 PASS. Dark run: 41/41 PASS. Covered: default theme per
  `prefers-color-scheme`, all 4 labels/changes as *displayed* text (no
  `display:none`/`visibility:hidden`/`color:transparent`/`font-size:0` rule applies
  to any text element; only hiding rule in CSS is `[hidden]`, which touches only
  the inactive theme icon), arrow directions, row/list node identity across the
  full loop, zero `innerHTML` writes, toggle flip + persistence + reload, icon swap.

## How to test
Open `index.html` in a browser; click the sun/moon button to check both themes.
Re-run verification: `PREFERS=light node verify-harness.js` and
`PREFERS=dark node verify-harness.js` in this directory.

## Not verified in a real browser
Pixel layout, container-query stacking, and focus outlines were matched by
construction from the original CSS and not screenshot-compared (no browser here).
