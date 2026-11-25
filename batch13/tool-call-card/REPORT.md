# Tool Call Card — replica report

## What was built
`index.html` (44.9 KB, self-contained: inline CSS + JS, system fonts only, no
network) replicating the affectUI **Tool Call Card** demo as clean-room code.

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
  **Retry**. Full loop auto-plays and repeats every 11.5 s.
- **Themes:** all colours are CSS custom properties; default `light` (the
  original demo’s appearance); toggle flips `data-theme` on `<html>`
  (persisted to localStorage when available). Dark theme uses the spec tokens.
- No agent identities exist in this component’s demo, so no pixel-marks were
  applicable (nothing invented).

## Original data / behaviour matched (verbatim from demo-original.js)
- Names, summaries, args, results, error string
  (`Request timed out after 8s – hubspot.com didn’t respond.`), time-format
  function (`1.5s`, `0m 06s`, `ms` under 1 s, …), cap 220 / threshold +24 /
  expanded max 640, copy revert 1400 ms.
- Timings: steps at 1500/2700/4300/5400/6700/8000 ms, group auto-collapse at
  8000 ms (unless the user toggled it), loop restart at 11500 ms; error card
  auto-opens on failure and auto-closes on retry/success; retry jumps to the
  running phase; per-card clocks reset each running phase while the group
  clock accumulates (as in the original hook).
- Hard-won rules honoured: 100 ms tick rewrites only time text nodes (no DOM
  rebuilds); no popovers/dialogs; hover/focus are pure CSS; explicit
  `[hidden]{display:none}`; SVG classes set via `setAttribute` (`className`
  appears 0 times); no browser launched — verification is node-only.

## Verification (node only)
- `node --check` on the extracted inline script: passes.
- `node harness.js` (in-dir DOM stub + virtual clock, tiny CSS engine that
  honours `display:none` / `visibility` / `color:transparent` / `font-size:0`
  / collapsed-body `opacity:0` / sr-only): **71 passed, 0 failed**. It walks
  the whole loop — initial running state, copy feedback, Show all/less,
  success at 1500, error + auto-open + `Failed` at 2700, Retry recovery,
  fetch result at 5400, deals result at 6700, group collapse at 8000, restart
  at 11500, error recurrence in loop 2 — and checks light default, dark
  toggle (content stays visible), and back to light.
- Could not verify: real pixel rendering / animation smoothness (headless
  Chrome cannot run here); `scrollHeight`-based capping falls back to a
  line-estimate in the stub but uses real measurement in browsers.

## How to test
Open `index.html` in a browser. Cards run the loop; click any card header to
expand arguments/results; click Retry on the failed card; toggle sun/moon for
dark mode. Narrow the window below ~440 px for the stacked layout.
