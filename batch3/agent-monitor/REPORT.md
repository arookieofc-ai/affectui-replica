# Agent Monitor — replica report

## What was built
Single self-contained `index.html` (43 KB, no external dependencies, inline CSS + JS, system fonts only):
one agent card that cycles the original demo's TWO scenarios, release → support → release …
(release: `Claude Opus 5.5`; support: `GPT-5`).

## Original demo data used (from `demo-original.js`)
- Release agent: `Claude Opus 5.5` — `Release agent · web-app v3.2`, rate `0.0058` $/s (15% while waiting).
  Steps (doing → did, with original ms, detail, output):
  1. `Collecting the v3.2 issues` → `Collected 14 issues` (1700ms, Linear, `cycle:v3.2 status:done`)
  2. `Comparing v3.1…main` → `Compared 38 commits` (2300ms, GitHub, `git log v3.1..main --oneline`)
  3. `Drafting the release notes` → `Drafted the release notes` (2800ms, Notion, `Releases / v3.2`)
  4. `Building the preview` → `Built the preview in 41s` (2600ms, Terminal, `npm run build && npm run smoke`)
  5. Approval: `Ready to ship` + `gh release create v3.2.0 --latest`
  6. `Publishing v3.2.0` → `Published v3.2.0` (1600ms, GitHub)
  7. `Announcing in #releases` → `Announced in #releases` (1300ms, Slack)
  Outcome: `v3.2.0 is live · 14 changes`.
- Support agent (added): `GPT-5` — `Support agent · ticket #4821`, rate `0.0036` $/s.
  Steps with exact original data:
  1. `Reading the customer thread` → `Read the customer thread` (1900ms, Slack,
     `12 messages – the customer was charged twice for a single order.`, `#support › Maria Lopez`)
  2. `Looking up the refund policy` → `Found the refund policy` (2000ms, Notion,
     `Double charges are refunded in full, no approval needed.`, `Policies / Refunds`)
  3. `Checking the orders sheet` → `Matched order #20931` (2100ms, Google Drive,
     `Order #20931 shows two charges of $129 a minute apart.`, `Orders 2026 › October`),
     fails once: error `The orders sheet is locked`, label `Orders sheet was locked`,
     detail `Someone else had the sheet open for editing – it tried again a few seconds later.`
  4. `Writing the reply` → `Wrote the reply` (2700ms, no tool,
     `A short apology, the refund of $129 and when it lands – 3 to 5 days.`)
  5. `Closing SUP-4821` → `Closed SUP-4821` (1200ms, Linear,
     `Linked the refund to the ticket and closed it.`, `SUP-4821`)
  Outcome: `Refund sent · ticket closed`. Tools row: Slack, Notion, Google Drive, Linear.
- Behaviour cloned: status labels (Running / Needs you / Paused / Finished / Failed / Cancelled),
  cost format (`<$0.001` / `$X.XXX` / `$X.XX`), clock (`m:ss`, `h:mm:ss`),
  step durations (`X.Xs` under 10s, else `Xs` / `Xm SSs`), segmented progress strip
  weighted by step duration, step-detail dialog (Started / Took / Share / State + detail + output),
  footer `Allow ⏎` / `Decline Esc` on approval, Pause / Resume / Cancel,
  approval auto-allows after ~6.5s (as in the original), failed step shows
  `The orders sheet is locked` with a `Retry ⏎` button and auto-retries after ~4s
  (failed row kept in history, new running row appended — as in the original),
  finish → ~5.2s → next scenario, alternating release → support → release …

## Matches the v3 spec
- Shared design tokens for every colour (`:root` light + `html[data-theme="dark"]`);
  radii 16/10/6px, pills 999px, soft shadow, 150–200ms transitions, hover lift, focus-visible rings.
- Light AND dark mode with a visible sun/moon toggle (top-right); default follows
  `prefers-color-scheme`, toggle overrides it (and stops following OS changes).
- Header pattern: project name `web-app v3.2` + `1 working` + `1 agent` (no generic toolbar).
- Deterministic 3×3 pixel-mark per agent id (recomputed on scenario switch); twinkles while working.
- Tools are small circular icons with hover tooltips, not text pills.
- Titles/roles single-line ellipsis; dimmed nodes stay at opacity 0.75; bottom padding kept
  when expanded; `Agents` column heading reserves space above the card.
- Responsive (stacks under 480px), keyboard support (Tab to steps, Enter/Esc on approval,
  Enter/Space on retry, Esc closes details), `aria-live` status announcer.
