# Color Picker — replica report

## What was built
- `index.html` (single file, ~26KB, no network, system fonts) replicating the
  affectUI **Color Picker** demo from `demo-original.js`.
- Layout: top bar (`Research` + `0 working` + `1 agent` + sun/moon toggle) and a
  `Research agent` card with row (pixel-mark + name + meta + swatch trigger) and
  foot (pixel-mark + `Research agent finished “Competitor pricing”` + `2m`).
- Picker: swatch trigger showing uppercase hex (`#A651F0` initial), pop card with
  saturation/brightness area (152px), hue slider, hex field with `#` + input,
  8 round presets in radiogroup. No opacity slider — matches the demo, which does
  not pass `alpha` (component supports alpha internally, demo hides it).

## Matched data / behaviour (verbatim from demo-original.js)
- Initial value `#a651f0`, displayed uppercase `#A651F0`.
- Texts: `Research agent`, `Its color on runs, mentions and the board`,
  `Agent color` (dialog label), `finished “Competitor pricing”` (curly quotes), `2m`.
- Presets verbatim: `#0190fe Blue`, `#14b3f0 Cyan`, `#13b3a0 Teal`, `#5fc88a Green`,
  `#e8b000 Amber`, `#f28a2e Orange`, `#ee3e9e Pink`, `#a651f0 Purple`.
- Aria: `Saturation and brightness` (0–100, `Saturation S%, brightness B%`),
  `Hue` (0–360, `H°, name` with red/orange/yellow/green/cyan/blue/purple/pink/red),
  `Hex color`, `Presets`, `Agent color`, section `Research agent`.
- Pixel-marks: deterministic hash of `research` → `[1,1,1,0,1,0,1,0,1]`, 2 marks × EXACTLY 9 `<i>` cells.
- Open by default on desktop; closed on `(pointer: coarse), (max-width: 640px)` via matchMedia (same as original `useLayoutEffect`).
- Interactions: click toggles, outside `pointerdown`/`mousedown` capture closes, `Escape` closes + refocuses trigger, area/hue drag via pointer capture, full keyboard (arrows/shift/PageUp/PageDown/Home/End), hex validation (`hexRe`), Enter/blur commit with invalid ring, presets click + arrow/Home/End roving tabindex, focus first slider on open.
- Clean-room: own color utils (`parseColor`, `toHex`, `hsvToRgb`, `rgbToHsv`, `hueName`), own CSS (same tokens/look, not copied verbatim).

## Spec compliance
- Design tokens as CSS vars (light: surface `#ffffff`, page `#fafaf9`, ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`, radius-lg 16 / radius 10 / radius-sm 6, shadow soft; dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`).
- Light AND dark via `<html data-theme>` + visible `◐/☀` toggle top-right, persisted as `clp-theme`.
- Default theme = original appearance (light); guard falls back to `prefers-color-scheme`.
- `/*noflash*/` guard first in `<head>` + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `meta color-scheme`.
- IN-PLACE ONLY: refs cached once at init, all updates mutate `textContent`/`style`/`attributes` on existing nodes; zero `innerHTML` in file; hover/focus never re-render; open/close on `pointerdown` capture.
- `[hidden]{display:none!important}` present; no SVG `.className` assignment.

## Verification
- `node --check` on extracted main script: pass.
- In-dir stub harness `harness.cjs` (no `/tmp`, no installs): builds fake DOM, loads page script via `vm`, asserts VISIBLE text (trigger hex, project, foot, time — not aria-only), 8 presets, 2×9 pixel cells, open→hex commits (`#0190FE`, `#EE3E9E`)→reopen full loop, advances timers (0 pending, no loop in this component), zero `innerHTML` writes after init, object identity kept for `trig/footLine/footTime/proj/area/hue` across full loop.
- Checked light AND dark: visible text asserted under both `data-theme` values; dark CSS tokens present.
- Result: **69 pass, 0 fail**.

## How to test
- Open `index.html` in a browser. Click swatch to open/close, drag area/hue, type hex + Enter, click presets, press Escape, toggle `◐/☀` (check both themes), narrow to ≤640px (card docks).
- Re-run: `node harness.cjs` inside this directory.
