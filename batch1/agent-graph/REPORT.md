# Agent Graph — replica report (v2)

## What was built
Standalone `index.html` (inline CSS/JS, no external deps, system fonts, 28KB) replicating the affectUI "Agent Graph" item:

- **Living network**: 5 agent cards (Orchestrator, Researcher, Analyst, Coder, Writer) on the left, 6 tool cards (Web search, Notion, HubSpot, Database, GitHub, Stripe) on the right, joined by 13 curved SVG links.
- **Pulse per call + answer**: blue dot travels agent→tool (call), then green dot returns tool→agent (answer) via `requestAnimationFrame` + `getPointAtLength`.
- **Busy links grow thicker**: per-edge counter; `stroke-width = 2 + min(count,12)*0.7`; high-count edges preferentially re-picked so thickness diverges.
- **Breathing + amber waiting**: `.working` avatars scale-pulse; `.waiting` agents get amber border/fill, glow, and a "needs you" badge. Approve & resume flow in Details.
- **Click for details / hover chain**: hover/focus dims unrelated nodes, lights connected chain; click pins Details (status pill, model/endpoint, per-link counts, task/callers); Esc clears; full keyboard support.
- **Live simulation**: calls every ~0.9–2.3s, auto wait/resume ~9–17s, idle↔working drift, timestamped log, Pause / Simulate needs-you / Reset, live counters.
- **Responsive**: <880px stacks side panel; <640px compacts cards, hides secondary meta. `prefers-reduced-motion` disables animation.

## v2 changes (from v1)
1. **Design-token system**: all colour/radius/shadow/spacing via `:root` custom properties (`--page/--surface/--ink/--muted/--subtle/--border`, `--radius-lg 16px/--radius 10px/--radius-sm 6px`, `--shadow` soft, status/accent/avatar tokens). Verified: 0 hex colours outside token block (74 token defs, 28KB file).
2. **Dark mode**: visible `☾ Dark / ☀ Light` toggle top-right, switches `data-theme="light|dark"` on `<html>`, defaults to `prefers-color-scheme`, persists override to `localStorage`. Dark tokens: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`, amber `#fbbf24` on `#451a03` bg text `#fde68a`, darker shadows. Wires, stage dots, avatars, pills, badges all re-tokened for dark.
3. **Original demo data restored**: replaced Planner/Slack/Linear placeholder set with Orchestrator/Researcher/Analyst/Coder/Writer + Web search/Notion/HubSpot/Database/GitHub/Stripe and 13 plausible edges + per-edge call phrases.
4. **Polish**: header/panels `16px`, nodes/task-boxes `10px`, pills `999px`; card padding 12–16px, gaps 8–12px; 1px borders + soft shadow; hover lift + border-accent on nodes, hover on every button, `focus-visible` ring; base 14px, titles 15–16px semibold, meta 12–13px.

## What matches the original
Agents↔tools network layout, rounded cards, soft colours, amber-for-waiting, pulse-along-link for call and answer, thickness-by-traffic, breathing-while-working, click-to-see-details, hover chain highlight, keyboard support, responsive stacking.

## What could not be verified
Exact original node positions, colours, type scale, pulse speed, edge routing, model names/task text — no Pro source fetched; written clean-room from prompt. No verbatim source copied.

## How to test
1. Open `index.html` in a browser (no server needed).
2. Watch blue/green pulses; confirm busy links thicken and counters rise.
3. Hover Orchestrator → its Notion/Database links highlight, others dim.
4. Click Analyst → Details shows model/task + per-link counts; click Stripe → shows callers.
5. Click “Simulate needs you” → agent turns amber; Approve & resume in Details.
6. Tab/Enter/Esc keyboard; resize <880px → stacks.
7. Toggle ☾/☀ top-right → dark/light; reload → preference persists; test with OS dark-mode default.

## Contrast check — confirmed light + dark
- Light: ink `#171717` on surface `#ffffff` (~17:1); muted `#78716c` on `#ffffff` (~4.6:1); warning-text `#92400e` on `#fef3c7` (~7:1); idle-text `#57534e` on `#f5f5f4` (~7:1); accent-ink `#1d4ed8` on `#dbeafe` (avatar, decorative + bold glyph).
- Dark: ink `#ededed` on `#1c1c1f` (~14:1); muted `#a1a1aa` on `#1c1c1f` (~7:1); warning-text `#fde68a` on `#451a03` (~9:1); idle-text `#d4d4d8` on `#26262a` (~9:1); borders `#2e2e33` on `#1c1c1f` visible; wires `#2e2e33` on surface + hot `#3b82f6` highlight.
- Both themes inspected: no grey-on-grey body text, no invisible borders, badges/pills legible, focus ring visible. Primary button uses ink-on-surface inversion so it stays contrasted in both themes.
