# Project Flow — replica report

## What was built
`index.html` (27 KB, self-contained, no network, system fonts) — clean-room replica of
the affectUI "Project Flow" animated scene: a client task branching into subtasks,
notes and assigned roles.

Layout mirrors the original 2312×1644 stage as a responsive `.scene` (aspect-ratio
preserved, stacked list under 720 px):
- Top centre: `Client: Unify` + `Onboarded: 25 Jun`
- Centre: `Task: Web Design` + `Assigned to` + 2 avatars + `Tech-Stack` + 5 circular tools (Slack, Gmail, Figma, Framer, ClickUp)
- Right: `Client Notes` + `Updated: Today`; pill `Assigned Roles`
- Bottom-right: `Project Manager` / `Managing Project Progress` and `UX Designer` / `Designing UX Elements`, each with avatar, pixel-mark identity and `Tech-Stack` tools
- Left: `Subtasks: List Below` (3 avatars) and `Subtask 1: Create Wireframe` (+ 4 tools), dragged in with a dashed connector, hand dot, pulse + straighten settle
- SVG overlay connectors with dots, drawn in sequence; thin 3 px context progress bar + `Step n / 8` + `T+ss.s` clock (tabular-nums)

Header follows the v3 pattern: `Unify · Web Design` + `N working · 3 agents` (working count updates through the loop) + sun/moon theme toggle + Replay button.
Sub-cards are slightly smaller; tools are circular icons; sub-agent text is single-line ellipsis.

## Matched data / behaviour / timings (verbatim from demo-original.js)
All visible strings used verbatim — nothing invented:
`Task: Web Design`, `Assigned to`, `Tech-Stack`, `Subtasks: List Below`,
`Subtask 1: Create Wireframe`, `Client:`, `Unify`, `Onboarded: 25 Jun`,
`Client Notes`, `Updated: Today`, `Project Manager`, `Managing Project Progress`,
`UX Designer`, `Designing UX Elements`, `Assigned Roles`.
Tools (Slack/Gmail/Figma/Framer/ClickUp) from the original `pf-tile` classes; aria
`A client task branching into subtasks and assigned roles` kept on the scene.

Timeline replays the original CSS delays verbatim (ms): 0 client → 450 dot / 600 draw →
850 task → 1300 dots / 1500 draws → 1750 notes → 1800 roles → 2100 pm → 2500 dot /
2650 draw → 2900 ux → 3400 addon drag-in + dashed draw → 4050 arrow → 4180 pulse /
straighten → 4630 hand away → 5050 branch → 6000 complete → 7500 loop restart.
Default theme is light (original default `theme="light"`); toggle switches
`data-theme="light|dark"` with the required token sets.

## Interactions
- Theme toggle (persisted `pf-theme`), Replay button, click/Enter/Space opens a detail
  dialog (`role="dialog"`, `hidden` + explicit `[hidden]{display:none}`), Esc / outside
  pointerdown closes. Dialogs open on `pointerdown` capture so real clicks survive.
- Hover/focus highlights linked edges + cards via classes only — never re-renders.
- Keyboard: cards focusable, `focus-visible` outlines, Esc handling.
- `prefers-reduced-motion` disables transitions.

## v4 / v5 compliance
- `<head>` starts with `/*noflash*/` guard (stored key → `prefers-color-scheme`), inline
  `html{background}` + `<meta name="color-scheme">`.
- DOM built once at init (DOM API only, zero `innerHTML`); timers update
  `textContent`/`class`/`style`/`setAttribute` in place; SVG classes via `setAttribute`
  (no `.className`); no broad `.x svg` rule; loop restart reuses nodes.
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`;
  `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`;
  concentric radii (16/10/6); shadows for elevation, borders for structure; inset
  outline on avatars/tools; optical nudge on round toggle button.

## Verification (node only, no browser)
- `node --check .page-script.js` (app script extracted from index.html) — OK.
- In-dir stub harness `harness.cjs` (fake DOM + fake timers, files inside this dir only):
  advances timers 0 → 6100 ms through the full loop and asserts VISIBLE text (`.card.on`
  textContent, not just markup/aria), working/phase state, dialog open/close on
  `pointerdown` capture, hover with zero `innerHTML` writes, pixel-marks (3 marks ×
  exactly 9 cells), node identity (`===`) for every card + `h2` across a full loop
  restart, and theme toggle light→dark→light. Result: ALL HARNESS CHECKS PASSED.
- Dark checked: harness flips `data-theme` both ways without errors; markup strings are
  theme-independent and dark tokens (`#1c1c1f/#101012`, amber `#fbbf24/#451a03/#fde68a`)
  verified present; static checks confirm no external URLs and required tokens/media.

## How to test
Open `index.html` in a browser. Watch the ~7.5 s loop, click cards, toggle ☾/☀,
narrow the window for stacked layout. Or run `node harness.cjs` in this directory.
