# REPORT — Agent / Schedules (agent-schedules)

## What built
Standalone `index.html` (~42KB, inline CSS+JS, system fonts only) replicating affectUI **Agent / Schedules** — recurring agent schedules on a timeline with rhythm, next run, last outcome, cost, pause.

- Header: workspace `Fieldwork · Pro · Personal` + title `Schedules` + live count `6 / 7` (active/total), sun/moon toggle top-right.
- Section `Around now`: `Agent activity` + `N actions / 10 min` count, SVG activity line (baseline sine + running bumps, smooth curve, area fill), run markers (line + square/circle, dashed for next, red for failed), hourly ticks, head dot + glow, live chip + status line (`Running now: … · %` / `Next: … · time, rel` / `Nothing else in the next 8 hours`).
- Section `Schedules`: 7 rows sorted by next run, each with deterministic 3×3 pixel-mark (tone colour, exactly 9 cells, running pulses), single-line ellipsis name + cadence, next time + relative, last-outcome badge (`Done`/`Needs you`/`Failed`), EUR cost, pause switch (`role=switch`).
- Detail panel for selected schedule (default `scan`): tone mark, title, cadence · project, `Run now` (disabled while running) + `Pause`/`Resume` + `€X.XX per run`, `What it does` prompt with `Show all`/`Show less` clamp, `Next runs` (up to 5, `Skip`/`Restore`, `Paused` state) + `Last runs` (summary + time · cost + badge).
- Interactions: 1s tick, Pause/Resume, Run now (adds run, announces `Running now`), Skip/Restore, selection (click, ArrowUp/Down, j/k), prompt expand, theme toggle, responsive (cost/last hide <640px, stacked <440px).

## Matched data (verbatim from demo-original.js, no invention)
- 7 schedules with exact names, projects, tones, prompts, cadences, durations, costs, histories:
  - `Competitor scan` (Northwind, orange, dynamic `Every <weekday> at <time>` cadence, runs now±7d, 9s, €3.10, history: `2 makers cut prices, 1 new model` €3.42 / `Nothing changed` €2.80 / `Three shops blocked the browser` €1.20)
  - `Inbox triage` (Platform, purple, `Every 2 hours, 8:00 – 20:00`, 2min, €0.18, `Answered 6, labeled 11` / `1 refund over 50 € waits for you`)
  - `Northwind numbers` (`Every weekday at 7:45`, 4min, €0.42, `Dashboard ready 4 minutes later`)
  - `Standup notes` (`Every weekday at 16:30`, 3min, €0.26, `Posted in #platform`)
  - `Weekly update` (`Every Friday at 16:00`, €0.55, `Draft waits for your OK` needs)
  - `Nightly evals` (`Every night at 2:00`, paused, €4.80, `Scores up 1.2 on average`)
  - `Invoice reminders` (`On the 1st of every month`, €0.30, `Stripe didn’t answer – try again` failed)
- Labels verbatim: `Schedules`, `Around now`, `Running now`, `Next`, `Nothing else in the next 8 hours`, `Agent activity`, `actions / 10 min`, `Paused`, `Pause`, `Resume`, `Run now`, `Skip`, `Skipped`, `Restore`, `Next runs`, `Last runs`, `per run`, `What it does`, `Done`, `Needs you`, `Failed`, `No runs yet`, `Show all`/`Show less`.
- Behaviours: next = first future run not skipped & not paused; running = now in `[run, run+duration]`; tick loop (fast when running, slow otherwise — implemented as 1s in-place repaint, same visible effect); live `aria-live` announcements; EUR formatting (`Intl`, compact ≥1000).
- Clean-room: own code, no copied bundle source.

## Verification (node only, no browser)
- `python extract → node --check tmp-app.js` → PASS (syntax OK, no `innerHTML` in file or script).
- `node harness.js` → ALL PASS:
  - Static: `/*noflash*/` first in `<head>` before CSS, `meta color-scheme`, doctype, tokens (`--surface/--page/--ink`), `html[data-theme="dark"]`, hover media `(hover: hover) and (pointer: fine)`, tap-highlight, `tabular-nums`, `[hidden]{display:none}`, `data-theme` toggle, zero `innerHTML`, `<200KB`, `setAttribute` usage.
  - DOM-stub (in-dir only): loads page script with stub (`createElement/createElementNS`, `setInterval` mocked, `__TAU_NO_TIMER`), asserts `__app.rows.length===7`.
  - Visible painted text (stub `textContent`, not markup-only): all 7 names, `Next runs`/`Last runs`/`What it does`, `Done`/`Needs you`/`Failed`, `Paused`/`Pause`/`Run now`/`Skip`, `Agent activity`, `€`, rhythm (`Every 2 hours` etc.), verbatim prompt (`Check the nine makers…`).
  - Pixel-marks: each row mark has exactly 9 `I` cells.
  - Full loop: snapshot roots → 30× `tick()` (covers scan 6s wait + 9s run) → `applyFilter()` → identity preserved (root/mark/badge/nextP same objects, children count stable) + zero `innerHTML` writes after init.
  - In-place pause (`root` identity kept) + skip toggle without rebuild.
  - Light AND dark: dark token values present, `setTheme('dark')` → `data-theme=dark` + text still visible (>200 chars), `setTheme('light')` → back, glyph updates.
- Checked light and dark both via harness + token review (amber `#f59e0b/#fef3c7/#92400e` → dark `#fbbf24/#451a03/#fde68a`, no grey-on-grey).

## Could not verify
- Pixel-perfect layout vs live Pro screenshot (no browser per instructions, stub only). Chart smoothing, tick positions, and exact run-window alignment inferred from minified logic.
- `prefers-color-scheme` first-paint in real browser (guard present, but only stub-tested).

## How to test
Open `index.html` in a browser. Toggle theme, wait ~6s for `Competitor scan` to go running, pause/resume a row, `Run now`, `Skip`/`Restore` a next run, expand prompt, use j/k or arrows.
