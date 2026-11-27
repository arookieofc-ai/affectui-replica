# Lead Sourcing — replica report

## Built
Standalone `index.html` (inline CSS+JS, no external deps, ~20KB) replicating the affectUI
**Lead Sourcing** card illustration (slug `lead-sourcing`, Card illustrations, Free).

Public description: **ChatGPT tile linked to Gmail and Grok, with shine running along the connection.**

Layout: header (`Lead Sourcing` + working count + agent count) → token context bar →
2-column card grid (illustration card + sourcing-run side panel) → footer. Narrow widths stack.

## What matches the original
- Illustration geometry verbatim from `demo-original.js`: `viewBox 0 0 320 240`, `aspect-ratio 3/2`,
  centre tile `x128 y88 w64 h64 rx14`, side tiles `x45 y95` / `x225 y95 w50 h50 rx10`,
  empty tiles `(67,27) (203,27) (67,163) (203,163)` with radial fade masks,
  connection `line 25→295 @ y120 width 1.5` with ends-fade mask, blob glow `cx160 cy152 rx22 ry8 blur 10`.
- Colours verbatim: blob `#FFA0AB/#FFB89E/#C8A8E5/#A8B5FF @.6`, edge
  `#E4E7EC/#FFB5BC/#FFC5AB/#D5BBEF/#B5C0FF`, shine base `#E4E7EC` + band
  `#FF6B5C/#FFB89E/#C8A8E5/#A8B5FF`, tile `#FFFFFF/#E4E7EC`, dark tile `#232326`,
  marks `#171717` → `#ededed` in dark, aria-label
  `A ChatGPT tile connected to Gmail and Grok, surrounded by empty tiles`.
- Shine loop `3.6s` (travel first 30%, hold rest), disabled under `prefers-reduced-motion`.
- Dark mode via `data-theme` on `<html>` following the demo's dark tile/mark/gray rules.
- Interactions: theme toggle, pause/resume sourcing, pause/play shine, click centre tile
  (keyboard Enter/Space) to open details, advance-step, live counters.

## Clean-room
All markup/CSS/JS rewritten by hand. Gmail/Grok/ChatGPT glyphs are simplified stand-ins
(letter/X/spark redrawn, not the compiled path data); gradient/tile numbers are facts reused,
not code copied. No bundle source pasted.

## Could not verify
- Pixel-exact match to the Pro screenshot (no browser available in this environment).
- Original SMIL `<animate>` timing vs my rAF port (same 3.6s curve by construction).
- Token counts / agent names: demo chunk has no run data, so plausible values used
  (`44k / 200k`, `128 leads`, `chatgpt-drafter/gmail-reader/grok-search`).

## How to test
1. Open `index.html` in a browser.
2. Toggle sun/moon — confirm light AND dark both finished (no grey-on-grey, borders visible).
3. Press Pause sourcing / Pause shine / Details / Advance step; click the centre tile.
4. Narrow the window — cards stack.
5. Node checks: `node --check index.html` is N/A (HTML); instead
   `node --check harness.verify.js` plus extract+check inline script, then
   `node harness.verify.js` (DOM-stub: visible text, node identity, zero innerHTML, themes).

## Verification
- `node --check` on extracted inline script: pass.
- `node harness.verify.js`: asserts visible painted text, full-loop node identity,
  zero `innerHTML` writes after init, light+dark themes: pass.
- Checked light and dark: tokens swapped via CSS vars, marks/tiles/stops all have dark rules.
