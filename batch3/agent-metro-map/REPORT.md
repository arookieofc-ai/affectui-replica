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

## Visual-QA defects fixed (2026-11-25)

### 1. Train marker occluded station labels
- Symptom: the 20×20 rounded-square train at `(+12,−12)` sat in the same
  quadrant as the `side:"above"` labels (baseline `−16`, centre-anchored), so
  e.g. step 1 `Question` rendered as `Ques□on`, step 4 `Write fix` lost `fix`,
  step 5 `Tests` was partly covered — even when stationary, since the marker
  is drawn at every running line's station. Trains were also emitted inline
  right after their own station, so a later train painted over earlier labels.
- Root cause: marker geometry overlapped the label band + no layering
  (trains and labels in one pass, trains sometimes on top).
- Fix (all three): (a) paint order is now rails → trains → stations+labels,
  so labels always win; (b) markers shrunk 20→15 px and moved east of the dot
  (`+19, 0`, fanned `+18 px` per extra line at the same station) — clear of
  both the above- and below-label bands; (c) label offset pushed out
  (`above −16→−26`, `below +22→+26`, sides `±14→±16`).
- Verify: geometry check over all 11 steps × 21 labels vs every active marker
  (conservative label widths) reports **0 overlaps**; all 21 `<text>` labels
  present in the SVG at every step; layer order asserted (trains before
  stations).

### 2. Mouse click on stations did not open details (keyboard worked)
- Symptom: clicking dots/labels/train markers did nothing; Tab+Enter opened
  the dialog fine.
- Root cause (two parts): (a) `pointerover`/`pointerout` on the SVG and
  legend called full `render()`, which replaces `svg.innerHTML` — the hovered
  node was destroyed between `pointerover` and `click`, so the click target
  never fired. (b) Train `<g>` markers had no `data-st`, so even without (a)
  `closest("[data-st]")` missed on marker clicks.
- Fix: hover/highlight no longer re-renders — new `updateHover()` toggles
  `dim`/`lit` classes and rail opacity in place (`pointerover/out`,
  `focusin/out`); `render()` is only called on real state changes (step,
  select, theme, approve/reject). Every train marker now carries its
  station's `data-st`, so dot, label and marker clicks all resolve to the
  same station dialog. Keyboard (Enter/Space/Escape) unchanged.
- Verify: DOM-stub harness registers 1 SVG click listener; synthetic click
  events on a station node and on a train-marker node both populate the
  detail card (`Write fix`, `Tests`); `pointerover` leaves `innerHTML`
  untouched (no re-render on hover).

## Verification (re-run after fixes)
- Token audit: all colours live in the `:root` / `html[data-theme="dark"]` token
  blocks and are referenced via `var()`; the only other `#…` match in the file is
  the text "PR #482". No ad-hoc hex per element. Status amber stays amber in dark
  (`#fbbf24` on `#451a03`).
- Contrast (all ≥ 4.5:1): light ink 17.2, light muted 4.6–4.8, dark ink 16.2,
  dark muted 6.6–7.4, warn pairs 6.4 / 12.0, ok/fail pairs 4.9–11.2.
- JS syntax checked with `node --check` (on extracted `<script>`); render logic executed under Node with a
  DOM stub: all 11 steps render, approval banner shows at step 10, Approve
  advances 9→10, Reject resets to 0, station + line detail cards populate,
  plus the click/hover harness above (click fires, hover does not re-render).
- Checked in both themes via token review (dark uses the same token names;
  borders/shadows adjusted, no grey-on-grey).

## How to test
Open `index.html` in a browser. Press Play/Pause, Prev/Next; click stations and
legend items; at step 10 click **Sign-off** → Approve/Reject. Toggle ☾/☀ and
repeat. No server or network needed.
