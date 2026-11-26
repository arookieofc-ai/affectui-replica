# Analytics · Revenue — replica report

## What was built
Standalone `index.html` (33.7KB, inline CSS+JS, no external deps) replicating affectUI **Analytics / Revenue** revenue dashboard.

Layout:
- Left sidebar: store mark `Petal & Post`, primary nav `Home, Revenue (active), Invoices (12), Payouts, Customers`, group `Channels: Online store, Marketplace, Wholesale, Subscriptions`.
- Sticky header `Analytics / Revenue` + `Live · Updated…` ticker, actions: period `Last 7 days / Last 30 days / Last 90 days`, `Export`, `Save as report`, sun/moon theme toggle.
- 4 stat cards: `Gross revenue $96,412 +12.5%`, `Active customers 2,847 +8.2%`, `Conversion 3.24% +0.4%`, `Refund rate 1.8% -0.3%` with 7-bar mini charts.
- Main row: tall `Revenue by channel` line chart (4 series) + `Revenue breakdown` list (6 rows + sparklines).
- 3-col row: `Top products` (4 bars), `Sessions over time`, `Average order value`.
- Single persistent tooltip + toast (`Export started`, `Saved to Reports`, period applied, nav/channel selected).

## Demo data — verbatim
Used exactly from `./demo-original.js`:
- `E = Mar 3..Mar 9`, `D = Mon, Mar 3..Sun, Mar 9`, channels `Organic #4fb0fe [4200…]`, `Paid ads #ee3e9e [3600…4000…]`, `Referral #a651f0 […]`, `Email #13b3a0 […]`.
- `M, N, P` values verbatim (`$96,412`, `$104,210`, `−$4,180`, `−$1,734`, `$2,940`, `$8,316`, `$38,400 / $24,150 / $18,920 / $9,640`, shares 100/63/49/25).
- Sessions `This week [1820…2950] / Last [1650…2100]`, AOV `This [118…141] / Last [112…124]`.
- Periods `7d factor 1`, `30d labels Feb 9…Mar 9 factor 4.3`, `90d labels Dec 10…Mar 9 factor 12.9` with same `L()` sine wobble scaling, same `k/R/H/F` formatters.
- Empty strings kept hidden: `No revenue yet / Key figures… / Connect store`, `No revenue in this period / Sales…`, `No sales in this period / Your best-selling…`.

## What matches
- Header pattern, card padding 14–16px, gaps 12px, radius 16/10/6, tokens light (`#ffffff/#fafaf9/#1c1917/#78716c/#f5f5f4/#e7e5e4`) and dark (`#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33`), shadow, 1px borders, pills 999px, tabular numbers.
- Charts: gridlines + y labels (`$k` / `k` / `$`), x labels per period, legend toggles, hover/focus keyboard arrows + Esc, dashed last-week line, sparkline tones (up green / down red / flat faint).
- Responsive: 4→2 stats, `1fr 340px`→stacked, 3→2→1 cols, sidebar hides <1060px.
- v4: `/*noflash*/` guard first in `<head>`, bg style, `color-scheme` meta; DOM built once, all ticks/period/legend/toast update `textContent/attrs/style/class` in place; `window.__rev` exposes hooks.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `tap-highlight transparent`, `body tabular-nums`, concentric radii, shadow vs border split, image inset outline rule, icon optical nudge.

## What could not verify
- No browser available; pixel-perfect colors/animations vs original screenshots not visually compared. Checked via DOM-stub only.
- Original `DemoStage` shell (container queries, `ui-statc/ui-trc` internals) reimplemented with plain CSS grid + SVG; exact line smoothing/tooltip styling is close approximation.
- Loading skeletons exist only as hidden empty states; period change updates instantly without skeleton flash (intentional anti-flicker).

## How to test
- `open index.html` in a browser (or serve dir). Switch period select, click legend pills, hover charts (mouse + Tab + arrows), click nav/channels, `Export` / `Save as report`, toggle theme.
- Node only (no browser): `node --check ./harness.js && node --check ./main-check.js && node ./harness.js` from this dir.

## Theme check
- Verified light AND dark via harness: visible painted text present in both, toggle persists to `affectui-analytics-theme`, defaults to `prefers-color-scheme`. No grey-on-grey: muted `#78716c`/`#a1a1aa` on surface/page, borders visible in both.
- Harness asserts: visible text, full-loop (7d→30d→90d→7d + ticks + theme) node identity (285 nodes), zero `innerHTML` writes after init.
