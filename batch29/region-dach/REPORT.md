# REPORT — region-dach replica

## What was built
Single standalone `index.html` (161921B, <200KB) + `harness.js` in this directory.
Replicates affectUI `DACH Region` (`slug region-dach`):
- DACH map (3 land paths, 10 neighbour paths) with fading neighbours via radial mask, pastel border band (4 staggered strokes, 14s loop).
- Pastel shine gradient `#FFA0AB / #FFB89E / #C8A8E5 / #A8B5FF` (verbatim stops from demo).
- Switchable to 5 other regions (US, China, India, Brazil, Japan) via pill trigger + morphing listbox menu.
- Enter `520ms scale(.94)` / exit `320ms scale(1.04)` layer transitions, 480ms exit cleanup.
- Theme toggle (sun/moon, top-right) `data-theme="light"|"dark"` on `<html>`, persisted as `ui-rd-theme`, defaults to `prefers-color-scheme`.

## Demo data verbatim
From `./demo-original.js` (not copied code, only data):
- Regions array verbatim: `dach/DACH/Map of the DACH region: Germany, Austria and Switzerland`, `us/United States/Map of the United States`, `cn/China/Map of China`, `in/India/Map of India`, `br/Brazil/Map of Brazil`, `jp/Japan/Map of Japan`.
- Geometry verbatim: `d` (3), `f` (10), `p`, `m,h,g,_,v,y,b,x,S`, jp neighbours inline string. `perimeter=u(land)` (`slice(0,indexOf('z')+1)`) reproduced. Fades `[260,220,220]` for DACH, `[270,220,240]` others. Mask stops `0% .9 / 65% .6 / 90% .18 / 100% 0`, neighbour stroke `#A6ABB3 .7`, land `#F8F8F8/#D6D9DE .9`, shadow `feDropShadow 0,3,3.5 #1F2128 .07`, band dasharrays `180 820 / 200 800 / 140 860 / 80 920`, widths `6/1.4`, opacities `.45/.32/.55/1`, delays `-.42/-.84`.

Clean-room: all HTML/CSS/JS rewritten. No copied bundle code. Check icons/chevron redrawn as generic paths.

## What matches
- Layout: `540x440 viewBox`, `aspect-ratio:540/440`, switch top-left scaled by `--ui-rd-s=min(1,max(.62,w/540))`.
- Switcher: 28px pill `999px`, 172px menu, `clip-path inset(... round 16px)` morph from trigger size, `fill` glide (`190ms`), options `13px/18px`, check scale spring, keyboard `Up/Down/Home/End/Enter/Space/Esc/Tab`, `aria-haspopup/listbox`, `aria-expanded/controls/label`, `aria-selected/activedescendant`, outside `pointerdown` close.
- Dark: neighbours `#5c5c63`, land `#2c2c30/#4a4a50`, trigger/panel/fill dark tokens.

## v3 notes (Crew-specific N/A)
Original demo has no project/agent header, no token counts, no 3x3 pixel-marks or tool icons. Page header is `DACH Region + 6 regions` + theme toggle. Single-line ellipsis, `opacity>=.75` for dimmed, bottom padding, column spacing preserved where applicable.

## v5 polish
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`.
- `html{-webkit-tap-highlight-color:transparent}`.
- `body{font-variant-numeric:tabular-nums}` (status counts `3 lands • 10 neighbours` don't jitter).
- Concentric radius: panel `16 = option 10 + padding 5 + border 1`.
- Shadows for elevation (`drop-shadow`/`box-shadow`), borders for structure.
- Map art `1px inset outline rgba(0,0,0,.1)/rgba(255,255,255,.1)`.
- Optical: trigger `padding:0 8px 0 12px` (icon side 4px tighter), chevron `14px`.

## v4 (no-flash + in-place)
- Head starts with `/*noflash*/`: `meta color-scheme`, `style html{background...}`, script reading `ui-rd-theme` else media, setting `data-theme` before paint.
- DOM built once at init (`createElement/createElementNS`). Ticks/timeouts only mutate `textContent/attributes/style` on existing nodes, remove exit layers, append new layer. No `innerHTML` anywhere after init (harness asserts zero writes). Full-loop keeps `trigger/panel/fill/options/svg` identity.

## Could not verify (no browser per instructions)
- Pixel-perfect map rendering, drop-shadow blur, gradient smoothness, morph clip-path animation fluidity, focus ring contrast in real browsers, narrow stacked layout, `prefers-reduced-motion`, screen-reader narration. Only Node stub verified.

## How to test
- Open `index.html` in a browser. Click pill, switch through 6 regions, try keyboard, toggle sun/moon, resize narrow.
- Node only: `node --check harness.js && node harness.js` — asserts visible painted text (`DACH`, all 6 names, map `aria-label`), full-loop node identity (6-region cycle back to DACH, `layers=1`), zero `innerHTML` after init, light AND dark themes. Main script syntax via `vm.Script` (no browser, no rm, in-dir only).

## Checks
- `node --check harness.js` + `node harness.js`: ALL PASSED.
- `index.html` 161921B <200KB.
- Light AND dark manually reasoned + harness toggled; no grey-on-grey (tokens `--ink/#ededed`, `--muted/#a1a1aa`, `--border/#2e2e33`).
