# agent-chat-rail — REPORT

Slug: `agent-chat-rail` (App screens).
Public description: Assistant chat with web search, icon rail, project switcher, findings on right.

## What was built
Single self-contained `index.html` (29 KB, inline CSS + JS, system fonts only, no external deps).
Clean-room implementation from the public description + `./demo-original.js` behaviour; no compiled source copied.

Layout (double sidebar):
- Left icon rail: Chats (active), Tasks, Runs, Folders, Integrations; bottom Notifications (badge 2), Settings.
- Project switcher + chat list sidebar: `New chat` button, Projects (Summer collection, Brand, Hiring, Research with counts), 9 chats verbatim with pinned 📌 (Tone of voice) and unread dot (Linen suppliers in Portugal). Active `c-fabric`.
- Center Assistant chat: header `Summer collection • Assistant` + title `Best fabric for a summer overshirt`, status pill (`○ idle` / `● N working`), `1 agent`, context `18k / 200k` with thin 3 px bar (right-aligned). Messages verbatim (u1/a1/u2/a2), tool rows as small circular icons (⌕/◍/▦ + label + ms + ✓), artifact chips.
- Right Findings panel: `fabric-comparison.csv` table (5×5 verbatim, € prices) + `sources.md` (title Sources, intro, 6 bullets verbatim), both `Updated Just now`.

Interactions:
- Rail / project filter / chat switch (dims non-selected at 0.78 opacity, single-line ellipsis titles), New chat → empty state (`New chat`, no artifacts), chat click restores.
- Composer placeholder `Ask anything – it searches the web`; Enter/Send appends user msg immediately, streaming agent reply after 700 ms (`Searched the web for "…"`, `Here's what I found: … supplier brief?`), working pill 0→1→0, streaming caret + pulsing 3×3 pixel-mark, caret removed after 3200 ms. Timers update nodes in place only.
- Artifact chips flash the matching finding card. Theme toggle ☀/☾ top-right. Responsive: ≤1180 px findings go 2-col below; ≤820 px single-column stacked. Keyboard: Enter to send, all buttons focusable with focus-visible outline.

## Spec compliance
- Tokens via CSS custom properties; light (`--surface #ffffff`, `--page #fafaf9`, …) and dark (`#1c1c1f`/`#101012`/`#ededed`/`#a1a1aa`/`#26262a`/`#2e2e33`); amber waiting `#f59e0b/#fef3c7/#92400e` → dark `#fbbf24/#451a03/#fde68a`; radius-lg 16 / radius 10 / sm 6; shadow tokens; pills 999 px; card padding 12–16, gaps 8–12; transitions 150–200 ms.
- v3: header project + working + agent counts; context as `18k / 200k` tokens with 3 px bar; deterministic 3×3 pixel-mark per agent id (FNV hash, HSL), live one pulses; tools are 24 px circular icons; dimmed opacity 0.78 (≥0.75); titles single-line ellipsis; chips have bottom padding; headings reserve space.
- v4: `<head>` starts with `/*noflash*/` script (stored key `agent-chat-rail-theme` else `prefers-color-scheme`) + `html{background…}` paint guard + `meta color-scheme`. DOM built once at init; ticks/sends mutate text/class/attributes only; zero `innerHTML` in app script; node identity preserved across loops.
- v5: all `:hover` (10 rules) inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radius (card 16 = inner 10 + padding); shadows for elevation, borders only on dividers/cells/inputs/selected; `img` inset outline via `outline:1px solid var(--img-outline)`; send button optical padding nudge.

## Verification (node only, no browser)
- `node --check ./verify.js` + extracted app script `node --check` — clean.
- `node ./verify.js` (in-dir DOM-stub harness) — ALL CHECKS PASSED:
  - 38 verbatim visible-text strings (titles, messages, tools, table, sources, projects, rail, placeholder, `18k / 200k`).
  - Static: noflash/meta/paint-guard/toggle/tokens/amber/tabular/tap-highlight/hover-media/3 px bar/pixel-mark.
  - Stub execution: painted header/chat/findings; theme light→dark→light; full send loop ×2 preserves first-4 node identity in order, appends streaming reply, zero `innerHTML` writes after init.
- Checked light AND dark (toggle asserted in stub; CSS tokens for both).

## What could not be verified
- No browser installed/launched per instructions; no pixel screenshot vs original. Dark/light judged via tokens + stub toggle, not visual QA.
- Model list `r`, `running:{running:0,needs:0}`, `decisions:[]` from demo chunk have no visible surface; represented as `0 working • 1 agent` header.
- Relative times (`Just now`, `6 min ago`) simplified to `Just now` with a 5 s in-place tick; original timestamps approximated.

## How to test
- `open index.html in a browser` (or any static server), toggle ☀/☾, switch projects/chats, send a message, click artifact chips, narrow the window.
- Re-run checks: `node ./verify.js` in this directory.
