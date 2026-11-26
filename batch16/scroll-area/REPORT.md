# Scroll Area — replica report

## What was built
`index.html` (27 KB, self-contained, no network, system fonts) replicates the
Scroll Area classic demo: a `Sources` card with a vertical scrolling reading
list (`maxHeight 240`, fade) plus a horizontal `Attached files` chip scroller.

- Clean-room code: own HTML/CSS/JS written from the observed behaviour in
  `demo-original.js`. No verbatim copy of the compiled bundle. Class names are
  own (`scrollbox__*`) with the same behaviour contract (`data-orientation`,
  `data-type`, `data-fade`, `data-scroll-y/x`, `data-scrolling`,
  `data-dragging`, `--sb-*-start/end` fade vars).
- Slim hover scrollbar (6 px → 8 px on hover), 10 px hit strip, draggable
  thumb, track click-to-page (0.9 × viewport, smooth unless reduced-motion),
  soft mask fade edges (28 px max, lengths animate near ends), `data-scrolling`
  shown for 800 ms after scroll, `ResizeObserver` + resize refresh, RTL-safe
  horizontal path, `tabindex=0` + `role=region` + `aria-label`, coarse-pointer
  / reduced-motion / forced-colors variants, dark-mode thumb + focus tokens.
- Header pattern matches the original: `Sources` + `12 read` (+ `5 files`
  pill), not a generic component title + toolbar. No invented project/token
  numbers — this component has no token context or agent identities, so no
  token bar and no 3×3 pixel-marks (correctly omitted; spec requires them only
  *if the component has agent identities*).
- Design tokens via custom properties for every colour; light tokens
  (`surface #ffffff`, `page #fafaf9`, `ink #1c1917`, `muted #78716c`,
  `subtle #f5f5f4`, `border #e7e5e4`, radii 16/10/6, shadow) and dark tokens
  (`surface #1c1c1f`, `page #101012`, `ink #ededed`, `muted #a1a1aa`,
  `subtle #26262a`, `border #2e2e33`, amber `#fbbf24` on `#451a03` / `#fde68a`).
  Visible sun/moon toggle (top-right) flips `data-theme` on `<html>` and
  persists to `localStorage`. Default is stored → `prefers-color-scheme` →
  light; in a light environment this equals the original demo appearance
  (light classic card).
- `<head>` starts with the `/*noflash*/` guard + `html{background:#fafaf9}` /
  `html[data-theme="dark"]{background:#101012}` + `<meta name="color-scheme">`.
- In-place updates only: lists are built once at init with `createElement` /
  `textContent`; timers/scroll/hover only mutate attributes, styles and CSS
  vars on existing nodes. Zero `innerHTML` anywhere. SVG classes only via
  `setAttribute`. Track/drag use `pointerdown` capture. `[hidden]{display:none}`
  rule included.

## Matched data / behaviour (verbatim from demo-original.js)
- 12 sources with exact title / site / read triples (stripe.com 4 min …
  priceintelligently.com 4 min; `Internal · billing-q3.csv`, `Internal ·
  notes.md` with `·`/`–` preserved) and `12 read` count.
- 5 files verbatim: `billing-q3.csv`, `pricing-draft.pdf`, `interviews.txt`,
  `plans-table.png`, `usage_model.py` with csv/pdf/txt/img/code glyphs.
- Props: list `orientation=vertical, type=hover, fade, maxHeight=240,
  aria-label=Sources`; files `orientation=horizontal, fade,
  aria-label=Attached files`. Thumb formula
  `max(min(24,track), round(track·viewport/scroll))`, proportional translate,
  fade `min(scrolled/remaining, 28px)`, 800 ms scroll-hide, hover/always/scroll
  types (switchable via Hover/Always/On-scroll segmented control — in-place
  `data-type` swap, no rebuild).

## What was not verified / notes
- No browser launch (per instructions). Pixel rendering, real pointer capture,
  native smooth-scroll animation and `ResizeObserver` live firing were not
  eyeballed — covered by stub + static token checks instead.
- `sa-demo` card CSS is not shipped in the demo chunk (only `ui-sa` CSS is);
  card styling is a faithful token-based reconstruction, not a copy.

## How to test
Open `index.html` in a browser (double-click or `python3 -m http.server` then
visit it). Hover each box to reveal the slim bar, drag the thumb, click the
track to page, `Tab` + arrows for keyboard, toggle Hover/Always/On-scroll,
toggle sun/moon for light/dark.

## Verification results
- `node --check` on the extracted page script: **pass**.
- In-dir stub harness `harness-verify.js` (`node harness-verify.js`):
  **ALL CHECKS PASSED** — 12 rows + 5 chips built once; VISIBLE text (node
  `textContent`, not markup) contains all titles/files/read-times; header
  `Sources + 12 read`; full scroll loop (top→mid→bottom→top + 800 ms timer
  drain on both axes) keeps all row/chip/thumb object identity; **zero
  `innerHTML` writes after init**; `data-scroll-y`, fade vars and thumb
  geometry update in place; light AND dark tokens present and `data-theme`
  toggles both ways without rebuild.
- Light AND dark: checked (token presence + runtime toggle + card/thumb
  contrast pairs use muted-on-surface/subtle, no grey-on-grey).
