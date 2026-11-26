# REPORT — AI Chat / Revenue Analyst (slug ai-chat-revenue)

## What was built
- Single self-contained `index.html` (~51KB, no external deps, system fonts only), clean-room code from the public description + demo behaviour in `demo-original.js`. No source copied; CSS/JS written from scratch.
- Chat thread for **Q3 revenue review**: start card ("Ask about your revenue"), user turns, three assistant answers used verbatim:
  - A1: "Q3 closed at $1.24M – 18% more than a year ago…" with KPI cards (Revenue $1.24M +18.2%, New MRR $86K +9.4%, Churn 2.1% −0.6%), trend chart W27–W39 (current/previous arrays + "Back to school · +38%" mark at W35), caption, sources Stripe/HubSpot, next chips.
  - A2: "Europe still brings in half…" with 4-region × plan split (Europe 318/196/99k, NA 236/128/57k, APAC 74/52/35k, LATAM 21/14/9k), title Q3 2026 vs Q2 $1.05M, caption "Revenue by region, by plan".
  - A3: "At this pace Q4 lands around $1.41M…" with KPIs ($1.41M +13.7%, $1.33–1.49M, 78%), forecast chart Jul–Dec (actual 366/399/430, forecast 430/452/468/490, target 450), caption "Monthly revenue · forecast from 18 months of history".
- Interactions: word-by-word streaming with caret + twinkling 3×3 pixel-mark, "Reading Stripe and HubSpot…" thinking row, selectable chart ranges (drag on trend/forecast, click/tap on split bars, keyboard Enter/arrows + Escape), ask-popup that computes detail answers with the same D/O/sum/% formulas, quote chips, copy/download/good/retry buttons, composer with fallback ("I can only answer the sample questions here…"), follow-up chips, idle/working status pill, auto-play loop that pauses on first user pointer/key input.
- Header: pixel-mark + "Q3 revenue review / Stripe · HubSpot · Q3 2026" + status + sun/moon theme toggle.

## What matches the original
- All demo strings, numbers, labels, captions, sources, next-question lists, mark text, and chart series used verbatim from `demo-original.js`.
- Layout language: 760px column, left-offset cards/figures, KPI grid, figure header + legend (solid/dashed swatches), hint rows (mouse/touch/keyboard variants), source chips, icon actions with tooltips, pill follow-ups, shimmer thinking text, 3×3 pixel-mark with the same on/off pattern and busy twinkle.
- Selection answers implement the original `H`/`U` logic (trend totals + YoY %, forecast totals + target count, region totals + plan shares).

## What could not be verified
- No browser was launched (per task constraints). Pixel-perfect rendering, smooth animations, real clipboard/download, and pointer-drag feel were not eyeballed — only DOM-stub assertions + static checks.
- Original wrapper (DemoStage nav, composer tray internals) was out of scope; a standalone page chrome was used instead.

## How to test
- `open index.html` in a browser (or serve the folder). Click chips, drag across charts, click a region bar, type in the composer, toggle the moon/sun button.
- Node-only verification (no browser): `node --check harness.js && node harness.js` — asserts visible painted text, noflash/dark/light tokens, guarded hover, tabular-nums, zero `innerHTML`, syntax, stub runtime theme toggle, and full-loop node identity.

## Checks confirmed
- Light AND dark: `data-theme` toggle with stored key `ai-chat-revenue-theme`, `prefers-color-scheme` default, `/*noflash*/` guard + `color-scheme` meta, token sets for both themes (dark legibility adjusted, amber-on-brown for waiting states). Harness toggles both and passes.
- In-place updates only: DOM built once in HTML; timers/streaming/loop mutate `textContent`/`hidden`/`style`/attributes. `index.html` contains zero `innerHTML`/`outerHTML`; harness counts 0 writes after init and asserts identical node objects across reset → ask ×3 → reset.
- v5 polish: hover rules only inside `@media (hover: hover) and (pointer: fine)`, `tap-highlight: transparent`, `tabular-nums` on body, concentric radii, border-for-structure/shadow-for-elevation split, keyboard focus-visible rings, `prefers-reduced-motion` disables animation/streaming.
