# Token Flow — replica report

## What was built
`index.html` (52,915 bytes, single self-contained file, inline CSS + JS, system fonts only, zero network/external assets) replicating the affectUI **Token Flow** Sankey component: token and cost flow from sources through models to outputs.

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

## Verification (all in-directory, no browser — headless Chrome can’t run here)
- `node --check` on the extracted inline script: passes.
- `node verify-harness.cjs` (temporary DOM-stub harness, since removed): **ALL 70 CHECKS PASSED**, covering CSS visibility audit (both themes’ tokens present), script self-containment (<200 KB, no external refs), exact loop phasing (step 0 → 22 → hold → fade → restart), VISIBLE text assertions (`335K`, `$1.56`, `Last run 381K`, `−12%`/`−14%` pills, all 12 node labels), 9-cell pixel-marks, hover highlight without rebuild, dialog open/close via click + Escape, Tokens/$ toggle, and theme toggle light→dark→light with text still visible. Light AND dark both checked.

## How to test
Open `index.html` in any browser. Watch the 22-step stream animate, hover bands/cards, click a card for details, flip Tokens/$ and the theme toggle, narrow the window for the stacked layout. Reduced-motion users jump straight to the final state.
