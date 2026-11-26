# Stat Card — replica report

## What was built
`index.html` (22.7KB, self-contained, no network, system fonts only) replicates the
affectUI **Stat Card** component: single metric card with change indicator, optional
sparkline chart, animated numbers, linkable footer.

Page wrapper: `Metrics / Monthly recurring revenue` header with meta
`Single stat card · animated · live demo` plus a visible sun/moon theme toggle
(top-right). Main card: label `Monthly recurring revenue`, animated amount,
delta pill (`+12.4%` up-green / `-1.8%` down-red with arrow), sparkline SVG with
hover tooltip + guide/dot, x-axis first/last labels, period switcher
`7D / 30D / 12M` (auto-advances every 3s, clickable), footer
`Updated just now · View report` (linkable — opens a `Revenue breakdown`
dialog with `Pro plan $31,200 / Team plan $12,460 / Starter plan $4,630`).
Two static mini variants below demonstrate the component's range:
`Active trials 1,284 +3.2%` (no-chart variant, live dot) and
`Churn rate 2.4% -0.6pts` (down state).

## Matched data / behaviour
- **Demo data unavailable**: `demo-original.js` in this directory is a 6,163-byte
  `Page not found · affectUI` HTML shell (failed fetch of `demo-Ccmtv6pD.js`),
  containing zero component data. Per spec ("if data is unknown, use plausible
  demo data in the same shape and note it"), all numbers are plausible inventions
  in the documented shape, used verbatim between markup, script, and harness:
  - 7D: `$48,290`, `+12.4%` up, `vs last week · Jun 9 – Jun 15`,
    spark `[41200,43800,42500,46100,47300,45900,48300]`,
    tips `Mon, Jun 9 … Sun, Jun 15`
  - 30D: `$52,140`, `+8.2%` up, `May 17 – Jun 15` (12 points)
  - 12M: `$61,880`, `-1.8%` down, `Jul – Jun` (12 points)
- Behaviours: animated count-up (~850ms easeOut, `requestAnimationFrame`,
  tabular-nums), period auto-loop every 3000ms with in-place updates,
  chart hover scrub (`pointermove` + `pointerdown` for touch) with tooltip
  (date + value, side flips left past 50%), keyboard (`ArrowRight/ArrowLeft/
  Escape` on focusable plot, `role=group`, `aria-live=polite` tooltip),
  period buttons (`aria-pressed`, click + arrow-friendly), report dialog opens
  on `pointerdown` capture (so the real click survives) and on `Enter/Space`,
  closes on `Escape`/button, theme toggle persists to `stat-card-theme`.
- Styles: 1px border + soft shadow, hover lift, focus-visible outlines,
  150–220ms ease, reduced-motion guard, responsive narrow stacking.

## Structure / hard rules followed
- Design tokens for every colour (`--page/--surface/--ink/--muted/--subtle/
  --border`, status `--up/--down`, amber kept, dark variants). Default appearance
  = light (data-display demos are light; `prefers-color-scheme` fallback).
- `/*noflash*/` guard first in `<head>`: reads `stat-card-theme` else
  `prefers-color-scheme`, sets `data-theme` before paint; inline
  `html{background:#fafaf9}html[data-theme=dark]{background:#101012}` +
  `meta color-scheme`. No white flash on dark.
- In-place updates only: DOM built once as static markup; timer/hover/focus
  update `textContent`/`style`/`setAttribute`/`hidden` on existing nodes
  (chart `d` via `setAttribute`, never `.className` on SVG). Zero `innerHTML`
  writes anywhere. `[hidden]{display:none!important}` included.
- No agent identities in this component, so no pixel-marks (spec: only if agents
  exist — noted, not omitted).
- Clean-room code; the 404 shell was not copied.

## Verification (node only, no browser)
- `node --check` on extracted component script (`.verify-app.js`): OK.
- In-dir stub harness `verify.cjs`: loads `index.html`, runs the component script
  against a DOM stub, drives the full 3-period timer loop (asserts amount, delta,
  trend, note, x-labels per period + loop-restart path restore), hover first/last
  points (dates/values/side/open), `pointerdown` hover, Arrow/Escape keys,
  `pointerdown`-opened dialog + Escape close, theme toggle light→dark→light with
  persistence + icon flip, node identity for amount/delta/line/area/buttons across
  the full loop, zero `innerHTML` writes after init. Result: `ALL CHECKS PASSED`.
- Light AND dark checked: token audit (page `#fafaf9`/`#101012`, surface
  `#ffffff`/`#1c1c1f`, ink `#171717`/`#ededed`, amber dark `#fbbf24`/`#451a03`/
  `#fde68a`) + toggle flip both directions in harness.
- No package installs/downloads. Size 22.7KB (< 200KB).

## How to test
Open `index.html` in a browser. Watch the value auto-cycle 7D→30D→12M every 3s,
click the period pills, scrub the sparkline, keyboard-focus it with arrow keys,
click `View report` (dialog), toggle sun/moon. No server needed.
