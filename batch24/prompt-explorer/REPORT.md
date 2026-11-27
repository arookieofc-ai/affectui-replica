# REPORT — fix-repair3-prompt-explorer: Popular/Trending per-row deltas

## What was wrong (real-browser QA, 3rd attempt)
Sorting in both lists was already correct, but the Popular list's per-row deltas were wrong:
4 of its 7 rows rendered the identical delta `2.1k`
(`76.2k, 2.1k, 2.1k, 2.1k, 1.4k, 2.1k, 1.8k` on the pre-fix file).

## demo-original.js check (before changing anything)
- Read `./demo-original.js`. Its full prompt table (`ie`, 26 entries) contains every
  keyword/volume/change pair used below (e.g. `C('northwind ai visibility',549400,76200)`,
  `C('answer engine optimization',58600,5200)`, … `C('geo vs seo',28400,3300)`), so the
  replacement rows are demo data verbatim, not invented.
- Note: the original bundle's own hardcoded Popular extract (`w = [...]`) does repeat
  `2100` deltas across rows, i.e. the shipped demo data has the same "identical delta"
  look in that extract. The fix was still applied because the task explicitly orders the
  verbatim tables below (and requires the harness to fail on the pre-fix file), so the
  conditional "do NOT fix" does not apply — the specified tables are authoritative.
- Number formatting and row layout are untouched (`549k`, `+76.2k` style via the page's
  existing `fmtVol`/`fmtChg`; note the pre-existing quirk `97.0k`/`64.0k`/`42.0k` for
  values < 100k is kept as-is — formatting was not part of this fix).

## The fix (targeted, 2 lines in ./index.html, lines 231–232)
- `POPULAR` replaced verbatim (volume desc):
  `northwind ai visibility` 549400 +76200; `answer engine optimization` 58600 +5200;
  `ai search visibility` 47300 +7800; `generative engine optimization` 41200 +6900;
  `geo vs seo` 28400 +3300; `aeo tools` 22700 +4100; `chatgpt brand mentions` 19800 +4400.
- `RISING` (Trending/rising tab) replaced verbatim (change desc):
  `northwind ai visibility` +76200 (549400); `ai search visibility` +7800 (47300);
  `generative engine optimization` +6900 (41200); `answer engine optimization` +5200 (58600);
  `chatgpt brand mentions` +4400 (19800); `aeo tools` +4100 (22700); `geo vs seo` +3300 (28400).
- Nothing else touched: `ALL`, `FALLING`, formatters, layout, CSS, `/*noflash*/` guard,
  in-place painters. `diff` backup-vs-fixed = exactly those 2 lines.

## Hard proof — md5 (differ: YES)
- BEFORE: `64a25e25caef405ad6ec895502fa1527  ./index.html`
- AFTER:  `b2b01e2677d3fa212f03c7296c85ce0d  ./index.html`
- Backup kept at `./original-backup.html` (`64a25e25caef405ad6ec895502fa1527`, matches BEFORE).

## Harness (node only, no installs) — ./harness.js
`node ./harness.js [file]` (default `./index.html`). DOM-stub asserts, as VISIBLE state:
exact rendered (keyword, volume, change) triples per list in order; computed
opacity (≥0.75) / visibility / display / colours (ink≠card, theme switches tokens) /
geometry (320×44 rows) in light AND dark; triples stable across theme round-trip;
full-loop (14-tick) button+row node identity; falling tab round-trip; zero innerHTML
writes after init; `/*noflash*/` + color-scheme + first-paint guards; formatter spot
checks (`549k`, `+76.2k`, `58.6k`, `+5.2k`). Exit 0 = PASS, 1 = FAIL.
`node --check ./harness.js` passes; both inline scripts of `./index.html` parse OK.

