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

## Interactions
Play/pause/restart the loop · click (or keyboard-activate) any node or lane for
details · Approve advances to the deploy frame, Reject resets · theme toggle
(sun/moon, top-right, follows `prefers-color-scheme` by default).

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

## Verification
- `node --check` on the extracted page script: pass.
- `node harness.mjs` (kept in this directory; uses `verify/node_modules`
  linkedom + a timer mock): **60 assertions, ALL GREEN** — boot state, exact
  holds incl. 420 ms fade reset, frame-by-frame statuses, 9-cell marks,
  pointerdown-open/click-survive dialog, Approve/Reject jumps, Esc + outside
  close, lane stats, 8 edges + dots, live-edge states, pause/restart, both
  themes, narrow list mode, contrast audit.
- Could not verify: pixel-perfect match to the proprietary rendered demo
  (no screenshot available); animation smoothness is CSS-driven and was
  asserted via state/attribute changes, not raster frames.
- To test: open `index.html` in a browser (light + dark via the toggle).
