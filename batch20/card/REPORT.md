# Card replica — REPORT

## What was built
Standalone interactive `index.html` (20.2 KB, inline CSS + JS, no external deps) replicating the affectUI **Card** (`card`, component, Cards, Free): a tray + sheet screen card with **header** (icon tile + title + quiet description + action), **content** body (stats), **footer** (status + Open button on the tray), **selection** (two `Replies` mode cards, `data-selected` + `aria-pressed`), and **click target** (stretched title button covers the whole tray, focus ring wraps the tray).

Demo data used verbatim from `demo-original.js`: `Support triage` / `Sorts new tickets and drafts the first reply`, stats `Tickets 142`, `Resolved 96%`, `Spent today $4.20`, footer `Running · started 2 min ago` + `Open`, label `Replies`, modes `Draft only` / `You send every reply` and `Send for me` / `Asks before refunds`, action aria-label `More for Support triage`.

Behaviours: mode select (click card, button, Enter/Space), live footer timer (in-place `textContent` tick `Running · 2m 05s…`, wraps at 1h without rebuilding), Open toggles an inline detail row, More toggles a small menu (Rename/Archive stamp the footer line), deterministic 3x3 pixel-mark tile for `support-triage` with busy twinkle, theme toggle (sun/moon, top-right), responsive stack under 560px, reduced-motion + forced-colors support. Clean-room: own class names/CSS/JS written from the public description and observed behaviour; no compiled source copied.

## What matches the original
- Tray geometry: 4px inset, outer radius 20px = inner 16px + 4px (concentric), sheet padding 16px, gap 12px, fonts 13/14px titles 500.
- Header/content/footer arrangement incl. footer-on-tray (40px min-height, 16px/2px insets, faint 12.5px text), action pinned to the title line.
- Interactive stretched `::after` click target with z-index handling; hover shadow swap; selected = darker tray + firmer edge, no coloured ring.
- Pixel-mark identity tile (deterministic per id, busy pulse with staggered delays).

## What could not be verified
- Pixel-exact comparison against the proprietary rendered demo (no browser/screenshot used per task constraints).
- `HugeiconsIcon`/`MoreHorizontalIcon` glyphs: replaced with an equivalent inline three-dot SVG drawn from scratch.

## How to test
Open `index.html` in a browser. Click the two Replies cards (selection + note update), press `Open` (detail expands), press `···` (menu), watch the footer timer tick, toggle the Light/Dark button top-right, resize below 560px.

## Verification (node only, no browser)
- `node --check harness.js` — OK; app script syntax validated via `vm.Script` — OK.
- In-dir DOM-stub harness `harness.js` — all pass: VISIBLE painted text for every demo string, full-loop node identity (77 nodes, 12 ticks + select send/draft + 3600-tick wrap, same object refs), zero `innerHTML`/`outerHTML` writes after init, theme toggle light→dark→light with persisted key.
- Light AND dark confirmed: token sets for both themes present in source and the toggle path exercised in the stub for both directions.
