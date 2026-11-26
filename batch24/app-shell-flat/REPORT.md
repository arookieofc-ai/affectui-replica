# App Shell Flat — replica report

Slug: `app-shell-flat`
Output: `index.html` (30.6 KB, single file, inline CSS+JS, system fonts only)

## What was built
Flat app shell from `demo-original.js` (used verbatim):
- `layout: "flat"`, header `title = active ?? "Home"` with `Share` + `More` icon buttons
- `active = "New chat"`, `onNavigate` → sidebar nav switching
- `workArea = { artifacts, newTab: { sources } }` → right hairline-divided work area
- Center: `title "Your page goes here"`, `text "The flat shell brings both sidebars and the scroll container – put any screen inside."`

Layout:
- Left gray sidebar (`--subtle`): brand, "+ New chat", search, Workspace nav (New chat/Home/Discover/Library/History), Recent, context tokens "44.1k / 200k" with thin 3px bar, user footer.
- Edge-to-edge page: sticky 56px topbar (title + crumb + Share/More/theme toggle), work row = scrollable center + 308px right work area divided by 1px hairline (`border-left`).
- Right work area: Artifacts (3 circular tool icons + wait/ready pills), New tab — Sources (checkbox rows), detail card updated in place on select.
- Interactivity: nav switching, Share toast, More dropdown menu (ArrowUp/Down, Esc), theme toggle, artifact select, composer (Enter sends, appends `div.msg` via `appendChild`), `/` focuses composer, sidebar scrim on narrow, 1s tick updates clock/tokens/status/pulse in place.

## What matches the original
- Flat (no outer card) gray sidebar + edge-to-edge page + hairline-divided work area.
- Header pattern: title from active nav + two icon actions.
- Demo strings verbatim, single-line ellipsis titles, pills `999px`, 12–16px card padding, 8–12px gaps.
- Clean-room: all HTML/CSS/JS written from description; no bundle copied (main script contains zero `innerHTML`).

## What could not be verified
- No pixel screenshot of the original available in-dir; spacing/ hues matched from spec tokens + description only.
- v3 crew specifics (3×3 pixel-marks, token-count header, sub-agent cards) don't apply to an empty shell; used context bar + circular tool icons in the same spirit.
- Real browser paint checked by code review only (node harness uses a DOM stub); manual open recommended.

## How to test
1. `open index.html` in a browser (or double-click the file).
2. Click sidebar items → topbar title + crumb update; click artifacts → detail card updates; Share/More → toast/menu; sun/moon → theme.
3. Node-only verification (no browser):
   - `node --check harness.js`
   - `node harness.js` → asserts visible painted text, full-loop (75+3605 ticks) node identity, zero `innerHTML` writes after init, light AND dark themes.

## Theme check
- [x] Light: `data-theme="light"`, text visible, tokens `--surface #ffffff / --page #fafaf9`.
- [x] Dark: `data-theme="dark"`, text visible, tokens `--surface #1c1c1f / --page #101012`, amber waiting adjusted.
- No-flash guard is first in `<head>` + `meta color-scheme` + `html{background}`; toggle persists to `app-shell-flat-theme`.

## v5 polish
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`.
- `body{font-variant-numeric:tabular-nums}` for timers/token counts.
- Concentric radii (composer 16px outer / 10px input), shadows only for elevation (menu/toast/cards), hairlines for dividers, icon buttons optically nudged.