### Result against ORIGINAL (must FAIL) — `node ./harness.js ./original-backup.html`, exit 1
```
  ok  noflash guard present
  ok  color-scheme meta present
  ok  first-paint bg style present
  ok  fmt.vol(549400)==="549k" (got 549k)
  ok  fmt.chg(76200)==="+76.2k" (got +76.2k)
  ok  fmt.vol(58600)==="58.6k" (got 58.6k)
  ok  fmt.chg(5200)==="+5.2k" (got +5.2k)
-- Popular triples (volume desc) --
  ok  pop[0] ("northwind ai visibility", 549k, ▲76.2k, dir=up) === ("northwind ai visibility", 549k, ▲76.2k)
  FAIL pop[1] ("northwind vs semrush", 195k, ▲2.1k, dir=up) === ("answer engine optimization", 58.6k, ▲5.2k)
  FAIL pop[2] ("generative ai tools", 135k, ▲2.1k, dir=up) === ("ai search visibility", 47.3k, ▲7.8k)
  FAIL pop[3] ("geo", 133k, ▼2.1k, dir=down) === ("generative engine optimization", 41.2k, ▲6.9k)
  FAIL pop[4] ("aeo", 120k, ▲1.4k, dir=up) === ("geo vs seo", 28.4k, ▲3.3k)
  FAIL pop[5] ("seo vs aeo", 108k, ▼2.1k, dir=down) === ("aeo tools", 22.7k, ▲4.1k)
  FAIL pop[6] ("generative ai", 97.0k, ▲1.8k, dir=up) === ("chatgpt brand mentions", 19.8k, ▲4.4k)
-- Trending triples, rising (change desc) --
  ok  trend[0] ("northwind ai visibility", 549k, ▲76.2k, dir=up) === ("northwind ai visibility", 549k, ▲76.2k)
  ok  trend[1] ("ai search visibility", 47.3k, ▲7.8k, dir=up) === ("ai search visibility", 47.3k, ▲7.8k)
  FAIL trend[2] ("seo", 42.0k, ▲7.1k, dir=up) === ("generative engine optimization", 41.2k, ▲6.9k)
  FAIL trend[3] ("generative engine optimization", 41.2k, ▲6.9k, dir=up) === ("answer engine optimization", 58.6k, ▲5.2k)
  FAIL trend[4] ("ai content optimization", 64.0k, ▲6.4k, dir=up) === ("chatgpt brand mentions", 19.8k, ▲4.4k)
  FAIL trend[5] ("answer engine optimization", 58.6k, ▲5.2k, dir=up) === ("aeo tools", 22.7k, ▲4.1k)
  FAIL trend[6] ("chatgpt brand mentions", 19.8k, ▲4.4k, dir=up) === ("geo vs seo", 28.4k, ▲3.3k)
  FAIL popular deltas all distinct (76.2k, 2.1k, 2.1k, 2.1k, 1.4k, 2.1k, 1.8k)
-- visible state (light) --
  ok  row0 opacity 1 >= 0.75
  ok  row0 visible/display
  ok  row0 colour #1c1917 on #ffffff
  ok  row0 geometry 320x44
  ok  row1 opacity 1 >= 0.75
  ok  row1 visible/display
  ok  row1 colour #1c1917 on #ffffff
  ok  row1 geometry 320x44
  ok  row2 opacity 1 >= 0.75
  ok  row2 visible/display
  ok  row2 colour #1c1917 on #ffffff
  ok  row2 geometry 320x44
  ok  row3 opacity 1 >= 0.75
  ok  row3 visible/display
  ok  row3 colour #1c1917 on #ffffff
  ok  row3 geometry 320x44
  ok  row4 opacity 1 >= 0.75
  ok  row4 visible/display
  ok  row4 colour #1c1917 on #ffffff
  ok  row4 geometry 320x44
  ok  row5 opacity 1 >= 0.75
  ok  row5 visible/display
  ok  row5 colour #1c1917 on #ffffff
  ok  row5 geometry 320x44
  ok  row6 opacity 1 >= 0.75
  ok  row6 visible/display
  ok  row6 colour #1c1917 on #ffffff
  ok  row6 geometry 320x44
  ok  row7 opacity 1 >= 0.75
  ok  row7 visible/display
  ok  row7 colour #1c1917 on #ffffff
  ok  row7 geometry 320x44
  ok  row8 opacity 1 >= 0.75
  ok  row8 visible/display
  ok  row8 colour #1c1917 on #ffffff
  ok  row8 geometry 320x44
  ok  row9 opacity 1 >= 0.75
  ok  row9 visible/display
  ok  row9 colour #1c1917 on #ffffff
  ok  row9 geometry 320x44
  ok  row10 opacity 1 >= 0.75
  ok  row10 visible/display
  ok  row10 colour #1c1917 on #ffffff
  ok  row10 geometry 320x44
  ok  row11 opacity 1 >= 0.75
  ok  row11 visible/display
  ok  row11 colour #1c1917 on #ffffff
  ok  row11 geometry 320x44
  ok  row12 opacity 1 >= 0.75
  ok  row12 visible/display
  ok  row12 colour #1c1917 on #ffffff
  ok  row12 geometry 320x44
  ok  row13 opacity 1 >= 0.75
  ok  row13 visible/display
  ok  row13 colour #1c1917 on #ffffff
  ok  row13 geometry 320x44
-- visible state (dark) --
  ok  row0 opacity 1 >= 0.75
  ok  row0 visible/display
  ok  row0 colour #ededed on #1c1c1f
  ok  row0 geometry 320x44
  ok  row1 opacity 1 >= 0.75
  ok  row1 visible/display
  ok  row1 colour #ededed on #1c1c1f
  ok  row1 geometry 320x44
  ok  row2 opacity 1 >= 0.75
  ok  row2 visible/display
  ok  row2 colour #ededed on #1c1c1f
  ok  row2 geometry 320x44
  ok  row3 opacity 1 >= 0.75
  ok  row3 visible/display
  ok  row3 colour #ededed on #1c1c1f
  ok  row3 geometry 320x44
  ok  row4 opacity 1 >= 0.75
  ok  row4 visible/display
  ok  row4 colour #ededed on #1c1c1f
  ok  row4 geometry 320x44
  ok  row5 opacity 1 >= 0.75
  ok  row5 visible/display
  ok  row5 colour #ededed on #1c1c1f
  ok  row5 geometry 320x44
  ok  row6 opacity 1 >= 0.75
  ok  row6 visible/display
  ok  row6 colour #ededed on #1c1c1f
  ok  row6 geometry 320x44
  ok  row7 opacity 1 >= 0.75
  ok  row7 visible/display
  ok  row7 colour #ededed on #1c1c1f
  ok  row7 geometry 320x44
  ok  row8 opacity 1 >= 0.75
  ok  row8 visible/display
  ok  row8 colour #ededed on #1c1c1f
  ok  row8 geometry 320x44
  ok  row9 opacity 1 >= 0.75
  ok  row9 visible/display
  ok  row9 colour #ededed on #1c1c1f
  ok  row9 geometry 320x44
  ok  row10 opacity 1 >= 0.75
  ok  row10 visible/display
  ok  row10 colour #ededed on #1c1c1f
  ok  row10 geometry 320x44
  ok  row11 opacity 1 >= 0.75
  ok  row11 visible/display
  ok  row11 colour #ededed on #1c1c1f
  ok  row11 geometry 320x44
  ok  row12 opacity 1 >= 0.75
  ok  row12 visible/display
  ok  row12 colour #ededed on #1c1c1f
  ok  row12 geometry 320x44
  ok  row13 opacity 1 >= 0.75
  ok  row13 visible/display
  ok  row13 colour #ededed on #1c1c1f
  ok  row13 geometry 320x44
  ok  theme switches ink (light #1c1917 vs dark #ededed)
-- triples stable across themes --
  ok  pop[0] ("northwind ai visibility", 549k, ▲76.2k, dir=up) === ("northwind ai visibility", 549k, ▲76.2k)
  FAIL pop[1] ("northwind vs semrush", 195k, ▲2.1k, dir=up) === ("answer engine optimization", 58.6k, ▲5.2k)
  FAIL pop[2] ("generative ai tools", 135k, ▲2.1k, dir=up) === ("ai search visibility", 47.3k, ▲7.8k)
  FAIL pop[3] ("geo", 133k, ▼2.1k, dir=down) === ("generative engine optimization", 41.2k, ▲6.9k)
  FAIL pop[4] ("aeo", 120k, ▲1.4k, dir=up) === ("geo vs seo", 28.4k, ▲3.3k)
  FAIL pop[5] ("seo vs aeo", 108k, ▼2.1k, dir=down) === ("aeo tools", 22.7k, ▲4.1k)
  FAIL pop[6] ("generative ai", 97.0k, ▲1.8k, dir=up) === ("chatgpt brand mentions", 19.8k, ▲4.4k)
  ok  trend[0] ("northwind ai visibility", 549k, ▲76.2k, dir=up) === ("northwind ai visibility", 549k, ▲76.2k)
  ok  trend[1] ("ai search visibility", 47.3k, ▲7.8k, dir=up) === ("ai search visibility", 47.3k, ▲7.8k)
  FAIL trend[2] ("seo", 42.0k, ▲7.1k, dir=up) === ("generative engine optimization", 41.2k, ▲6.9k)
  FAIL trend[3] ("generative engine optimization", 41.2k, ▲6.9k, dir=up) === ("answer engine optimization", 58.6k, ▲5.2k)
  FAIL trend[4] ("ai content optimization", 64.0k, ▲6.4k, dir=up) === ("chatgpt brand mentions", 19.8k, ▲4.4k)
  FAIL trend[5] ("answer engine optimization", 58.6k, ▲5.2k, dir=up) === ("aeo tools", 22.7k, ▲4.1k)
  FAIL trend[6] ("chatgpt brand mentions", 19.8k, ▲4.4k, dir=up) === ("geo vs seo", 28.4k, ▲3.3k)
  ok  full-loop button identity preserved (14 ticks)
  ok  full-loop row identity preserved (14 ticks)
-- triples stable across full loop --
  ok  pop[0] ("northwind ai visibility", 549k, ▲76.2k, dir=up) === ("northwind ai visibility", 549k, ▲76.2k)
  FAIL pop[1] ("northwind vs semrush", 195k, ▲2.1k, dir=up) === ("answer engine optimization", 58.6k, ▲5.2k)
  FAIL pop[2] ("generative ai tools", 135k, ▲2.1k, dir=up) === ("ai search visibility", 47.3k, ▲7.8k)
  FAIL pop[3] ("geo", 133k, ▼2.1k, dir=down) === ("generative engine optimization", 41.2k, ▲6.9k)
  FAIL pop[4] ("aeo", 120k, ▲1.4k, dir=up) === ("geo vs seo", 28.4k, ▲3.3k)
  FAIL pop[5] ("seo vs aeo", 108k, ▼2.1k, dir=down) === ("aeo tools", 22.7k, ▲4.1k)
  FAIL pop[6] ("generative ai", 97.0k, ▲1.8k, dir=up) === ("chatgpt brand mentions", 19.8k, ▲4.4k)
  ok  trend[0] ("northwind ai visibility", 549k, ▲76.2k, dir=up) === ("northwind ai visibility", 549k, ▲76.2k)
  ok  trend[1] ("ai search visibility", 47.3k, ▲7.8k, dir=up) === ("ai search visibility", 47.3k, ▲7.8k)
  FAIL trend[2] ("seo", 42.0k, ▲7.1k, dir=up) === ("generative engine optimization", 41.2k, ▲6.9k)
  FAIL trend[3] ("generative engine optimization", 41.2k, ▲6.9k, dir=up) === ("answer engine optimization", 58.6k, ▲5.2k)
  FAIL trend[4] ("ai content optimization", 64.0k, ▲6.4k, dir=up) === ("chatgpt brand mentions", 19.8k, ▲4.4k)
  FAIL trend[5] ("answer engine optimization", 58.6k, ▲5.2k, dir=up) === ("aeo tools", 22.7k, ▲4.1k)
  FAIL trend[6] ("chatgpt brand mentions", 19.8k, ▲4.4k, dir=up) === ("geo vs seo", 28.4k, ▲3.3k)
  ok  falling list has 7 rows
  ok  trend-after-tab[0] ("northwind ai visibility", 549k, ▲76.2k, dir=up) === ("northwind ai visibility", 549k, ▲76.2k)
  ok  trend-after-tab[1] ("ai search visibility", 47.3k, ▲7.8k, dir=up) === ("ai search visibility", 47.3k, ▲7.8k)
  FAIL trend-after-tab[2] ("seo", 42.0k, ▲7.1k, dir=up) === ("generative engine optimization", 41.2k, ▲6.9k)
  FAIL trend-after-tab[3] ("generative engine optimization", 41.2k, ▲6.9k, dir=up) === ("answer engine optimization", 58.6k, ▲5.2k)
  FAIL trend-after-tab[4] ("ai content optimization", 64.0k, ▲6.4k, dir=up) === ("chatgpt brand mentions", 19.8k, ▲4.4k)
  FAIL trend-after-tab[5] ("answer engine optimization", 58.6k, ▲5.2k, dir=up) === ("aeo tools", 22.7k, ▲4.1k)
  FAIL trend-after-tab[6] ("chatgpt brand mentions", 19.8k, ▲4.4k, dir=up) === ("geo vs seo", 28.4k, ▲3.3k)
  ok  zero innerHTML writes after init (count=0)

RESULT: FAIL (39 checks) :: ./original-backup.html
```

