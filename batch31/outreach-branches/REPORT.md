# Outreach Branches — targeted fix (pulses + Notion glyph)

## What was fixed (in `./index.html` only, no rebuild)
1. **Coloured pulses never painted** — `buildDefs()` used camelCase SVG presentation
   attributes (`stopColor` / `stopOpacity` / `floodColor` / `floodOpacity`) via
   `setAttribute`. Those names are invalid in raw SVG (must be kebab-case
   `stop-color` / `stop-opacity` / `flood-color` / `flood-opacity`), so the
   `ui-ob-pulse` / `ui-ob-blob` / `ui-ob-edge` gradients had zero valid stops.
   The `stroke="url(#ob-pulse)"` paint server was therefore invalid and the
   36 pulses were invisible — branches rendered as bare thin lines.
   Fixed by quoting kebab-case keys in JS object literals:
   `{"stop-color":...}`, `{"stop-opacity":...}`, `{"flood-color":...}`,
   `{"flood-opacity":...}`. Colours are now the verbatim original palette
   `#FF8A96 / #FFA77F / #B98EE5 / #8E9DFF` (`userSpaceOnUse 40->280`).
2. **Notion icon solid black square** — `notionMark()` used simplified paths
   without `fill-rule`/`clip-rule`, so the inner frame filled solid `#171717`.
   Replaced with verbatim original `demo-original.js` path data:
   page `M4.49207 3.25638...` + mark `M45.393 0.182995...M19.1502...M14.6581...M58.7508 24.8891...`
   with `fill-rule="evenodd" clip-rule="evenodd"`, classes
   `ui-ob-notion-page` / `ui-ob-mark` retained.
3. **Dark-theme invisibility** — added missing dark overrides matching the original
   `m` CSS string:
   `:where(.dark,[data-theme="dark"]) .ui-ob-lines/.ui-ob-tile/.ui-ob-drop/.ui-ob-sliver/.ui-ob-gray/.ui-ob-notion-page/.ui-ob-mark`.
   Pulses are theme-independent bright colours, now visible on both
   `page #fafaf9` (light) and `page #101012` (dark).

Checked `./demo-original.js` first: the original uses React props `stopColor`/
`floodColor` (compiled to correct `stop-color`/`flood-color`), `fillRule="evenodd"`,
and the 7 dark `:where(.dark,[data-theme="dark"])` rules above, with 9 paths
(3 branches x [line+left+right]) x 4 lens (`[36,.18],[25,.38],[15,.7],[7,1]`,
`--from=len/2+18`, `--to=len/2-100-18`, `delay=branch*0.6s`, `4.2s` loop) = 36 pulses.
The replica broke all three, so a fix was warranted (not original behaviour).

Kept: `/*noflash*/` guard + `html{background...}` + `color-scheme` meta,
in-place updates only, zero `innerHTML` writes after init, demo data verbatim
(`BRANCH_PATHS`, `TILES`, `PULSE_LENS`, `36 pulses`, `4.2s loop / 0.6s stagger`),
Pause/Resume (`body.paused` + `animation-play-state:paused`) working.

## What matches the original
- Geometry: `M160 52 V120`, `M160 52 C 160 86, 72 86, 72 130`,
  `M160 52 C 160 86, 248 86, 248 130`; tiles `[128,120,64,14]/[44,130,56,12]/[220,130,56,12]`.
- Pulse motion: `pathLength=100`, `stroke-dasharray="<len> 200"`,
  `--from/--to` as above, keyframes `ob-flow` (peak `.8`) / `ob-wrap` (peak `.45`).
- Glyphs: Gmail/Slack kept; Notion now verbatim original with evenodd holes.
- Tokens, radius, shadows, tabular-nums, hover-only media, tap-highlight, reduced-motion.

