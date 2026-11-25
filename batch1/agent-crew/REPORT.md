# Agent Crew — replica report (v2)

## What was built
Standalone `index.html` (inline CSS/JS, ~32KB, no external deps, system fonts) replicating the "Agent Crew" live tree:
- Lead `Orchestrator` (GPT-5) on top, three sub-agents below (`Researcher` / Haiku, `Coder` / Sonnet, `Reviewer` / Sonnet).
- Each card shows: current task ("Doing now"), context-full % + progress bar, tool chips, last-handoff line, status dot + pill (working / waiting / idle / paused).
- Handoffs as light: SVG rounded cubic-Bezier connectors lead→crew; amber glowing dot travels via `getPointAtLength`, target card flashes + handoff text updates. Auto every ~5s + "Send handoff" button.
- Click opens details drawer (task, model, context/tokens/cost, tools, last handoff, activity log). Esc closes; ←/→ cycles agents.
- Project switcher (Website Redesign / API Migration / Launch Brief).

## v2 fixes (vs v1)
1. **Design tokens, no ad-hoc hex**: all colour lives in `:root` / `html[data-theme]` custom properties (`--page/--surface/--ink/--muted/--subtle/--border/--wire`, status `--working/--waiting/--idle/--failed`, `--accent`). Verified: every `#hex` in the file is inside a token definition; components reference only `var(--*)`.
2. **Dark mode**: visible sun/moon toggle (top-right, `🌙/☀️`, `aria-label`, 999px circle) switching `data-theme="light"|"dark"` on `<html>`. Default from `prefers-color-scheme` (inline head script, no FOUC), toggle persists to `localStorage`. Dark tokens per spec: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`; amber waiting adjusted (`#fbbf24` on `#451a03`, text `#fde68a`).
3. **Original demo data**: tools now exactly the required set — Orchestrator `Linear/Notion/GitHub/Vercel`, Researcher `Notion/GitHub` (+`Linear` variant), Coder `GitHub/Vercel`, Reviewer `Linear/GitHub` (`Linear/Vercel` variant). Drawer actions are now the required six: **Approve / Decline / Pause / Stop / Resume / Retry** (2×3 grid), each updating status/log/toast (Approve→working, Decline→waiting+hand-off, Pause↔paused, Stop→idle, Resume→working, Retry→context 12%+working).
4. **Polish**: card/tree/toolbar radius `16px` (`--radius-lg`), buttons/boxes `10px` (`--radius`), pills `999px`; 1px border + soft shadow `0 1px 2px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.05)` (darker in dark); card padding 12–16px, gaps 8–12px; hover lifts (`translateY(-2px)` + lift shadow), focus-visible `2px accent` outline, 180–200ms transitions; `prefers-reduced-motion` guard.

## Contrast check (light + dark)
- Light: ink `#171717` on `#ffffff` ~17:1; muted `#78716c` on `#ffffff` ~4.6:1; waiting `#92400e` on `#fef3c7` ~6:1; working `#166534` on `#dcfce7` high.
- Dark: ink `#ededed` on `#1c1c1f` ~14:1; muted `#a1a1aa` on `#1c1c1f` ~6:1; waiting `#fde68a` on `#451a03` ~9:1; working `#bbf7d0` on `#052e16` high.
- Borders `--border` vs surfaces visible in both; wires `--wire` distinct from background in both; no grey-on-grey text. Checked by token values + visual pass: page loads in both themes, cards/pills/tools/drawer/toast legible, no invisible borders.

## What matches the original
Lead-over-crew tree, rounded cards, amber waiting state, per-card context meter, tools + last-handoff per card, animated handoff light along rounded connectors lighting the target, click-to-open task/model/usage/tools + steer actions, project switcher, hover/focus chain highlight, responsive stacking <860px.

## What could not be verified
No access to original Pro source or pixel-perfect demo visuals — spacing/palette/typography/drawer/handoff physics are clean-room interpretations of the description + v2 spec.

## How to test
1. Open `index.html` in a browser (no server). Toggle OS dark mode → page follows; click 🌙/☀️ top-right → switches and persists.
2. Wait ~5s: amber dot travels a connector, card flashes, "Last handoff" updates. Hover card → chain highlights. Click/Enter → drawer with Approve/Decline/Pause/Resume/Stop/Retry.
3. Switch projects, Pause live, resize <860px (stacks), Esc/←/→ in drawer. Confirm light AND dark: toggle sun/moon, check cards, pills, tools, drawer, toast all legible.

## Clean-room note
Written from description + spec; no fetched bundle code copied.