- Clean-room: own markup/CSS/JS and own stroke icons; nothing copied verbatim from the bundle.

## Could not verify
- Pixel-perfect match to the original rendered demo (no browser available in this environment
  to screenshot; verified by code inspection against the bundle's strings/behaviour instead).
- The demo bundle's exact easing curves and shine keyframes (re-implemented close equivalents).

## URGENT FIX 2026-11-25 — frozen live page (root cause + harness evidence)

Root cause: `#pxmark` had 8 `<i>` cells but `pixelmark()` loops `i<9` for a
deterministic 3×3 mark. `cells[8]` is `undefined`, so
`pixelmark("claude-opus-5-5")` threw
`TypeError: Cannot set properties of undefined (setting 'className')`
synchronously during IIFE load — before the engine, `setInterval`, and the
first `render()`. The whole script aborted: timer stuck at `0:00`, steps list
empty, no `Ready to ship` / `gh release create v3.2.0 --latest`, no outcome,
support scenario never started. Exactly the Visual QA symptom.

Fix (keeps v3 spec, `index.html` only):
- Added the missing 9th `<i></i>` so the mark is a true 3×3 grid.
- Hardened the loop: `for(i=0;i<9&&i<cells.length;i++)` + `if(!cells[i])continue;`
  so a future DOM slip can never freeze the page again.
- No data/behaviour change: release + support phases, ms, labels, approval
  auto-allow ~6.5s, fail auto-retry ~4s, cycle ~5.2s all unchanged.

Call-site re-check (line-by-line): 0 bare `AGENT`/`PHASES`/`OUTCOME_NOTE`
references (all 16 sites use `()`); `S` defined before first `scen()` call
(via `buildSteps()`); `pixelmark` defined before its call; seeded first step,
`buildSteps`/`startStep` id-lookup (ask phases excluded by design),
`render`/`buildTools`/`shareOf`/`tick` all null-safe.

Harness (`harness.js` in this directory, real headless run — NOT just
`node --check`; no browser/jsdom in this env so a small DOM stub + fake
`Date.now`/timers loads the page script): BEFORE fix it reproduced the freeze
(`LOAD THREW: TypeError ... at pixelmark`, steps=0). AFTER fix
`ALL HARNESS ASSERTIONS PASSED`:
- step 1 completes ~2.2s (`Comparing v3.1…main` running, clock `0:02`);
- ask `Ready to ship` + `gh release create v3.2.0 --latest`, state `Needs you`;
- `Allow` click advances to `Running`;
- release outcome `v3.2.0 is live · 14 changes`;
- cycles to support (`GPT-5`, `Reading the customer thread`);
- orders fails once (`Failed`, `The orders sheet is locked`, `Retry` present),
  auto-retries to `Running` (failed row kept, new row appended);
- outcome `Refund sent · ticket closed`.
Run: `node harness.js` (exit 0).

## Verification (all pass, re-run 2026-11-25 after fix)
- Token audit: `0` hex colours outside the two token blocks in CSS; JS contains no hex
  colours (only `#4821` / `#20931` inside ticket/order-number strings — not colours).
- Contrast (WCAG AA, recomputed 2026-11-25): light ink 17.49, muted 4.80, amber text-on-bg 6.37,
  working 6.70, success 5.02, failed 4.83; dark ink 14.52, muted 6.63, amber 12.03,
  working 7.89, success 9.76, failed 6.15.
- `node --check` on the inline script: OK. All 33 `getElementById` targets exist.
  All original demo strings present verbatim (release + support, incl. failure texts).
  File is 43 KB (< 200 KB).
- Light + dark checked by token review (dark uses adjusted amber `#fbbf24` on `#451a03`,
  no grey-on-grey, borders visible in both themes).

## How to test
1. Open `index.html` in a browser (double-click or `python3 -m http.server` + visit it).
2. Watch release: steps advance with live timer/cost; approval `Ready to ship` appears with
   `Allow ⏎` / `Decline Esc` (auto-allows after ~6.5s); outcome `v3.2.0 is live · 14 changes`.
3. Watch it switch to support (`GPT-5`, `Support agent · ticket #4821`): thread → policy →
   orders FAILS once (`The orders sheet is locked` / `Orders sheet was locked`) with a
   `Retry ⏎` button, auto-retries after ~4s, then reply → close; outcome
   `Refund sent · ticket closed`. Then it cycles back to release, and so on.
4. Click any step or strip segment for details (failed row included); hover to highlight the chain.
5. Toggle sun/moon (top-right) for dark mode; set OS theme to check the default.
6. Narrow the window below 480px to check the stacked layout.
