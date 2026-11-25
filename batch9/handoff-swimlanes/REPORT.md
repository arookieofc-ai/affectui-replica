# Handoff Swimlanes — replica report

## What was built
`index.html` (52 KB, self-contained, no network, system fonts) — a clean-room
replica of the affectUI Pro `handoff-swimlanes` component: a swimlane view of
handoffs between agents over time. Open it in any browser; the timeline plays
automatically on a loop.

- Header: project name (**Ship the billing fix**) + done count (`N of 6`) +
  working/agents line (`1 working · 4 agents`) + overall state pill
  (Not started / Running / Waiting for you / Done) + Pause, Restart, theme toggle.
- Six lanes (You, Planner, Coder, Writer, Reviewer, Vercel tool with triangle logo),
  eight nodes (start / 5 tasks / approval gate / deploy / end), eight orthogonal
  handoff edges with arrowheads, animated "flow" dashes on live edges, and
  output dots at handoff sources.
- Deterministic 3x3 pixel-mark per lane id (own FNV-1a + LCG hash, ≥5 cells on;
  person lane all-on); busy lanes twinkle via CSS only. Every mark contains
  **exactly 9 `<i>` cells** (asserted in the harness).
- Task dialog (kind chip, status chip, duration, owner, detail, From/To flow,
  working Approve/Reject on the waiting gate) and lane dialog (kind/role/tags,
  description, Tasks/Done/Handed-to-it/Handed-on stats).
- Hover/focus chain highlight of connected edges + nodes; Esc / outside-click
  closes the dialog; narrow widths (<560 px) switch to a stacked list with
  status chips; `prefers-reduced-motion` disables animation.

## Original demo data used (from `demo-original.js`, behaviour only — no copied code)
- Lanes + descriptions, tasks + details, gate `Approve deploy`, all verbatim.
- Frames (7), durations (`plan 14s, fix 2m 40s, notes 38s, review 1m 05s,
  approve 4s, deploy 1m 12s`), holds (`2200,2000,2400,2600,4200,2600,3600` ms),
  420 ms fade before loop reset, Approve→frame 5, Reject→frame 0.
- Status labels (Queued/Running/Waiting/Done/Failed/Skipped), kind labels
  (Person/Agent/Tool), overall labels incl. "Waiting for you".
- Nothing invented: no token counts bar (belongs to a different component),
  no extra agents or tasks.

## Visual QA fixes (2026-11-25, browser QA in both themes)
Browser visual QA had failed this replica: task titles truncated
("Split into ta…", "Fix invoice r…", …), the You lane's "Ship the billing
fix" / "Shipped" showing as bare circles, lane subtitles truncated
("Splits the w…", "Docs & cha…"), plus reports of a 6-frame timeline and a
button-less approve dialog. Fixed in `index.html`:
- Task cards: adopted the original bundle's 2-line clamp
  (`.hs-box-text` is now `-webkit-box` / `-webkit-line-clamp: 2`, matching
  `demo-original.js` `.ui-hs__box-text`) instead of single-line ellipsis,
  and widened task boxes 104→132 px (columns 136→160 px) so all six titles
  ("Split into tasks", "Fix invoice rounding", "Draft the changelog",
  "Review PR #482", "Approve deploy", "Deploy to production") render in full.
- Start/end nodes: now render a visible `.hs-event-label` pill under the
  circle with the full title ("Ship the billing fix", "Shipped"); previously
  only the hollow circle was painted (the original bundle also paints only
  the circle, but the QA requirement is visible titles, so the label was
  added and edge geometry kept on the circle).
- Lane subtitles: widened the label column 112→152 px and removed the
  single-line ellipsis on `.hs-lane-name` / `.hs-lane-role`, so "Splits the
  work" and "Docs & changelog" (and all other roles) show in full.
- Gate label: removed the 96 px `max-width` + ellipsis on
  `.hs-gate-label`; "Approve deploy" now renders on one untruncated line.
- Timeline: confirmed 7 frames with the original's exact holds
  (`[2200,2000,2400,2600,4200,2600,3600]` ms, 420 ms fade reset) matching
  `demo-original.js` `k`/`j`; final 7th frame completes all 8 nodes.
- Approve gate: the waiting-gate dialog (frame 4) renders working
  Reject → frame 0 and Approve → frame 5 buttons, matching the original's
  `onApprove: () => t(5)` / `onReject: () => t(0)`; verified in-harness.
- Narrow stacked list rows also wrap instead of ellipsis-truncating.

## Engineering notes (per prompt)
- No fast tick loop: one chained `setTimeout` per frame hold; per-frame updates
  only mutate classes/text/attributes — the canvas is never rebuilt mid-play.
- Dialog opens on `pointerdown` **capture** (plus `mousedown` fallback), so a
  real click is never lost across a rebuild; the follow-up `click` is
  de-duplicated, keyboard use still goes through `click`.
- Re-render happens only on real state change (frame, play/pause,
  selection, narrow breakpoint, theme).

## Token audit
All colour flows through CSS custom properties on `html[data-theme]`; no
hard-coded hex per element (SVG uses `currentColor`). Light tokens match the
spec (`#ffffff/#fafaf9/#1c1917/#78716c/#f5f5f4/#e7e5e4`, radius 16/10/6,
waiting `#f59e0b`/`#fef3c7`/`#92400e`); dark tokens match the spec
(`#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33`, amber `#fbbf24` on
`#451a03`/`#fde68a`). Verified dark mode renders finished (own surface/border/
shadow values, amber waiting legible).

