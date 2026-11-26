# Live Session — replica report

## What was built
`index.html` (34KB, self-contained, no network, system fonts) replicates the
**Live Session** affectUI component: *work alongside agents — central
conversation, ticking plan, shared context, agent steps*.

Layout (from `demo-original.js` CSS + props):
- Header pattern: project name **“Launch the new pricing page”** + live pill
  (**“Live · N working · 4 agents”**) + `Started 9m ago` + `Loop N · 14:xx`.
  Visible theme toggle (☀/☾) top-right switching `data-theme` on `<html>`.
- Grid: left **Central conversation** stream (max-height 560px), right
  **Team plan** (title + “4 agents · running”, 5 steps, Pause/Resume) and
  **Shared context** (Opus 5.5 · 200k limit, thin 3px bar, right-aligned
  `Nk / 200k` label, 5 part rows).
- Conversation rows: 3×3 pixel-mark avatar, name + model, kind badge
  (ask/spawn/share/reply/question/handoff), time, verbatim text, typing dots,
  attachment cards (file buttons with pointerdown-capture preview toggle),
  tool rows with small circular icons, facts + item rows.
- Composer at the bottom; focusing it pauses the loop (matches original
  `h = extra.length>0 || textareaFocused` freeze). Pause/Resume buttons work.
  Sending a message appends it plus a deterministic agent auto-reply
  (Orchestrator/Researcher/Writer/Coder lines from the demo).

## Matched data / behaviour (verbatim from demo-original.js)
- Agents: Orchestrator/Gemini 3.8, Researcher/Gemini 3.8 Flash, Writer/Sonnet 5.5,
  Coder/Opus 5.5 (+ You/Operator).
- All 13 messages m1–m13 with exact texts, times (14:02–14:12), kinds, replyTo,
  attachments (`pricing-table.csv` 4 rows + CSV preview, `plans-copy.md` 1KB +
  copy preview, `web_search ×6` 6 calls + 6 query lines, `src/billing/` 6 items,
  `Pricing / Desktop` Figma preview, `PR #482 +214 −38` preview,
  `price_team_12/15` Stripe rows, `feat/pricing-page` branch) and details facts
  (Model Gemini 3.8 Flash, Tokens 41.2k, Cost $0.02, Took 1m 48s / From
  Orchestrator, To Coder, Context 18.4k tokens / Model Opus 5.5, Waiting 2m,
  Holds Deploy) — all asserted visible in the harness.
- 5 plan steps with exact titles/agents/from-to:
  Compare per-seat prices (research 1→3), Draft the copy (writer 2→6),
  Build /pricing (coder 7→12), Pick the Team price (you 11→12),
  Review the preview deploy (orch 12→99); status = done/active/pending from
  `g = 4 + floor(elapsed/1.5)`.
- Timing constants verbatim: `W=4, T=1.5, E=0.7, D=(13−4)*1.5+4.5=18s`,
  100ms tick, 0.7s typing window on the newest message, 1400ms reply typing,
  `startedAt = Date.now() − 9*60000`, context `limit 200k, model Opus 5.5`,
  parts `system 4200 / tools 12800 / files 6400×atts / talk 3600×msgs /
  memory 3900`. Context label shows computed `≈52k→119k / 200k`.
- Auto-replies verbatim: “Got it – I’ll pass that on…”, “On it – I’ll check
  that against the competitor pages.”, “Sure – I’ll rework the copy…”,
  “Done – switching it over…”.
- Clean-room: hand-written HTML/CSS/JS; no copied bundle source.

## Spec compliance (v2/v3/v4)
- Design tokens as CSS vars for every colour; light (`surface #fff, page
  #fafaf9, ink #1c1917, muted #78716c, border #e7e5e4, radii 16/10/6`) and dark
  (`surface #1c1c1f, page #101012, ink #ededed, muted #a1a1aa,
  subtle #26262a, border #2e2e33`, amber `#fbb624/#451a03/#fde68a`).
- Default theme = original demo appearance (light page `#fafaf9`); stored key
  `ui-lss-theme` else `prefers-color-scheme` via `/*noflash*/` guard in `<head>`
  + `<meta name="color-scheme" content="light dark">` + inline bg style.
- Header = project + working/agent counts; context = token counts, 3px bar,
  right label; pixel-marks are deterministic 3×3 (9 cells each, twinkle when
  working); tools are circular icons; dimmed opacity ≥0.75; titles ellipsis;
  column headings have reserved space; responsive stack <860px.
- IN-PLACE ONLY: DOM built once at init; tick updates text/class/attrs/style on
  existing nodes only; **zero `innerHTML` anywhere** (verified by grep +
  runtime counter); node identity preserved across the loop; popovers toggle on
  `pointerdown` capture; no hover/focus full re-render; `[hidden]{display:none}`
  present; no SVG className assignment (icons use `setAttribute`).

## Verification (node only, no browser/packages)
- `python` extract last `<script>` → `node --check`: **PASS** (syntax OK).
- In-dir stub harness `./harness.stub.js` (`node ./harness.stub.js`):
  stubs document/window/localStorage, runs the real page script, advances
  `tick(0.1)` through the full 18s loop + restart. **ALL PASS**:
  initial 5/13 visible with verbatim texts; all 13 pixel-marks have exactly 9
  cells; post-loop visible m10–m13/PR/step titles; plan `done,done,done,done,
  active`; context label shape `118.9k / 200k`; loop counter ≥2 (restart);
  message + step node identity unchanged; zero innerHTML writes after init;
  light + dark token sets present and toggle click flips `data-theme`.
- Checked both themes statically (light surface `#ffffff`, dark `#1c1c1f`,
  dark page `#101012`, dark amber `#451a03`) and via attribute switch +
  toggle handler; no grey-on-grey (muted `#a1a1aa` on `#1c1c1f`, ink `#ededed`).

## How to test
Open `index.html` in a browser. Watch 5→13 messages stream over ~18s with
typing dots, plan steps flip queued→working→done, context `52k→119k / 200k`
grows, then the loop restarts. Focus the composer to pause; Send appends a
user message + agent reply; Pause/Resume freeze the tick; toggle ☀/☾ top-right
for light/dark. Re-run `node ./harness.stub.js` for the automated checks.
