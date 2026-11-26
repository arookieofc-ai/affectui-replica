# Metering Chart — replica report

## What built
- `index.html` (26KB, self-contained, no network, system fonts). Inline CSS + JS, no Tailwind/build.
- Component: `API calls` metering chart — daily gradient bars, live today bar (accent `#5e5cff` + sheen), `Real-time` badge with spinner, period label, rolling totals (`Total volume` money, `Total events` axis), hover/keyboard tooltip with 5-row breakdown (4 tools + `Other`), y-axis 4 ticks, date labels (filtered).
- Clean-room: own class prefix `meter__*`, own JS names. No verbatim copy from `demo-original.js`. Tool logos replaced with small circular initial dots (same shape/role, avoids pasting original SVG paths).

## Matched data / behaviour (verbatim from demo-original.js)
- Seed values: `[1870,2290,2860,2860,3230,2290,2550,2700,2700,1880,1080,3230,2990,1730,2550,2550,1880,2200,2640,3110,620]` (21 days).
- Tools: `GitHub, Slack, Notion, Linear, Figma, Vercel`, weights `[38,24,16,10,7,5]`, breakdown = weight*wobble `sin(day*2.3+n*1.7)`, largest-remainder `%` (`<1%` else `N%`), limit 4 + `Other`.
- Dates: `Date.UTC(2026,8,1)` + `864e5`, `toLocaleDateString(en-US,{month:'short',day:'numeric',timeZone:'UTC'})`; period `Sep 1 – Sep 21` → rolls.
- Loop: `setInterval 900ms`; today `+40+round(rand*90)` until `>3150`, then shift window, `dayOffset++`, new today `140`. Totals: `sum-13000`, `vol=(sum-13000)*1.4` as `$51,534`, `ev` as `37k` (`>=1e4→0 decimals` else 1). Y nice-max `u()` + labels `4.5k/3k/1.5k/0`. Bar delay `min(i,40)*28ms`, rise `900ms`, sheen `2400ms`, spin `900ms`, tween `700ms` `1-(1-t)^4`.
- Interactions: `pointermove/down` → pick, `pointerleave(mouse)/blur` → clear, `ArrowRight/Left/Home/End/Escape`, `tabIndex 0`, `role group`, `aria-label`, `role status aria-live polite`. Tag hidden unless picking (`data-open`), `data-wide` when breakdown, `data-live` on today + ` · live` suffix. Dates filtered `(i+2)%N==0`, `N=ceil(21/3.5)=6` → `Sep 5/11/17`-ish (indices 4/10/16), `data-odd` for narrow hide.
- No agent identities → no 3x3 pixel-marks (correct: spec requires them only if component has agent identities).

## Spec compliance
- Tokens via CSS vars: light `surface #ffffff page #fafaf9 ink #171717 muted #78716c subtle #f5f5f4 border #e7e5e4`, dark `surface #1c1c1f page #101012 ink #ededed muted #a1a1aa subtle #26262a border #2e2e33`, radius `16/10/6`, shadow, `999px` pills, `150-200ms` transitions, hover lift, focus-visible outline, `[hidden]{display:none}`.
- Dark: visible `sun/moon` toggle top-right, `data-theme` on `<html>`, stored key `mtr-theme` else `prefers-color-scheme`. Default `light` = original demo appearance.
- Header: `title + badge + period` (no generic toolbar). Context is counts, thin dashed grid, right-aligned period.
- `/*noflash*/` first in `<head>`: stored-theme/prefers-color-scheme script + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `meta color-scheme`.
- In-place only: DOM built once (`buildOnce`), timer/hover/focus update `textContent/attrs/style` only, never `innerHTML` after init, SVG `setAttribute('class')` only, `pointerdown` capture.

## How to test
- Open `index.html` in browser. Watch today bar grow every 0.9s, then window rolls `Sep 1–21 → Sep 2–22`. Hover bars → tooltip with breakdown; focus chart → arrow keys; toggle Light/Dark top-right; narrow window → responsive stack.
- Node only (no browser install): `node -e "...extract main..." && node --check extracted-main.js && node verify-harness.cjs` (all inside this dir).

## Verification results
- `node --check extracted-main.js`: OK.
- `node verify-harness.cjs`: all PASS —
  - visible light: `API calls / Real-time / Sep 1 – Sep 21 / $51,534 / 37k / tag 1,870`;
  - after 60 ticks: rolled ≥1, period `Sep 2 – Sep 22`, 21 bars kept identity (`===`), totals node identity kept, `innerHTML writes after init = 0`;
  - hover opens tag + `live` suffix + dim, `End/Escape` keyboard OK;
  - dark CSS present, switch to `dark` keeps visible text legible (`Sep 2 – Sep 22 / $56k / 40k`);
  - `pointerdown capture`, no external URLs/tailwind, `<200KB`.
- Light AND dark checked (tokens present + toggle + visible text in both).
- Not verified in real browser (no browser install per task); layout/animations inferred from CSS + stub.
