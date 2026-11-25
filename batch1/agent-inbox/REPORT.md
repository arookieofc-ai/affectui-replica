# Agent Inbox — replica report

## What I built
Standalone `index.html` (single file, inline CSS/JS, no external deps, system fonts only): a calm background-tasks inbox.

- Header: logo, "Agent Inbox / background tasks", live pill (`live · 5 tasks · N need you`) with pulsing dot.
- Filter tabs: **All / Needs you / Running / Done** with rolling count bubbles. Done = done + failed (so failed items aren't orphaned).
- 5 demo tasks covering all states: 1× working, 2× waiting, 1× done, 1× failed (titles/agents/tools are plausible demo data in the described shape).
- Each row: status dot, title, status pill, live elapsed clock (`mm:ss`, ticking every second; frozen for done/failed), agent/tools meta, chevron.
- Click a row to unfold the last 3–4 steps (timeline with ✓/●/◷/! ticks) plus contextual actions:
  - waiting → Approve / Reject / Open
  - failed → Retry / Open
  - working → Open live / Cancel
  - done → Open / Re-run
- Actions mutate state and the card **glides to its new place** via FLIP position animation; counts roll (translateY pop). Filtering to a tab the item no longer matches fades it out of view; in All it stays and animates in place.
- Status colours: blue working (pulsing), amber waiting, green done, red failed; light theme, white cards, rounded 16px, soft pastel pills.
- Keyboard: ↑/↓ moves + opens, Enter toggles focused row, Esc collapses. Focus-visible outline. Responsive: side cluster stacks under title below 560px. `prefers-reduced-motion` disables animation.
- Toast confirms every action.

## What matches the original (from public description)
Layout (calm single list), live clocks + status tags, filter tabs with counts, click-to-unfold steps, Approve/Reject/Retry/Open actions, glide-on-move, light rounded-card aesthetic with amber for waiting.

## What I could not verify
No live original URL or Pro source was provided/fetched in this workdir — only the public description in the prompt. Demo names, step text, and exact timings are invented. Exact original sort order, count semantics (whether Done includes failed), and motion curves are approximations.

## How to test
Open `index.html` in a browser (double-click or `python3 -m http.server` + visit). Click tabs, unfold rows, press Approve/Reject/Retry and watch counts roll and cards glide. Check narrow width (~360px) for stacked layout.
