# Settings / Privacy — replica report

## What was built
Single self-contained `index.html` (inline CSS/JS, no external deps, ~43KB) replicating the affectUI **Settings / Privacy** page from `./demo-original.js` demo data verbatim.

Sections:
- Page head: `Privacy` + `Decide what you share and where you're signed in.`
- `Data and cookies` card: `Ad measurement`, `Product analytics`, `Improve models with my chats`, `Cookies on this browser` + `Manage cookies`/`Done` expander (`Necessary`/`Always on`, `Preferences`, `Analytics`). Toasts match original (`Ad measurement on/off`, `Product analytics on/off`, `Your chats can help train models` / `Your chats stay out of training`, `Preference cookies allowed/blocked`, `Analytics cookies allowed/blocked`).
- `Emails` card: `Product updates` with `Subscribe`/`Unsubscribe` + `Subscribed` badge and the two note strings verbatim.
- `Active sessions`: `Chrome on macOS` (`Vienna, Austria · Signed in with Google · 82.214.130.34`, `This device`), `Safari on iPhone` (`Vienna, Austria · Active 3 hours ago`), `Desktop app on Windows` (`Berlin, Germany · Active 6 days ago`); per-row `Sign out` + `Sign out others` header button. Toasts `… signed out` / `Signed out everywhere else`.
- `Shared chats` with tabs `In the workspace (2)` / `Public links (1)`; rows `Q4 pricing review with Finance` (`Shared 2 days ago`, `14 views`), `Onboarding checklist for new hires` (`Shared last week`, `31 views`), `How we write release notes` (`Shared 3 weeks ago`, `208 views`); `Copy link`→`Copied` (1.6s revert, clipboard `https://app.workspace.ai/share/<id>`), `Stop sharing` removes row + `Stopped sharing “…”`; empty states `No shared chats` / `No public links` with original copy + `Open chats`.
- `Danger zone`: `Export my data` → `Requested` + `We're putting it together – the link arrives by email within an hour` + `Export started – check your email`; `Delete all chats` → `Cancel` / `Delete for good` confirm (autofocus, Escape closes) → clears shares + `All chats deleted`.

## What matches the original
Layout, card styles, tokens, typography, spacing, switch/button/tab/badge/toast visuals, responsive narrow stacking, keyboard (switches/tabs/buttons focusable, tabs arrow-key, Escape closes cookies/delete confirm), copy adapted clean-room (own SVG icons, no copied source).

## What could not be verified
Pixel-exact original screenshots/styles were not available in this directory; loading skeletons, backend navigation (`onNavigate`), and real clipboard/OS share URLs were stubbed. Icons are clean-room approximations.

## How to test
Open `index.html` in a browser (double-click or any static server). Toggle theme with the sun/moon button top-right; try switches, `Manage cookies`, `Subscribe`, `Sign out` / `Sign out others`, tabs, `Copy link`, `Stop sharing`, `Export`, `Delete all chats`. No network needed.

## Checks performed (node only, no browser)
- `node --check` on extracted inline script (syntax).
- In-dir DOM-stub harness `./harness.js`: asserts visible painted text, full-loop node identity, zero `innerHTML` writes after init, and light + dark themes. Run: `node ./harness.js`.
- Verified light AND dark: `data-theme` toggles, dark tokens present, contrast legible, no white first paint via `/*noflash*/` guard.
