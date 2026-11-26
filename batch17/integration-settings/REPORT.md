# Integration Settings — replica report

## What was built
`index.html` (37 KB, self-contained, no network, no external assets, system fonts only)
replicates the **Integration Settings** card for a connected service: header with service
identity + sync switch, API-key row, site-address field, time-zone picker, and a dirty-state
save bar. All code is clean-room (own `int-*` classes, own CSS/JS); nothing copied from the
compiled demo bundle.

## Matched demo data (verbatim from `demo-original.js`)
- Service: name `Shopify store`, count `128`, meta `Connected on March 4, 2026 at 09:12`
- Site hint: `Your store's primary domain from Settings › Domains`
- Defaults: site `lumen-studio.com`, time zone `(GMT +01:00) Berlin`
- All 13 time zones with exact strings (`−` U+2212, `São Paulo`, `+05:30`, …)
- Strings: `Generate a new API key`, `Generating…`, `Copy it now – it is shown in full only once.`,
  `Copied to the clipboard.`, `Site address`, `yourstore.com`, `https://`,
  `That doesn't look like a domain – try something like yourstore.com`,
  `Time zone`, `Search city or offset`, `No time zone matches.`,
  `Unsaved changes`, `Discard`, `Save`, `Saving…`, `Regenerate`, `Show/Hide/Copy key`,
  `Paused – no data is synced`
- Behaviours/timings: key generation busy 700 ms then full `sk_live_` + 32 hex shown once
  (masked `first8 + •×14 + last4` afterwards), eye toggle, clipboard copy with 1400 ms
  `Copied` reset, domain validation regex (Unicode, empty = valid), save 450 ms simulated
  round-trip with `Saving…`, discard restores saved values, switch toggles fold + paused meta,
  time-zone menu filters case-insensitively, closes on outside pointerdown / Escape.
- Default theme = original demo appearance (light).

## Spec compliance notes
- Design tokens as CSS custom properties for every colour (light + dark sets per spec);
  no ad-hoc hex per element. Radius/shadow/typography per spec.
- Light AND dark via `data-theme` on `<html>` + visible sun/moon toggle (top-right);
  dark re-themes all tokens incl. amber.
- `/*noflash*/` guard is the first thing in `<head>`, with first-paint background style
  and `color-scheme` meta — dark never flashes white.
- DOM built once at init; timers update only text/class/attributes in place — zero
  full re-renders, zero `innerHTML` writes after init (asserted at runtime).
- Popover opens on `pointerdown`/`mousedown` capture and closes on window capture, so
  real clicks survive; hover/focus are CSS-only and never re-render.
- `[hidden]{display:none}` rule present; SVG classes set only via `setAttribute`;
  no broad `.x svg{display:block}` rule.
- No agent identities in this component, so no pixel-marks are required (nothing omitted).

## Verification (node only, no browser, no installs)
- `node --check page-script.js` (script extracted from `index.html`): **OK**
- `node harness.js` (in-dir DOM-stub harness): loads the page script, advances timers
  through the full loop (switch off/on → generate → mask/unmask → copy → invalid/valid
  domain → timezone search/select/empty/Escape → save → discard), asserts **visible**
  text/state at each step, node identity across the loop, zero post-init writes,
  and theme toggle light→dark→light: **65/65 PASS, ALL CHECKS PASSED** (both themes).

## How to test manually
Open `index.html` in a browser. Toggle the Dark/Light pill, turn the sync switch off/on,
generate + reveal + copy the key, type a bad domain, pick `Tokyo` in the time-zone menu,
then Save and Discard.
