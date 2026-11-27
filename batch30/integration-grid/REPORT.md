# Integration Grid — replica report

## What was built
Standalone `index.html` (25 KB, no external deps) replicating the affectUI **Integration Grid** illustration:
“Honeycomb wall of integration logos around a bright centre product tile, fading edges.”

- 3-row honeycomb field (7 / 9 / 7, 23 slots, 1 centre + 22 app tiles) on a 1520×560 field, `aspect-ratio: 1520/560`, tiles 140px (centre 168px), 160px pitch.
- Per-tile fading copied as behaviour: `alpha = max(.22, .64-.095·d)`, `keep = max(.35, 1-.16·d)` where `d` is grid-distance from centre; radial mask adds edge fade.
- Centre product tile: bright surface + stronger shadow + original 8-petal mark (clean-room redrawn ellipses, soft layer at 32% + solid layer + core cutout).
- Demo data reused verbatim for names/order/tints (22 in order): Notion (ink), Stripe #635BFF, Figma #F24E1E, Linear #5E6AD2, HubSpot #FF7A59, Dropbox #0061FF, Jira #0052CC, Shopify #7AB55C, Zapier #FF4F00, Airtable #18BFFF, Slack #4A154B (ink in dark), GitHub (ink), Google Drive #4285F4, Gmail #EA4335, Asana #F06A6A, Trello #0052CC, Discord #5865F2, Salesforce #00A1E0, Loom #625DF5, Intercom (ink), Webflow #146EF5, Calendly #006BFF. Glyph artwork is clean-room geometric marks in brand tints — brand SVG `path d` strings were **not** copied.
- Interactive: hover grows logo 1.18× and lifts tile to full opacity; click/Enter selects tile into detail panel; arrow keys + Home/End move; Prev/Next buttons; auto spotlight tour every 1600ms with Pause/Play; live counter `Spotlight n / 22 — Name`; theme toggle (sun/moon, top-right) persisting to `integration-grid-theme`.
- Light/dark via `data-theme` tokens; dark tile `35 35 38`, ink `#ededed`, centre `#2a2a2d`; `prefers-color-scheme` default with override.
- v4/v5: `/*noflash*/` guard is first in `<head>` + paint style + `color-scheme` meta; DOM built once, timer updates only `textContent`/`class`/`style` in place; all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `tabular-nums` on body; concentric shell radius 21px = 10px + 10px padding + 1px border; optical button padding (icon side ~2px tighter).

## What matches the original
Layout math, tile sizes/radii, logo size (52), centre size/mark size (168/68), fade curves, hover-grow behaviour, dark-mode token shifts, aria-label `Integrates with …` list, 22-count.

## What could not be verified
Pixel-exact brand glyphs (intentionally redrawn for clean-room); original minified bundle has no additional demo props beyond defaults, so header/count copy is plausible replica chrome; no screenshot comparison run (no browser per task constraints).

## How to test
1. Open `index.html` directly in a browser (no build).
2. Hover/focus tiles, click to inspect, arrow-key through wall, toggle Pause/Play, toggle Theme.
3. Narrow window <640px → list stacks to one column.
4. Node-only checks (no browser):
   - `node --check page-inline.js`
   - `node --check harness.js`
   - `node harness.js` — asserts visible painted text (`Notion`…`Calendly`, `Spotlight 1 / 22`), 22-node full-loop identity, zero `innerHTML` writes after init, light + dark themes, noflash/hover/tap/tabular/size checks.

## Theme confirmation
Checked both: light (`--page #fafaf9`, white tiles) and dark (`--page #101012`, `#1c1c1f` surfaces) via harness scenarios `light` + `dark` — both paint visible text, keep node identity, and report zero post-init `innerHTML` writes. Manual browser check recommended for final contrast pass.
