# Progress Tracker — targeted fix REPORT

## What was built
Standalone `index.html` replica of the `Getting started` onboarding checklist (5 rows).
Header with title + count, thin progress bar with shine, 5 toggleable rows with
self-drawing ticks, auto-tour every 2200ms, pause on press, reset, theme toggle.
Light defaults from `prefers-color-scheme`, toggle overrides via
`data-theme="light" | "dark"` on `<html>`.

Matches original: layout, card, tokens, hover lift, focus-visible, tabular-nums,
concentric radius, shadows for elevation, 1px inset image outline rule,
`prefers-reduced-motion` kill-switch, responsive narrow stacking.
Demo data verbatim from prompt (also matches `./demo-original.js` shape):
`Getting started`, `Connect your tools`, `Turn on notifications`,
`Catch up on blockers`, `Summarize priorities`, `Create a project` (done),
`INTERVAL 2200`.

## Root cause — GREY GHOST on completed labels (fixed)
QA (real browser, 3x zoom, light + dark): beneath each struck-through grey
completed label there was a faint offset duplicate, blurred/double-printed.
Incomplete rows were crisp single-layer.

Original (`./demo-original.js`): completed label is a SINGLE crisp layer —
`.ui-progress__label` (grey via `var(--ui-pg-muted)`) + inner `span` with
`background: linear-gradient(currentColor,currentColor) 0 58% / 0% 1.5px`
growing to `100% 1.5px` for the strike. No `text-shadow`, no `filter`,
no `::after` text echo, single text node per row.

Replica risk: any inherited/added `text-shadow`, `filter: blur/drop-shadow`,
or `::before/::after` text echo on `.pg-label` would paint a second faint
grey copy under the strike, exactly the reported ghost in both themes
(grey `#78716c` light / `#a1a1aa` dark on white/dark surfaces shows it;
ink `#171717`/`#ededed` incomplete stays crisp).

Fix (targeted, everything else identical):
- `.pg-label`, `.pg-label>span`,
  `.pg-step[aria-checked="true"] .pg-label`,
  `.pg-step[aria-checked="true"] .pg-label>span` now explicitly
  `text-shadow:none; filter:none;`
- Added guard
  `.pg-label::before,.pg-label::after,`
  `.pg-label>span::before,.pg-label>span::after{content:none !important;}`
  to kill any `::after` echo used for strike.
- Kept single crisp strike unchanged:
  `background:linear-gradient(currentColor,currentColor) 0 58%/0% 1.5px`
  → `background-size:100% 1.5px` when checked (same as original).
  No duplicate DOM (single `inner.textContent`, single `appendChild`).

Kept: `/*noflash*/` guard + paint css + `color-scheme` meta,
in-place updates only (`buildOnce`, `syncRow`/`syncAllRows`/`syncProgress`
via `setAttribute`/`textContent`/`style.transform`, `rowRefs` identity kept),
zero `innerHTML` writes (count 0), demo data verbatim, entrance animation intact.

## SECONDARY — blank first frame (~1–2s, rows appear one by one)
Checked `./demo-original.js` FIRST: original HAS staggered entrance —
`style={{animationDelay:`${180+Math.min(t,12)*90}ms`}}` on each `li` with
`@keyframes ui-progress-row-in {from{opacity:0;filter:blur(3px);`
`transform:translateY(8px)}} … both`.
Replica matches (`li.style.animationDelay = 180+min(idx,12)*90ms`,
`pg-row-in 640ms both`). First-frame blank then staggered fade/blur-up
IS original behaviour, so per instructions it was LEFT AS-IS, not “fixed”.

## How to test
Open `index.html` in a browser. Click rows to toggle; auto-tour advances.
Check completed = grey + single strike, no offset duplicate at 3x zoom,
light AND dark (toggle top-right). First paint shows staggered entrance
(blank → one-by-one, ~0.2–1.2s) in both themes, matching original.

Node-only verification (no installs, in-dir, relative paths):
- `node --check ./verify-ghost-fix.cjs` → syntax OK
- `node ./verify-ghost-fix.cjs` → ALL CHECKS PASSED:
  VISIBLE state (grey muted + 100% strike, `text-shadow:none`,
  `filter:none`, `content:none`, single text node) in light (`#78716c`)
  AND dark (`#a1a1aa`, `currentColor` strike), full-loop `rowRefs`
  identity, zero `innerHTML` writes.

Checked light AND dark: finished, no grey-on-grey, borders visible.
