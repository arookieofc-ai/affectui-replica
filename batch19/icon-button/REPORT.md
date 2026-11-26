# REPORT — Icon Button replica

## What was built
- `index.html` (18.9 KB, self-contained, no network, system fonts only): clean-room replica of the **Icon Button** demo — square icon-only buttons in ghost (default), outlined (`secondary`) and solid (`primary`) styles with toggle (`aria-pressed`) state.
- Layout matches `demo-original.js` structure with the same class hooks (`icb-demo`, `icb-democ icb-demo--classic`, `__head`, `__title`, `__count`, `__tools`, `__reply`, `__text`, `__actions`):
  - Header: `Runs` + count pill (`24` / `3`) + 4 toolbar buttons (Search runs, Filter, Pinned runs only [toggle], New run [primary]).
  - Reply: verbatim reply text + 4 action buttons (Copy/Copied [timed], Good answer [toggle, initially on], Regenerate [disabled], More).
  - Extra states gallery below the verbatim demo shows ghost / outlined / solid in default, pressed, and disabled — same icons, no new data.
- All icons are hand-drawn inline stroke SVGs (search, filter, pin, plus, copy, tick, thumbs-up, refresh, more). No SVG uses `.className`; visibility swaps use `hidden` attributes only.
- Design tokens via CSS custom properties for light + dark; visible sun/moon toggle top-right switching `data-theme` on `<html>` with `icb-theme` localStorage persistence.

## Matched data / behaviour (verbatim from demo-original.js)
- `Runs ` + count `e ? 3 : 24` — pinned toggle flips count 24 ↔ 3 and `aria-pressed`.
- Reply text: `Summarised 14 support tickets – three mention the export timeout, so I opened a draft fix in billing-api.`
- Labels verbatim: `Search runs`, `Filter`, `Pinned runs only`, `New run`, `Copy` → `Copied`, `Good answer` (initial `pressed=true`), `Regenerate` (`disabled`), `More`.
- Copy timing: click sets copied; `setTimeout(..., 1600)` reverts to Copy with icon swap (copy ↔ tick). Re-click while copied is a no-op (matches `setState(true)` with unchanged value).
- No demo loop beyond the 1600 ms copy revert; no fast tick. DOM is built once (static markup); JS only updates `textContent`, `aria-pressed`/`aria-label`/`title`, and `hidden` in place. Zero `innerHTML` writes anywhere.
- Hover/focus are CSS-only, never re-render. No popover/dialog exists (More is static per the demo), so the pointerdown-capture rule has nothing to trigger. `[hidden]{display:none !important}` is present; the only `svg{display:block}` rule cannot beat it due to `!important`.
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}` (count pill); concentric note (card 16 px, icon buttons r=8 treated as separate surfaces); shadows for elevation (card lift) vs borders for structure (outlined buttons, divider, pressed ring); optical nudge `translateY(.5px)` on glyphs.
- No agent identities in this component, so no 3×3 pixel-marks (spec: only if the component has agent identities). No context bar (no token counts in demo).
- Default markup theme is `light` (the demo's `--classic` appearance); `/*noflash*/` guard in `<head>` restores the stored `icb-theme` key or `prefers-color-scheme` before first paint, with `<meta name="color-scheme">` and first-paint background style.

## What could not be verified
- Pixel-exact visuals vs the original site (no screenshot available; matched from class names, tokens, and behaviour).
- Exact original SVG paths (compiled icon chunks were not read); icons are clean-room equivalents with the same meaning/size.
- `More` / `Search` / `Filter` / `New run` have no `onClick` in the demo, so they keep hover/press feedback only — faithful to the source.

## How to test
- Open `index.html` in a browser. Click the pin button (count 24 ↔ 3), Copy (Copied → reverts after 1.6 s), Good answer (toggle), and the sun/moon toggle for dark mode. Narrow the window below 560 px for the stacked layout.
- Node verification (no browser, no installs): `node verify.harness.cjs` — runs static checks plus a DOM stub that clicks through pin/like/copy, advances fake timers through the 1600 ms loop, and asserts node identity + zero `innerHTML` writes. `node --check` was run on the extracted page script and the harness (both OK).

## Verification results
- `node --check` on extracted page script: OK. `node --check` on harness: OK.
- Harness: 50/50 PASS — visible text (`Runs`, `24`/`3`, full reply string), pressed/disabled states, copy revert at 1600 ms (still `Copied` at 1599 ms, `Copy` at 1601 ms), unchanged nodes keep object identity across the full loop, zero `innerHTML` writes.
- Light AND dark checked: toggle light → dark → light persists `icb-theme`; dark-theme token set renders (surface `#1c1c1f`, page `#101012`) with no grey-on-grey; both themes exercised in the harness.