## What could not be verified
- Real-browser computed pixels at 3s/32s/40s/49s (no browser here). Verified with
  node-only DOM-stub harness asserting visible computed state
  (peak opacity x stroke-opacity, stop-color palette, geometry, per-branch counts,
  light+dark fills) plus loop identity and 0 innerHTML.

## How to test
- `open index.html` in a browser (or `python3 -m http.server` then open).
- Light + dark: click Sun/Moon toggle (top-right); confirm coloured dashes travel
  down all 3 branches on a 4.2s loop in both themes, Notion tile shows white/dark
  page with N glyph (not a black square), blob + edge tint visible.
- Pause: click `Pause motion` -> freezes; `Resume motion` resumes; `Cycle N` ticks
  every 4.2s, `Ns elapsed` ticks every 1s.
- Node only (no installs): `node --check ./harness.js` + `node ./harness.js ./index.html`
  (and `./original-backup.html` for contrast). Inline scripts were extracted and
  `node --check`ed as well (both OK).

## Proof — md5 (MUST differ)
- BEFORE: `8d0369539b2c30e4fcb719e65a996871  ./index.html`
- AFTER:  `bdfc8cda7f27bcfcecfac510c652d556  ./index.html`
- Backup: `8d0369539b2c30e4fcb719e65a996871  ./original-backup.html` (identical to BEFORE)

## Proof — harness FAILs on original, PASSes on fixed
Harness: `./harness.js` (node only, in-dir DOM stub). Asserts visible state
(computed peak opacity/colours/geometry, light+dark fills), 12+24=36 pulses
(12 per branch via 0s/0.6s/1.2s delays), Notion evenodd glyph, dark CSS,
full-loop node identity, zero innerHTML, Pause/Resume.

### `node ./harness.js ./original-backup.html` (expected FAIL, exit 1)
```
FAIL ./original-backup.html
 - missing dark override for ui-ob-lines (invisible in dark)
 - missing dark override for ui-ob-tile (invisible in dark)
 - missing dark override for ui-ob-drop (invisible in dark)
 - missing dark override for ui-ob-sliver (invisible in dark)
 - missing dark override for ui-ob-gray (invisible in dark)
 - missing dark override for ui-ob-notion-page (invisible in dark)
 - missing dark override for ui-ob-mark (invisible in dark)
 - found camelCase stopColor (invalid SVG; must be stop-color) — pulses cannot paint coloured
 - found camelCase floodColor (invalid SVG; must be flood-color)
 - missing stop-color presentation attribute (pulse/blob gradients)
 - missing flood-color presentation attribute
 - Notion mark missing original outer outline (glyph-less)
 - Notion mark missing original N-glyph detail
 - Notion mark missing original inner frame
 - Notion mark missing fill-rule evenodd (paints as solid square)
 - expected >=4 pulse gradient stops with stop-color palette, got 0 (coloured pulses)
 - stop element has invalid stopColor attr
 - stop element has invalid stopColor attr
 - stop element has invalid stopColor attr
 - stop element has invalid stopColor attr
 - stop element has invalid stopColor attr
 - stop element has invalid stopColor attr
 - stop element has invalid stopColor attr
 - stop element has invalid stopColor attr
 - stop element has invalid stopColor attr
 - stop element has invalid stopColor attr
 - stop element has invalid stopColor attr
 - stop element has invalid stopColor attr
 - stop element has invalid stopColor attr
 - stop element has invalid stopColor attr
 - notion mark d len 375 too short (simplified solid square)
 - notion mark must have >=4 subpaths (frame + N holes), else solid square
 - notion mark fill-rule must be evenodd
```

### `node ./harness.js ./index.html` (expected PASS, exit 0)
```
PASS ./index.html (36 pulses visible light+dark, notion glyph evenodd, loop identity, 0 innerHTML)
```

### `node --check` (node only, no installs)
```
node --check ./harness.js -> HARNESS_SYNTAX_OK
inline script 0 (/*noflash*/) -> OK
inline script 1 (main 11KB) -> OK
```
