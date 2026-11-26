# Agent / Orchestration — replica report

## What was built
- Single self-contained `index.html` (~47KB, inline CSS+JS, system fonts only) replicating affectUI “Agent / Orchestration” (App screens, Pro).
- Layout: header (`Market research` + `3 running` + `17 agents` + run controls + theme toggle), totals strip (agents done, elapsed, tokens, cost, trace events), left canvas run tree (3 column groups: Orchestrate / Research·Analysis / Verify·Review, with reserved `.col-heads` space) + right sidebar (agent details with Overview/Tasks/Context, Tokens & cost) + bottom run panel (Trace / Tokens & cost / Events tabs).
- 17 agents verbatim from `demo-original.js`: Orchestrator, Researcher, Web search, Page reader, Competitor scan, Pricing scraper, Data analyst, Filings reader, Market sizing, Chart builder, Writer (waiting with approval ask), Outline, Section drafter (queued), Fact-checker, Claim check (failed HTTP 429), Claim check · retry, Reviewer (queued). 10 tools verbatim (Web search, Browser, Filings API, SQL, Python, Charts, Docs, Citations, Handoff, Slack). 23 events verbatim (e1 `Run started from the brief “Q4 market report”` … e23 `Filings API · claims 55–58 confirmed`), times 0–114000ms.
- Required details: context as token counts (`38.4K / 128K`, limit 128000) with thin 3px bar + right-aligned label; deterministic 3×3 pixel-mark per agent id (EXACTLY 9 `<i>` cells, hashed hue, working cards twinkle); tools as small circular icons (glyph + title, not pills); queued/failed/done/running/waiting chips with verbatim labels (Queued/Running/Needs you/Done/Failed/Stopped); dimmed chain highlight opacity .78; single-line ellipsis titles/model/task; column headings reserved; bottom padding kept; click/Enter/Space opens details, arrows move focus, pointerdown-capture select so clicks survive; hover/focus only toggle classes, never re-render; responsive stack under 920px.
- Clean-room: all HTML/CSS/JS written from observed behaviour; formatting helpers (V/H/ke/Ae), live accrual `Me`, and event loop reimplemented, not copied.

## Demo data / behaviour matched
- Names, roles, tasks, models, tools, statuses, times, tokens, costs, asks, errors, retryOf, events verbatim (incl. `€11.8B in 2025`, `Median €3,290`, `D2C 41%, dealers 59%`, `9 × 6 table`, `HTTP 429 – rate limited after 41 of 58 claims`, `Quote two paywalled analyst reports…`).
- Timings: `BASE_ELAPSED=94000`, `setInterval(tick,1000)` (original 1s), elapsed `Ae` mm:ss, running agents accrue via rate (`orch 90/.0011`, `checker 60/.0004`, `retry 140/.0002`); events appear when `at<=E`; full loop 94s→139s covers all 23 events; Pause/Resume (`Pause run`/`Resume`), `Run again` reset, Writer Approve→running / Reject→stopped.
- Default theme dark (original demo canvas appearance); toggle overrides with stored key `affectui-agent-orchestration-theme`, falls back to `prefers-color-scheme: light` check.

## v3/v4/v5 compliance
- Tokens for every colour; waiting amber separate in dark (`#fbbf24` on `#451a03`, text `#fde68a`); focus-visible outline; transitions 140–200ms.
- `/*noflash*/` guard first in `<head>`, stored-key + prefers-color-scheme, inline `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}`, `meta color-scheme`.
- IN-PLACE ONLY: DOM built once at init; tick updates textContent/styles/classes/attributes on existing nodes; no `innerHTML` anywhere (static check); node identity + zero writes asserted.
- v5: all 7 `:hover` inside `@media (hover:hover) and (pointer:fine)`; `tap-highlight:transparent`; `tabular-nums` on body; concentric radii (outer 16 = inner 10 + 6 inset, documented); shadows for elevation, borders for structure/dividers/selected; `img` 1px inset outline both themes; optical nudge (`.btn .ic{margin-right:-2px}`, `.tri` nudge); `[hidden]{display:none}` explicit; no SVG class assignment (icons are text glyphs, pixel cells via `setAttribute`).

## Verification (node only, in-dir files)
- `node --check ./.__check.js` (extracted page script): PASS.
- `node ./harness.cjs` (in-dir DOM stub): HARNESS PASS — 60+ asserts including: noflash first, tokens, hover-media 7/0, no `.innerHTML`, `[hidden]`, pointerdown capture, verbatim project/run/workspace, 17 agent names + 23rd-event texts + `$` + `/ 128K` + `Needs you` as painted `textContent`, 17 nodes, 9-cell marks, tick 94000→139000, identity + slot reuse + 0 writes after init, all 23 events shown, dark default → light → dark with text preserved, pause/resume, select reviewer/writer + approval ask visible.
- Light AND dark checked in harness (toggle both ways, painted text asserted in each).

## What could not be verified
- Pixel-perfect match to the original screenshot / live Pro motion (no browser; stub only). Canvas pan/zoom simplified to grouped columns (original uses absolute x/y tree + pan/zoom physics); trace bars simplified to proportional agent spans rather than per-LLM/tool sub-rows.
- Sub-agent “no model line” note: verbatim data gives sub-agents models, so model line retained (dashed smaller style) to stay verbatim.

## How to test
- `node ./harness.cjs` then `node --check ./.__check.js` in this directory. Open `index.html` in a browser: toggle theme (top-right), hover/focus cards for chain highlight, click/Enter to inspect, Approve/Reject the Writer ask, Pause/Resume and Run again, switch Trace/Tokens & cost/Events and Overview/Tasks/Context, resize narrow. Confirm light and dark both look finished.
