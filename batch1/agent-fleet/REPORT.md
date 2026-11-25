# Agent Fleet — replica report

## What was built
Standalone `index.html` (inline CSS/JS, no external deps, system fonts) replicating the public
"Agent Fleet" description: 3 fleet cards side by side, each summarising its sub-agents; clicking a
card opens its sub-agent tree in a panel on the right, and opening another card folds the previous
tree back (single-open accordion). Clicking the open card again also folds it back.

Demo data (plausible, per task brief):
- **Support Fleet** (4 sub-agents): Triage, FAQ Resolver, Escalation Handler, CSAT Follower — $4.82
- **Sales Fleet** (3): Lead Qualifier, Outreach Writer, Deal Closer — $3.15
- **Ops Fleet** (5): Scheduler, Inventory Watcher, Invoice Reconciler, Incident Responder, Report Builder — $6.40

Each card shows: status pill (working / waiting / idle / active mix), sub-agent + open-task + working
counts, working/waiting/idle bar + legend, cost today, and a View/Fold toggle.
Tree panel shows: fleet root → sub-agent nodes with status dot, model chip, current task, tool chips,
cost, progress bar; clicking a node expands its step list. Hover/focus on a node highlights the
root→node chain. Header has live badge, status filter, search; totals row shows fleets / sub-agents /
open tasks / cost.

Interactions: card click, keyboard (Tab, ←/→ between cards, Enter/Space toggle, Esc close/fold),
search + status filter, pause/resume live ticks, live simulation every ~2.6s (progress advances,
occasional working⇄waiting flips with amber pulse, idle at 100%, costs creep; cards + tree + totals
stay in sync). Light theme, white cards, rounded 16px, soft pastels, amber `#f59e0b`/`#fef3c7` for
waiting. Responsive: ≤1020px panel stacks below cards; ≤700px single column.

## What matches the original (from public description)
- Side-by-side fleet cards with per-card sub-agent summary, status, counts, cost.
- Click-to-open tree on the right; last open tree folds back when another opens.
- Light theme, rounded cards, soft colours, amber for waiting; working/waiting/idle states.
- Hover/focus chain highlight; keyboard support; responsive stacked layout on narrow screens.

## What could not be verified
- No access to the real affectUI Pro source or exact pixels/fonts/spacing — colours, type scale,
  icons, and tree connector styling are close approximations, not measurements.
- Exact original sub-agent names/tasks/costs are unknown; demo data above is invented in the same
  shape (noted per REPLICATE_SPEC.md allowance).
- Original timer cadence / animations approximated with a 2.6s tick and CSS pulses.

## How to test
1. Open `index.html` directly in a browser (no server/build needed).
2. Click "Support Fleet" → tree appears right; click "Ops Fleet" → Support folds, Ops opens.
3. Click a sub-agent node → step list expands; hover nodes → root highlights.
4. Try search ("refund"), filter "Waiting", `←/→` + `Enter` + `Esc`, and Pause ticks.
5. Resize below ~700px → cards stack, panel goes full-width below.

Clean-room: written from scratch from the brief; no fetched bundle code copied.
