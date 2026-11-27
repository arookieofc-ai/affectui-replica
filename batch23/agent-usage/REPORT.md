# Fix report — agent-usage Details overlap + clipped arrow

## What was fixed (targeted, `index.html` only)
- `Where it went` / Details overlap: `.agu-layout` was 2-col
  (`minmax(0,1fr) minmax(0,1fr)`) inside a 720px page. Project rows need
  ~482px min (150 name + 84 amount + 34 share + 52 change + gaps/padding),
  columns were ~322px, so rows overflowed and the Details card painted over
  the Projects/Models tabs and the ↑%/↓% change column in both themes.
  Fix: single-column layout (`minmax(0,1fr)`), Details stacks below
  (allowed by spec: “beside/below”), children pinned to
  `position:static; width:auto; z-index:auto; max-width:100%; overflow:visible`.
  Tabs (`flex:none`) and groups (`position:static; overflow:visible`) can no
  longer be covered.
- Clipped `↑` in Details: `.agu-detail__title` had `overflow:hidden` with no
  `flex:1/min-width:0`, no left breathing room, so the left glyph clipped to
  `:25% vs last month`. Fix: `flex:1; min-width:0; padding-left:1px`,
  keep right-only `ellipsis`, plus `.agu-detail__sum>span{white-space:nowrap;
  overflow:visible}` so `↑..% vs last month` stays on one line unclipped.

No JS changed. Demo data verbatim. `/*noflash*/` guard kept. In-place updates
only, zero `innerHTML` writes after init. Evalkit click-to-details kept.

## Original behaviour (checked `./demo-original.js`)
- Original uses side panel `panelTitle:"Details"`,
  `panelWidth:{default:380,min:300,max:520}` — separate from the single-column
  `.ui-agu-page` (max 720px). No covering by design.
- Delta fn: `` `${n>0?`↑`:n<0?`↓`:``}${abs}%` `` + `" vs last month"`.
  Exact texts: Northwind `↑23% vs last month` (118.4 vs 96.2),
  Evalkit `↑102% vs last month` (46.3 vs 22.9), Opus `↑26% vs last month`
  (141.2 vs 112.4). Replica matches. Defect `:25%` is the clipped `↑26%`/`↑23%`
  (arrow top/left cut). No “fix” needed to text, only to clipping.

## Matches
- Layout: spend chart, stats, Where-it-went list, Details (day-by-day bars,
  What-cost-the-most), Worth-a-look notes, theme toggle, tabular-nums.
- Data, tokens, hover media, reduced-motion, focus-visible kept identical.

## Could not verify
- Real-browser pixels (node-only per instructions). VISIBLE state asserted via
  CSS + DOM stub in light AND dark (see harness).

## How to test
- `node --check ./demo-original.js` (original syntax)
- `node --check ./harness.js && node ./harness.js` (in-dir stub):
  single-col layout, static/z-auto, title flex+1px, nowrap change,
  full `↑23%`/`↑102%` texts, Evalkit select, light+dark visible, full-loop
  (5 ticks) node identity, zero innerHTML after init. 63 checks pass.
- Open `index.html` in a browser, toggle sun/moon, click Evalkit row.
