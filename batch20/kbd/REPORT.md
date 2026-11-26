# Kbd replica — REPORT

## What I built
Standalone `index.html` (28 KB, inline CSS+JS, system fonts only) replicating affectUI **Kbd** (slug `kbd`, component, Text, Free): *"Key chip for shortcuts, showing platform-appropriate modifier keys, screen-reader friendly."*

- **Demo data verbatim** from `demo-original.js`: 6 rows — Search runs and files `mod K`, New task `C`, Run the agent `mod enter`, Stop the run `mod .`, Approve and continue `mod shift A`, Close the panel `esc`; card title `Keyboard shortcuts`; OS group `macOS/Windows` (`role=group`, `aria-label=Keyboard`, `aria-pressed`); footer `Press ? anytime to open this list`.
- **Kbd chip**: `kbd.ui-kbd` with `data-size=sm/md`, `data-os=mac/other`; inner `span.kbd-keys aria-hidden=true` with per-key `span.kbd-key` (`data-glyph` for single-char glyphs ⌘⌃⌥⇧↵⌫⌦↑↓←→) + `span.kbd-sr` with spoken names joined by spaces. Gap 1px on mac, 3px on Windows; keys forced `direction:ltr`; glyphs nudged `translate:0 -0.5px` and `1.1em`.
- **Platform logic**: `mod→⌘/Ctrl` (Command/Control), `cmd→⌘/⌘`, `ctrl→⌃/Ctrl`, `alt→⌥/Alt` (Option/Alt), `shift→⇧/Shift`, `enter→↵/Enter` (Return/Enter), `esc→Esc` (Escape), arrows/page/home/end, punctuation spoken names (`.` Period, `?` Question mark…), single letters uppercased; aliases (`command/meta/⌘→cmd`, `option/opt→alt`, `return→enter`, `del→delete`, `arrow*→*`, `pgup/pgdn`). Auto-detect via `navigator.userAgentData.platform || platform || userAgent` (`/mac|iphone|ipad|ipod/i`), prop override via OS toggle.
- **Interactive**: OS toggle re-renders all chips in place; `sm/md` size toggle + free-text playground (`mod shift A` default) with live spoken readout; auto-tour highlights one row every 2 s with dots + `role=status` line (pause/play, in-place class/text updates); real keypresses flash the matching row (`?` announces list, `Escape` announces close); theme toggle (top-right) `light/dark`.
- **Clean-room**: all HTML/CSS/JS written from the public description and observed behaviour. No copied bundle source, no `innerHTML`/`outerHTML`/`insertAdjacentHTML` anywhere.

## What matches the original
Keycap look (18 px sm / 22 px md, 1 px inset edge + heavier bottom, 11/12 px 500, `.02em`), combo spacing, `?` footer chip, macOS/Windows toggle, dark tokens (`#232326/#a1a1a6/#34343a/#1a1a1d`), forced-colors border, `aria-hidden` + sr-only spoken text.

## What I could not verify
No browser available (per task: node only). Pixel-perfect match vs. the Pro screenshot, real screen-reader narration, and `prefers-color-scheme` first paint in an actual engine were not visually checked — covered by static + stub assertions instead.

## How to test
- `open index.html` in a browser (or `xdg-open index.html`): toggle macOS/Windows, type in the playground, press `?`, pause the tour, switch theme.
- Node only: `node --check ./harness.js && node ./harness.js` — runs the in-dir DOM-stub harness.

## Verification (node only, no browser)
- `node --check ./harness.js` — pass; inline script extracted and parsed via `vm.Script` — pass.
- `node ./harness.js` — **ALL CHECKS PASSED**: visible painted text (6 actions + ⌘K/Ctrl K + ↵), full-loop node identity (6 ticks, `li` + `kbd` refs stable), zero `innerHTML` writes after init, light AND dark `data-theme` switches, noflash/meta/tokens/hover-media/tap-highlight/tabular-nums/forced-colors static checks, `<200 KB`.
- Checked light AND dark mode: CSS token sets for both (`--page #fafaf9/#101012`, `--surface #ffffff/#1c1c1f`, amber adjusted `#f59e0b/#fef3c7/#92400e` → `#fbbf24/#451a03/#fde68a`); stub asserts `data-theme=light` and `data-theme=dark` both apply with no `innerHTML`.
