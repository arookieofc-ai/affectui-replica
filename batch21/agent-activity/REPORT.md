# Agent / Activity — rebuild report

## What was built
ONE self-contained `index.html` (41KB, no network, system fonts) replicating the **Agent Activity** daily grouped log from `demo-original.js`. Clean-room code from observed behaviour; no compiled source copied.

Layout: header (`Activity` + segmented tabs + search) + scrollable grouped list + sticky detail panel (`Step details`). Responsive: two columns ≥900px, stacked below. Theme toggle top-right (`Light`/`Dark`, `localStorage` key `affectui-activity-theme`).

## Matched data (verbatim from demo-original.js)
- Apps: Gmail `alex@fieldwork.co`, Slack `Fieldwork workspace`, GitHub `fieldwork-labs`, Google Drive `Shared drive · Clients`, Stripe `Fieldwork GmbH`, Google Calendar `alex@fieldwork.co`, Web `Browser`.
- 9 items with exact texts, tasks, rules, details, previews, undo `how`, finals, costs:
  - `a1` Sent the weekly update to Priya Shah / Weekly update / approved / Send email to clients / To `priya.shah@northwind.com`, Subject `Northwind – week 46` / preview `Hi Priya – three things…` / undo `Recalls the email – it’s still unread` (30min) / €0.04
  - `a2` Refunded 38 € to Hannah Kim / Billing webhooks / auto / Issue refunds · up to 50 € / Customer/Amount `38,00 €`/Reason `Charged twice on Nov 18` / final `Refunds can’t be taken back…` / €0.02
  - `a3` Posted the staging link in #platform / auto / Post in project channels / preview `Staging is up…48 of 48 tests pass…` / undo `Deletes the message from #platform` (24h) / €0.01
  - `a4` Opened pull request #482 – Retry failed billing webhooks / auto / Open pull requests / Repository `fieldwork-labs/platform`, Changes `6 files · +214 −38` / undo `Closes the pull request` (7d) / €0.31
  - `a5` Booked a review call with Tom Becker for Thursday 10:30 / Onboarding emails / approved / Book meetings with clients / undo `Cancels the meeting and tells Tom` (2d) / €0.01
  - `a6` Created “Northwind – ingest design” in Clients / Ingest pipeline / auto / Create documents / undo `Moves the document to the trash` (30d) / €0.12
  - `b1` Merged #479 – Move our apps to API v2 / API migration / approved / Merge to main / final `Merged code can’t be unmerged here…` / €0.08
  - `b2` Sent an invoice reminder to Lumen Studio / approved / undone:true / final `Recalled – Lumen Studio paid an hour later` / €0.03
  - `b3` Asked Tom Becker for the staging keys / approved / final `Too long ago to take back` / €0.01
- Labels verbatim: Activity, All, On its own, You approved, Undone, Search activity, Undo, Undone, Final, Today, Yesterday, What happened, Why it could, Taking it back, Task, When, Cost, `You approved it {when}`, `It asked first…`, `It did this on its own – the rule allows it`, Rule, Permissions, Open task, `Possible for {left}`, `Taken back just now`, `Nothing open…`, `Nothing yet…`, `Nothing matches…`, `Show all`, etc.
- Behaviour: sort newest-first, tabs with counts (9/4/5/1), search across text+task+app name, grouping by calendar day (`Today`/`Yesterday`/weekday), 30s `now` tick updating relative times (`just now`, `x minutes ago`, `Possible for…`) and undo expiry, undo sets `undone`, strike animation 520ms + tag pop, live-region `Undone: …`, struck cleared after 1200ms, keyboard `/`, `j`/`k`, `u`, `ArrowUp/Down`, `Esc`, preview clamp 6 lines with `Show all`/`Show less` when overflow, costs via `Intl EUR`.

## Design / polish (spec v2–v5)
- Tokens for all colours; light default (original demo light): surface `#ffffff`, page `#fafaf9`, ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`; dark: `#1c1c1f`/`#101012`/`#ededed`/`#a1a1aa`/`#26262a`/`#2e2e33`; amber preserved per theme.
- `/*noflash*/` guard first in `<head>`, inline `html{background…}`, `meta color-scheme`.
- In-place updates only: DOM built once at init, timer/hover/focus never call `innerHTML`; rows/sections reused, panel fields updated via `textContent`/hidden/attributes; loop restart updates in place.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radii (outer = inner + padding), shadows for elevation / borders for structure, `[hidden]{display:none}`, SVG created via `createElementNS` + `setAttribute` only.
- No agent pixel-marks: component identities are apps (letter tiles), not agent IDs — original uses app logos/tiles, so no 3×3 marks added.

## Verification
- `node --check extracted.js` (extracted from `index.html`): **PASS**.
- In-dir harness `node verify-harness.cjs` (DOM stub, no external deps):
  - static: noflash, color-scheme, `[hidden]`, tap-highlight, tabular-nums, hover-media, data-theme — PASS
  - page runs, 23 visible strings (titles, Today/Yesterday, tabs, search placeholder, a1 details/preview/undo, approved/auto texts) — PASS
  - counts 9/4/5/1; a3/a4/a6 detail selects — PASS
  - 32-day loop with `tick()`: node identity preserved, zero `innerHTML` writes after init — PASS
  - expiry → `Final`, undo → `undone` + strike + identity preserved — PASS
  - search, no-match `Show all`, undone tab — PASS
  - dark theme visible intact, light theme visible intact, tokens for both — PASS
  - `ALL HARNESS CHECKS PASSED`
- Light AND dark checked via attribute switch + token presence; open `index.html` in a browser to confirm visually.

## How to test
1. `cd` to this directory.
2. `python3 -c "import pathlib,re;html=pathlib.Path('index.html').read_text();open('extracted.js','w').write(list(re.finditer(r'<script>(.*?)</script>',html,re.S))[-1].group(1))" && node --check extracted.js`
3. `node verify-harness.cjs`
4. Open `index.html` in a browser, toggle theme, try search/tabs/undo/keyboard.
