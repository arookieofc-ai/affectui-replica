# REPORT — Agent Tree (slug agent-tree)

## What was built
Standalone `index.html` (~29KB, inline CSS+JS, system fonts only) replicating affectUI **Agent Tree** (component, Agents, Pro).
Public description: *Orchestrator and sub-agents as a live tree with status, cost, and time.*

- Header follows v3 pattern: project name `Launch the new pricing page by Friday` + `N working · M agents` + live loop label, not a generic title+toolbar.
- Context is token counts (`29k / 200k tokens` at 8s, `~43k / 200k` at end) with thin 3px bar, right-aligned label. Tokens derived as `round(totalCost*20000)`, capped 200k.
- 3 columns: Orchestrator / Team / Sub-agents with reserved `.col-head` space above cards.
- Agent identity is deterministic 3×3 pixel-mark per agent id (hash → 9 hsl cells), coloured; working cards twinkle via CSS. No dots.
- Tools are small 22px circular badges with initials (`Slack→S`, `Notion→N`, `GitHub→G`, `Figma→F`, `Stripe→S`, `Finder→F`), not pills.
- Sub-agents (Scraper, Analyst, Tester×2) are smaller cards with no model line; model still in Details for accessibility.
- States: running (blue), waiting (amber), done (green), failed (red), stopped/queued (grey). Dimmed chain nodes stay at `opacity:.8` (≥0.75).
- Titles/model rows single-line ellipsis; expanded cards keep bottom padding so text never sits under buttons.
- Live loop 18.5s (`CAP 16s`, `G 8` same as demo): nodes appear at `at`, status via `e>=end?outcome:wait?waiting:running`, waiting→running and failed→stopped on resolve, cost `active*rate*8`, elapsed `active*8`. Auto-collapse `['research']` for 9–16s unless user overrides. Pause / Replay / scrub slider included.
- Interactions: hover/focus highlights ancestor+descendant chain, click/Enter toggles Details, `C` collapses, arrows move focus, waiting `Resolve` and failed `Acknowledge` buttons work in place.
- Clean-room: all CSS/JS written from spec + demo behaviour; no copied bundle source. Provider/tool SVGs replaced with pixel-marks and letter circles.

## Demo data (verbatim)
Used exactly from `demo-original.js`:
lead Orchestrator/Opus 5.5/0→12.6/done/.011; research Researcher/Sonnet 5.5/.8→6.4/done/.004; scrape Scraper/Gemini 3.8 Flash/1.8→4.6/done/.0012; reviews Analyst/Sonnet 5.5/2.6→6/done/.003; copy Writer/Sonnet 5.5/1.4→10/done/wait[5.6,7.4]/ask `Formal or friendly…`/.0035; build Coder/GPT-6 Sol/2→12/done/.006; tests Tester/GPT-6 Mini/3.6→7/failed/`2 of 14 checkout tests fail – coupon codes aren't applied`/.0016; retry Tester/GPT-6 Mini/7.6→10.8/done/.0016. Parents: research/copy/build→lead, scrape/reviews→research, tests/retry→build. Tool counts/order preserved (lead 3, research 2, scrape 1, reviews 2, copy 2, build 3, tests 1, retry 2).

## What matches / v5 polish
Tokens use CSS vars for every colour (light + dark exact hexes from spec). Cards 1px border + soft layered shadow, hover lift inside `@media (hover:hover) and (pointer:fine)`, focus-visible ring, 150–200ms ease. `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, pills `999px`, card `16/10/6px` radii (inner details `4px` so outer 16 = inner 4 + pad 12), image-line inset outline on pixel-marks, button icon side 2px less padding. Noflash guard is first in `<head>` + bg style + `color-scheme` meta. Responsive: ≤900px stacks to list.

## In-place updates
DOM built once via `createElement`; ticker only mutates `textContent/class/style/hidden/attrs` when cached values change. No `innerHTML`/`outerHTML` anywhere. Loop restarts keep object identity.

## Verification (node only, no browser)
- `node --check` on extracted noflash + main scripts and `verify.js`: all OK.
- In-dir DOM-stub harness `verify.js`: ALL PASS. Asserts VISIBLE painted text at 8s (all 8 agents, all tasks, asks, errors, models, `$x.xx`), full-loop identity (`0→18.5s` same `card` objects), zero `innerHTML` writes after init, light AND dark themes paint with text intact, waiting at 6.5s, failed at 7.0s, resolve keeps identity and flips to running.
- Checked both themes via `setTheme('light'/'dark')` + CSS token presence; contrast uses spec tokens.

## What could not be verified
No browser launched per instructions; pixel-perfect layout, real paint timing, prefers-color-scheme auto default, and screen-reader narration were not visually checked. Harness uses a stub, not layout engine.

## How to test
Open `index.html` in a browser (double-click or `python3 -m http.server` then visit). Watch live statuses/costs, hover cards for chain highlight, click for Details, resolve Writer 5.6–7.4s, acknowledge Tester failure, toggle sun/moon top-right for light/dark, scrub timeline, resize narrow to see stacked list.
