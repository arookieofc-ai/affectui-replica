# settings-subscription — REPORT

## What built
Standalone clean-room replica of affectUI **Settings / Billing** (`settings-subscription`) as `./index.html` (42KB, inline CSS+JS, system fonts only, no external deps, no Tailwind, no build step).

Sections (static HTML, JS only mutates):
- Header: `Billing` + `See your plan, what you pay and what you've used.` + `Open docs` + sun/moon theme toggle.
- Overview: `Pro plan` `$49 per member / month, billed monthly` + `Explore plans` (scrolls to plans); `Upcoming bill` `Renews on Dec 6, 2026` `$294` + `Show details`/`Hide details` expanding to `Pro · 6 seats × $49` `$294`, `Workflows · Starter` `Included`, `Tax` `Added at checkout`.
- Usage: `Seats 6 / 10` (+ Add seats), `Credits 34,000 / 50,000` + info `Model use draws on credits; they reset with every bill`, `Storage 42.6 GB / 100 GB`, `Agent runs 2,310 / 2,500` with high-bar (92.4%).
- Plans & add-ons: `Monthly` / `Yearly −20%` segmented; `Plan` `Chat, agents, meetings & apps` `6 members` `Manage members`; current `Pro` `Current plan` `$49` (`$39` yearly); cards `Team $69 ($55 yearly)` + 6 features, `Business $89 ($71 yearly)` + 4 features + `Everything in Team, plus:`; `Using your own model keys? See pricing for your own keys`; `Enterprise` `Contact sales`; `Compare plans` table (Pro/Team/Business × Members, Credits a month 50,000/150,000/400,000, Storage, Workflow runs, Meeting recordings, SSO & SCIM, Audit log).
- Add-on Workflows: `Starter Included 2,500 runs / month`, `Business $539` select `10k workflow runs / month $189` / `40k workflow runs / month $539` / `100k workflow runs / month $1,190`, runs line `40,000 runs / month`, `Model use in workflows is billed at API prices`.
- Billing details: `Address Shown on every invoice` `Edit address` → `billing@acme.com`, `Acme Inc.`, `Mariahilfer Straße 1, 1060 Vienna, Austria`, `VAT number Not provided` with editable form (Save/Cancel/Escape → toast `Billing address saved`); `Payment Charged on every renewal` `Visa •••• 4242 Expires 08/2028 Default` + note.
- History: `Upcoming $294 Dec 6, 2026 Upcoming Preview`, 4 invoices `INV-2026-0011 $294 Nov 6, 2026` etc. `Paid` + download → toast `*.pdf downloaded`.
- `Cancel subscription` popover `Cancel your subscription? You keep Pro until Dec 6, 2026…` `Keep plan` / `Cancel subscription` → toast `Cancelled – Pro stays until Dec 6, 2026`.
- Toasts for upgrades, contact sales, add card, preview.

## What matches original
- Demo data verbatim from `./demo-original.js`: plan Pro 49/6/Dec 6 2026, Team/Business prices + blurbs + features (incl. limited Meetings/Apps), compare rows, flows 10k/189 40k/539 100k/1190, usage 6/10 34000/50000 42.6/100GB 2310/2500, invoices 0011/294/Nov6 0010/294/Oct6 0009/245/Sep6 0008/245/Aug6, address, Visa.
- Pricing math: `$ = price*seats`, yearly `Math.round(p*0.8)`, `Intl.NumberFormat` USD + 1-decimal numbers.
- Interactions: details/compare/workflow-select/address-edit/cancel/period/toasts, keyboard Escape + focus return, aria-expanded/roles.
- Tokens, radius 16/10/6, pills 999px, 150–200ms transitions, card border+shadow + hover lift, focus-visible.

## What could not verify
- No Pro .tsx source fetched (per spec). Pixel-perfect colors/fonts vs original screenshot not compared (no browser). Loading/empty skeletons from original (`loading`, `empty` props) omitted — page renders final state directly; behavior preserved.
- Icons are unicode glyphs (✦👥🗄🧠) not original SVG set — clean-room to avoid copying compiled paths.

## How to test
- Open `./index.html` in a browser (double-click, no server needed).
- Toggle sun/moon (top-right), Show/Hide details, Monthly↔Yearly (check $49→$39, $69→$55, $89→$71), Compare plans, workflow select 10k/40k/100k, Edit address Save/Cancel, download invoice, Preview upcoming, Cancel flow.
- Verify only with node (no browser needed):
  - `node --check ./harness.cjs`
  - `node --check ./main-extracted.js`
  - `node ./harness.cjs` — asserts visible painted text, full-loop node identity, zero innerHTML writes, light+dark.

## Verification (this dir only, relative paths)
- `node --check ./harness.cjs` → OK
- `node --check ./main-extracted.js` (extracted main script 10723B) → OK
- `node ./harness.cjs` → ALL PASSED: 130+ visible-text strings, `/*noflash*/` first + `meta color-scheme` + `html{background:#fafaf9}/dark #101012`, hover inside `@media (hover:hover) and (pointer:fine)`, `tabular-nums`, tap-highlight, tokens, zero `innerHTML/outerHTML/insertAdjacentHTML`, `window.__test` full-loop identity (overview/billLines/compare/flowLabel/addrEmail/etc. `===` after details/compare/period/flow/cancel/theme loop), yearly `$55/$71` + flow `$1,190` in-place, dark→light switching via `sb2-theme`.
- Checked light AND dark: `data-theme="light"|"dark"` on `<html>`, defaults to `prefers-color-scheme`, toggle overrides + persists; dark uses `#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33`, amber/green adjusted, contrast checked (no grey-on-grey).

## Clean-room / polish notes
- Wrote HTML/CSS/JS from public description, never copied compiled `U` CSS or bundle code.
- In-place only: DOM built once (static HTML + cached `getElementById`), all updates mutate `textContent/hidden/aria-* /value/style` — no `innerHTML` anywhere.
- v5: hover inside media, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radius (outer 16 = inner 12 + 3 pad + 1 border), shadows for elevation / borders for dividers, optical nudge on icon buttons.
