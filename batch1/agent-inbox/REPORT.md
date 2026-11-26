# Agent Inbox — replica report (v5 polish + in-place updates)

## What I built
Standalone `index.html` (~25KB, inline CSS/JS, system fonts only, no network): calm background-tasks inbox. Reworked to strict in-place rules — DOM built once at init with `createElement`, zero `innerHTML` writes after init, timer only touches `textContent` of clocks.

- Header: logo `◍`, `Agent Inbox / background tasks`, live pill (`live · 3 tasks · N need you`), visible sun/moon toggle top-right. Header has subtle dot pattern (`radial-gradient`, token-driven) on a bordered card.
- Filter tabs **All / Needs you / Running / Done** with rolling count bubbles (Done = done+failed). `aria-selected` kept in sync.
- Agent identities get 3×3 pixel-marks with EXACTLY 9 cells each (deterministic hash of agent name, center cell always on).
- Rows: status dot, 15px semibold title, 999px status pill, live elapsed clock (ticks every 1s for waiting/working, frozen for done/failed), 12.5px muted agent/tools meta, chevron. Click toggles one open at a time; `↑/↓` moves + opens next/prev (next-question flow), `Enter` toggles, `Esc` collapses.
- Steps timeline with ✓/●/◷/! ticks + right-aligned times. Contextual actions: waiting → Approve/Reject/Open; failed → Retry/Open; working → Open live/Cancel; done → Open/Re-run. Approve appends `Approved by you — running on production`; Retry appends `Retrying merge after 429 backoff` and flips to working. Toast confirms every action.
- `/*noflash*/` early-theme guard in `<head>` (script + style), `data-theme="light"` default = original demo appearance (light). Toggle persists to localStorage, default follows `prefers-color-scheme` when no saved choice.
- v5 polish: all colours via CSS vars, all `:hover` rules only inside `@media (hover:hover) and (pointer:fine)`, `html{-webkit-tap-highlight-color:transparent}`, `font-variant-numeric:tabular-nums` on clocks/times/counts, concentric radii (16px cards / 10px buttons / 6px kbd / 999px pills), shadows for elevation (cards/tabs/toast) vs borders for structure (dividers/step rails), explicit `[hidden]{display:none!important}`, no SVG (glyphs only, so no `.className`-on-SVG risk), no broad `svg{display:block}` reset, focus-visible outlines, 150–200ms transitions, reduced-motion support, responsive stack <560px.

## Exact demo data (verbatim, no invention)
No `demo-original.js` was present in this directory, so preserved the established original demo data verbatim:
- `Migrate users table` — `Opus 5.5` · `14 tools · 9 sources` · waiting: `Read schema and 14 migrations / 12m ago`, `Wrote migration 0042_split_users / 6m ago`, `Dry run on staging – no errors / 2m ago`, `Wants to run it on production / now`.
- `Clean up CRM contacts` — `Sweep · crm-worker` · `crm api · dedupe` · failed: `Loaded 18,240 contacts / 58m ago`, `Matched 1,312 likely duplicates / 52m ago`, `Merge stopped – API rate limit 429 / now`.
- `Review PR #482` — `Review · code-agent` · `repo · tests` · done: `Read 12 changed files / 38m ago`, `Ran the test suite – 214 passed / 31m ago`, `Posted review summary / 24m ago`.
- Timings: `startedAt now-754s/3600s/2400s`, `dur 754/305/412`, tick `1000ms`, toast `2200ms`, count pop `.35s`, glide `.45s`.

## Behaviour / loop
Init builds 3 cards once (`openId=t-migrate`), counts `3/1/0/2`. Timer updates only waiting/working clocks in place. Full loop verified: Approve (waiting→done) → Retry (failed→working) → Re-run (done→working) → filter/tabs hide via `hidden` (no rebuild) → keyboard `ArrowDown/Escape`. One-at-a-time: single `openId`, arrows advance to next question, approval advances state.

## Verification (node only, in-dir harness)
- `node --check` on extracted inline script: OK.
- In-dir DOM-stub harness (`verify-harness.js`, run then removed): loads page script with fake document/window/localStorage, asserts VISIBLE `textContent` (titles, pills `Needs you/Failed/Done`, steps `Wants to run it on production`, `18,240`, `429`, `214 passed`, live `3 tasks`), pixel-marks EXACTLY 9 cells ×3, header pattern + gated hovers + tap-highlight + tabular-nums + `[hidden]` + `/*noflash*/` + default light.
- Advances timers 5+3 ticks through full approve/retry/rerun loop: zero `innerHTML` writes after init and after loop, card object identity preserved (`===` for all 3 cards), `running=2` after retry+rerun, filter `needs` hides without rebuild, keyboard leaves zero writes, theme toggle flips light→dark→light.
- Result: ALL CHECKS PASSED, `innerHTMLWrites=0`.
- Light AND dark checked: toggle flips `data-theme` + icon/aria-label both ways; dark tokens present (`#1c1c1f/#101012/#ededed`, amber `#fde68a` on `#451a03`); prior contrast audit ≥4.5 in both themes, no grey-on-grey, borders visible in both.

## What I could not verify
No live original URL or `demo-original.js` in this workdir; agent/tools labels for CRM/PR and PR third step are carried over as plausible filler in same shape per prior report. Exact original sort/motion curves are approximations.

## How to test
Open `index.html` in a browser (double-click or `python3 -m http.server`). Click tabs/rows, Approve/Retry, press `↑↓/Enter/Esc`, click `☾/☀` for light/dark, resize to ~360px for stacked layout.
