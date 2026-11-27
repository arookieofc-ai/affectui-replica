# Integration Beam — replica report

## What was built
`index.html` (25 KB, self-contained, no external deps) replicates the affectUI
**Integration Beam** (slug `integration-beam`, illustration, Product scenes, Free):
"Product between connected tools with pulsing light beams, hover focus, click pause."

- **Scene:** three sender tools on the left (Slack, Notion, Gmail), the Acme hub
  product tile in the centre with an 8-petal sparkle mark, three receiver tools
  on the right (HubSpot, Linear, Google Drive) — names verbatim from the demo chunk.
- **Beams:** one SVG cubic-bezier beam per tool behind the tiles, with a travelling
  light pulse (bright head + accent body on a transparent tail, glow + core strokes)
  scheduled left-wave then right-wave with stagger, matching the demo's timing
  (1500 ms travel, 280 ms stagger, gap between loops).
- **Status chip:** `N connected` at rest, `Syncing…` while pulses are in flight,
  `All paused` when every tool is paused; breathing dot, polite live region
  announcing pause/resume with counts.
- **Interactions:** hover / `focus-visible` focuses one connection (other beams dim,
  tooltip appears beside the tile); click (or Enter/Space) pauses/resumes a tool —
  beam goes dashed, tile desaturates, tooltip notes "Paused". Arrival ping plays on
  the tile a pulse reaches. Resize re-lays beams in place; off-screen and
  `prefers-reduced-motion` reduce/stop animation. Narrow widths stack
  senders → hub → receivers with vertical beams.
- **Clean-room:** all markup/CSS/JS written from the public description and observed
  behaviour. Tool glyphs are original letter badges in brand hues (not copied logo
  paths); the hub mark is an original asterisk. No compiled source was pasted.

## What matches the original
Layout (side groups + centre hub, SVG beams underneath), per-tool beams with
gradient pulses, hover-focus dim/highlight, click-pause with dashed lines and
greyed tiles, status chip states, tooltips pointing at the scene centre, stacked
narrow layout, dark-mode token swap, reduced-motion support.

## What could not be verified
Pixel-exact logo artwork (brand SVGs replaced with clean-room letter badges);
exact original easing constants beyond what the demo chunk exposes; real-browser
paint (no browser available here) — geometry falls back to deterministic
coordinates when layout APIs are absent, and the page was verified via stubbed DOM.

## How to test
Open `index.html` in a browser. Hover tools, click to pause/resume, resize narrow,
toggle the sun/moon button. Or run the stub harness (no browser needed):

```
node harness.js
```

It runs `node --check` on the inline script and asserts visible painted text,
full-loop node identity, zero `innerHTML` writes after init, and light + dark themes.
Result at time of writing: **ALL HARNESS CHECKS PASSED** (51/51).

## Themes
Checked both: light (default, follows `prefers-color-scheme`) and dark via the
top-right toggle, guarded by a `/*noflash*/` first-paint script so dark never
flashes white. Tokens (`--surface`, `--page`, `--ink`, `--border`, …) drive every
colour in both modes.
