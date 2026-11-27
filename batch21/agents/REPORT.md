# Agents — rebuild report

## What was built
ONE self-contained `index.html` (56,954 bytes, no network, system fonts) replicating the
affectUI **Agents** screen: team of agent cards (status, apps, model, spend) + detail panel + creator modal.

- Header follows the original pattern: project name **Fieldwork** + live counts
  (`3 working · 6 agents`) instead of a generic title/toolbar.
- Toolbar: filter tabs All agents / Working / Idle / Paused with live counts, Grid/List
  toggle, New agent button.
- Cards show deterministic 3×3 pixel-mark per agent id (coloured, twinkling when working),
  name, role (single-line ellipsis), status pill, small circular app icons + `Access to N apps`,
  model chip with model mark, `N runs · €N` stats.
- Detail panel for the selected agent: status/doing with breathing dot, model, Reports to
  (initials avatar), Last ran (relative), Runs 14-bar chart (`2 weeks ago` → `Today`,
  y labels max/mid/0), Instructions with Show all/less (>140 chars), Skills + Can use tags,
  Recent tasks (running=blue ring + `now`, done=green, failed=red + relative time).
- New-agent modal (Name, What does it do?, Model pick from 8, Color pick from 6,
  slugified id with `-2` dedup, disabled Create until valid, Escape/Cmd+Enter support,
  opens on `pointerdown` capture so real clicks survive).
- Keyboard: `j`/`k` + arrow keys move selection, focus follows.
- Timers: 2600 ms doing-rotation loop, 30 s relative-time refresh, 1400 ms toast/fresh highlight.

## Matched data / behaviour (verbatim from `demo-original.js`)
- 6 agents with exact ids/names/roles/colors/models/status/doing/runs/cost/owners/instructions/
  skills/apps/recents (Builder 38/€46.20, Reviewer 64/€21.80, Writer 27/€12.40, Ops 112/€8.60,
  Researcher 9/€31.50, Support 0/€0 paused; owners Alex Morgan / Priya Shah / Jonas Weber).
- Rotation sequences: Builder `Running the migration on staging → Checking 48,210 rows →
  Writing the summary for review`, Reviewer `Writing comments on PR #482 → Running the test
  suite → Approving PR #482`, Writer `Drafting the release highlights → Matching the brand
  voice → Sending the draft to Priya`; runs +1 on wrap; cycle order builder→reviewer→writer
  every 2600 ms (full doing cycle = 9 ticks).
- Relative times via `Intl.RelativeTimeFormat` (`just now`, minutes/hours/days); `now` for
  running recents; EUR formatters (`€46`, `€46.20`, compact for ≥10k); deterministic pixel
  pattern (symmetric 3×3, ≥5 on-bits) and 14-bar chart data (hash + LCG, `runs/7` scaled).
- Pause/resume (working→paused→idle), filter counts, grid/list, modal create
  (`You are {name}. {role}.`, idle, 0 runs) with toast `joined the team`.

## What was not / could not be verified
- No browser available — checked via `node --check` + DOM-stub harness only, not pixel
  screenshots. Brand/model/app icons are clean-room approximations (letter tiles + simple
  SVG marks), not copied paths. Outer DemoStage chrome (nav, sidebars) intentionally
  omitted; standalone page keeps the agents surface only.

## How to test
1. Open `index.html` in a browser (double-click, no server needed).
2. Watch Builder/Reviewer/Writer `doing` rotate every ~2.6 s; runs increment on wrap.
3. Click filter tabs, Grid/List toggle, cards (detail updates), Pause/Message,
   New agent (create → appears, toast, selected), Show all/less, theme toggle.
4. `node harness.cjs` re-runs the automated checks in this directory.

## Verification results
- `node --check` on the extracted app script: **OK**.
- `node harness.cjs` (in-dir stub, no packages): **ALL PASSED** —
  noflash guard, color-scheme meta, paint style, data-theme + visible toggle,
  `[hidden]{display:none}`, tap-highlight, tabular-nums, all 14 `:hover` rules inside
  `@media (hover:hover) and (pointer:fine)`, tokens, verbatim strings (55),
  2600 ms + 30 s timings, zero `innerHTML` in source, VISIBLE text (names/doing/apps/models),
  9-tick full loop restores doing + runs+1, card/row nodes keep object identity,
  zero `innerHTML` writes after init, intermediate `Checking 48,210 rows` visible in place,
  EXACTLY 9 pixel cells per agent, size <200 KB.
- Light **and** dark checked: toggle switches `data-theme="light"|"dark"` on `<html>`;
  dark uses adjusted tokens (surface `#1c1c1f`, amber `#fbbf24` on `#451a03`); harness
  asserts both directions with content still visible. Default (no stored pref,
  light `prefers-color-scheme`) is light = the original demo appearance.

## v5 polish compliance
Hover only in gated media, `html{-webkit-tap-highlight-color:transparent}`,
`body{font-variant-numeric:tabular-nums}`, concentric radii (16 px shell / 10–12 px
nested + 12–14 px padding), shadows for elevation + 1 px borders for structure,
avatar inset outline, optical icon-side padding (`0 12px 0 10px`), `[hidden]` rule,
SVG classes via `setAttribute` only (zero `.className` in output), `color-scheme` meta.
