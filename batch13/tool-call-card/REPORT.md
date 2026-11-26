# Tool Call Card — replica report

## What was built
`index.html` (self-contained: inline CSS + JS, system fonts only, no network)
replicating the affectUI **Tool Call Card** demo as clean-room code.

- **Page chrome (v3 header pattern):** project name “CRM pricing research” +
  live working count pill (`N working` amber / `Idle` grey) + tool count,
  theme toggle (sun/moon, top-right), token-count context row with
  right-aligned `44k / 200k` label and a thin 3px bar.
- **Chat + tool group:** user bubble with the original message; group head with
  stacked last-3 tool icons, `Using tools…` (shine sweep) while running,
  `Used N tools` + `· N failed` + `· time` when done; collapsible.
- **Cards:** 26px icon tile, mono tool name (ellipsis, max 55%), summary
  (ellipsis), status spinner / draw-on check / error glyph + live time or
  `Failed`, chevron; expandable Arguments/Result sections with syntax
  highlighting (keys/strings/numbers/literals), Copy buttons with “Copied”
  feedback, capped code blocks (`Show all`/`Show less`), red error box with
  **Retry**. Full loop auto-plays and repeats every 11.5 s (nominal; paused on
  error — see below).
- **Themes:** all colours are CSS custom properties; default `light` (the
  original demo’s appearance); toggle flips `data-theme` on `<html>`
  (persisted to localStorage when available). Dark theme uses the spec tokens.
- No agent identities exist in this component’s demo, so no pixel-marks were
  applicable (nothing invented).

## Original ground truth checked first (demo-original.js)
- Steps: `b=[0,1500,2700,4300,5400,6700,8000]`, restart `x=11500`. Error window
  is **2700→4300 = 1600 ms** (`o===2 ? 'error' : o>=4 ? 'success' : 'running'`,
  retry `s(e=>Math.max(e,3))`). So the QA complaint “error lasts only seconds”
  is **confirmed, not a false positive** — 1.6 s is too short for a real mouse.
- Group collapse at 8000 ms for 3.5 s (8000→11500), then generation `e+1`
  remounts (jsx key `e`), which **resets all clocks**. Group hook `p(running,
  earliestStartedAt, true)` accumulates running time *within* one generation
  only (~5.1 s/loop), never past one loop. So QA’s “timer past 2 min” and
  “cards vanish 7–40 s” are also **confirmed defects** — the original never
  accumulates past ~5 s and never hides cards longer than 3.5 s.
- No QA false positive this round; all three symptoms trace to replica bugs
  (see root causes). Previous “QA wrong twice” caution was honoured by checking
  the above before changing anything.

## Root causes + fixes (index.html only)
1. **Error unclickable:** replica auto-advanced step 2→3 after exactly 1600 ms
   (faithful to the original, but unusable) and Retry only set
   `step=max(step,3)` without rescheduling, so a hold was impossible.
   Fix: `holdOnError()` clears pending auto-advance timers on entering step 2
   and holds the error state up to `ERROR_HOLD_MS=10000` (fallback
   auto-recovers for unattended loops); `resumeFromError()` (Retry click or
   fallback) sets step 3 and replays the original post-error gaps
   (1100/2400/3700/7200 ms → fetch success / deals success / collapse /
   restart), preserving the 11.5 s choreography. Retry now provably runs the
   recovery (error hidden, `Failed` hidden, card auto-closes, fetch running).
2. **Loop / vanish / timer:** replica kept `group.clock.base` across restarts
   (no remount), so elapsed accumulated loop-over-loop → past 2 min, and any
   stall left the group collapsed (header-only) indefinitely.
   Fix: `restartLoop()` resets `group.clock.base/start` (fresh loop like the
   original remount), repeats unconditionally every 11500 ms nominal, collapses
   only 3.5 s, and the error fallback guarantees the loop never stalls. Long
   runs now show max hidden gap 3.5 s and max timer ~5.1 s.
- Hard-won rules kept: 100 ms tick rewrites only time text nodes (no DOM
  rebuilds — harness asserts no appendChild/removeChild/innerHTML in tick);
  no popovers/dialogs (N/A); hover/focus pure CSS; explicit
  `[hidden]{display:none}`; SVG classes via `setAttribute` (`className`
  appears 0 times); no browser launched — verification is node-only, files
  INSIDE this directory.

## Verification (node only)
- `vm.Script` parse of the extracted main script (equivalent of
  `node --check`): passes.
- `node harness.js` (in-dir DOM stub + virtual clock, tiny CSS engine that
  honours `display:none` / `visibility` / `color:transparent` / `font-size:0`
  / collapsed-body `opacity:0` / sr-only, asserts VISIBLE painted text via
  `isVisible` in light AND dark): **86 passed, 0 failed**. Covers initial
  state, copy feedback + revert, Show all/less, success at 1500, error at 2700,
  **hold at 4300 (still error/Retry/Failed — the specific fix)**,
  Retry recovery (running, auto-close), fetch result at 5400, deals at 6700,
  collapse at 8000 (cards hidden, header + user message visible), restart at
  11500 with **timer reset <11.5 s**, error recurrence loop 2, **fallback
  auto-recovery without click**, **90 s long-run (max hidden gap 3.5 s,
  max timer 5.1 s)**, dark theme painted-text checks + toggle-does-not-advance-
  timers, `[hidden]`/reduced-motion guards, no-className and tick-no-rebuild
  guards.
- Could not verify: real pixel rendering / animation smoothness (no browser
  here by rule); `scrollHeight`-based capping falls back to a line-estimate in
  the stub but uses real measurement in browsers.

## How to test
Open `index.html` in a browser. Cards run the loop; the fetch error now holds
(~10 s) so you can click Retry; the loop restarts every ~11.5 s with the timer
resetting each loop; toggle sun/moon for dark mode (state is preserved).
Narrow the window below ~440 px for the stacked layout.
