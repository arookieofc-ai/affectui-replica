# Pagination — replica REPORT

## What was built
ONE self-contained `index.html` (23,199B, no network, system fonts) replicating the
`Pagination` long-list demo from `demo-original.js`.

- Card `Runs` + `1,284` header, 25 rows/page, footer pagination.
- Pagination bar: `Rows per page` select (`25,50,100`), live range
  (`1–25 of 1,284`, en dash, `en-US` grouping, `aria-live="polite"`),
  `Previous page` / `Next page` chevrons, numbered buttons with ellipsis `…`,
  `siblings=1` window, current `aria-current="page"`, ends use `aria-disabled`.
- Row formula verbatim: `id=4821-e`, `title=d[(e*7)%12]`, `agent=f[(e*3)%4]`,
  `secs=18+(e*37)%290`, ` <60 ? "Ns" : "Mm SSs"`.
  e.g. row0 `#4821 · Summarise Q3 support tickets · Research bot · 18s`;
  page2 row0 `#4796 · Translate the onboarding emails · Ops helper · 1m 13s`.
- Page math verbatim: `pageCount=ceil(1284/size)` (52/26/13),
  `I=(T-1)*S+1, L=min(T*S,C)`,
  size change keeps first item `floor((T-1)*S/n)+1`,
  number click restores focus if focus was inside the nav.
- Agent identity: deterministic 3×3 pixel-mark per agent (hash → hue,
  centre always on), EXACTLY 9 `<i>` cells per mark. Colours:
  hash hue `hsl(h 55% 45%)`, legible on both themes.

## Tokens / themes / polish (v5)
- CSS vars for every colour. Light (original appearance, default):
  `page #fafaf9, surface #ffffff, ink #1c1917, muted #78716c, subtle #f5f5f4,
  border #e7e5e4`. Dark: `page #101012, surface #1c1c1f, ink #ededed,
  muted #a1a1aa, subtle #26262a, border #2e2e33`. Amber kept in both.
- Visible sun/moon toggle top-right, `data-theme="light"|"dark"` on `<html>`,
  stored as `pagination-theme`, falls back to `prefers-color-scheme`.
- `/*noflash*/` guard is first in `<head>` + `html{background}` inline +
  `meta color-scheme`. Default paint is light (the original demo look).
- All `:hover` (7) live only inside `@media (hover:hover) and (pointer:fine)`;
  `html{-webkit-tap-highlight-color:transparent}`;
  `body{font-variant-numeric:tabular-nums}`;
  radii `16/10/6` (`16=10+6` concentric); borders for structure,
  `box-shadow` for elevation; chevron optically nudged (`padding-left:2px`,
  `translateX(.5px)`); `[hidden]{display:none!important}` so the broad
  `.ui-pgn svg{display:block}` can never collapse layout;
  SVG classes only via `setAttribute`; no `innerHTML` anywhere.

## In-place updates
DOM built once (`100` row `<li>`, `7` page slots + prev/next, select, range
text nodes). Timers/handlers only mutate `textContent`/`nodeValue`,
attributes, `hidden`, `style`, `value`. No `innerHTML` after init, no full
re-render on hover/focus. `scrollTop=0` on page/size change like the original
`useLayoutEffect`.

## What was not copied / could not verify
- Clean-room CSS/JS written from observed behaviour; no bundle source pasted.
- Original has no timed auto-loop (interaction is click/select); harness treats
  the full page loop `1→52→1` as the loop. No `compact`/`disabled` demo states
  were shown in the supplied demo, but the logic (`aria-disabled`, hidden slots)
  is implemented.
- Visual pixel-perfect check needs a browser; stub checks structure/text.

## How to test
Open `index.html` in a browser. Click numbers/prev/next, change rows-per-page,
toggle sun/moon, resize narrow, check keyboard focus.

## Verification (node only, in-dir)
- `node --check ./extracted.js` → OK (syntax of the page script extracted from `index.html`).
- `node ./harness.js` → **69 passed, 0 failed** (DOM stub, no packages):
  asserts visible range/rows, verbatim titles/agents/times, window
  `[1,2,3,4,5,…,52]` → `[1,…,25,26,27,…,52]`, `1,251–1,284` last page,
  `25,50,100` options, 9-cell pixel-marks, node identity across full `52`-page
  loop with zero `innerHTML` writes, light AND dark `data-theme` application.
