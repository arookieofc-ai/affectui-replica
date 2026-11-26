# agent-run replica — REPORT

## What was built
Single self-contained `index.html` (37.6 KB, no external deps, system fonts only) replicating affectUI **AI Chat / Run — slug `agent-run` (App screens)**.

Layout:
- Left app nav (Home / Chat / Runs [3] / Analytics / Deliverables + Agents: Board prep active, Revenue ops, Inbox triage, Workflows).
- Center run column: crumbs `Runs / Prepare the Q3 board update` + phase pill (Running / Needs input / Done / Stopped), time label, Stop run / Run again, theme toggle, options; hero (avatar Board prep · started by Alex Morgan, title, 4px progress bar, Uses logos stripe/drive/docs/gmail/calendar, figures Steps / Tool calls / Time / Cost $0.14); Plan block (5 steps); Activity feed (per-step entries + expandable tool calls + loader).
- Right `Run details` panel: Needs your input (approval card), Draft (Board memo – Q3 · Revenue original vs suggested), Files (board-memo-q3.md, q3-revenue.csv, churn-chart.png + mini chart).

Behavior (autonomous loop):
- Event timeline mirrors original `Oe()` order: step → ask (450ms) → call (200ms) → end (call.duration) → finish (250ms). Steps activate in place, calls go Running → success with duration + JSON result, progress/figures/time update in place every tick.
- Step 4 `Send the draft to Maya` pauses on `Waiting for your approval`; Deny/Approve buttons work. Approve continues to step 5 → Done; Deny marks step failed and stops the run (Retry re-queues in place). Stop run / Run again also work in place.
- Tool calls expand/collapse (aria-expanded, no innerHTML), keyboard-focusable, focus-visible outline.

Demo data is verbatim from `demo-original.js`: all 5 step titles/details/tools, all 8 call summaries/args/results, approval title/description/risk/details (Maya Chen (CFO), Q3 board update – draft, Board memo – Q3 2026), draft label + original/suggested paragraphs, run title/agent/user/cost, file names.

## What matches the original
- Header pattern (Runs / title + pill + time + Stop/Run-again), progress bar colors per phase, figures row, Plan + Activity blocks, approval card (Step 4 code, Medium risk, To/Subject/Attachment, Deny/Approve), draft diff, file chips.
- Design tokens as CSS vars, light + dark values from spec, 1px borders + soft shadows, hover lift (hover-fine only), 150–200ms transitions, pills 999px, tabular-nums, tap-highlight transparent, concentric radii, inset outlines on logos/chart, reduced-motion guard.
- v4 rules: noflash guard first in `<head>` (theme key `affectui-agent-run-theme` + `html{background}` + `color-scheme` meta); DOM built once, all ticks update nodes in place; loop restart reuses nodes.

## What could not be verified
- Pixel-exact colors/spacing vs hosted screenshots (no browser in this environment; verified by code + DOM-stub harness only).
- Real clipboard share and exact wall-clock durations (durations preserved from demo data but timers are illustrative).
- Original compiled Pro `.tsx` not fetched; icons are clean-room letter marks, not copied SVG paths.

## How to test
- Open `index.html` in a browser (double-click or `python3 -m http.server` then visit). Wait ~10s: steps complete, approval appears at step 4, approve to finish. Try Deny, Stop run, Run again, expand tool calls, toggle sun/moon.
- Node only (no browser): `node --check .check-target.js && node verify.cjs` — asserts visible painted text, full-loop node identity, zero innerHTML writes after init, light AND dark toggle. Result: ALL PASS.
- Confirmed light AND dark: dark tokens present, toggle flips `data-theme` + persists, harness checks both directions; no grey-on-grey (muted #a1a1aa on #101012, borders #2e2e33).

## Verification
- `node --check`: CHECK_OK
- `node verify.cjs`: ALL PASS (size, noflash, tokens, hover-media, tabular-nums, verbatim data, no innerHTML, visible text, node identity ×2 loops + reset, deny-stop, light/dark toggle)
