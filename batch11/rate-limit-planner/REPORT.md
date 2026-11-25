# REPORT — Rate Limit Planner replica

## What was built
`index.html` (65.6 KB, self-contained, no network, system fonts only): a clean-room
replica of the affectUI **Rate limit** planner — plan agent runs against a per-minute
API limit with draggable run bars and peak-spreading. Open it in a browser; no build step.

- **Header (original pattern):** title `Rate limit` + context `4 runs · 41M tokens · 120k / min`
  (token counts, never percentages) + state badge (`Under limit · peak 76%` /
  `Close to limit…` / `Over limit · HH:MM–HH:MM`) + `Spread out` button with wave icon.
- **Chart:** stacked plan curve with selection layer, over-limit segment, dashed limit
  (120k) + buffer (96k) lines, scale labels, 3h axis (06:00…03:00), `Now 10:30`,
  `Nightly batch 23:00`, and `Peak …` flags, hover tooltip (`HH:MM · N / min`,
  ` measured` for elapsed part), thin rendering, tabular numerals.
- **Lanes:** deterministic 3×3 pixel-marks (exactly 9 cells each, twinkle while running),
  run name + `Running`/`HH:MM`, duration bars with peak labels (`46k`, `82k`…),
  over-limit hatch segments, hover/focus toolbars (remove ✕, edit …), editor dialog
  (Name / Starts / Peak k-min / Climbs-for / Halves-every / Done), `Add run` row,
  `No runs planned for today yet` empty state.
- **Footer verdict** (`aria-live`): pace check (`Today runs 12% above plan – …`),
  checkpoint load (`…still running when the nightly batch starts at 23:00`),
  over-limit explanations + `Move to HH:MM` fix button.
- **Themes:** light default (matches the original demo appearance) + sun/moon toggle
  top-right switching `data-theme="light"|"dark"`; dark uses adjusted tokens
  (page `#101012`, surface `#1c1c1f`, amber stays legible). `[hidden]{display:none}`
  rule present; SVG classes set via `setAttribute`, never `.className`.

## Original data/behaviour matched (from `demo-original.js`, used verbatim)
Runs `Inbox triage 08:00/46k/45/70`, `Lead research 11:00/82k/60/90`,
`Report writer 15:30/74k/55/100`, `Code review 18:30/36k/30/60`,
`Weekly digest 19:30/40k/40/80 weekend` (correctly filtered out of the weekday view);
limit 120k, buffer 0.8, startHour 6, now 10:30, checkpoint `Nightly batch 23:00`,
same smoothstep-climb + half-life-decay curve math, 5-min snapping, 3-pass spread
search (±180 min, 15-min grid), median-peak `New run` placement, 240 ms leave /
900 ms glide / 600 ms fresh timings, and the **auto-play loop**: Lead research
11:00↔14:50 at 110 ms/tick with 6-tick lead-in and 14-tick end pauses, badge
visibly sweeping `Under → Close → Over limit · 16:xx–17:xx`, stopping on real input.
Real `pointerdown/move/up` dragging (with `setPointerCapture`), arrow/Shift/Home/End/
PgUp/PgDn keyboard, Enter-to-edit, Delete-to-remove.

## Verification (all in-directory, no installs)
- `node --check` on the extracted inline script: **pass**.
- `harness.cjs` (DOM stub + virtual timers, since removed after the run): loaded the
  page script, advanced timers through the **full loop** (11:00→14:50→pause→reverse→11:00),
  and asserted **86 checks, 0 failures**: visible text (hidden/aria-only text excluded,
  plus a CSS scan proving no hiding rule applies to asserted text), exact header/names/
  flags, 9-cell marks, drag rescheduling + 5-min snap + live `aria-valuetext`,
  keyboard moves, capture-phase dialog open, Escape close, over-limit reachability,
  spread/add/remove, and the theme toggle both ways.
- **Light AND dark checked**: same visibility/state assertions re-run after toggling
  to `data-theme="dark"` (title, context, badge, verdict, all lane names), plus dark
  token presence (`#101012`, `#1c1c1f`); toggle returns cleanly to light.
- Could not verify: pixel-perfect rendering vs the original screenshot (no browser here);
  narrow-viewport stacking and `prefers-reduced-motion` are implemented per spec but
  only statically reviewed. How to test: open `index.html`, drag bars, hover the chart,
  toggle the moon/sun button.
