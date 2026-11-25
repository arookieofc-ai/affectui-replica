# Agent Metro Map — REPORT

## What was built
`index.html` (30 KB, single file, no external dependencies) — clean-room replica of the
affectUI "Agent Metro Map" demo: the multi-agent **Ship v2.4** run drawn as a metro map
with 6 coloured lines, 21 stations, moving trains and an approval stop.

## Original demo data used (extracted from `demo-original.js`, fetched via curl)
- Title: **Ship v2.4** — header shows project name + working count + agent count.
- Lines (colour order as in demo): Planner (blue), Coder `#a651f0`, Writer `#14b3a0`,
  Researcher `#f28a2e`, QA `#ee3e9e`, Support `#5e6ad2`.
- Agents/models: Planner / Claude Opus 5.5, Coder / GPT-5.5 Codex, Writer / Gemini 3 Pro,
  Researcher / Claude Sonnet 5.5, QA / GPT-5.5, Support / Gemini 3 Flash.
- All 21 station names, grid positions, label sides, detail strings, tool strings
  (Linear – BIL-482, GitHub – fix/invoice-rounding, 214 passed, checkout flow,
  Vercel – preview/production, Slack – asks you in a DM, …) and durations
  (2s … 6m 10s) are verbatim from the demo.
- Timeline: the 11 demo steps with the demo's per-step timings; loop with end hold.
- Approval: **Sign-off** becomes `waiting` when the Planner arrives (step 10);
  Approve advances to Production, Reject restarts at step 0 — same as the demo's
  `onApprove`/`onReject`.

## Behaviour / styling matched (re-implemented, not copied)
- Deterministic 3×3 pixel-mark per agent id; running agents pulse.
- Lines drawn with rounded corners; travelled portion solid, ahead portion faint.
- Interchange stations larger; station states ahead / now / passed / waiting.
- Click legend (line) or station for a detail card (stops, tools, durations);
  hover/focus highlights the chain and dims the rest (opacity ≥ 0.75 per v3).
- Tools as small circular icons; pills fully rounded; 3 px progress bar.
- Light + dark via `data-theme` on `<html>`, visible sun/moon toggle top-right,
  default follows `prefers-color-scheme`.
- Responsive: map scrolls horizontally on narrow screens, legend wraps.
- Keyboard: stations focusable, Enter/Space opens, Escape closes.

## Verification
- Token audit: all colours live in the `:root` / `html[data-theme="dark"]` token
  blocks and are referenced via `var()`; the only other `#…` match in the file is
  the text "PR #482". No ad-hoc hex per element. Status amber stays amber in dark
  (`#fbbf24` on `#451a03`).
- Contrast (all ≥ 4.5:1): light ink 17.2, light muted 4.6–4.8, dark ink 16.2,
  dark muted 6.6–7.4, warn pairs 6.4 / 12.0, ok/fail pairs 4.9–11.2.
- JS syntax checked with `node --check`; render logic executed under Node with a
  DOM stub: all 11 steps render, approval banner shows at step 10, Approve
  advances 9→10, Reject resets to 0, station + line detail cards populate.
- Checked in both themes via token review (dark uses the same token names;
  borders/shadows adjusted, no grey-on-grey).

## How to test
Open `index.html` in a browser. Press Play/Pause, Prev/Next; click stations and
legend items; at step 10 click **Sign-off** → Approve/Reject. Toggle ☾/☀ and
repeat. No server or network needed.
