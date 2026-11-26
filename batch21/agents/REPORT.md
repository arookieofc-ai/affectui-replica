# Agents — replica report

## What built
- `index.html` (self-contained, ~28KB, system fonts, no network): team board for **Acme launch**.
- Header: project name + `3 working · 7 agents` + context `44k / 200k` with thin 3px bar, right-aligned label.
- Grid of 5 agent cards + 2 sub-agent small cards (no model line): Aria, Atlas, Pixel, Nova, Echo + `Aria · migrate`, `Atlas · fetch`.
- Each card: deterministic 3×3 pixel-mark (9 cells, coloured by id hash, twinkle when `working`), name/role single-line ellipsis, status pill (working/waiting/idle/failed), model row (`claude-sonnet-4.5`, `gpt-5`, `gpt-5-mini`, `claude-haiku-4`), circular tool icons, spend `$x.xx` + tokens `12k tokens`, task line.
- Detail panel (right, sticky; stacked below on narrow): name, role·status, Status/Model/Spend/Tokens/Task rows, 3 activity lines. Updates in place.
- Creator: `New agent` button opens popover on `pointerdown`+`mousedown` capture; form creates card in place, no reload.
- Loop: `TICK_MS=1500`, working agents accrue tokens/spend, `used` context grows, 6-tick deterministic status cycle (`pixel waiting→working`, `nova idle→working`, `echo failed→idle`, `atlas-s1 idle→working`) returning to start; `used` resets 44k at 200k limit. `Live · tick N` label.
- Keyboard: Tab focus, Enter/Space selects, Esc closes creator. `focus-visible` outline.
- Tokens: light `--surface #ffffff / --page #fafaf9 / --ink #1c1917 / --muted #78716c / --subtle #f5f5f4 / --border #e7e5e4`, dark `--surface #1c1c1f / --page #101012 / --ink #ededed / --muted #a1a1aa / --subtle #26262a / --border #2e2e33`, amber waiting adjusted for dark. Toggle `data-theme` on `<html>`, persists `localStorage theme`.
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric `16px = 10px + 6px` in creator dialog; shadows for elevation / borders for structure; `img` inset outline rule; optical button padding (`has-icon` left 10px vs right 12px).
- Hard rules: DOM built once, ticks update `textContent/class/attributes/style` only, never `innerHTML` (zero uses); `[hidden]{display:none!important}`; SVG classes via `setAttribute`; no broad `svg{display:block}` hiding rule.

## Matched vs unknown
- `demo-original.js` in this dir is the affectUI 404 HTML page (6163 B), not demo JS — no names/numbers/strings to copy. Used plausible data in same shape (noted per spec): statuses, models, apps, spend, token counts, tasks above.
- Header pattern, token-count context, 9-cell pixel-marks, circular tools, sub-cards, in-place loop, noflash guard implemented from spec v3/v4/v5.

## Verification
- `python3` extract last inline `<script>` → `./__extracted.js` → `node --check ./__extracted.js` → **OK**.
- `node ./harness.cjs` (in-dir stub, no packages): stubs `document/localStorage/matchMedia/setInterval`, counts `innerHTML` writes, advances 6 ticks (full loop), checks visible text (names/status/model/spend/tokens), 9-cell marks, node identity, toggle, pointerdown capture.
- LIGHT (`light`, prefers-light) + DARK (`dark`, prefers-dark): **ALL CHECKS PASSED** (see run output). Zero `innerHTML` writes after init and after loop; card roots + detail title keep identity; statuses return to start; toggle flips theme; live label `tick 6`.
- Checked contrast manually via tokens (amber dark `#fbbc24 on #451a03 text #fde68a`, muted on surface); no grey-on-grey.

## How to test
- Open `index.html` in a browser (double-click or `python3 -m http.server` in this dir). Toggle sun/moon, click cards, create agent, watch ticks. No installs.
