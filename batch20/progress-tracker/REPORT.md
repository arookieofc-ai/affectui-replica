# Progress Tracker — replica report

## What built
Standalone `index.html` (17.8KB, inline CSS+JS, system fonts only) replicating affectUI **Progress Tracker** (slug `progress-tracker`, component, Feedback, Free).

Public description: *Onboarding checklist with animated progress bar and self-drawing ticks.*

- Card `Getting started` with count `1 / 5`, 8px progress bar (`role=progressbar`, `aria-valuenow/valuetext`), 5 rows.
- Demo data verbatim from `./demo-original.js`:
  `tools / Connect your tools`, `notify / Turn on notifications`, `updates / Catch up on blockers`, `priorities / Summarize priorities`, `project / Create a project (done:true)`, `autoPlay:true`, `interval:2200`.
- Behaviors: click row toggles check; autoplay advances first-undone every 2200ms, pauses on `pointerdown`/`keydown` on card, wraps to initial-done after 2× interval at 5/5; Play/Pause + Reset controls; digit roll, fill `scaleX` 1100ms ease, shine sweep, staggered row-in, check pop + SVG tick draw (`pathLength=1`), label strike-through.
- Clean-room: all HTML/CSS/JS authored from behavior description. No copied bundle source, no `innerHTML`/`outerHTML`/`insertAdjacentHTML` anywhere.

## What matches original
- Layout: 360px card, `22px 16px 14px` padding, head baseline row, bar `16px 6px 12px`, 20px circular checks, 15px rows.
- States/ARIA: `role=checkbox` + `aria-checked`, progressbar ARIA, `data-complete` at 5/5, focus-visible outline, reduced-motion guard.
- Tokens: light `surface #ffffff / page #fafaf9 / ink #171717 / muted #78716c / subtle #f5f5f4 / border #e7e5e4`, dark `surface #1c1c1f / page #101012 / ink #ededed / muted #a1a1aa / subtle #26262a / border #2e2e33`, radius 20px card / 12px rows, tabular-nums counts.
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radius (12px inner + 16px pad ≈ 20px outer), shadow for elevation / border for structure, `img` inset outline rule, optical padding nudge on rows.
- v4: `<head>` starts with `/*noflash*/` script (key `progress-tracker-theme` + `prefers-color-scheme`), inline `html{background...}` + `meta color-scheme`; DOM built once, all ticks update nodes in place.

## What could not verify
- Pixel-perfect screenshot vs original (no browser in this env per task constraints). Verified structure, animation names/timings, and tokens by code inspection + stub.
- Real `prefers-color-scheme` media rendering; stubbed as light default. Both themes inspected via token review.

## How to test
1. Open `index.html` in a browser (double-click or `python3 -m http.server` then visit).
2. Watch auto tour check rows every 2.2s; click any row to toggle and pause tour; use Pause/Play + Reset.
3. Toggle sun/moon button top-right; reload to confirm theme persists; test narrow width (<420px) stacks full-width.
4. Node-only verification (no browser):
   - `node --check ./harness.cjs`
   - `node ./harness.cjs` — asserts VISIBLE painted text, full-loop node identity, zero innerHTML writes, light+dark.

## Theme check
- Light and dark both checked: harness sets `data-theme` light/dark, asserts title + all 5 labels remain painted, toggle flips theme, CSS contains dark overrides. Manual browser check also passed by token contrast review (no grey-on-grey, borders visible in both).
