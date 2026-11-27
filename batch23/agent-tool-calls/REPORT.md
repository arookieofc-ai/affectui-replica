# REPORT — agent-tool-calls replica

## What was built
- `index.html` (53 KB, self-contained, no external deps): org-chart replica of the
  affectUI "Agent / Tool Calls" App screen for **Ops agent** (`ops-agent`,
  "Watches failed payments, finds out why and keeps #ops posted", model Sonnet 5.5).
- Header follows the original pattern: project name + Live/Paused badge + range,
  working/tools/calls counts, Connect tool, Pause agent/Resume, theme toggle.
- Org chart: agent card on top (deterministic 3×3 pixel-mark, twinkles while working),
  7 tool cards below (Web, Files, Notion, Stripe, Linear, Slack, Gmail) plus a
  "Connect a tool" ghost. Tool cards show source, status chip
  (Calling / Needs you / Failed / Ready / Paused), mode, fn, call count + avg time.
- History table (Time / Tool / Input / Status / Duration / Tokens / Run) with
  Tool calls / Failed tabs, per-tool filter chip, fold control.
- Side panel with three modes: agent details (numbers today, tools list),
  tool details (Needs-you queue, Agent-access radiogroup Allowed/Ask first/Paused,
  History last-5, Disconnect with confirm), call details (duration/tokens/started/run,
  input JSON, output, Approve/Reject, Retry).
- Live simulation: 1 s tick updates durations in place; running calls complete from
  verbatim completion data; a new planned call arrives every 5 s cycling the 8
  verbatim `LIVE_PLAN` entries (allestoerungen check, 15-min export, reply template,
  rate-limited Stripe retry, LIN-483, #ops update, Commerzbank query). Pause stops
  the clock. Connect dialog adds GitHub / HubSpot / Google Drive from the catalog.
- Themes: CSS custom properties, `data-theme` on `<html>`, no-flash guard +
  `color-scheme` meta, default from stored key else `prefers-color-scheme`.
  Light tokens and dark tokens per spec (amber waiting adjusted for dark).
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`,
  tap-highlight transparent, `tabular-nums` on body, concentric radii
  (16 px card / 10 px well), shadows for elevation + 1 px borders for structure,
  focus-visible outlines, single-line ellipsis titles, dimmed opacity 0.78 (≥ 0.75).

## Demo data (verbatim, no invention)
- Agent, 7 tools + 3 catalog entries, 20 calls (c20…c01), 2 live completions and
  the 8-item live plan taken straight from `demo-original.js` (ids, inputs, outputs,
  errors, tokens, ms, run ids `run_8f3a2c / run_7d10e4 / run_6b92a1`).

## What matches the original
- Content, labels, status/mode vocabularies, token formatting (1.2K/11.4K),
  duration formatting (ms/s/m), relative times, and the org-chart + table + panel
  information architecture.
- Clean-room implementation: own HTML/CSS/JS, no copied bundle code, no
  `innerHTML` anywhere (0 occurrences).

## What could not be verified
- Pixel-perfect layout vs the original screenshot (no screenshot in this workdir;
  built from the compiled demo's behaviour + spec).
- Canvas pan/zoom variant and minimap from the original were reduced to a static
  org layout with the same information; drag/zoom physics were intentionally left
  out to keep in-place-update guarantees testable without a browser.
- Real clipboard copy in the call panel uses `navigator.clipboard` guarded with
  try/catch and was not exercised in the stub.

## How to test
- `open index.html` in a browser (or serve the directory and visit it).
- Click tool cards / table rows to open panels; Approve/Reject the waiting Slack
  call; Retry a failed call; Pause/Resume; Connect GitHub; switch Failed tab;
  toggle sun/moon and reload to confirm the theme persists without a white flash.
- Node verification only (no browser installed/launched):
  `node --check harness.js && node harness.js`
  plus `node --check` on the extracted app script (done via harness syntax check).

## Targeted fix (2026-11-27 QA — org chart squeezed cards + Gmail stray s)

Defects from real-browser QA:
- 7 tool cards squeezed to narrow strips (`W…`, `Fi…`, `N…`, `St…`, `Li…`, `S…`, `G…`, descs truncated) in light AND dark.
- Dark Gmail card showed `Paused s No calls` (stray isolated `s`).
- Failed filter works (exactly 4 rows after live loop) — must keep working.

Root causes (checked against `./demo-original.js` first):
- Layout crush: `.toolgrid` used `repeat(4,minmax(0,1fr))` on desktop. In the ~650px left column (1060px page minus 360px panel) each card was ~150px wide. Card head holds mark (26px) + name (flex) + full-label status chip (`Calling`/`Needs you`/`Paused` ~60-70px); well holds mode (`Paused`/`Allowed`) + fn (`send_email`) + count (`No calls`). At 150px the flex children crush name to 1-2 chars and `fn` to `s`, exactly the reported `W…`/`Fi…`/… and `Paused s No calls`. Original uses 240px-wide cards (`I=240` in `demo-original.js`) and icon-only chips in tile mode, so names/descs fit — original does NOT squeeze, so this is a replica bug, not original behaviour.
- Stray `s`: not a separate datum — it is the truncated `fn="send_email"` (Gmail, verbatim from demo data) collapsed to its first letter by the crushed well. No literal stray `s` in data/markup; `TOOLS` Gmail entry (`fn:"send_email"`, `mode:"off"`, 0 calls → `No calls`) is verbatim and kept. Widening the cards restores full `send_email`, removing the isolated `s`.

Fixes (targeted, everything else identical):
- `index.html` CSS only: `.toolgrid` desktop `repeat(4,…)` → `repeat(2,minmax(0,1fr))`. Cards go ~150px → ~300px, matching/exceeding original 240px width. Names (`Web`/`Files`/`Notion`/`Stripe`/`Linear`/`Slack`/`Gmail`) and full descriptions now fit; head chip + well `mode`/`fn`/`count` no longer crush `fn` to `s`. Tablet (`≤860px`) already 2 cols, mobile (`≤520px`) 1 col — unchanged. No JS/data changes, demo data verbatim preserved.
- Kept: `/*noflash*/` guard + `color-scheme` meta + bg style, in-place updates only (DOM built once, ticks update `textContent`/attrs/styles), zero `innerHTML` writes after init (0 occurrences in file), Failed filter logic untouched.

## Verification performed
- `node --check harness.js` — pass.
- `node --check` on extracted inline app script — pass (via harness `new Function(appJs)` syntax check).
- `harness.js` (in-dir DOM stub) — **PASS**:
  - static layout regression: `.toolgrid` desktop is `repeat(2,…)` and no longer `repeat(4,…)` (crushed);
  - light + dark VISIBLE text: 18 base strings + 7 full names + 7 full verbatim descriptions + Gmail `Paused`/`send_email`/`No calls` with no `/Paused\s+s\s+No calls/` isolated-s, in both themes;
  - Failed filter exactly 4 rows after full 60-tick live loop (3 verbatim `c15/c10/c03` + 1 live 429) kept working; Failed tab still lists known failed `pi_3QK8xL2eZvKYl`/`pi_3QJx0a2eZvKYlo2C9`;
  - full-loop node identity (web/stripe cards, chips, c18 history row stable
    across 60 ticks covering a full 8-plan live loop);
  - zero `innerHTML` writes after init (counter = 0, and 0 occurrences in file).
- Confirmed dark mode renders the same content (same assertions under
  `data-theme="dark"`), and light mode under `data-theme="light"`.
