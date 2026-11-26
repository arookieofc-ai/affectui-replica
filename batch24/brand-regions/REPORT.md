# brand-regions — AI Search / Regions replica

## What built
Standalone `index.html` (~34KB, inline CSS+JS, no deps) replicating affectUI **AI Search / Regions**:
- Header: `Brand` title, 7 tabs (Visibility, Sentiment, Topics, Platforms, **Regions** active, Shopping, Citations), More menu (Export CSV / Copy link / Report settings), `5.6k answers` button.
- Filter bar: Period seg `7d / 15d / 30d / Custom` + `Tags / Topics / Platforms` dropdowns with count badges + Clear.
- Card `Regions`: left shaded world map (own simplified SVG, viewBox presets World / Americas / Europe / Asia, `Chart config` menu, Shading on/off, Low→max legend, hover tooltip with flag + name + Nov 23 + 3 measures), right ranking list sorted by active measure with flag, value `E()` (`1.1%`), delta `D()` (`+` / `−` U+2212 / `0.0%`), roving tabindex + ArrowUp/Down/Home/End, click row toggles zoom.
- Measures seg: Visibility / Share of Voice / Positive sentiment. Values use verbatim demo factors: period `1 / .94 / .88 / .9` × `(1-.04*filters)`, sentiment `min(100, s*(.5+f/2))`.
- Toasts: tab switch, export, copy, report, answers. Export CSV really downloads `regions.csv`.
- Theme toggle top-right, `data-theme` on `<html>`, localStorage `br-regions-theme`, noflash guard + `meta color-scheme`.

## Demo data verbatim
16 regions from `./demo-original.js` with exact ids/names/flags/numbers:
US 52.1/44.9/72.3, AR 35.5/28.4/66, MX 64.1/51.2/70.4, CN 19.5/12.3/58.1, IN 18.3/14.7/69.2, ES 17.2/15.1/63.8, DE 15.5/18.6/61.5, LK 12.1/8.2/64.9, TH 12.1/9.4/67.3, BR 11.8/10.6/62.7, CH 11.7/13.2/71.6, GB 11.5/16.8/65.4, FR 9.8/11.4/59.9, JP 8.6/7.9/68.8, CA 8.1/9.7/73.1, AU 7.4/8.8/70.2 + changes. Answers `5600` → `5.6k`, date `Nov 23, 2026`. Map geometry is own clean-room simplified continents + 16 country nodes (not copied).

## Matches original
Layout (title+tabs+answers, bar, card 1fr/340px, map+side), tokens, hover/focus, tooltip placement (left/right flip), legend, sorting, formatting, keyboard (tabs/radios/list), responsive stacked, reduced-motion.

## Could not verify
Pixel-exact map shapes (original uses 100+ detailed country paths; replica uses stylised nodes for size/clean-room), exact flag SVGs (replica uses emoji flags with inset outline), Pro `DemoStage` chrome outside card.

## In-place / v5
- DOM built once; all updates mutate nodes in place (`textContent`, attrs, `style`, `appendChild` reorder). No `innerHTML`/`outerHTML`/`insertAdjacentHTML` anywhere.
- All `:hover` inside `@media (hover: hover) and (pointer: fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radius (16/10/6), shadows for elevation / borders for structure, flag inset outline, icon optical padding.

## How to test
- `node ./harness.js` (writes `app-check.js`), then `node --check ./harness.js && node --check ./app-check.js` (in this dir) — asserts visible painted text, 16 rows/paths, full-loop node identity, zero innerHTML writes, light AND dark.
- Open `index.html` in browser, toggle sun/moon, switch periods/measures/zooms/filters, hover map+rows.

Checked light AND dark via harness + manual token review. No browser install used.
