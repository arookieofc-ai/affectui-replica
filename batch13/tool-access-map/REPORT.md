# REPORT — Tool Access Map replica

## What was built
- `index.html` (51 KB, single self-contained file, no network, no external assets, system fonts only):
  an agent-centred map of reachable tools. Header (`Tool access` + live `N running` pill + `X/9 tools · Y calls`
  summary), agent tabs (tablist with arrow-key nav), central agent card (name, model, status pill, task),
  per-tool nodes with SVG bezier connectors (grey base + blue used + animated glint for running), and a
  click-to-open calls panel (call list newest-first, input/output detail, Edit-input-as-JSON + Replay/Run,
  `Waiting for the result` for running calls, back button + Escape to close).
- `tam.verify.cjs`: in-directory node-only harness (DOM stub, fake timers, CSS-visibility audit).
- Agent identity is a deterministic 3x3 pixel-mark (exactly 9 cells) hashed from the agent id; marks on
  running agents twinkle. Blocked tools stay legible (opacity 0.78, no grey-on-grey).
- Light theme is the default (matches the original demo's light appearance); a visible sun/moon toggle in
  the page bar switches `<html data-theme="light|dark">`, persisted to localStorage. Dark theme re-maps every
  token (amber waiting adjusted to `#fbbf24` on `#451a03`).

## Original data / behaviour matched (verbatim from demo-original.js)
- Tools in order with descriptions: GitHub `acme/web`, Terminal `Sandbox shell`, Stripe `Test mode`,
  Figma `Pricing file`, Database `Postgres replica`, Web search `Search API`, Notion `Launch workspace`,
  Slack `#launch, #pricing`, HubSpot `CRM, read only`.
- Agents: Researcher/Sonnet 5.5 `Compare the pricing of five competitors`; Coder/GPT-6 Sol
  `Build the pricing page and wire up checkout`; Writer/Sonnet 5.5 (Needs you)
  `Write the copy for the three plans`; Analyst/Gemini 3.8 Pro `Sum up 120 G2 reviews that mention price`.
- All seed calls verbatim (incl. `permission denied for table accounts`,
  `2 of 14 tests failed – coupon codes aren't applied`, `1730.4211`, `412:96`, `price_monthly`/1900).
- Live loop verbatim: 900 ms tick, +2600 ms clock from 190000, inject every 2nd tick, per-event durations
  (4,2,3,2,2,2,2,2,2,3), all 10 scripted replacements
  (npm retest → passed:14, vercel query, review-theme summary, `9f3c2e1`, `Starter, Team, Scale`, `#pricing`
  teardown, `LAUNCH20`, `notion.so/review-summary`, `Plan / Name` → Scale, PR 482), status derivation
  (running > future-scripted check > initial, Writer stays `Needs you`), Replay adds a `left:2` running call,
  full reset after 5 idle ticks. Status labels Queued/Running/Needs you/Done/Failed; `m:ss`, `ms/s/m` formats.

## Hard-won rules applied
- Re-render only when the structural signature changes (11 renders for 26 ticks); per-tick clock text is
  updated in place, never rebuilding the DOM in the fast loop.
- Tool nodes open on `pointerdown` capture (+ click for keyboard); hover/focus listeners never re-render.
- Explicit `[hidden]{display:none}` rule; all SVG is markup strings (no `.className` on SVG elements).

## Verification (node only — no browser install attempted)
- `node tam.verify.cjs`: **95 passed, 0 failed**. Covers: script syntax (vm.Script ≈ node --check),
  all design tokens in CSS, default-light + toggle-to-dark-and-back, boot in a DOM stub, visible-text
  assertions for every agent/tool/seed-call string, all 10 scripted events through a full loop + reset,
  Replay chip + completion, exactly-9-cell pixel-marks, no hiding CSS on text selectors, <200 KB.
- Light AND dark checked: token values for both themes asserted in CSS; toggle behaviour asserted in the
  theme script (light default → dark → light). Visual polish in a real browser (hover lift, glint
  animation, narrow stacking) could not be verified here — open `index.html` in a browser to confirm.

## How to test
Open `index.html` in a browser (or `node tam.verify.cjs` for the headless checks). Click tools to open
their calls, Edit input + Replay, switch agents, toggle the sun/moon button for dark mode, narrow the
window below ~560 px for the stacked layout.
