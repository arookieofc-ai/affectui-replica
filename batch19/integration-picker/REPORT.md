# Integration Picker — replica report

## What was built
- Single self-contained `index.html` (37 KB, inline CSS+JS, system fonts, no network).
- Command-menu integrations page: header (`Back`, `Integrations`, `3 of 10 connected`), search (`Search integrations`, `⌘/`), two groups (`Connected` / `Available`), 10 service tiles, detail pane with connection art (rings + app tile + link + brand tile), title `affectUI + <Name>`, domain, description, 3 features with check icons, `Connect/Disconnect` switch, `Explore integration` button.
- Clean-room code: own DOM/CSS/JS written from observed behaviour. Icon path data and copy reused verbatim as demo data (allowed); no compiled source pasted.

## Matched data / behaviour
- Data verbatim from `demo-original.js`:
  - Linear/linear.app/Project management — 3 features, tile `#5E6AD2`, connected.
  - Figma/figma.com/Design — custom 5-path Figma mark, tile `#ffffff`, available.
  - Notion/notion.so/Docs & wiki — Notion path, `currentColor`, tile `#ffffff`, connected.
  - Stripe/stripe.com/Payments — Stripe path, tile `#635BFF`, connected.
  - HubSpot/hubspot.com/CRM — HubSpot path, tile `#FF7A59`, available.
  - Shopify/shopify.com/Commerce — Shopify path, tile `#95BF47`, available.
  - Airtable/airtable.com/Databases — custom 3-path Airtable mark, available.
  - Webflow/webflow.com/Website — Webflow path, tile `#146EF5`, available.
  - Vercel/vercel.com/Developer tools — triangle path, `currentColor`, tile `#000000`, available.
  - ClickUp/clickup.com/Project management — custom gradient mark, available.
- Behaviour: live search filters name+domain+category; `Connected`/`Available` grouping; selection pill follows selected row; detail shows first filtered item when selection is filtered out; `Enter` toggles connection for current item; `ArrowUp/Down` moves selection; `Escape` clears query; `ArrowLeft` focuses Back; `⌘/` or `Ctrl+/` focuses search; switch toggles `data-on` (link rotates, rings spread animates); `Explore integration` + Back are inert demo actions; IntersectionObserver pauses rings off-screen; `prefers-reduced-motion` disables animations.
- Note: original groups from a stale snapshot that only resyncs on query change; replica uses live connected set so the count and groups stay consistent (documented deviation for usability).

## v3/v4/v5 compliance
- Tokens via CSS vars for every colour; light default = original (light); dark via `data-theme="dark"` on `<html>`.
- Visible sun/moon toggle top-right, persisted as `ip-theme`.
- `/*noflash*/` guard first in `<head>` + `html{background}` + `<meta name="color-scheme">`; no white first frame.
- In-place updates only: DOM built once at init; timer/search/select/toggle paths update `textContent`/attrs/styles on existing nodes, move existing buttons with `appendChild` (identity preserved); never uses `innerHTML` (zero writes).
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}` + count; concentric radii (tray 20 = card 16+4, art 12 = 16−4); borders for dividers/inputs, shadows for elevation; no content images; focus-visible outlines; `[hidden]{display:none!important}`; SVG classes only via `setAttribute`.
- No agent identities in this component, so no 3×3 pixel-marks (correctly omitted, not invented).

## Verification (node only, in-dir files)
- `node --check page-script.js` (extracted page script) → `CHECK_OK`.
- `node harness.js` (in-dir DOM stub, no packages):
  - loads page script, advances mock timers through full loop,
  - asserts visible text/state (count, crumb, titles, names, categories, placeholder, switch, empty states) — text in hidden nodes not counted,
  - cycles all 10 selections, asserts same button objects (`===`) across loop,
  - asserts `innerHTML` writes = 0 after init and after loop,
  - checks light default, dark toggle, and back to light.
  - Result: `HARNESS PASS: light AND dark checked, identity + zero-innerHTML ok` (41 asserts).

## How to test
- Open `index.html` in a browser. Try search `fig`, `notion`, `zzz`; Arrow keys + Enter; switch; theme toggle. Resize narrow to see stacked layout.
- Re-run: `node --check page-script.js` and `node harness.js` in this directory.

## Unverified
- Pixel-perfect spacing vs original screenshots (no screenshots provided); animations eyeballed from CSS timings (260 ms pill, 420 ms swap, 2.8 s rings).
