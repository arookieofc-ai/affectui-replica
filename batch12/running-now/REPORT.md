# Running Now — replica report

## What was built
`index.html` (single file, ~38KB, no network, no external assets, system fonts only):
a clean-room replica of the **Running Now** component — a live header pill for
background tasks that opens a dialog with progress rings, step labels, and
pause / resume / open actions.

- Page header follows the original demo pattern: **Acme / Agents** brand +
  the pill, with a visible sun/moon **theme toggle** at the top-right
  (`data-theme="light" | "dark"` on `<html>`).
- **Default theme is light**, matching the original demo's appearance (light
  tray pill, white card). The toggle switches to the dark token set.
- All colours go through CSS custom properties (no ad-hoc hex per element):
  surface/page/ink/muted/subtle/border, radius-lg 16 / radius 10 / radius-sm 6,
  soft shadow, status colours (teal/amber/orange/blue), waiting badge
  `#92400e` on `#fef3c7` (light) and `#fde68a` on `#451a03` (dark).

## Original data / behaviour matched (verbatim from `demo-original.js`)
- Labels: `Background tasks`, `running`, `need you` / `needs you` (singular quirk
  kept: `1 needs you`, plural `2 need you`), `Needs you`, `Paused`, `paused`,
  `Done`, `Pause`, `Resume`, `Open`, `Open Tasks`, `Nothing running right now`,
  `No tasks running`.
- All 5 seed tasks verbatim (ids, titles, states, done/total, steps), e.g.
  `Ingest pipeline` → `Embedding chunks` 2/4, `Refund review` →
  `Approve a $240 refund to Acme` (needs-you), `Weekly report` →
  `Drafting the summary` 1/5, `Dependency upgrade` paused at
  `Running 212 tests` 1/4, `Lead enrichment` → `Loading 420 leads` 0/6 with
  `asks: {at: 3, step: "Which CRM field gets the score?"}`.
- Timings/loop: tick every **1900ms**, round-robin advance of one running task,
  asks transition at `done == at`, completion → `done`, **reset every 14th tick**.
  Pause keeps the step; resume recomputes `steps[min(done, len-1)]`; open on a
  needs-you task resumes it and clears `asks`.
- Ring progress colours (done→blue, paused→muted grey, ≤25% orange, ≤50% amber,
  else teal), swap-animated counts, `role=status` live announcements only on
  needs-you/done transitions, outside-pointerdown close, Esc/arrow/Home/End
  keyboard support with focus restore, panel open by default.
- Hard-won rules honoured: rows/trigger are persistent nodes updated in place
  (tick never rebuilds the DOM — asserted in harness); open on
  pointerdown/mousedown capture; hover/focus are CSS-only, never re-render;
  explicit `[hidden]{display:none}`; SVG classes set via `setAttribute`.

## Not applicable from the spec
- Token-count context bar and 3×3 pixel-marks: this component has no agent
  identities or token budgets — it uses progress rings and `done/total` step
  counts, as in the original.

## Verification (node only, no browser — all files in this directory)
- `node --check script.check.js` (script extracted from `index.html`): **passes**.
- `node verify-harness.js`: **68 passed, 0 failed**. The harness stubs the DOM,
  runs the page script, advances timers through the full 14-tick loop (including
  the asks transition, completions, live announcements and reset), and asserts
  **visible** text/state (hidden ancestors, `display:none`, `visibility:hidden`,
  `color:transparent`, `font-size:0` and the sr-only live region are excluded
  from "visible"; aria-only text never counts).
- Light **and** dark checked: theme toggle flips `data-theme`, swaps icons,
  keeps all text visible, and keeps waiting-badge contrast in both themes.
- Static audit: no `http(s)`/`<link>`/`<img>`/`@import`/`url()` externals;
  top-level CSS hides no text classes (word-hiding lives only in `@media`).

## How to test
Open `index.html` in a browser. Watch tasks advance every ~2s, pause/resume one,
open the needs-you task, toggle the theme (top-right), and try keyboard
(`↓` on the pill, arrows + `Esc` in the panel).
