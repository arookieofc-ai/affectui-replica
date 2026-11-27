# Settings / Teams (slug settings-members) — replica report

## What was built
Single self-contained `index.html` (inline CSS/JS, no external deps, ~46KB) replicating affectUI Settings / Members & teams:
- Header: Settings back pill + theme toggle (top-right), title `Members & teams`, sub `Invite people, set what they can do and group them into teams. Learn more`.
- Tabs `Members` / `Teams` (role=tablist).
- Members panel:
  - Stats: Members count + `N active · M invited`, Seats `N of 10` with thin bar, Admins + `Can invite, remove and bill`.
  - Note: `Extra usage and spending limits are set on Usage & limits.` (button toasts).
  - Toolbar: search `Search name or email` (240px), Role filter menu, Export, Invite members popover.
  - Invite popover: `Invite to the workspace`, `They get an email with a link to join.`, email field, Admin/Member/Viewer radiogroup with Arrow-key nav, Send invite disabled until valid email.
  - Bulk bar: `N selected`, Change role, Remove, Clear.
  - Table: Name / Role / Plan / Usage / Actions, select-all with indeterminate, avatar (initials + hue), `(You)` for alex, `Invited` pill for sam, role picker, plan chip (`Business` tinted), usage bar + %, `—` for invited, more menu (Resend invite / Cancel invite / Remove).
  - Empty: `No members yet`, search-empty `No one found` with quoted query, Clear search.
- Teams panel: `N teams`, New team, rows with letter mark, member count, overlapping avatars + `+N`, Delete team. Empty `No teams yet`.
- Toast (`aria-live=polite`) for: invite sent, already in workspace, removed, set to role, is now role, moved to plan, exported, created, deleted, Usage link, Back.
- Export CSV: `Name,Email,Role,Plan,Status` with quoting, Blob download `members.csv`.

Demo data used verbatim from `./demo-original.js`:
`alex/Admin/Business/.68`, `jonas/Admin/Business/.42`, `mara/Member/Pro/.81`, `lea/Member/Pro/.23`, `tom/Viewer/Free/.05`, `sam/invited/Member/Pro/0`, teams Product[alex,jonas,mara], Marketing[lea,tom], Engineering[jonas,mara], ROLES Admin/Member/Viewer, PLANS Business/Pro/Free, SEATS=10, ME=alex. Initials/hue/email-regex logic matches original (`reduce(*31)%360`, `/^\p{L}/u`, `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).

## Matches original
Layout, card styles, spacing, pills, stats grid with dividers, seats bar, note, toolbar, table grid `36px 1fr 120px 110px 120px 36px`, responsive collapse to `28px 1fr 92px 36px` hiding Plan/Usage under 760px, avatar hues, role/plan pickers, bulk bar, teams faces, toasts.

## In-place updates / clean-room
- Built DOM once at init with `createElement`/`textContent` only. No `innerHTML` anywhere (static check + runtime counter).
- `renderMembers`/`renderTeams` mutate only changed nodes: text/style/attrs on existing rows, `display:none` for filtered out, `appendChild` reorder (identity preserved), new nodes only for invites/teams, removed nodes detached. No full re-render from timer/hover/focus.
- Own class names (`st-` avoided, used semantic names), own SVG icons (shield/user/eye hand-drawn), own CSS from tokens. No copied bundle source.

## v5 polish
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`.
- `html{-webkit-tap-highlight-color:transparent}`.
- `body{font-variant-numeric:tabular-nums}` (counters/seats/usage).
- Concentric radii via `calc()` (e.g. tabs `radius+2` / tab `radius-1`).
- Borders for structure (`1px solid var(--border)` on cards/inputs/menus), shadows for elevation.
- `img` inset outline rule (light black 10% / dark white 10%).
- Icon buttons nudged (`padding-left` ~2px less on icon side, `+`/`⋯` optical alignment).

## Dark mode + no-flash
- `<head>` starts with `/*noflash*/` script reading `ui-st-theme` else `prefers-color-scheme`, plus `html{background:#fafaf9}html[data-theme=dark]{background:#101012}` and `<meta name=color-scheme>`.
- Toggle `data-theme light|dark` on `<html>`, persists to `localStorage`. Tokens for both themes defined, amber adjusted for dark (`#fbbf24` on `#451a03`).
- Checked both: harness asserts visible text in light AND dark, manual open also finished (no grey-on-grey, borders visible).

## What could not be verified
- Pixel-perfect vs original screenshots (no image access in this env).
- Real `prefers-color-scheme` default in headless stub (forced via `matchMedia` stub; manually reasoned).
- CSV download click in real browser (Blob path guarded, toast verified).
- Focus-ring visuals and container-query exact breakpoint vs original `@container` (used `@media` 760px equivalent).

## How to test
- `node --check` on extracted inline scripts (syntax) + `node ./harness.js` in this directory. Harness asserts: VISIBLE painted text (names, teams, seats of 10, invites), full-loop node identity (6 rows same objects across filter/tab/select loop), zero `innerHTML` writes after init, light AND dark themes.
- Open `index.html` in a browser: search `mara`, filter Role=Admin, select rows for bulk Change role/Remove, Invite `new@acme.com`, switch to Teams → New team → Delete, toggle sun/moon, narrow window to ~360px, Export.

## Verification log
- `node --check inline` OK, `node --check noflash` OK, `node --check harness` OK.
- `node ./harness.js`: all PASS (visible text, node identity, zero innerHTML, light+dark, invite in-place).
