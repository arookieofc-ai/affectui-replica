# Kanban Board — replica report

## What was built
Standalone `index.html` (56 KB, no external deps, system fonts only) replicating affectUI **Kanban Board** (`slug kanban`, screen, App screens, Pro).

Public description: *Issues board by priority with drag-and-drop, list view, filters, sorting.*

Layout:
- Left sidebar: `Inbox (3)`, `Activity (2)`, `My issues`, `Board` (active), `Projects`, plus `Problems` group (`Password reset emails failing`, `Payments failing for some users`, `Dashboard loads slowly`).
- Header bar: `Inbox / Overview` breadcrumb (or `Inbox / Overview / #10x Title` in issue view), favorite star (`Add to favorites` / `Remove from favorites`), tools `Filter`, `Sort by`, `Board`/`List` segmented view, theme toggle (sun/moon, top-right), and in issue view `n / total`, `Previous issue`, `Next issue`, `Close issue`.
- Toolbar: scopes `All tasks` / `Open` / `Completed` with counts + `New task`.
- Board: 4 columns `Low priority`, `Medium priority`, `High priority`, `Completed` with priority bar-mark icons, count badges, cards, `No issues` empty state, `New task in <column>` add button, drop indicator line.
- Cards (verbatim): 11 issues k1–k11 (`#101`–`#111`) with title, 2-line description (`No description` fallback), footer `Ready for review` / `Needs attention` / `In progress` / `Fixed` + comments `◱ N` + attachments `⌁ N`.
- List view: grouped rows with `#id`, title, description, status + counts.
- Issue detail: editable title/description, `Attach` / `Copy link`, `Sub-issues` (`Reproduce it on staging` done, `Write a fix and a test` open, `Add sub-issue`, `Name the sub-issue and press Enter`), `Activity` (`Subscribe`/`Unsubscribe`, `created the issue · 3 days ago`, `set the priority to … · 2 days ago`, `I can reproduce it on staging – the logs are attached. · Yesterday`, reply `Leave a comment…`, `Send comment`), `Details` (`Status`, `Priority`, `Assignee`, `Labels`, `Project`, `#id · created 3 days ago`). Assignee/label/project derived verbatim: `Mara Klein, Jonas Weber, Lea Braun, Tom Fischer` / `Bug, Auth, Billing, Performance, Mobile, Web` / `Q3 Reliability, Checkout revamp, Onboarding`.
- Create modal: `Create task`, `Goes to the <column> column`, `What needs to happen?`, `Add details, steps or links…`, `Attach files`, side `Status/Priority/Assignee/Labels/Project` (`Nobody`, `None`), footer `Create another`, `Cancel`, `Create task ⌘↵`, `Bigger window`/`Smaller window`, `Close`.
- Toasts: `Moved to …`, `… created`, `changed the status to …`, `assigned it to …`, `Link copied`, `Attach a file – open your picker here`.

Interactions: drag-and-drop (HTML5, drop line, `Moved to` toast), click/Enter/Space to open, Esc to close, prev/next navigation, filter menu (show columns), sort menu (`Manual`, `Title`, `Most comments`), scope tabs, board/list toggle, favorite toggle, sub-issue checkboxes, comment post, assignee/status/priority cycling, theme toggle. Responsive: sidebar hides <900px, columns 248px scroll-x, row text/counts hide <640px.

## Demo data
Used verbatim from `demo-original.js`: `ce` columns, `le` 11 cards, `R`, `z`, `B`, `V`, `oe`/`se` nav, ID format `#${100+n}`, initials avatar, status/priority icons. No invented tasks. Clean-room: all HTML/CSS/JS rewritten; no copied bundle source or CSS.

## Matches / fidelity
- Header/toolbar/board/list/issue/modal structure, labels, counts, empty states match parsed strings.
- Priority marks (3 bars, low=1 blue / medium=2 amber / high=3 red, done=check green) and status icons (review half-circle blue, progress quarter purple, attention triangle amber, fixed dot green) re-drawn as inline SVG.
- Design tokens via CSS vars, light + dark per spec; cards 1px border + soft shadow, hover lift, focus-visible outline, 150–200ms transitions, pills 999px.
- v3: single-line ellipsis titles, opacity ≥0.75 (drag 0.4 only on dragged node), reserved 36px column header space, bottom padding kept.
- v4: `/*noflash*/` guard first in `<head>` + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `meta color-scheme`; DOM built once, all later renders mutate nodes in place (`textContent`/attrs/`appendChild` reorder), no `innerHTML` anywhere.
- v5: all `:hover` (17 rules) inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (col 20px = card 16px + 4px padding, modal 22px, menu 12px); shadows for elevation / borders for structure; icon buttons use 8px icon-side / 10px text-side optical padding. No content images.

## Could not verify
- Pixel-perfect colors/spacing vs live Pro build (no browser screenshot; verified by code inspection against extracted `ye` CSS strings only for behavior, not copied).
- Native drag image / touch drag on mobile; coarse-pointer heights adjusted but not device-tested.
- Clipboard `Copy link` in sandboxed file:// (falls back to toast).
- Full screen-reader announcement order.

## How to test
1. Open `index.html` in a browser (double-click or `python3 -m http.server` then visit).
2. Toggle Board/List, Filter (hide a column), Sort by Title / Most comments, scopes All/Open/Completed.
3. Drag a card across columns; click a card for issue view, step with ↑/↓, Esc to close.
4. `New task` → create; check toast + new `#112…` card.
5. Toggle sun/moon; reload to confirm persistence; test `prefers-color-scheme` with no stored key.

## Verification (node only, in-dir, no browser)
- `node --check` on extracted `<script>` — passes.
- In-dir DOM-stub harness (vm + FakeElement):
  - VISIBLE painted text contains `Reset password flow issue`, `Low priority`, `All tasks`, `Board`, `Inbox`, `Ready for review` — PASS.
  - Full-loop node identity (Manual→Title→Most comments→Manual, all→open→done→all, board→list→board, select→close): same `article` objects — PASS.
  - Zero `innerHTML` writes after init (static grep + runtime counter) — PASS (0).
  - Light AND dark: `data-theme` light default via noflash, `setTheme('dark'/'light')` switches, CSS contains both token blocks — PASS.

Checked 2026-11-26. Default theme follows `prefers-color-scheme`; toggle overrides via `kanban-theme`.
