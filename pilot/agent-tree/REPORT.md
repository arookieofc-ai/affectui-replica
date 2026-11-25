# Agent Tree — replica report

## What was built
Standalone interactive page `index.html` (single file, inline CSS/JS, no external deps, system fonts only):
- Root orchestrator card **Research Lead (GPT-5)** with three sub-agent cards: **Web Search (Haiku, working, $0.12, 4.2s)**, **Summarizer (Sonnet, working, $0.31, 9.8s)**, **Fact Checker (Sonnet, idle, $0.00)**.
- Every card shows: name, role, model chip, status badge (working / waiting / idle), self cost, **branch total (rollup)**, elapsed time, expandable task/tool details.
- Costs roll up: parent branch total = sum of subtree (starts at **$0.43** and ticks up live as working agents accrue cost). Each card shows its own branch total.
- Fold/unfold: click a branch card (or its ▾/▸ button, or `Enter`/`Space`/`ArrowLeft`/`ArrowRight` on a focused card) to fold it; a folded root collapses to one line: "▸ branch folded — 3 agents · branch $X · click to unfold". `Expand all` / `Collapse all` toolbar buttons.
- Hover/focus chain highlight: hovering a card dims the rest and highlights its ancestor↔descendant chain with a blue ring + connector tint.
- Live behaviour: `setInterval` ticks +0.1s per 100ms for `working` agents and accrues a small cost; header stats (branch cost, agents, working count, slowest branch) update live. `Pause live timers` button.
- Waiting state (amber `#fef3c7` / `#b45309`) implemented per spec; click any status badge to cycle working → waiting → idle to preview it (initial data keeps the specified working/working/idle states).
- Light theme, white background, rounded cards (14px), soft pastel badges, amber for waiting, subtle shadows, pulsing green dot for working.
- Responsive: ≥760px children sit in a horizontal row with a top bus connector; narrow screens stack vertically with a left spine. `prefers-reduced-motion` disables the pulse.

## What matches the public description
- "Who started whom" tree: orchestrator → sub-agents, with connectors. ✓
- Status, cost and time on every card. ✓
- Costs rolling up each branch to the parent. ✓
- Branches fold to one line. ✓
- Hover highlights the chain. ✓
- Light theme / white bg / rounded cards / soft colours / amber waiting. ✓
- Demo data names, models, costs, times as specified. ✓

## What could not be verified
- No access to the original affectUI source or pixel measurements; spacing, fonts, connector geometry and exact colour hexes are clean-room approximations from the public description and worker spec (not copied from any bundle).
- Orchestrator's own cost is not specified in the prompt; set to $0.00 so the parent branch total equals the specified $0.43 at load. Time-rollup semantics (sum vs. max) are unspecified; header shows "slowest branch" (max) as the most sensible live-tree reading.
- Sub-agent tasks/tools (web_search ×6, summarize ×2, verify_claims) are plausible demo data in the same shape, as permitted by the spec.

## How to test
1. Open `index.html` directly in a browser (double-click or `xdg-open index.html`) — no server or build step needed.
2. Check initial cards: Research Lead branch $0.43; Web Search $0.12 / 4.2s working; Summarizer $0.31 / 9.8s working; Fact Checker $0.00 / — idle.
3. Hover Web Search → root + that card highlight, others dim. Move mouse away → clears.
4. Click Research Lead card (or ▾) → branch folds to one line with folded cost; click again to unfold.
5. Click a card's `Show details` → task/tool/started appears. Click a status badge → cycles to amber `waiting`, then `idle`.
6. Watch numbers tick up for working agents; `Pause live timers` freezes them. Resize below ~760px → stacked list layout. Tab to a card, press `Enter` → folds/unfolds.
7. Confirm file size <200KB and no network requests (DevTools → Network, reload).