### Result against FIXED file (must PASS) — `node ./harness.js ./index.html`, exit 0
```
  ok  noflash guard present
  ok  color-scheme meta present
  ok  first-paint bg style present
  ok  fmt.vol(549400)==="549k" (got 549k)
  ok  fmt.chg(76200)==="+76.2k" (got +76.2k)
  ok  fmt.vol(58600)==="58.6k" (got 58.6k)
  ok  fmt.chg(5200)==="+5.2k" (got +5.2k)
-- Popular triples (volume desc) --
  ok  pop[0] ("northwind ai visibility", 549k, ▲76.2k, dir=up) === ("northwind ai visibility", 549k, ▲76.2k)
  ok  pop[1] ("answer engine optimization", 58.6k, ▲5.2k, dir=up) === ("answer engine optimization", 58.6k, ▲5.2k)
  ok  pop[2] ("ai search visibility", 47.3k, ▲7.8k, dir=up) === ("ai search visibility", 47.3k, ▲7.8k)
  ok  pop[3] ("generative engine optimization", 41.2k, ▲6.9k, dir=up) === ("generative engine optimization", 41.2k, ▲6.9k)
  ok  pop[4] ("geo vs seo", 28.4k, ▲3.3k, dir=up) === ("geo vs seo", 28.4k, ▲3.3k)
  ok  pop[5] ("aeo tools", 22.7k, ▲4.1k, dir=up) === ("aeo tools", 22.7k, ▲4.1k)
  ok  pop[6] ("chatgpt brand mentions", 19.8k, ▲4.4k, dir=up) === ("chatgpt brand mentions", 19.8k, ▲4.4k)
-- Trending triples, rising (change desc) --
  ok  trend[0] ("northwind ai visibility", 549k, ▲76.2k, dir=up) === ("northwind ai visibility", 549k, ▲76.2k)
  ok  trend[1] ("ai search visibility", 47.3k, ▲7.8k, dir=up) === ("ai search visibility", 47.3k, ▲7.8k)
  ok  trend[2] ("generative engine optimization", 41.2k, ▲6.9k, dir=up) === ("generative engine optimization", 41.2k, ▲6.9k)
  ok  trend[3] ("answer engine optimization", 58.6k, ▲5.2k, dir=up) === ("answer engine optimization", 58.6k, ▲5.2k)
  ok  trend[4] ("chatgpt brand mentions", 19.8k, ▲4.4k, dir=up) === ("chatgpt brand mentions", 19.8k, ▲4.4k)
  ok  trend[5] ("aeo tools", 22.7k, ▲4.1k, dir=up) === ("aeo tools", 22.7k, ▲4.1k)
  ok  trend[6] ("geo vs seo", 28.4k, ▲3.3k, dir=up) === ("geo vs seo", 28.4k, ▲3.3k)
  ok  popular deltas all distinct (76.2k, 5.2k, 7.8k, 6.9k, 3.3k, 4.1k, 4.4k)
-- visible state (light) --
  ok  row0 opacity 1 >= 0.75
  ok  row0 visible/display
  ok  row0 colour #1c1917 on #ffffff
  ok  row0 geometry 320x44
  ok  row1 opacity 1 >= 0.75
  ok  row1 visible/display
  ok  row1 colour #1c1917 on #ffffff
  ok  row1 geometry 320x44
  ok  row2 opacity 1 >= 0.75
  ok  row2 visible/display
  ok  row2 colour #1c1917 on #ffffff
  ok  row2 geometry 320x44
  ok  row3 opacity 1 >= 0.75
  ok  row3 visible/display
  ok  row3 colour #1c1917 on #ffffff
  ok  row3 geometry 320x44
  ok  row4 opacity 1 >= 0.75
  ok  row4 visible/display
  ok  row4 colour #1c1917 on #ffffff
  ok  row4 geometry 320x44
  ok  row5 opacity 1 >= 0.75
  ok  row5 visible/display
  ok  row5 colour #1c1917 on #ffffff
  ok  row5 geometry 320x44
  ok  row6 opacity 1 >= 0.75
  ok  row6 visible/display
  ok  row6 colour #1c1917 on #ffffff
  ok  row6 geometry 320x44
  ok  row7 opacity 1 >= 0.75
  ok  row7 visible/display
  ok  row7 colour #1c1917 on #ffffff
  ok  row7 geometry 320x44
  ok  row8 opacity 1 >= 0.75
  ok  row8 visible/display
  ok  row8 colour #1c1917 on #ffffff
  ok  row8 geometry 320x44
  ok  row9 opacity 1 >= 0.75
  ok  row9 visible/display
  ok  row9 colour #1c1917 on #ffffff
  ok  row9 geometry 320x44
  ok  row10 opacity 1 >= 0.75
  ok  row10 visible/display
  ok  row10 colour #1c1917 on #ffffff
  ok  row10 geometry 320x44
  ok  row11 opacity 1 >= 0.75
  ok  row11 visible/display
  ok  row11 colour #1c1917 on #ffffff
  ok  row11 geometry 320x44
  ok  row12 opacity 1 >= 0.75
  ok  row12 visible/display
  ok  row12 colour #1c1917 on #ffffff
  ok  row12 geometry 320x44
  ok  row13 opacity 1 >= 0.75
  ok  row13 visible/display
  ok  row13 colour #1c1917 on #ffffff
  ok  row13 geometry 320x44
-- visible state (dark) --
  ok  row0 opacity 1 >= 0.75
  ok  row0 visible/display
  ok  row0 colour #ededed on #1c1c1f
  ok  row0 geometry 320x44
  ok  row1 opacity 1 >= 0.75
  ok  row1 visible/display
  ok  row1 colour #ededed on #1c1c1f
  ok  row1 geometry 320x44
  ok  row2 opacity 1 >= 0.75
  ok  row2 visible/display
  ok  row2 colour #ededed on #1c1c1f
  ok  row2 geometry 320x44
  ok  row3 opacity 1 >= 0.75
  ok  row3 visible/display
  ok  row3 colour #ededed on #1c1c1f
  ok  row3 geometry 320x44
  ok  row4 opacity 1 >= 0.75
  ok  row4 visible/display
  ok  row4 colour #ededed on #1c1c1f
  ok  row4 geometry 320x44
  ok  row5 opacity 1 >= 0.75
  ok  row5 visible/display
  ok  row5 colour #ededed on #1c1c1f
  ok  row5 geometry 320x44
  ok  row6 opacity 1 >= 0.75
  ok  row6 visible/display
  ok  row6 colour #ededed on #1c1c1f
  ok  row6 geometry 320x44
  ok  row7 opacity 1 >= 0.75
  ok  row7 visible/display
  ok  row7 colour #ededed on #1c1c1f
  ok  row7 geometry 320x44
  ok  row8 opacity 1 >= 0.75
  ok  row8 visible/display
  ok  row8 colour #ededed on #1c1c1f
  ok  row8 geometry 320x44
  ok  row9 opacity 1 >= 0.75
  ok  row9 visible/display
  ok  row9 colour #ededed on #1c1c1f
  ok  row9 geometry 320x44
  ok  row10 opacity 1 >= 0.75
  ok  row10 visible/display
  ok  row10 colour #ededed on #1c1c1f
  ok  row10 geometry 320x44
  ok  row11 opacity 1 >= 0.75
  ok  row11 visible/display
  ok  row11 colour #ededed on #1c1c1f
  ok  row11 geometry 320x44
  ok  row12 opacity 1 >= 0.75
  ok  row12 visible/display
  ok  row12 colour #ededed on #1c1c1f
  ok  row12 geometry 320x44
  ok  row13 opacity 1 >= 0.75
  ok  row13 visible/display
  ok  row13 colour #ededed on #1c1c1f
  ok  row13 geometry 320x44
  ok  theme switches ink (light #1c1917 vs dark #ededed)
-- triples stable across themes --
  ok  pop[0] ("northwind ai visibility", 549k, ▲76.2k, dir=up) === ("northwind ai visibility", 549k, ▲76.2k)
  ok  pop[1] ("answer engine optimization", 58.6k, ▲5.2k, dir=up) === ("answer engine optimization", 58.6k, ▲5.2k)
  ok  pop[2] ("ai search visibility", 47.3k, ▲7.8k, dir=up) === ("ai search visibility", 47.3k, ▲7.8k)
  ok  pop[3] ("generative engine optimization", 41.2k, ▲6.9k, dir=up) === ("generative engine optimization", 41.2k, ▲6.9k)
  ok  pop[4] ("geo vs seo", 28.4k, ▲3.3k, dir=up) === ("geo vs seo", 28.4k, ▲3.3k)
  ok  pop[5] ("aeo tools", 22.7k, ▲4.1k, dir=up) === ("aeo tools", 22.7k, ▲4.1k)
  ok  pop[6] ("chatgpt brand mentions", 19.8k, ▲4.4k, dir=up) === ("chatgpt brand mentions", 19.8k, ▲4.4k)
  ok  trend[0] ("northwind ai visibility", 549k, ▲76.2k, dir=up) === ("northwind ai visibility", 549k, ▲76.2k)
  ok  trend[1] ("ai search visibility", 47.3k, ▲7.8k, dir=up) === ("ai search visibility", 47.3k, ▲7.8k)
  ok  trend[2] ("generative engine optimization", 41.2k, ▲6.9k, dir=up) === ("generative engine optimization", 41.2k, ▲6.9k)
  ok  trend[3] ("answer engine optimization", 58.6k, ▲5.2k, dir=up) === ("answer engine optimization", 58.6k, ▲5.2k)
  ok  trend[4] ("chatgpt brand mentions", 19.8k, ▲4.4k, dir=up) === ("chatgpt brand mentions", 19.8k, ▲4.4k)
  ok  trend[5] ("aeo tools", 22.7k, ▲4.1k, dir=up) === ("aeo tools", 22.7k, ▲4.1k)
  ok  trend[6] ("geo vs seo", 28.4k, ▲3.3k, dir=up) === ("geo vs seo", 28.4k, ▲3.3k)
  ok  full-loop button identity preserved (14 ticks)
  ok  full-loop row identity preserved (14 ticks)
-- triples stable across full loop --
  ok  pop[0] ("northwind ai visibility", 549k, ▲76.2k, dir=up) === ("northwind ai visibility", 549k, ▲76.2k)
  ok  pop[1] ("answer engine optimization", 58.6k, ▲5.2k, dir=up) === ("answer engine optimization", 58.6k, ▲5.2k)
  ok  pop[2] ("ai search visibility", 47.3k, ▲7.8k, dir=up) === ("ai search visibility", 47.3k, ▲7.8k)
  ok  pop[3] ("generative engine optimization", 41.2k, ▲6.9k, dir=up) === ("generative engine optimization", 41.2k, ▲6.9k)
  ok  pop[4] ("geo vs seo", 28.4k, ▲3.3k, dir=up) === ("geo vs seo", 28.4k, ▲3.3k)
  ok  pop[5] ("aeo tools", 22.7k, ▲4.1k, dir=up) === ("aeo tools", 22.7k, ▲4.1k)
  ok  pop[6] ("chatgpt brand mentions", 19.8k, ▲4.4k, dir=up) === ("chatgpt brand mentions", 19.8k, ▲4.4k)
  ok  trend[0] ("northwind ai visibility", 549k, ▲76.2k, dir=up) === ("northwind ai visibility", 549k, ▲76.2k)
  ok  trend[1] ("ai search visibility", 47.3k, ▲7.8k, dir=up) === ("ai search visibility", 47.3k, ▲7.8k)
  ok  trend[2] ("generative engine optimization", 41.2k, ▲6.9k, dir=up) === ("generative engine optimization", 41.2k, ▲6.9k)
  ok  trend[3] ("answer engine optimization", 58.6k, ▲5.2k, dir=up) === ("answer engine optimization", 58.6k, ▲5.2k)
  ok  trend[4] ("chatgpt brand mentions", 19.8k, ▲4.4k, dir=up) === ("chatgpt brand mentions", 19.8k, ▲4.4k)
  ok  trend[5] ("aeo tools", 22.7k, ▲4.1k, dir=up) === ("aeo tools", 22.7k, ▲4.1k)
  ok  trend[6] ("geo vs seo", 28.4k, ▲3.3k, dir=up) === ("geo vs seo", 28.4k, ▲3.3k)
  ok  falling list has 7 rows
  ok  trend-after-tab[0] ("northwind ai visibility", 549k, ▲76.2k, dir=up) === ("northwind ai visibility", 549k, ▲76.2k)
  ok  trend-after-tab[1] ("ai search visibility", 47.3k, ▲7.8k, dir=up) === ("ai search visibility", 47.3k, ▲7.8k)
  ok  trend-after-tab[2] ("generative engine optimization", 41.2k, ▲6.9k, dir=up) === ("generative engine optimization", 41.2k, ▲6.9k)
  ok  trend-after-tab[3] ("answer engine optimization", 58.6k, ▲5.2k, dir=up) === ("answer engine optimization", 58.6k, ▲5.2k)
  ok  trend-after-tab[4] ("chatgpt brand mentions", 19.8k, ▲4.4k, dir=up) === ("chatgpt brand mentions", 19.8k, ▲4.4k)
  ok  trend-after-tab[5] ("aeo tools", 22.7k, ▲4.1k, dir=up) === ("aeo tools", 22.7k, ▲4.1k)
  ok  trend-after-tab[6] ("geo vs seo", 28.4k, ▲3.3k, dir=up) === ("geo vs seo", 28.4k, ▲3.3k)
  ok  zero innerHTML writes after init (count=0)

RESULT: PASS :: ./index.html
```

