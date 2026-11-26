# REPORT — ai-chat-agents (AI Chat / Agent Run)

## What was built
`index.html` (single self-contained file, ~45KB, inline CSS+JS, no external deps) replicating the
affectUI **AI Chat / Agent Run** App screen: narrow chat (380px) on the left beside working agents on a
dot-grid canvas, with stuck alerts and inline replies.

Public description matched: "Narrow chat beside working agents on a dot grid, with stuck alerts and
inline replies."

## Demo data (verbatim from `./demo-original.js`)
- Agents: `orch` Orchestrator / Plans and hands out / Opus 5.5; `research` Research / Pulls the numbers /
  Sonnet 5.5 (#0190fe); `analyst` Analyst / Builds the charts / Sonnet 5.5 (#8b5cf6); `writer` Writer /
  Drafts the slides / Sonnet 5.5 (#10a37f); `publisher` Publisher / Checks and sends / Haiku 5.5 (#e8458b).
- Prompt: `Prepare the Q4 board report and send it to the board`. Title: `Board report`.
- Blocks verbatim: `HubSpot isn't connected` / `Needed for the forecast slide` (Connect HubSpot/Connect,
  Skip the pipeline/Skip); `Stripe rate-limited the export` tone error / `429 – too many requests, try in
  20s` (Retry now/Retry, Skip the monthly chart/Skip); `Send to 6 board members?` /
  `Board deck Q4.pdf · 12 slides` (Approve & send/Send, Review first/Review).
- Timeline texts verbatim: `Reading the request`, `Planning – 4 agents, 1 hand-off`, `Watching the agents`,
  intro/runner says, `Pulling Q4 revenue from Stripe`, `Pulling the pipeline from HubSpot`,
  `Matching 41 deals to accounts`, research/analyst/publisher stuck says, `Revenue by month, against plan`,
  `Pipeline forecast for Q1`, `The 3 headline numbers`, `Drafting 12 slides`, `Speaker notes for each slide`,
  `Checking every number against Stripe`, `Emailing the deck to the board`, both endings
  (`Done – the deck went to all 6 board members…` + file + 2 suggestions; draft variant + file + 2
  suggestions), empty-state text/churn suggestion. Branching (connect vs skip, retry vs skip, send vs
  review) follows the original `me/he/ge` event builders.

## What matches the original
- Layout: chat column + agent canvas with dot grid (`radial-gradient` dots), SVG connector lines from
  Orchestrator to 4 children, dots at line ends, floating run header (`run title + x/4 done + Needs you/Failed`
  chip), bottom-left canvas toolbar (zoom out/in, fit, run again), right-side detail panel on card click.
- Chat: Assistant header w/ history + new-chat buttons, user bubbles right, assistant messages with inline
  block cards (who-button jumps to agent + opens run pane), file card (`Board deck Q4.pdf · 12 slides`),
  suggestion pills on the last message, composer (`Ask anything or use / for commands…`).
- Agents: deterministic 3×3 pixel-mark per agent id (own hash, coloured per agent), working agents
  twinkle (`pix` keyframes + staggered delays); status chips (Working/Needs you/Failed/Done/Idle/Queued);
  role line single-line ellipsis with `done/total` counts; last-3 steps list; stuck block card with actions;
  click-to-open detail with all steps + counts + block actions; keyboard (Enter/Space toggle, Esc close,
  ArrowUp/Down/Left/Right navigate); responsive stacked Chat/Agents switch under 760px with needs-you dot.
- States/animations: running spinner, blocked/failed edge colors + flash on attention, rise-in messages,
  reduced-motion guards, hover lift, focus-visible outline.

## What could not be verified / deliberate deviations
- No browser was launched per instructions; verified with node only (see below). Real-browser pixel
  rendering, pointer drag-pan feel, and `prefers-reduced-motion`/`prefers-color-scheme` media behavior were
  not visually inspected.
- Original card block is an absolutely-positioned popover overlapping the canvas; this replica renders the
  block **in-flow** inside the card (same content, no text-under-button overlap, keeps bottom padding) —
  spec-compliant and safer on small canvases.
- Spec v3 mentions "sub-agents are smaller cards (no model line)"; in this demo's original code all cards
  share one size (248×152), so all cards keep the model line here to match the original.
- Dimmed opacity uses 0.78 (spec requires ≥ 0.75) rather than the original's 0.62, for legibility.
- Light canvas pulse animation from the original (`getTotalLength`/Web-Animations light streaks) is replaced
  by CSS-only twinkle; no canvas animation APIs are required.

## How to test
- Open `index.html` in a browser. The run starts automatically. Click `Connect` / `Retry now` / `Send`
  (or the Skip/Review alternatives) to advance the three stuck states to the done message. Click agent
  cards for the detail panel; use toolbar for zoom/fit/run-again; toggle sun/moon top-right for light/dark;
  narrow the window under 760px for the Chat/Agents switch.
- Node-only verification (no browser): `node verify.js` in this directory. It boots the page's inline
  script in a DOM stub and asserts visible painted text, full-loop node identity, zero `innerHTML` writes
  after init, and light+dark legibility. `node --check verify.js` passes; the app script contains zero
  occurrences of `innerHTML`.

## Light AND dark
Confirmed: `verify.js` switches `data-theme` light→dark→light, asserting the stuck alert, prompt, and agent
text remain legible in both. Tokens follow the spec (`surface #ffffff/#1c1c1f`, `page #fafaf9/#101012`,
amber waiting, red failed) with a `/*noflash*/` guard + `color-scheme` meta, so dark never flashes white.

## v5 polish
- All `:hover` rules live inside `@media (hover: hover) and (pointer: fine)`.
- `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`.
- Concentric radii (page 16 / card 10 / chip 6; detail 12 with inner 10 blocks); borders for structure +
  layered shadows for elevation; `img` 1px inset outline rule included; icon buttons use optical padding
  nudge (`padding:0 0 2px 0`) for asymmetric glyphs.
