# Outreach Branches — Replica Report

## What was built
`index.html` (17.8KB, self-contained, no network, system fonts) replicates the
`ui-outreach-branches` demo: three lines branching from a top point to
Gmail (left), Slack (center-front) and Notion (right) tiles, with coloured
pulses flowing down each branch and wrapping around the tiles.

Page chrome: top bar with title + visible theme toggle (top-right),
card with header (`Outreach Branches` + `3 destinations · 36 pulses`),
diagram, legend (Gmail / Slack / Notion), live status
(`Cycle N · pulses flowing to Gmail, Slack, Notion` + `Ns elapsed`),
`Pause motion` button, and a footer note about the 4.2s loop.

## Matched data / behaviour (verbatim from demo-original.js)
- `aria-label`: `Lines branching out to Gmail, Slack and Notion tiles`, `role="img"`, `viewBox="0 0 320 240"`.
- Branches: `M160 52 V120`, `M160 52 C 160 86, 72 86, 72 130`, `M160 52 C 160 86, 248 86, 248 130`.
- Tiles: `[128,120,64,14]` (Slack), `[44,130,56,12]` (Gmail), `[220,130,56,12]` (Notion); rects `44,130,56,56,rx12`, `220,130,56,56,rx12`, `128,120,64,64,rx14`; blob `cx160 cy184 rx40 ry13`; edge highlight `M128 170 A 14 14 0 0 0 142 184 L178 184 A 14 14 0 0 0 192 170`.
- Pulse system: `[[36,.18],[25,.38],[15,.7],[7,1]]`, base `36`, `pathLength=100`, `dasharray="{n} 200"`, `--from=n/2+18`, `--to=n/2-100-18`, `animation-delay=branch*0.6s`, `duration 4.2s infinite`; `flow` keyframes (0%→40% travel, fade) and `wrap` keyframes (23.3%→61.8% tile wrap) with same cubic-bezier timing and opacities (0.8 / 0.45).
- Gradients: blob `#FFA0AB/#FFB89E/#C8A8E5/#A8B5FF`, edge `#E4E7EC…#FFB5BC…#B5C0FF…#E4E7EC`, pulse `#FF8A96/#FFA77F/#B98EE5/#8E9DFF`; tile drop-shadow + top inner sliver filters; dark-mode overrides for lines/tiles/floods.
- Logos are clean-room redraws (no verbatim bundle copy): simplified Gmail envelope (red/blue/amber), Slack 4-colour marks (`#36C5F0/#2EB67D/#E01E5A/#ECB22E`), Notion page + N. Layout positions (`57,146.07,w30` / `146,138,s28` / `235,143,s30`) match the original.

## Deliberate deviations
- No 3×3 pixel-marks: component has no agent identities (only brand tiles), so per spec the pixel-mark rule does not apply. Legend uses colour dots instead.
- Header uses project pattern (`Outreach Branches` + `3 flowing · 3 destinations` + `3 destinations · 36 pulses`) rather than a generic toolbar; context/token bar does not apply (no token counts in source).
- Added `Pause motion` + live `Cycle/ elapsed` line for interactivity and to give the timer loop an in-place observable state. Animation itself remains CSS-only like the original.

## v5 polish / v4 guards
- `/*noflash*/` script first in `<head>`, `meta color-scheme`, inline `html{background}` for both themes; default light (original appearance), stored `ob-theme` else `prefers-color-scheme`.
- Tokens for all colours; dark theme (`--surface:#1c1c1f`, `--page:#101012`, etc.), amber waiting kept legible.
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (card 16 / inner 10 + 6 padding); shadows for elevation, borders for structure; `[hidden]{display:none!important}` beats `.ui-ob-art svg{display:block}`; SVG classes only via `setAttribute`; focus-visible outlines; no `innerHTML` after init; DOM built once, timers update `textContent`/attributes in place.

## Verification (node only, no browser)
- `node --check` on extracted main script: PASS.
- `node harness.cjs` (in-dir DOM stub): ALL PASS —
  static (noflash order, tokens, dark overrides, gated hover, tap-highlight, tabular-nums, verbatim paths/label, visible Gmail/Slack/Notion/Cycle 1),
  dynamic (2 timers 1000/4200ms; 36 pulse paths; `viewBox`; cycle advanced to `Cycle 6` + `21s elapsed` across full loop; node identity held; 0 `innerHTML` writes after init; theme toggled light→dark→light with in-place label sync; pause/resume without rebuild).
- Light AND dark checked: dark token block present, toggle switches `data-theme` both ways in stub, `prefers-reduced-motion` disables pulses.
- Size 17.8KB < 200KB.

## How to test
Open `index.html` in a browser. Pulses should flow on a 4.2s staggered loop. Toggle sun/moon (top-right) for dark mode. `Pause motion` freezes pulses. Resize narrow: legend stacks.
