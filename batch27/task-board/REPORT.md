# Task Board — replica report

## What was built
Standalone `index.html` (48 KB, inline CSS+JS, system fonts only) replicating the affectUI **Task Board** (slug `task-board`, Productivity): Kanban with drag-and-drop, quick add, detail panel, search, label filters, compact view.

- Header: `Northwind / Launch / Sprint 12` crumbs + favorites star; bar with `11 tasks` (`of N` when filtered) + search + label-filter menu + compact toggle.
- Columns: Todo / In review / In progress / Done with status icons (grey/purple/amber/blue), counts (999+ cap), per-column `+` quick-add, `Show N more` (limit 50), `Drop tasks here` / `No matching tasks` empties.
- Cards: key, assignee initial, title (3-line clamp), props row (priority bars / urgent pink `!`, estimate `M/L/XL`, due `2d/1d/4d/Today`, subtask ring `2/4`, PR `#412`, label dots with `+N` overflow), `Created …` line. Compact mode hides props/created.
- Detail panel: slide-in dialog with scrim, key, close, title textarea, Status radiogroup, Priority radiogroup (Urgent→No priority), Labels toggles, Assignee toggles, `Created …` + `Delete task`. Focus trap on Tab, Esc closes, scrim click closes, arrows/Home/End in radiogroups.
- Drag-and-drop: HTML5 DnD with 3px drop bar, column highlight, drop reorder within/across columns.

## Demo data (verbatim from demo-original.js)
Statuses, labels (`Website #4fb0fe`, `Billing #a651f0`, `Mobile #13b3a0`, `Bug #ee3e9e`, `Feature #a9d9ff`), people (Mara Lindqvist, Jonas Weber, Lena Hart, Theo Brandt, Sofia Marin), path, priorities, and all 11 tasks/keys/titles/estimates/due/subtasks/PRs/created dates used as-is. Avatars replaced by initial chips (no external images); noted below.

## Matches / could not verify
- Matches: layout, card styles, tokens, counts, search (`key + title`), multi-label filter + clear, compact, quick-add (Enter/blur/Esc), DnD reorder, panel editing, delete, keyboard, responsive stacked columns, reduced-motion + coarse-pointer rules.
- Could not verify against live original: exact status glyph paths, overlay/shadow pixel values, `component-*.js` status-icon component rendering, avatar images (`/avatars/*.jpg` unreachable offline — initials used), `board-demo` scaling wrapper (1240px frame) outside the component. No fetched JS was copied; clean-room implementation with own class names.

## v5 polish
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radius (board 20px = 16+4); borders for structure + layered shadows for elevation; avatar images get 1px inset outline (light black 10% / dark white 10%); icon buttons use asymmetric padding (icon side ~2px less) for optical alignment.

## No-flash + in-place updates
- `<head>` starts with `/*noflash*/` script (reads `task-board-theme` or `prefers-color-scheme`, sets `data-theme` before paint) + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `meta color-scheme`.
- DOM built once at init; `sync()` only mutates `textContent`/classes/attributes/`hidden`/order via `appendChild` moves. Zero `innerHTML` writes anywhere (static + runtime enforced).

## How to test
Open `index.html` in a browser. Verify with node only:
- `node --check harness.js` (syntax)
- `node harness.js` → asserts VISIBLE painted text (all 11 titles, crumbs, `11 tasks`), full-loop node identity (search→filter→compact→panel cycle keeps `===` card/slot objects), zero `innerHTML` writes after init, and light AND dark themes (visible text intact in both).
- Result: `HARNESS OK: visible text ✓  node identity(full loop) ✓  zero innerHTML ✓  light+dark ✓`
- Checked 2026-11-27: 48 KB, no external deps, no browser install used.
