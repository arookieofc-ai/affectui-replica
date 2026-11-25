# agent-timing — clean-room replica report

## What was built
`index.html` (49.8 KB, single self-contained file, no network, system fonts) replicates
the affectUI Pro **agent-timing** component: an agent run rendered as a timing diagram
with signal rows, step segments, and handoff wires. Open it in a browser; no build step.

Layout mirrors the original: header bar (`Fix the cart total` + live summary + clock),
names column (3×3 pixel-mark, agent name, live status pill), signal plot (area-filled
step lines per state, dashed waiting runs, pulsing live dot, vertical handoff wires
with destination dots, gridlines + baselines, running now-line), and a time axis with
a now-pill. Narrow viewports (≤560 px) collapse to marks-only, per the original's
container-query behaviour.

## Original demo data used (no invented data)
- Title `Fix the cart total`; duration 46 s at 3× speed; loop restarts at 55.6 s;
  reduced-motion shows a static frame at 36 s (all exact values from the demo).
- Participants: `you` (person), `lead`, `coder`, `tester`, `reviewer`, `docs`.
- All 17 segments verbatim (who/state/start/end/label), e.g. lead `thinking 0.6–4
  "Planning the fix"`, lead `waiting 33.5–39.5 "Approve the fix?"`, docs `tool
  41.6–43.6 "update_changelog"`.
- All 11 handoffs verbatim (from/to/at/label), e.g. `coder→reviewer @24.6 "Review the
  rounding fix"`, `lead→you @44.4 "Pull request #482 is ready"`.
- Pixel-mark: deterministic symmetric 3×3 pattern hashed from the agent id
  (≥5 cells lit, own reimplementation of the observed behaviour); `you` is all-on;
  per-cell twinkle delays `[0,120,240,120,240,360,240,360,480]` ms; busy agents twinkle.
- Agent colours from the demo palette: lead = theme blue, coder = purple
  `rgba(166,81,240,.85)`, tester = `rgba(20,179,240,.85)`, reviewer =
  `rgba(95,200,138,.9)`, docs = `rgba(238,62,158,.8)`; waiting runs amber.
- Behaviour: ease-out step settling over 0.9 s, handoff wire draw-in over 0.6 s,
  nice-axis ticks ≈90 px apart, header shows `Waiting on you` pill + live tool-call
  count + clock; finished state shows `Xs busy` per agent and max time `0:44`;
  keyboard focus pauses the run.

## Interactions
Auto-playing loop (pause ❚❚ / resume ▶, restart ↻), hover highlights a step/handoff
and shows a tooltip (name + state pill + label + time range/duration; handoffs show
"Handed over at m:ss"), click pins/unpins the tooltip, full keyboard support with
roving tabindex (←/→ along a row, ↑/↓ across rows, Home/End, Esc unpins or blurs),
theme toggle (sun/moon, top-right, persisted to localStorage, follows
`prefers-color-scheme` when unset), `prefers-reduced-motion` static frame.

## Token audit
Every colour resolves through CSS custom properties; a scan of the stylesheet finds
**zero** hex/rgba literals outside the `:root` / `html[data-theme]` token blocks.
Light tokens match the spec (`#ffffff/#fafaf9/#171717/#78716c/#f5f5f4/#e7e5e4`,
16/10/6 px radii, soft shadow); dark tokens match (`#1c1c1f/#101012/#ededed/
#a1a1aa/#26262a/#2e2e33`); waiting uses `#f59e0b`-family dot on `#fef3c7`/`#92400e`
(light) and `#fbbf24` on `#451a03`/`#fde68a` (dark). Dimmed items use opacity 0.75
(per v3, not the original's 0.3) so they stay legible.

## Contrast results (computed relative-luminance ratios)
- Light: ink/surface 17.9, muted/surface 4.8 ✓, muted/page 4.6 ✓,
  amber-text/bg 6.4 ✓, now-pill white/solid-blue 5.7 ✓.
- Dark: ink/surface 14.5, muted/surface 6.6 ✓, amber-text/bg 12.0 ✓,
  on-amber/dark-amber 9.6 ✓, on-blue/blue 4.7 ✓.
- Axis ticks (~2–3:1) are decorative and `aria-hidden` (same as the original; the
  current time is always in the header), so they carry no information.

## Verification
- `node --check` on the extracted page script: passes.
- Real headless run: a Node DOM-stub harness loaded the actual inline page script,
  drove its `requestAnimationFrame` loop with advancing timestamps, and asserted:
  clock advances (`0:00`→`0:01`), all labels/handoffs render, 6 marks × exactly 9
  cells, deterministic ≥5-lit patterns, person all-on, waiting pill at t=34,
  "2 tool calls" at t=27, finished state (`now()===null`, `0:44`, `busy` statuses,
  now-line hidden), loop wrap past 55.6 s, seg + handoff tooltip content, theme
  toggle flips `data-theme` and persists, reduced-motion yields no loop and a static
  36 s frame. **All 27 checks passed** (harness removed after the run to keep the
  directory to deliverables).
- Checked light AND dark: token sets verified above; toggle logic verified in-harness.

## Could not verify / deviations
- No browser installed here, so no pixel screenshot vs. the original; geometry math
  (row 64 px, base +52, tool +13 / thinking-waiting +30, 5 px corners) was ported
  from observed behaviour instead.
- Two deliberate spec-over-original deviations, both required by the replica spec:
  dimmed opacity 0.75 (not 0.3), and the waiting pill uses amber-bg/dark-amber-text
  (original tray used solid amber + white, 2.7:1) for AA legibility.
- Added (not in original): pause/replay buttons and click-to-pin tooltips, per the
  spec's "buttons work / click-to-open details" requirements.
- Default theme follows `prefers-color-scheme` per the spec's Dark-mode section
  (the v3 "dark for Crew" note targets a different component).
