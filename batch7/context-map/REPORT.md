# context-map — replica report

## What was built
`index.html` (51.6KB, self-contained, no network, system fonts) — a clean-room
replica of the affectUI **context-map** component: a living treemap of an agent's
context contents. Tiles grow as the run progresses, then compact into a summary.
All CSS/JS is original code written from the observed behaviour; no source was
copied from `demo-original.js` (it was read only to extract data, timings and
behaviour).

## What matches the original
- **Header pattern**: logo mark + "Context" title + agent picker (name + token
  limit + chevron, `menu`/`menuitemradio` roles) + "Compacting" status pill with
  spinner + Before/After compare group + right-aligned `used / limit` + `%` pill.
- **Thin 3px usage bar** under the header, shifting to amber then red at the
  high (≥80%) / full (≥95%) thresholds.
- **Exact original demo data**: 3 agents (Checkout fixer / Opus 5.5 / 200k,
  Codebase scout / Gemini Pro / 500k, Support triage / GPT-5 / 128k), all 38
  content blocks with verbatim labels, details (`"confirmPayment" in 14 files`,
  `38 files read at 0:12`, …) and the 12/5/5 tool-definition lists.
- **Timings**: 25s loop, compaction starts 14.4s and settles over 1.2s,
  compaction row appears at 15.9s, auto-"before" window 17.3–20.9s,
  "Compacting" status 13.8–16s, cubic ease-out growth, `until` blocks shrink
  away, blocks under 40 tokens are dropped, token formatter (`999500+` → M,
  `100k+` → round k, `1000+` → 1dp k).
- **Before/after compare**: before-view freezes tiles at pre-compaction sizes
  with kept/summarized/dropped fates; after-view grows the Summary tile;
  fates row (`X → Y`, `N kept ·`, `M summarized · … into …`, `K dropped ·`)
  and the "Not compacted yet…" placeholder.
- **Tooltip**: kind label · tokens · %, detail, fate line, tool items
  (11 shown + "+N more"). Hover previews, click pins; Escape / outside click
  dismisses.
- **v3 items**: deterministic 3x3 pixel-mark per agent id (exactly 9 cells,
  twinkles while working), token counts (never %), small circular tool glyphs,
  dimmed tiles stay at opacity 0.75, single-line ellipsis titles, expandable
  tiles keep bottom padding, responsive narrow layout.

## Interactions
Hover tile → tooltip; click/`Enter` tile → pin; Before/After buttons or auto
window switch views; agent picker switches runs (clock resets); sun/moon button
toggles light/dark (`data-theme`, persisted, defaults to
`prefers-color-scheme`); Escape closes menu/pin. Tiles are keyboard-focusable
with visible focus rings; `prefers-reduced-motion` disables animation.

## Render discipline (prompt constraints)
- Tiles are rebuilt **only** when the tile set / view / agent changes
  (signature check); per-frame ticks only touch CSS vars and text that actually
  changed (verified: 0 rebuilds over 2s of steady animation).
- Pinning uses **`pointerdown` capture** on the tile, so a click can never be
  lost to a rebuild; agent chrome never rebuilds on numeric ticks.

## Verification
- `node --check` on the extracted inline script: passes.
- `node harness.js` (kept in this directory): boots the page in a DOM stub,
  drives its rAF timers and asserts behaviour — **28/28 pass**, including:
  tiles appear over time, counters animate, status/compare/fates appear at the
  right times, before-view freeze, pin + Escape, agent switch, both theme
  directions with 9-cell pixel-marks intact, and the 25s loop wrap.
  (`node harness.js --debug` prints pixel-mark/menu diagnostics.)

## Token audit
All colours go through custom properties; no hard-coded hex in rules.
Light: surface `#ffffff`, page `#fafaf9`, ink `#171717`, muted `#78716c`,
subtle `#f5f5f4`, border `#e7e5e4`, radii 16/10/6px, shadow
`0 1px 2px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.05)`, pills `999px`.
Dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`,
subtle `#26262a`, border `#2e2e33`; amber `#fbbf24` on `#451a03` / `#fde68a`.
Both themes render finished (dark tile tints mirror the original's dark set).

## Contrast results (computed, WCAG AA 4.5 for text)
Light — ink/surface 17.93, muted/page 4.59, pill-ink/subtle 5.21,
system 6.03, tools 5.67, memory 6.01, file 4.55, chat 5.90, result 5.26,
summary 5.53, amber pill 6.37, fail pill 4.52: all pass.
Dark — ink 14.52, muted/page 7.42, muted/subtle 5.88, system 7.51,
tools 7.20, memory 8.17, file 7.16, chat 8.06, result 8.02, summary 6.69,
amber 12.03, fail 6.57: all pass.
(Result/summary greens were darkened one notch from the raw demo tints to
reach AA; hues unchanged. Dimmed tiles kept at opacity ≥ 0.75 per spec.)

## Could not verify
Pixel-perfect likeness against the rendered original (no screenshot harness
available here) — layout values, palette roles, timings and copy follow the
compiled demo exactly. No sub-agent cards exist in this demo's data, so that
v3 clause is not exercised. Open `index.html` in a browser to view.
