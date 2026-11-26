# CRM Replica — REPORT

## What was built
Standalone `index.html` (~35KB, inline CSS+JS, no external deps) replicating affectUI **CRM** (slug `crm`):
- Top bar: `Sales / <role>` view switcher (Head of Sales → Account executive → Partner manager), company+deal count pill, favorite star toggle, theme toggle.
- Tabbed views: `Company CRM` (hubspot), `Deals` (stripe), `Contacts` (airtable), `Renewals` (notion) with colored logo chips, `role=tablist`, ArrowLeft/Right/Home/End keyboard support.
- Pipeline strip: New / Qualified / Proposal / Negotiation / Won / Lost counts derived from data, updated in place.
- Editable data table: 10 rows × up to 7 cols per view, sortable headers, search filter, row checkbox, double-click cell to edit (commits to backing company, toast confirms), row click/Enter opens detail drawer, Esc closes.
- Detail drawer + toast + "Updated Xs ago" ticker (5s interval updates one text node only).
- Responsive: table min-width 880px with horizontal scroll, stacked toolbar under 600px.

## Demo data (verbatim)
Used `COMPANIES` exactly as in `demo-original.js` (10 entries: Notion 48k Negotiation Today, Linear 12.5k Proposal Yesterday, Figma 86k Won Mar 6, Stripe 124k Qualified Mar 5, Shopify 9.8k New Mar 4, Vercel 62k Proposal Mar 3, Airtable 37.5k Qualified Mar 1, HubSpot 21k New Feb 27, ClickUp 6.4k Lost Feb 25, Webflow 18.9k Negotiation Feb 24 with owners/categories/domains).
Derived with original formulas: Deal `${name} – Enterprise(≥50k)/Team plan`, chance {New:10,Qualified:30,Proposal:50,Negotiation:70,Won:100,Lost:0}, close dates, contacts (Nina Hartmann…Lucas Moreau / Founder…Head of Design, email firstname@domain), renewals (Enterprise≥50k/Business≥15k/Team, seats max(5,round(value/900)), renews, health cyclic), USD formatting, tag tones.

## What matches
Header pattern (Sales / view + fav), 4 logo tabs, 7/6/6/7-column schemas, pills, currency/percent, empty states, hover/focus, dark mode. Clean-room: all HTML/CSS/JS hand-written; brand SVGs replaced with colored initial chips (same brand hexes as facts); no compiled source copied.

## What could not be verified
Pixel-perfect vs original (no browser allowed per task); icon glyphs are text/emoji approximations; skeleton-loading and Pro `ui-dtc` internals approximated with own table.

## How to test
Open `index.html` in a browser. Switch the 4 tabs, sort by clicking headers, type in search, double-click a cell to edit, click a row for details, toggle ☾/☀, resize to mobile width.

## Verification (node only, no browser)
- `node --check verify.js` — syntax OK.
- `node verify.js` — in-dir DOM-stub harness: asserts VISIBLE painted text (all 10 companies/owners/stages/views), full-loop tab cycle content (Deals plans, Contacts names, Renewals health), full-loop node identity (4 tabs + 10 TR + 70 TD same objects), zero innerHTML/outerHTML writes after init, light AND dark themes with painted text. Result: ALL CHECKS PASSED.
- Checked light and dark: `setTheme('dark'/'light')` flips `data-theme`, tokens `--surface #1c1c1f / #ffffff`, `--page #101012 / #fafaf9`, amber dark variant, text stays legible.
