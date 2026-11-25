# REPORT — context-compaction replica

## What was built
`index.html` (37,443 bytes, single self-contained file, no network, system fonts) replicating
the affectUI Pro **context-compaction** component: a context-window bar whose colored segments
fold into a summary during compaction, plus `harness.js` (headless DOM-stub + fake-timer
verification, kept in this directory) and this report.

Clean-room implementation: the original compiled demo (`demo-original.js`) was read only to
extract data/timings/behaviour; all HTML/CSS/JS was written from scratch (own glyph strokes,
own letter-tile app icons instead of copied brand paths).

## Original data used (verbatim from demo-original.js)
- Header: title **"Fix the cart total"**, model pill **"Claude Sonnet"**, limit **200000**,
  threshold **0.8** (compacts at 160K), row height **32px**, fold animation **950ms**.
- Base entries: `System prompt` 3200 · `14 tools` 9800 with the exact 14 apps in order
  (GitHub, Linear, Vercel, Terminal, File system, Code search, Test runner, Browser,
  Postgres, Stripe, Slack, Notion, Figma, Docs search), total 14.
- Streamed entries (13): `The cart total is off by a cent – can you fix it?` 400 …
  `run_tests · 48 tests, 2 failed` 26300 … `All 48 pass – rounding moved to the total` 1100
  (full token list preserved).
- Continuation (3): `Nice. Round the tax line the same way?` 300 ·
  `On it – the tax sits in its own file` 700 · `src/cart/tax.ts` 12200.
- Compaction rule: victims = all except `system`/`tools` minus the last two; summary =
  `Summary – bug found and fixed, all tests pass`, tokens `max(1200, 3%)` → **3576 (3.6K)**
  over 11 entries / 119.2K — verified in harness.
- Timings: first entry 900ms, step 620ms, compact sweep 1700ms, fold 950ms, reset 3600ms;
  token formatter (`174K`, `3.6K`) matches the original.
- Identity: agent 3×3 pixel-mark derived from the original hash routine → cells
  `[0,1,0,1,0,1,1,0,1]`, per-cell twinkle delays `[0,120,240,120,240,360,240,360,480]ms`;
  user mark is all 9 on. Markup contains **exactly 9 `<i>` cells per mark** (asserted).
- Kind colours (light/dark pairs) and per-extension file-doc colours preserved in spirit
  via design tokens.

## Interactions
Autoplay loop (stream → auto-compact at 80% → fold → continue → reset → replay);
hover segment/row highlights (others dim to 0.75, never below); click/pointerdown on
tool-strip or summary rows opens the details card (14-app grid / 8 ghosts + "and N more");
`Compact now` button; keyboard ↑↓/Home/End/Enter/Space/Esc; aria-live announcements
("Compacting N…", "Compacted 11 entries, 119.2K to 3.6K tokens"); theme toggle
(sun/moon, top-right, `data-theme` on `<html>`, defaults to `prefers-color-scheme`);
`prefers-reduced-motion` boots to the already-compacted static state.
v3 adaptations: thin 3px bar with right-aligned `58.3K of 200K` counts (no bare
percentages in meta), circular tool icons, single-line ellipsis rows, dim floor 0.75.
Render-on-change only (signature check; fold is pure CSS) and card opens on
`pointerdown` capture, so clicks survive re-renders.

## Token audit
Every colour is a `var(--*)` token on `:root` / `html[data-theme="dark"]`; no ad-hoc hex
in component styles (only brand-tile accents on app icons). Surface/page/ink/muted/
subtle/border/radius/shadow match the spec values in both themes; light is the default
unless the OS prefers dark.

## Contrast results (computed luminance ratios)
Light — ink/surface 17.9, muted/surface 4.8, muted/page ~4.7, amber-ink/bg 6.4,
blue-ink/surface 5.2. Dark — ink/surface 14.5, muted/surface 6.6, muted/subtle 5.9,
amber-ink/bg 12.0, blue-ink/surface 9.4. All body text ≥ 4.5:1. The summary green
(3.3:1 light) is used only for non-text accents (bar segments, 8px dots), which pass
the 3:1 graphics threshold; no text is set in it.

## Verification
`node harness.js` → **ALL CHECKS PASSED** (37 assertions: static size/network/font checks,
script execution, streaming, compaction math, fold lifecycle, pointerdown card, manual
compact, quiet-window no-write check, theme flip, reset loop, 30s soak) plus
`node --check` on the extracted script → SYNTAX_OK.
Checked in light and dark token sets (theme toggle flips `data-theme`; dark palette
verified by token inspection + contrast math). Open `index.html` in a browser to watch it.

## Could not verify
Pixel-perfect match to the original Pro render (no screenshot available here); exact
easing curves of the ghost fold (recreated as a 950ms CSS fold); real-browser focus
outlines and scrollbar styling (covered by `:focus-visible` + system rules).
