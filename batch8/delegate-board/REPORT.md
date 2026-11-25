# delegate-board — replica report

## What was built
`index.html` (38.8 KB, single file, no network, system fonts only) replicating the
affectUI Pro **delegate-board** component: a board of delegated tasks across agents with
owners, status and handoffs. Open it in a browser, or serve the directory with any static
server. Original code was read only to extract behaviour — all markup/CSS/JS is written
from scratch.

Layout mirrors the original: header bar (spark icon + `Delegate` title + live hint +
Auto switch), then a card with a two-column body — left `Unassigned N` pile, right
`Agents … in queues` roster. Each agent row shows identity mark, name + key number
(visible on focus-within), model + $/min rate, status tag (`Free` / `Busy until …` /
preview `+Nm until …` + price), and a chip queue (first 3, spinner on the running task,
`+N` overflow with hover/focus tooltip listing up to 8 more). Narrow widths stack to a
single column (container + media query); `prefers-reduced-motion` disables animation.

## Original demo data used (exact, from demo-original.js)
- Agents: **Researcher** (Opus 5.5, current 6, $0.08/min), **Writer** (Sonnet 5.5,
  $0.03/min), **Coder** (GPT-6 Sol, current 14, $0.06/min), **Ops** (Gemini 3.8 Flash,
  $0.01/min).
- Tasks: Competitor scan 10m (research), Refactor auth 20m (coder), Upgrade Stripe
  SDK 8m (coder), Write release notes 12m, Fix flaky checkout test 20m, Summarize churn
  calls 15m, Update pricing page 10m, Clean up CRM duplicates 18m (last five start
  unassigned). Tool badges map to the original tools: Notion, GitHub, Stripe, Slack,
  Figma, HubSpot (rendered as small circular glyph badges).
- Timings: suggestions at **1200/3200/5200 ms** (notes→writer, flaky→coder, sdk→ops),
  each resolving **1100 ms** later; **auto mode at 7200 ms** (900 ms per handoff to the
  earliest-free agent); **loop restart at 13500 ms**; any trusted user input cancels the
  loop. Same money (`<$0.01`, `$x.xx`), duration (`N min` / `Hh MMm` / `Dd Hh`) and
  busy-until (today `HH:MM`, <7d `Wed HH:MM`, else `Mon DD`) formatting rules.
- No data invented. One deliberate presentation change per v3 spec: agent identity is a
  deterministic **3x3 pixel-mark per agent id** (FNV-1a hash → pattern + hue, exactly 9
  `<i>` cells per agent, 36 total; working agents twinkle) instead of the original
  vendor-logo/initial avatars, and tool icons are circular glyph badges.

## Interactions
Drag tasks/chips onto agents or the pile (pointer capture, 4 px threshold, persistent
ghost node, target highlight); tap a task opens a details dialog (owner, estimate,
queue cost, busy-until, per-agent handover buttons); keyboard: Enter/Space picks up,
arrows choose agent, Enter/Space hands over, Esc cancels, keys 1–4 hand over directly;
Auto switch; sun/moon theme toggle (top-right, `data-theme` on `<html>`, defaults to
`prefers-color-scheme`, persisted); screen-reader hints + polite live announcements.

## Engineering constraints (from the brief)
- **No rebuild in any fast loop**: `render()` runs only on state change
  (assign / suggestion / mode / target-change / theme / minute rollover). Pointermove
  only moves the persistent ghost via `style.left/top`; re-render happens only when the
  drop target *changes*. No interval faster than 30 s (clock only, and it skips render
  unless the minute changed).
- **Dialog can't be lost across a rebuild**: all pointer/keyboard listeners are
  delegated on the static `#board` container in the **capture phase**; nothing is
  rebuilt between pointerdown and pointerup, and the tap-to-open dialog fires from that
  press pairing, so a real mouse click is never dropped.
- **Pixel-mark cell count**: markup contains exactly 9 `<i>` cells per agent
  (asserted by the harness).

## Verification (real run, not just syntax)
- `node --check` on the extracted page script: passes.
- `harness.js` (kept in this directory): loads the page script in Node `vm` with a
  DOM stub, then drives **real listeners and timers** — 61/61 pass: all 8 tasks + 4
  agents render, 9-cells-per-mark verified, sub-threshold moves render nothing, drag
  activation renders once, 20 further moves render nothing, ghost follows, tap opens /
  closes dialog, `1` key assigns crm→research, the full 1200→2300→3200→4300→5200→6300→
  7200 chain assigns notes/flaky/sdk and flips to auto which hands out another task,
  clock ticks don't re-render, theme toggle flips `data-theme`, trusted input clears
  pending timers. Run with `node harness.js`.

## Token audit
Every colour goes through the CSS custom properties (no ad-hoc hex): light
surface `#ffffff`, page `#fafaf9`, ink `#171717`, muted `#78716c`, subtle `#f5f5f4`,
border `#e7e5e4`, radii 16/10/6 px, pill tags 999 px, soft shadow, 150–200 ms
transitions; dark surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`,
subtle `#26262a`, border `#2e2e33`. Status colours: Free = green pair, Busy = neutral,
preview price = brand blue, suggestion target = amber pair (`#f59e0b`/`#fef3c7`/
`#92400e` light; `#fbbf24`/`#451a03`/`#fde68a` dark).

## Contrast results (computed relative-luminance ratios)
Light — ink/surface 17.9, muted/surface 4.8, brand/surface 4.5, ok/ok-bg 5.3,
amber/amber-bg 6.4 (all ≥ 4.5 AA). Marginal: 12 px section labels muted on the subtle
lane ≈ 4.4:1 (spec-pinned tokens; label carries a count badge and stays legible).
Dark — ink/surface 14.5, muted/surface 6.6, muted/tray 7.2, brand/surface 8.1,
ok/ok-bg ≈ 10.3, amber/amber-bg 12.0 (all AA). Busy tag was moved to surface bg +
border so it passes in both themes. Verified finished-looking in both themes.

## What could not be verified
Pixel-perfect match to the original site (no screenshots compared); vendor logo SVGs
replaced by token-coloured glyph badges + pixel-marks per v3; FLIP flight animation
for moved chips approximated with an enter transition (480 ms path not replicated
1:1); drag uses coordinate hit-testing rather than `elementFromPoint` visuals, which is
equivalent in a real browser.
