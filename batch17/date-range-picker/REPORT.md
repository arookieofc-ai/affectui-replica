# Date Range Picker — replica report

Built `index.html` (35KB, self-contained, system fonts, no network) — clean-room replica of the Date Range Picker demo (`demo-original.js`).

## What matches the original (verbatim data/behaviour)
- Presets (9): Today, Yesterday, Last 7 days, Last 30 days, Last 90 days, This month, Last month, This quarter, Year to date — same ids/labels/range math (T-6, T-29, T-89, startOfMonth, last-month start/end, quarter start, Jan 1).
- Compare options: Off, Previous period, Previous year; math: previous = shift back by inclusive length; previous-year = same month/day prior year clamped to month length.
- Strings: `Choose a date range`, `Presets`, `Previous month`, `Next month`, `Compare`, `Compare to`, `Cancel`, `Apply`, `Custom`, `vs. `, ` – `, ` – pick an end`, `day`/`days`, weekday 2-letter `Mo Tu We Th Fr Sa Su` (Monday start), `Intl` formatters en-US (short/long/month-long/full + NumberFormat).
- Default: Last 30 days (`today-29` to today) with `Previous period`, panel open (`defaultOpen=true` in demo), max=today (future disabled), left month = end-1.
- Interactions: preset click sets draft + re-anchors left month; day click starts (`end=null`) then completes sorted; `pointerenter` hover preview + `pointerleave` clear; compare band; footer `N days` + `vs. …` fold; `Apply` commits to trigger + closes, `Cancel`/outside `pointerdown`/`Escape` closes; trigger shows `range` + `vs. compare`; keyboard Arrows/PageUp/PageDown/Home/End, focus tabIndex, `aria-selected`/`aria-checked`/`aria-current="date"`/`aria-label` full date; sliding pills for presets/segments; CSS transitions 140–320ms, open/slide/pick animations, `prefers-reduced-motion` guard; responsive single-month stacked under 640px.

## Design tokens / themes / hard rules
- CSS vars for all colours; light `surface #ffffff page #fafaf9 ink #171717/#1c1917 muted #78716c subtle #f5f5f4 border #e7e5e4`, dark `surface #1c1c1f page #101012 ink #ededed muted #a1a1aa subtle #26262a border #2e2e33`; radii 16/10/6, shadows, fully-rounded pills; visible `◐ Theme` toggle top-right switching `data-theme` + `localStorage('drp-theme')`.
- Default `data-theme="light"` = original demo appearance (white card/tray).
- `<head>` starts with `/*noflash*/` guard + `<meta name="color-scheme" content="light dark">` + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}`.
- DOM built once at init; all updates in place (`textContent`/attrs/classes/styles), zero `innerHTML` after init; hover/focus never rebuild; dialogs open on `pointerdown` capture (`trigger` + `document` both `,true`); `[hidden]{display:none!important}`; SVG classes via `setAttribute` only (no `.className`); no broad `svg{display:block}` beating hidden.

## Could not verify
- Pixel-perfect vs original screenshot (no browser in this env); pill offsets are 0 in stub (real browser positions via `offset*`); `ResizeObserver` auto-sizing omitted (fixed layout, same look); smooth preset-list scroll omitted.

## How to test
- `open index.html` in a browser; panel is open by default; try presets, two-date click, hover preview, Compare Off/Previous/Previous year, month nav, keyboard, Cancel/Apply, theme toggle, narrow width.
- Node only (no browser): `node --check` on extracted script + `node ./harness.js` (in-dir stub, no installs).

## Verification (node only)
- `node --check` on extracted page script: OK.
- `node ./harness.js`: PASS — asserts visible text (all 9 presets, Custom, all compares, Cancel/Apply, `vs.`, day counts, `pick an end`, weekdays, month names), default-open state, preset/day/hover/compare/nav/Apply/reopen full loop, node identity across loop (preset/segment/day/trigger/summary/count/compare nodes), zero `innerHTML` writes after init + after timers, light AND dark visible, noflash/hidden/SVG checks.
