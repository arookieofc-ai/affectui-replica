# Integrations — replica report

## What was built
Standalone `index.html` (25,976 bytes, <200KB, no external deps) replicating affectUI `Integrations` screen (slug `integrations`, App screens, Pro).

- Page: `Integrations` H1 + sub `Connect the tools your team already uses and work with them right in the chat.`
- Sticky toolbar: segmented `All | Connected | Available`, search `Search integrations` (254px), `Request` button + popover form (`Request an integration` / `Which tool should we add next?` / `e.g. Pipedrive` / `Send request` → toast `Request sent – thanks!`).
- Sections verbatim from `demo-original.js`: `Popular` (6 + 4 more), `Google` (3), `Communication` (6 + 3 more). 22 apps total with verbatim names/vendors/descriptions.
- Rows: letter logo (tile colour where original had `tile`), name single-line ellipsis, `Official` check badge for `essential` (Slack, Notion, Linear, Figma, GitHub, Stripe, Zapier), description ellipsis, add button `data-state=off|on|busy`.
- Connect: `off` (+) → click → `busy` spinner 900ms → `on` (✓) + toast `X connected`; `on` → click → immediate disconnect + toast `X disconnected`. Busy clicks ignored.
- More: `Show Stripe, Zapier and 2 more`-style label (`X`, `X and Y`, `X, Y and N more`), mini 20px logos, arrow →, expands in place.
- Empty states verbatim: `No integrations found` / `Nothing matches “q” – try another name…` + `Clear search`; `Nothing connected yet` + `Browse integrations`; `Everything is connected`; `No integrations yet` fallback.
- Toast `role=status aria-live=polite`, single node reused.

## Matches original
- Layout: centred 957px, 2-col grid gap 32px → 1-col ≤760px, row 58px, logo 30px/8px, add 28px/8px, more-logos 20px/6px in 9px tray (concentric: 6+3=9).
- Toolbar sticky `top:0` with 32px fade `::after`.
- Demo data verbatim (names, vendors, descriptions, section membership, `connected: slack` only, `essential` 7).
- Behaviour: filtering `(All OR (Connected==isConn)) && name+vendor+desc includes query`, `filtering = filter!=All || query`, merged items+more when filtering/expanded, toasts, 900ms busy, focus/Escape handling for request dialog.
- Clean-room: no copied bundle code. Brand SVGs replaced by letter tiles with original tile hexes (Linear #5E6AD2, GitHub #171717, Stripe #635BFF, Zapier #FF4F00, Zoom #0B5CFF, Discord #5865F2, Calendly #006BFF, Make #6D00CC, Mixpanel #7856FF, Typeform #262627, Intercom #1F8DED, Paddle #FDDD35 dark-text for contrast, single-colour letters for HubSpot/Dropbox/Drive/Jira/Airtable/Google). Path data not copied.

## Could not verify (no browser per task)
- Pixel-perfect brand logos, exact `var(--panel/card/…)` values from host app (used spec tokens instead).
- Container-query breakpoints (`@container ui-as`) — used `@media` equivalents (900/760/600px).
- Real screen-reader announcement timing beyond `aria-live`.

## How to test
- Open `index.html` in a browser. No server needed.
- Only-node verification (no browser launched):
  - `node --check ./check-target.js` (extracted main script) + `node --check ./harness.js`
  - `node ./harness.js` — in-dir DOM-stub asserting VISIBLE text (64 strings), full-loop node identity, zero `innerHTML` after init, light AND dark.

## Checks
- `node --check`: pass for both files.
- Harness: 22 rows built once, `innerHTML` count 0 at init and after full loop (filter/search/expand/toggle), row/btn/section object identity preserved, search `zoom` isolates zoom, `Connected` shows `slack` only, busy→on after ~900ms, disconnect immediate.
- Light AND dark: `applyTheme('light'|'dark')` flips `documentElement[data-theme]`, toggle button ☀/☾ top-right, `localStorage ui-integrations-theme`, `prefers-color-scheme` default, noflash guard + `color-scheme` + `html{background:#fafaf9}/dark #101012` first paint. Checked contrast: ink/muted/border adjusted per theme, amber dark `#fbbf24 on #451a03 text #fde68a`, paddle tile uses dark text.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radii, elevation via `box-shadow` + structural `border` on inputs, inset outline on logos (black 10% / white 10%), optical nudge on add glyphs.
- v4: `<head>` starts with `/*noflash*/` script, in-place updates only (no `innerHTML`, `style.display`/`textContent`/`data-state` mutation).

Files in this dir: `index.html`, `REPORT.md`, `harness.js`, `check-target.js` (extracted for `node --check`).