## Invariants confirmed (both themes checked in harness)
- `/*noflash*/` guard + `color-scheme` meta + first-paint background: intact.
- In-place updates only: full 14-tick loop preserves every button/row node identity;
  triples unchanged across loop and across light/dark round-trip.
- Zero `innerHTML` writes after init (counter = 0 through ticks + trend tab switches).
- Demo data verbatim: `ALL` (26 entries) and `FALLING` untouched; row values exist in
  `demo-original.js` with identical numbers; only the two list-data lines changed.
- Light AND dark: all 14 rows legible in both
  (light ink `#1c1917` on card `#ffffff`; dark ink `#ededed` on card `#1c1c1f`;
  opacity 1 ≥ 0.75; geometry 320×44).

## How to test
- Browser: open `./index.html`; Popular shows 549k/58.6k/47.3k/41.2k/28.4k/22.7k/19.8k
  with distinct deltas ▲76.2k/▲5.2k/▲7.8k/▲6.9k/▲3.3k/▲4.1k/▲4.4k; Trending (Rising) shows
  the change-desc order; toggle the sun/moon button for dark mode.
- Node: `node --check ./harness.js && node ./harness.js ./index.html` (PASS, exit 0);
  `node ./harness.js ./original-backup.html` (FAIL, exit 1).
- Work was confined to this directory; no installs/downloads; no `/tmp` writes.
