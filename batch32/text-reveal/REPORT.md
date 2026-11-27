# Text Reveal — replica report

Built `index.html` (self-contained, ~18KB, no network, system fonts) replicating the
`demo-original.js` Text Reveal component with clean-room code.

## What was built
- Hero demo with exact original copy:
  - Title (h2): `Words that arrive one at a time.` — `by=word`, stagger `40ms`, delay `0ms`, duration `700ms`
  - Body: `Each word fades in out of a soft blur and rises into place, so a sentence reads like it is being spoken.` — `by=word`, stagger `22ms`, delay `260ms`, duration `700ms`
  - `Replay` button (remount-equivalent, done in place: clears `data-shown`, forces reflow, re-sets on next frame; replay count updated via `textContent`)
- Core `ui-trv` behaviour from observed source:
  - `text.split(/(\s+)/)` preserving whitespace; word mode → `span.ui-trv__p` per word with `--ui-trv-i`; letter mode → `span.ui-trv__w` per word containing grapheme `span.ui-trv__p` split via `Intl.Segmenter` (fallback `Array.from`)
  - SR-only full-text `span.ui-trv__sr` + `aria-hidden` visual layer
  - CSS vars `--ui-trv-stagger/--delay/--duration`, animation `ui-trv-in` with blur `8px` (light) / `6px` (dark), rise `0.35em`, ease `cubic-bezier(0.2,0.7,0.2,1)`, `animation-delay: calc(delay + i*stagger)`
  - `IntersectionObserver(threshold: 0)`, `once=true` disconnects, `once=false` hides on scroll-out; no-IO falls back to shown; `prefers-reduced-motion` shows text as-is
- Playground (same verbatim sentence): Word/Letter segmented control, stagger/delay/duration sliders, once checkbox — all update in place, no `innerHTML`
- Scroll section: three blocks (title defaults, body defaults, letter mode) each observed on scroll; `R` key replays hero
- Chrome per spec v2–v5: design tokens as CSS vars, visible sun/moon toggle (`data-theme` on `<html>`), `/*noflash*/` guard + first-paint bg + `meta color-scheme`, `[hidden]{display:none}`, hover only inside `@media (hover: hover) and (pointer: fine)`, `tap-highlight: transparent`, `tabular-nums` on body, concentric radii (16/10/6), borders for structure + shadows for elevation, SVG hidden toggled via `setAttribute` only

No agent identities on this component, so no 3×3 pixel-marks (correctly omitted).

## Matched data / behaviour / timings
Verbatim strings, Replay label, stagger/delay/duration numbers above, blur/rise/ease, threshold-0 IO with once semantics — all match `demo-original.js`.

## Verification (node only, no browser)
- `python3 -c` extract last `<script>` → `./_check_tmp.js`, then `node --check ./_check_tmp.js` → `CHECK-OK` (temp file removed afterwards)
- In-dir stub harness `./harness.cjs` (no deps): stubs `document/window/localStorage/matchMedia/IntersectionObserver/rAF`, runs page script in `vm`, fires IO, drains rAF, calls `__trv.replay()`, flips theme:
  - VISIBLE text asserted via `textContent` of `aria-hidden` layer (not only `aria`/markup)
  - `data-shown` set, word count 7, `--ui-trv-i` sequential, vars 40/22/260/700
  - Node identity kept across full loop (visual layer + every word/letter span identical objects), `innerHTML` writes after init = 0 (also after mode switch + theme flips)
  - Default theme `light` (original appearance), toggle → `dark` (persisted `text-reveal-theme`) → `light`; state stays `revealed`
  - Result: `ALL HARNESS CHECKS PASSED (light AND dark verified)`

## Could not verify
- Real browser paint / animation smoothness, actual scroll intersection timing, screen-reader announcement order — stub asserts DOM/state only
- Pixel-perfect line-breaks vs original (font-dependent)

## How to test
Open `./index.html` in a browser (double-click or `python3 -m http.server` in this dir). Scroll the third card, press Replay / `R`, flip Word/Letter and sliders, toggle sun/moon; check both themes. Re-run `node ./harness.cjs`.
