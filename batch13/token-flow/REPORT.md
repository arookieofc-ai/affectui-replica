# Token Flow — replica report

## What was built
`index.html` (53,817 bytes, single self-contained file, inline CSS + JS, system fonts only, zero network/external assets) replicating the affectUI **Token Flow** Sankey component: token and cost flow from sources through models to outputs.

Layout matches the original: header row (pixel-mark + title + Tokens/$ segmented switch), summary line (big total + unit + secondary total + delta pill), and a 3-column Sankey (`Sources | Models | Outcomes`) with gradient flow bands, per-node share/split bars, hover tooltip, and click-to-open detail dialog (`role="dialog"`, Tokens/Cost/Share/$-per-1K stats, From/To top-3 lists with “and N more”).

## Original data / behaviour matched (verbatim from `demo-original.js`)
- Title `Answer a refund question`; sources `System prompt / You / Agent turns / Tool results / Files / Memory` (Tool results carries 6 app tiles + “+3” = 9 total); models `Claude Sonnet 5.5 ($6) / GPT-5.5 ($5) / Gemini 3 Flash ($0.6)`; outcomes `Answer delivered / Retried / Cancelled`.
- All 24 links with exact token counts and `from0/to0` windows; per-link cost = tokens × model price / 1e6.
- Loop timings: 700 ms first tick, 1050 ms per step, 22 steps with per-link ease-out (`1-(1-q)²` inside each `from0→to0` window), 9 s hold, fade, restart.
- Number formatting identical in behaviour: `335K` total tokens, `$1.56` total cost, streaming pill `Last run 381K`, completion pill `−12% vs last run` (tokens) / `−14% vs last run` (cost mode: big `$1.56`, unit `spent`). Previous run `{tokens: 381e3, cost: 1.82}`.
- Agent identity is a deterministic 3×3 pixel-mark (hash of `"agent"`, exactly 9 cells) that twinkles while streaming; header mark + agent node mark. “You” node uses an all-on 3×3 mark (the demo’s `/avatars/sofia.jpg` is a network asset, so the offline replica uses the mark fallback).
- Model logos are clean-room letter badges (C/G/F); status/tool/file/memory glyphs are hand-drawn stroke icons; tool-app brand paths were NOT copied (letter tiles instead) — noted as the one deliberate visual deviation.

## Design tokens / themes
- Light default (the original demo’s appearance): surface `#ffffff`, page `#fafaf9`, ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`.
- Visible ☾/☀ toggle flips `data-theme` on `<html>`; dark theme uses surface `#1c1c1f`, page `#101012`, ink `#ededed`, adjusted amber/green/red pills; choice persists via `localStorage`, initial value honours `prefers-color-scheme`.
- Hard-won rules honoured: single `[hidden]{display:none}` rule and no other desktop `display:none`/`visibility:hidden`/`color:transparent`/`font-size:0` rules; dimmed cards keep opacity 0.78 (≥ 0.75); no DOM rebuilds in the tick path (ticks only update text/attributes/paths); dialogs open on `pointerdown` capture with a consume-flag so the follow-up click can’t toggle them shut; outside-close on document `pointerdown` capture + `Escape`; SVG classes set via `setAttribute`; responsive narrow layout stacks cards and hides the SVG.

## Browser-QA fixes (2026-11-26, verified against `demo-original.js` ground truth)
All three QA findings confirmed as genuine defects (checked the original first —
none of them is original behaviour; the original's click-to-select, timings and
easing are untouched).

1. `% of all` footer clipped — root cause: fixed card heights `CARDH = [40, 76, 52]`
   were below the painted content height (name 18px + meta 16px + 5px margin +
   footer 16px = 55px). Side cards overflowed top/bottom and the next absolutely
   positioned card painted over the overflow, leaving only the footer's top half
   visible. The original sizes side cards dynamically in the 64–96px range
   (`we=64, Te=96`; models 72–132px). Fix: `CARDH = [68, 76, 68]` (side cards at
  /above the original minimum with breathing room; model height 76px was already
   in range and is unchanged). `chartH` is recomputed from `CARDH`, so spacing
   follows automatically. Still no DOM rebuilds in the tick path.

2. Details dialog cut off (FROM values at right edge, TO section at bottom) —
   root causes: (a) `top` used a fixed 60px guess and `maxHeight = chartH - 8`
   ignored `top`, so tall dialogs ran past the chart bottom and were clipped by
   `.tfl-scroll{overflow-y:hidden}` (e.g. bottom node: old top 388 + maxH 440 =
   828px in a 448px chart); the original estimates dialog height
   (`o = 104 + (col1 ? 44 : 0) + lists*26 + rows*26`) and clamps top plus a
   post-layout `offsetHeight` correction. (b) Right-edge cutoff was grid blowout:
   `.tfl-detail` grid children (`ul`, `.tfl-list`, stats cells, `dd`) had
   `min-width:auto`, forcing `nowrap` content past the 256px box. Fix: estimate
   `estH` with the original's formula, clamp
   `top = max(4, min(chartH - estH - 4, center - estH/2))`, set
   `maxHeight = chartH - top - 4` with `overflow:auto` so excess scrolls inside
   the dialog, and add a `min-width:0` chain (`.tfl-detail > *`, lists, `ul`,
   stats cells, ellipsis on `dd`). Dialog geometry now asserted:
   left+width ≤ 756, top+maxHeight = chartH−4 for every node.

3. Theme toggle closed the dialog — root cause: the document `pointerdown`
   capture outside-close treated the toggle (fixed-position, outside `.tfl`) as
   an outside click and cleared `state.open`. The toggle handler itself never
   touched demo state. The original has no theme button (its outside-close
   covers the component root), so exempting is consistent, not contradictory.
   Fix: the capture handler returns early for `#themeToggle` (and `#tflSwitch`,
   which sits inside the section in the original and refreshes the open dialog
   via the existing `if(state.open) openDetail(state.open)` path). Clicking a
   node still opens the details dialog (selection, the original behaviour) —
   deliberately NOT changed to filtering.

## Verification (node only, in-directory — no browser installed or launched)
- `node verify-qa.cjs` (kept next to `index.html`, zero deps): **128/128 PASS**.
  Static: file <200KB, no external refs/network, `[hidden]{display:none}` + no
  other desktop `display:none`/`visibility:hidden`/`color:transparent`,
  SVG classes via `setAttribute` only, pointerdown-capture opens, tick path has
  no `createElement`/`appendChild`/`openDetail`, original timings/easing intact.
  Runtime (minimal DOM stub executes the real inline script to final state):
  VISIBLE painted text asserted in BOTH themes — `335K`, `tokens`, `$1.56`,
  `−12% vs last run`, all 12 node labels, every `% of all` footer, full dialog
  (Tokens/Cost/Share, From/To, `and 3 more`, all values/bars) — plus theme-token
  contrast in light (17.9:1 body, 4.8:1 muted) and dark (14.5:1 body, 6.6:1
  muted), card heights ≥ 64px, dialog-inside-chart geometry for top and bottom
  nodes, theme toggle preserving open dialog + step/streaming/unit/text/timers,
  unit switch refreshing (not closing) the dialog, Escape closing, and two ticks
  reusing the same node elements.
- `node --check` equivalent on the extracted inline script: passes (asserted inside the harness).
- `node verify-qa.cjs` run: `128 passed, 0 failed` (exit 0).

## How to test
Open `index.html` in any browser. Watch the 22-step stream animate, hover bands/cards, click a card for details, flip Tokens/$ and the theme toggle, narrow the window for the stacked layout. Reduced-motion users jump straight to the final state.