## Contrast results (WCAG relative luminance, computed in harness)
Light — ink 17.49, strong 17.93, muted 4.80, work 5.49, wait 6.37,
done 6.49, fail 5.30 → all ≥ 4.5 PASS.
Dark — ink 14.52, strong 16.29, muted 6.63, work 8.72, wait 12.03,
done 12.11, fail 8.96 → all ≥ 4.5 PASS.

## Interactions
Play/pause/restart the loop · click (or keyboard-activate) any node or lane for
details · Approve advances to the deploy frame, Reject resets · theme toggle
(sun/moon, top-right, follows `prefers-color-scheme` by default).

## Visual QA fixes round 2 (2026-11-25, browser QA re-check in both themes)
Round-1 items (titles, subtitles, 7 frames, Approve/Reject buttons) all still
pass. Three new failures, all reproduced from `demo-original.js` behaviour:

1. **You-lane FIRST card clipped on the left ("ip the billing fix").** Root
   cause: round-1 added centred `.hs-event-label` pills under the start/end
   circles (the original paints bare circles). The start pill is centred on a
   circle at x = LABEL_W+8, so its left half extends under the sticky
   (`position: sticky; left: 0`) lane-label column (z-index 4, opaque
   gradient) and is painted over — unreachable at scroll-left 0. Fix: anchor
   the start label inward (`.hs-node[data-kind="start"] .hs-event-label`
   `{ left: 0; transform: none }`) so its left edge starts at the circle and
   extends right, clear of the sticky column.
2. **You-lane LAST card "Shipped" clipped on the right (only "S" visible).**
   Root cause: the centred end pill extends past the canvas width
   (node right edge is already at `width - 6`), i.e. outside the scrollport
   at desktop widths. Fix: anchor the end label inward
   (`{ left: auto; right: 0; transform: none }`) so its right edge ends at
   the circle, plus the fit fix below.
3. **Running cards show only 1 title line ("Fix invoice", "Deploy to").**
   Root cause: in `refresh()`, running cards prepend a `.hs-mark` that is
   `display: grid` (block-level) inside the vertical `-webkit-box`
   (`.hs-box-text`, `-webkit-line-clamp: 2`). A block child becomes its own
   box item and consumes one of the two clamped lines (~12 px mark + margins
   inside a 30 px `max-height`), leaving room for a single 15 px title line.
   The original has no such state difference: its mark/glyph is
   `display: inline-grid` and flows inline with the title text in all
   states. Fix: `.hs-box-text > .hs-mark { display: inline-grid;
   vertical-align: top; ... }` (glyph already inline), so running cards keep
   the 2-line clamp with the full two-line title.
4. **Timeline width/overflow (covers 1+2 structurally).** The original never
   scrolls horizontally: `.ui-hs__scroll` is `overflow: hidden` and the canvas
   gets `zoom: fit<1 ? fit : undefined` (fit = available / natural width,
   floored at 0.4), with columns/boxes additionally shrunk to fit. Round-1
   used `overflow-x: auto`, which cannot help because the sticky column
   covers the start label at any scroll position. Fix: `.hs-scroll` is now
   `overflow: hidden` like the original, and `applyFit()` (called on build
   and on resize via ResizeObserver) sets the same `zoom` shrink-to-fit, so
   the whole first-to-last-card span is visible at ~1920x1000 in both themes
   with no unreachable content.
5. **Frame counter "0 of 6"–"6 of 6": KEPT, matches the original.** The
   original renders `[doneCount, " of ", tasksAndGates.length]` where the set
   is filtered to `kind === task|gate` (6 items; start/end circles are never
   counted) — i.e. it really counts 0..6 over 7 frames, not 1..7. The replica
   uses the identical formula, so it was left unchanged (asserted in-harness
   via the denominator check).

## Verification
- `node --check` on the extracted page script: pass.
- `node harness.mjs` (kept in this directory; uses `verify/node_modules`
  linkedom + a timer mock): **108 assertions, ALL GREEN** — boot state, exact
  holds incl. 420 ms fade reset, frame-by-frame statuses, 9-cell marks,
  pointerdown-open/click-survive dialog, Approve/Reject jumps, Esc + outside
  close, lane stats, 8 edges + dots, live-edge states, pause/restart, both
  themes, narrow list mode, contrast audit, plus the visual-QA block: all 6
  task/gate titles in full, start/end `.hs-event-label` titles, all 6 lane
  roles in full, 2-line-clamp/no-ellipsis CSS checks, exactly 7 frames with
  the original's holds, frame 4 waiting gate, 8-node final frame,
  Approve→5 / Reject→0 from the dialog buttons, and the round-2 block:
  hidden (non-scrolling) scroll wrapper, inward-anchored start/end labels
  with in-canvas geometry, zoom shrink-to-fit at narrow widths, running cards
  keeping the inline mark + full two-line titles, and the 0-of-6 counter
  formula matching the original.
- Could not verify: pixel-perfect match to the proprietary rendered demo
  (no screenshot available); animation smoothness is CSS-driven and was
  asserted via state/attribute changes, not raster frames.
- To test: open `index.html` in a browser (light + dark via the toggle).
