# REPORT — diff-timeline replica

## What was built
Single self-contained `index.html` (38 KB, inline CSS+JS, no network, system fonts) replicating the
affectUI Pro **diff-timeline** component: a timeline of diffs/changes with before-after state over time.
Clean-room code written from scratch; the compiled `demo-original.js` in this directory was read only to
extract exact demo data, timings and behaviour.

## Original demo data used (verbatim, no invented data)
- Agent `{id:"frontend", name:"Frontend agent"}`, context `"PR #214"`, `duration:240`, animated
  `elapsed: 0 → 226` at `18 units/s` with a 600 ms lead-in; `live = elapsed < 226`.
- All 15 edits with exact `at` times, files, added/removed counts and diff-line snippets, including the
  binary `public/hero.png` (`added:0, removed:0`, "Binary file changed" note):
  `6 app/page.tsx +22`, `14 components/landing-page.tsx +38`, `30 components/hero.tsx +44`,
  `46 components/pricing.tsx +6 −28`, `58 lib/brand.ts +16 −4`, `70 components/landing-page.tsx +12 −8`,
  `84 public/hero.png` (binary), `98 app/page.tsx +14 −10`, `118 components/hero.tsx +26 −6`,
  `132 components/pricing.tsx +20 −12`, `152 components/landing-page.tsx +24 −6`,
  `162 components/hero.test.tsx +58`, `188 components/hero.tsx +6 −9`,
  `200 lib/brand.ts +4 −11`, `212 components/hero.test.tsx +28`.
- End totals derived from that data: **+318 / −94, net +224, "Done · 15 edits in 3:46"** (verified in harness).
- 7 files in first-appearance order; file-type glyph colours (code blue, image pink, sheet green,
  folder amber); `m:ss` axis labels via the original's nice-step ticks; chart scale rows via the original's
  scale function; 3% smoothstep ramp; tooltip width 236 px, max 4 diff lines.

## Interactions (match original)
- Live playback of the cumulative added/removed/net area+line chart with glowing head dots and a
  dashed "now" line; status line shows `Editing <dir><file>` while live, `Done · N edits in M:SS` at end,
  `Waiting for the first edit…` when empty. Any trusted pointer/keyboard interaction settles to the end
  state (as the original's capture-to-end does). Replay / Skip-to-end buttons included.
- Hover chart → nearest-edit tooltip (cumulative + this-edit counts, diff preview, binary note);
  hover file row → pins for that file's edits; keyboard ←/→/Home/End/Esc; focus jumps to latest edit;
  current-file highlight bar; theme toggle (sun/moon, top-right, `data-theme` on `<html>`,
  `prefers-color-scheme` default + localStorage override); responsive narrow layout
  (dir hidden, brief `+1.2k` counts, wrapped totals); `prefers-reduced-motion` disables animation.

## Anti-freeze / anti-lost-click measures (per prompt)
- Pixel-mark markup contains **exactly 9 `<i>` cells** (asserted in harness; deterministic hash of the
  agent id, ≥5 on, twinkle delays `[0,120,240,120,240,360,240,360,480]`).
- No rebuild inside the fast tick loop: the rAF loop only calls `render()` when `elapsed` actually
  changed; file list rebuilds only when its render key (visible count + hover) changes; renders are
  coalesced through a single queued rAF.
- Hover state is set on **`pointerdown` (capture) as well as `pointermove`**, so a real mouse click can
  never be lost across a rebuild.

## Design tokens
All colours are CSS custom properties (light + dark twin). Light: surface `#ffffff`, page `#fafaf9`,
ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`, radius-lg `16px`, radius `10px`,
radius-sm `6px`, shadow soft, pills `999px`, transitions 150–200 ms. Dark: surface `#1c1c1f`,
page `#101013`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`. Status:
add green, del red, waiting amber (`#92400e` on `#fef3c7` light / `#fde68a` on `#451a03` dark).

## Contrast audit (computed)
| pair | ratio |
|---|---|
| light ink/surface | 17.93 |
| light muted/surface | 4.80 ✓ |
| light faint/surface (axis/dir only) | 3.69 (raised from original's 2.5 for legibility) |
| light add/del text | 4.37 / 5.52 |
| light waiting text/bg | 6.37 |
| dark ink/surface | 14.52 |
| dark muted/surface | 6.63 ✓ |
| dark faint/surface | 4.64 ✓ |
| dark add/del text | 9.15 / 7.42 |
| dark waiting text/bg | 12.03 |
No grey-on-grey; borders visible in both themes. Checked light + dark by token measurement and by
toggling `data-theme` in the harness (theme button flips html `data-theme` light→dark).

## Verification
- `node --check` on the extracted inline script: passes.
- Real headless run: `node harness.js` (kept in this directory) loads the page script in a small DOM
  stub, pumps the fake rAF queue through the full 12 s playback, and asserts: 15 edits / 7 files /
  timings; 9-cell pixel-mark; animation runs 0→226 then stops; totals +318/−94/net +224 and
  `Done · 15 edits in 3:46`; tooltip opens on hover with correct file; ArrowLeft/Escape work; theme
  toggles to dark; replay restarts. **ALL HEADLESS CHECKS PASSED.**

## How to test
Open `index.html` in a browser. Watch the 12 s replay, hover the chart and file rows, use arrow keys,
toggle the theme (◐/☾), resize narrow, try Replay.

## Could not verify
Pixel-perfect match to the original site's surrounding page (only the compiled demo bundle was
available); exact font rendering Inter-vs-system; real-browser container-query narrow breakpoint
(covered by CSS `@container`, not executed headless).
