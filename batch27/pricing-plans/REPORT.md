# Pricing Plans — replica report

## What was built
Single self-contained `index.html` (~28KB, inline CSS + JS, system fonts only) replicating the affectUI **Pricing Plans** (`pricing-plans`) section: centered header, Monthly/Yearly sliding switch, three plan cards (Starter / Growth / Scale), collapsible details per the demo.

## Demo data used verbatim (`demo-original.js`)
- Title `Choose your plan`, subtitle `Find the right plan for your team. Start with a 14-day free trial.`, default billing `yearly`, currency `$`.
- Plans: Starter `$29/mo · $24/yr`, Growth `$99/mo · $79/yr` + `Popular` badge, Scale `$249/mo · $199/yr`.
- Limits rows verbatim: `Monthly visitors 10k/100k/1M`, `Seats 2/10/Unlimited`, `Workspaces 1/3/10`.
- Sync chips verbatim: `Hourly`, `Every 15 min`, `Real-time`; pick counts `Choose 2/4/7 of 7`.
- Integrations verbatim (7 tiles): Google Analytics, Stripe, Gmail, Slack, Google Calendar, HubSpot, Notion (clean-room letter glyphs, Stripe tile keeps `#635BFF`).
- Feature lists verbatim incl. `Unlimited dashboards … Dedicated onboarding` + `Email support` / `Chat + Email support` / `Priority support + Slack channel`, with `(included)` / `(not included)` screen-reader text.
- Strings kept: `Monthly`, `Yearly`, `Billing period`, `/per month`, `Start free trial`, `Show/Hide details`, `Integrations`, `Native sync`, `No plans to show yet`.

## Behaviour matches
- Switch is a `radiogroup` with sliding thumb, roving `tabindex`, `aria-checked`, Home/End/Arrow key support; first switch enables the per-digit price-roll animation (`pp-roll`), same as the original's `roll` flag; price formatting mirrors the original (`$` prefix, integer/2-decimal, `Custom` fallback for non-numbers).
- Details share one open state (all cards expand/collapse together, as in the original single `useState(true)`), with grid-rows + opacity transition, rotating chevron, and `inert` when collapsed.
- CTA keeps `Start free trial` and announces `"<Plan> · <period> billing — trial started"` to a polite live region.
- Featured card (Growth/`Popular`) gets the accent border + glow ring. Overflow clipping sets `title` tooltips on hover, as in the original.
- **In-place updates only:** DOM is built once at init; billing/details/theme changes mutate existing nodes (attributes, classes, text) — no section rebuilds, no `innerHTML` anywhere in the page.

## v5 polish
- All `:hover` rules inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `font-variant-numeric:tabular-nums` on body; concentric radii (card 14px = 16−2, controls 8px = 10−2); shadows for elevation / real borders for structure; toggle uses optical padding (`0 6px 0 8px`); `prefers-reduced-motion` disables thumb/details/roll.

## Verification (node only, no browser)
- `node --check .check-app.js` (app script extracted from `index.html`) — passes.
- `node --check harness.cjs` — passes.
- `node harness.cjs` — in-dir DOM-stub harness, all assertions pass: VISIBLE painted text (title, subtitle, switch, 3 cards, badge, `$24/$79/$199` yearly and `$29/$99/$249` monthly, limits, CTAs, details, sync chips, pick counts, 7 tiles/card), full-loop node identity (cards, price nodes, plans host stable across billing + details + keyboard loops), zero `innerHTML` writes after init, and intact VISIBLE text in **both light and dark** themes via the theme toggle.
- Checked light AND dark token sets in source (`#fafaf9/#171717` light, `#101012/#ededed` dark); noflash guard (`/*noflash*/` + `meta color-scheme` + first-frame bg) is the first node in `<head>`.

## How to test
Open `index.html` in a browser. Toggle Monthly/Yearly (mouse + arrow keys), expand/collapse details, flip the sun/moon button top-right, narrow the window below ~860px for the stacked layout.

## What could not be verified
- Pixel-exact match to the original render (no browser/screenshot in this environment; verified via stub + token/style inspection only).
- Real font rendering/kerning and the exact proprietary integration SVG artwork (replaced with clean-room glyph tiles of the same names/order).
- `prefers-color-scheme` default and `localStorage` persistence paths (stubbed `matchMedia`; logic follows the noflash key `ui-pp-theme`).
