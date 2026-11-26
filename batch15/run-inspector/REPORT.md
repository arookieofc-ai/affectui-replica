# Run Inspector — replica report

## What was built
`index.html` (35 KB, self-contained, no network, system fonts only): a clean-room
replica of the affectUI **Run Inspector** component — one agent run with a live tree,
per-agent call bars, clickable errors, and run totals.

- Header follows the original pattern: project title **“Launch the new pricing page
  by Friday”** + live working count + agent count + run status pill, theme toggle
  top-right.
- Run-totals card: **Duration / Cost / Tokens / Model calls / Tool calls / Errors**
  (facts recompute live for the selected agent subtree, exactly like the original).
- Run tree: Orchestrator → Researcher / Writer / Coder (+ their tool & LLM calls as
  timeline bars), plus a Supervisor section (Inspector watching budget/secrets/diffs).
- Agent identity is a deterministic **3×3 pixel-mark (exactly 9 cells)** per agent id;
  working agents twinkle/pulse. Tools are small circular glyph icons.
- Clicking a call row expands its detail (model/tool line, Done/Running/Failed state,
  output or error, Called-with/Prompt args). Failed rows render in red; the Errors
  fact is a button that jumps to the failing `tests` call. “+N more / Show less”
  collapsing mirrors the original (`+3 more` on Coder’s 7 calls).

## Matched data / behaviour / timings (verbatim from `demo-original.js`)
- All names, models, tools, inputs, outputs, errors and numbers copied verbatim
  (e.g. `linear.app pricing per seat 2026`, plan counts 8412/1906/311,
  `pricing/page.tsx, PlanCard.tsx, 3 more files – 412 lines`,
  `2 of 14 checkout tests fail – coupon codes aren't applied to seat prices`,
  `github.com/acme/web/pull/482`).
- Same formatters (cost `$0.49` total / `$0.004` inspector, compact `100k` / `4.5k`,
  duration `1m 22s`), same end totals: 5 model + 14 tool calls, 1 error (run scope).
- Same loop: 60 ms tick, 17.6 s loop, run completes at 13.6 s, **auto-focus on Coder
  + failing `tests` call during 8.6–12.6 s**, user clicks latch the selection.
  Loop restarts update everything in place (no remount).

## Hard-won rules applied
- DOM built once at init; the timer only mutates text/attributes/styles of existing
  nodes (cached writes skipped). Zero `innerHTML` use anywhere in the page script.
- Rows toggle on `pointerdown` capture (with click fallback + Escape handling, so
  real clicks survive); hover/focus only change CSS, never re-render.
- Explicit `[hidden]{display:none}` rule; no SVG (zero `className`-on-SVG risk —
  all classes via `setAttribute`); `/*noflash*/` guard + `html{background…}` +
  `meta color-scheme` first in `<head>`; default theme = original (light), toggle
  persists to `localStorage`.
- No browser was installed/launched; verified with node only.

## Verification (all in this directory)
- `node --check` on the extracted page script: **OK**.
- `node harness.js` (stub-DOM harness, no external files): **ALL CHECKS PASSED**
  (~110 assertions): full 0→18 s loop driven frame-by-frame; visible (non-aria)
  text asserted at t=2 s, t=9 s (auto-focus, error visible, Errors=1) and end of
  run (`1m 22s`, `$0.49`, `100k`, all agent/call names); 10 call details opened by
  click showing verbatim outputs; supervisor scoping (`$0.004`, `4.5k`, 1 model /
  3 tool calls); fact/card/row/pixel node identity held across the wrap; zero
  `innerHTML` writes; 5 pixel-marks × exactly 9 cells; **light AND dark** themes
  checked (toggle → dark keeps text visible + persists, toggle back → light).

## How to test
Open `index.html` in a browser (no server needed). Watch the run play, wait for the
8.6–12.6 s window (Coder auto-selected, failing tests open), click rows/Errors, and
flip the ☾/☀ toggle. Re-run checks any time with `node harness.js`.

## Notes / deviations
- The embedded supervisor tree (`component-3L8vap8_`) is not readable from this
  directory, so its card chrome is approximated with the same tokens and the
  required header/pixel-mark/tool-icon patterns rather than pixel-copied.
- Noflash default is `light` (the original demo’s appearance) rather than
  `prefers-color-scheme`, per the prompt’s “default theme = the original demo’s
  appearance” (spec v3 over v2).
