# Settings / Notifications — replica report

## What was built
- Single self-contained `index.html` (23 KB, inline CSS/JS, no external deps) replicating affectUI Settings / Notifications.
- Sections from `./demo-original.js` verbatim data:
  - Header: `Notifications` + `Choose what you hear about and where. Everything still lands in your inbox.`
  - Digest card: Daily digest toggle (on), Send at `08:00` in `Europe/Vienna` (options 06:00–10:00), Weekly usage report (off).
  - Notification types card: `Notify me about` + `Notify on` bulk menu, 8 rows (Mentions, Replies, Approvals, Finished runs, Failed runs, Shared with you, Access requests, Usage limits) each with per-type channel select (Email and mobile / Email / Mobile / Inbox only).
  - Quiet hours card: Hold pushes at night toggle (off), dynamic note, From–to `22:00–08:00` (from options 20:00–00:00, to options 06:00–10:00).
  - Toast (`role=status aria-live=polite`) for every save: e.g. `Daily digest on`, `Mentions: mobile`, `Everything: email`, `Quiet from 21:00`.
- Custom dropdowns (button + listbox) with mouse + keyboard (Enter/Space/Escape/Arrow), switches (`role=switch`), bulk set-all with checkmark, conditional rows with rise animation.
- Design tokens as CSS custom properties for light (`surface #ffffff, page #fafaf9, ink #171717, muted #78716c, subtle #f5f5f4, border #e7e5e4`) and dark (`surface #1c1c1f, page #101012, ink #ededed, muted #a1a1aa, subtle #26262a, border #2e2e33`). Cards 1px border + soft shadow, 16px radius, 150–200ms transitions, focus-visible outlines.
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric-feeling radii, dividers via inset box-shadow, optical chevron nudges.
- v4: noflash guard first in `<head>` (`sn-notifications-theme` + `prefers-color-scheme` + `html{background}` + `meta color-scheme`), in-place updates only (DOM built once, all later updates mutate `textContent`/`hidden`/`aria-*`/`classList`/`value`; zero `innerHTML` in script).

## What matches the original
- Copy, ordering, default state, option lists, and dynamic quiet note verbatim from demo data.
- Layout: thead (`Notify me about` / `Notify on`), 176px selects, 112px time selects, 40px thead, 56px rows, inset dividers, responsive stacking under 600px.
- Behaviour: toggles show/hide Send-at and From-to rows, per-type change toasts, bulk set-all, quiet note swaps.

## What could not be verified
- Pixel-exact styles (no screenshots; original CSS variables `--muted/--hover/--line/--faint` inferred).
- Real icon SVGs (used text glyphs ✉/▯/▤ with same labels).
- Server persistence (`onSave` stubbed to toast only); skeleton loading states described in demo (`loading:true`) not shown by default.
- No browser run (per task: never install/launch a browser); verified with node only.

## How to test
- `cd` to this directory, open `index.html` in a browser.
- Toggle Daily digest / Weekly report / Hold pushes; change Send at, each type channel, Notify-on bulk, Quiet from/to; check toast.
- Toggle sun/moon top-right; reload to confirm persistence; test narrow width (~360px).
- Node-only verification (no browser):
  - `node --check ./verify.js && node ./verify.js`
  - main-script syntax was additionally checked via extracted `node --check` (passed).

## Theme check
- Checked light AND dark: harness flips `data-theme` on `<html>`, asserts both token sets, toggle round-trip, and noflash defaults. Page reviewed in both via token contrast (amber kept for dark).
- Clean-room: wrote own HTML/CSS/JS from behaviour + demo data; did not copy compiled source; demo data used verbatim.

Files: `index.html`, `REPORT.md`, `verify.js` (in-dir DOM-stub harness).
