# Agent / Permissions — replica report

## What built
ONE self-contained `index.html` (35KB, no network, system fonts, inline CSS+JS).
Clean-room code from observed behaviour in `demo-original.js`; no verbatim copy of compiled source.

Layout (max-width 700px, matches original `.ui-apm-page` 680px):
- Topbar: crumbs `Fieldwork Pro · Personal / Permissions`, `h1 Permissions + Pro`, pills `7 apps · 26 checks`, sun/moon theme toggle top-right.
- Autonomy card: `How much it does on its own`, 3 tiles, thumb slider, means line `Does X things on its own · asks before Y · never does Z`, 3-seg bar.
- Apps card: `Apps · 7`, 7 rows with letter mark, name, account, summary words, mini bar.
- Red lines card: `Red lines`, note `These always ask – or never happen – whatever you pick above`, 7 locked rows.
- App panel card: header (mark+name+account for selected app, default `Stripe`), per-app groups `Reads / Changes / Needs care`, level dropdowns, limit field for refunds, per-app `Lately` events.
- Footer: `Agent permission levels in plain words · apps · red lines · grouped actions`.

## Matched data (verbatim from demo-original.js)
- Labels `ve`: `Permissions`, `What your agent – and every agent it starts – may do without asking you first`, `How much it does on its own`, `Apps`, `Red lines`, `These always ask – or never happen – whatever you pick above`, `Careful`/`Reads on its own, asks before it changes anything`, `Balanced`/`Works on its own, asks before anything that needs care`, `Hands-off`/`Does everything on its own – except the red lines`, `On its own`/`Asks first`/`Never`, `Does it without asking – you see it in the activity`/`Waits for your OK in the Inbox`/`Won’t do it, and tells you it can’t`, `Mixed`, `A red line – it can’t do this on its own`, `Reads`/`Changes`/`Needs care`, `On its own up to`/`asks above`, `Lately`, `Nothing happened here this week`, `Approved`/`Declined`/`Done`/`Stopped`.
- Apps (7): `Gmail/alex@fieldwork.co`, `Slack/Fieldwork workspace`, `GitHub/fieldwork-labs`, `Google Drive/Shared drive · Clients`, `Stripe/Fieldwork GmbH`, `Google Calendar/alex@fieldwork.co`, `Web/Browser`.
- Rules (26) with exact `action/detail/kind/level/locked`: `Read email`, `Draft replies`, `Send email to your team/Anyone at Fieldwork`, `Send email to clients/Anyone outside Fieldwork`, `Delete email` (locked never), `Read channels`, `Post in project channels/#northwind, #platform, #evalkit`, `Send direct messages`, `Post in #general/1,284 members` (locked never), `Read code`, `Open pull requests`, `Merge to main` (locked ask), `Deploy to production` (locked never), `Read files`, `Create documents`, `Share outside Fieldwork`, `Delete files` (locked never), `Read payments`, `Issue refunds` (limit 50 €), `Change prices` (locked never), `See your calendar`, `Accept invites`, `Book meetings with clients`, `Browse the web`, `Fill in forms`, `Buy things/With a saved card` (locked never).
- Recents (12): `Weekly update to Priya Shah at Northwind/approved`, `Invoice reminder to Hannah Kim/approved`, `Launch date to the Evalkit list – 312 people/declined`, `Delete 48 newsletters from last year/blocked`, `Ask Tom Becker for the staging keys/approved`, `Merge #482 – Retry failed billing webhooks/approved`, `Merge #479 – Drop the v1 API/declined`, `Share the Q3 report with northwind.com/approved`, `Refund 38 € to Hannah Kim – charged twice/done`, `Refund 240 € to Lumen Studio/approved`, `Refund 12 € to Jo Park/done`, `Buy a 49 € stock photo licence/blocked`.
- Preset logic `Ee`: cautious=read allow/write ask/risky never, balanced=risky ask else allow, handsoff=allow (locked stays). Default best-match is `balanced`. Summary words `X on its own · asks before Y · never Z`.

## Matched behaviour / timings / loop
- `setPreset` applies `effFor` to all non-locked, updates tiles/means/bar/apps in place + toast.
- `setDecision(id,level)` blocks locked→allow, updates dot/label/menu/means/apps + toast.
- `selectApp` toggles 7 prebuilt panels via `display` (no rebuild), updates header mark/name/account in place.
- Level popover opens on `pointerdown`+`mousedown` capture (plus click fallback), closes on outside `pointerdown`; hover/focus never re-renders.
- Limit input for `Issue refunds`: `On its own up to [50 €] asks above`, change updates + toast.
- `Lately` per-app (top 5, sorted by `atMin`), relative time `just now/42 minutes ago/5 hours ago/2 days ago`, badges `Approved/Declined/Done/Stopped`.
- Live loop: `setInterval(tick,3500)`; `tick` increments `elapsed` and repaints all Lately `when` texts in place (`relTime(atMin+elapsed)`). No `innerHTML` anywhere after init; `while(firstChild)removeChild` only in initial `build()`.

## v5 / v3 / v4 polish
- Tokens via `--surface/--page/--ink/--muted/--subtle/--border/--radius-lg/--radius/--radius-sm/--shadow`, dark via `[data-theme=dark]` (`#1c1c1f/#101012`), amber/red adjusted for dark, contrast checked.
- `/*noflash*/` guard first in `<head>`, `html{background:#fafaf9}` + `html[data-theme=dark]{background:#101012}`, `meta color-scheme`.
- Default `data-theme=light` (original demo appearance is light; dark via toggle).
- All `:hover` inside `@media (hover: hover) and (pointer: fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radii (16/10/6 with padding), shadows for elevation / borders for structure, 1px inset outline for marks, `[hidden]{display:none}`, no SVG `.className` assignment, no broad `svg{display:block}` override.
- No agent identities in original `demo-original.js`, so 3×3 pixel-marks N/A (no invented agents).

## Verification (node only, in-dir)
- `node -e` extract largest inline `<script>` → `extracted.tmp.js`; `node --check extracted.tmp.js` → OK.
- `node harness.verify.cjs` (in-dir stub: FakeEl, painted via `textContent/createTextNode`, counts `innerHTML` writes, `setInterval` noop, `Intl` avoided):
  - static gates: <200KB, noflash, color-scheme, hover-gated, tap-highlight, tabular-nums, dark tokens, CSS vars.
  - visible text: 100+ verbatim strings (apps, accounts, 26 actions, details, 12 recents, levels, Lately, badges); locked hint `A red line` verified after opening locked menu via click.
  - full loop: 12 `tick()`s, action nodes + feed slots keep object identity, `innerHTMLWrites===0`.
  - interactions: `setDecision`, `setPreset`, `selectApp`, `counts()===26` keep identity.
  - light AND dark: toggle button flips `documentElement[data-theme]`, persists `affectui-agent-permissions-theme=dark/light`.
  - Result: `ALL 122 CHECKS PASSED` (light and dark both checked).

## How to test
Open `index.html` in a browser. Pick Careful/Balanced/Hands-off, change any `On its own/Asks first/Never` dropdown, change refund limit, switch Apps (default Stripe), toggle sun/moon, wait 3.5s to see Lately times tick in place. Check both themes.
