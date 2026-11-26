# Email Draft — Replica Report

## What was built
Standalone `index.html` (inline CSS + JS, no external deps, ~29KB) replicating the affectUI `email-draft` card.

Layout from top to bottom:
- Tray record: `SUB-1182` + `Renews in 5 days` status pill + `$8,900` right-aligned, second line `Northwind Logistics`.
- Email card: `to` + recipient chip (`Jonas Weber (jonas@northwind.io)` + chevron) with dropdown menu, attachment `Renewal-quote.pdf` with remove / `Attach Renewal-quote.pdf` restore on the right; body text + `Review quote` link; tone group `Friendly / Short / Formal` + pencil edit button; `Discard` + `Send email` buttons.
- Receipt states: `Sent to <name> with <file>` / `Draft discarded` + `Undo`.
- Footer: `Renewal agent` + badge (`Ready for review` / `Sent` / `Discarded`) + hint `⌘ Enter to send`.

## Demo data (verbatim from demo-original.js)
- Contacts: Jonas Weber <jonas@northwind.io>, Lena Hart <lena@northwind.io>, Finance team <billing@northwind.io>.
- Tones: Friendly (`Hi {first}, a heads-up that your Growth plan renews on October 9 for $8,900 a year…`), Short (`Hi {first}, your Growth plan renews on October 9 ($8,900/year)…`), Formal (`Dear {full}, this is a reminder…`).
- Reference `SUB-1182`, account `Northwind Logistics`, amount `$8,900`, status `Renews in 5 days`, agent `Renewal agent`, attachment `Renewal-quote.pdf`, link `Review quote → #`.

## Behaviour matches
- Recipient dropdown (toggle, outside pointerdown closes, Escape closes), avatar initials (first alphanumeric per word, 2 chars), tick on selected; switching recipient rewrites old full/first name inside edited custom text (same RegExp logic as original).
- Tone switching clears custom edits; editing (click text / Enter-Space / pencil) sets custom text, textarea autoresizes, `input` updates in place, `Esc`/blur ends editing, `Cmd/Ctrl+Enter` sends.
- Attachment remove/restore; Send → `sending` (card dimmed, spinner + `Sending`, buttons disabled) → `sent` after 900ms; Discard → `discarded`; Undo → `draft`.
- Link click stops propagation (plus preventDefault to avoid `#` jump in standalone).
- Narrow ≤480px hides email address + hint; reduced-motion disables animations.

## Clean-room / in-place updates
- Written from scratch; no copied compiled source. Own class names (`ed-*`).
- DOM built once at init. All ticks update existing nodes via `textContent`, attributes, `style.display`, classes. No `innerHTML` anywhere in component script (asserted by harness + grep). Menu items, file/attach, text/textarea, card/receipt pairs are pre-built and toggled, never rebuilt.

## v5 polish
- All `:hover` inside `@media (hover: hover) and (pointer: fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (tray 20px = card 16px + 4px padding); shadows for elevation, borders only for structure/inputs; icon buttons optically nudged (asymmetric padding).

## Dark mode
- Tokens via CSS vars; `html[data-theme]` toggle (☾/☀ top-right), default from `prefers-color-scheme`, persisted as `email-draft-theme`. Dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`; amber waiting adjusted (`#fbbf24` on `#451a03`, text `#fde68a`).
- Checked: light tokens + dark tokens present in CSS; toggle flips `data-theme`; harness asserts both apply.

## Verification (node only, no browser)
- `node --check harness.js` — pass.
- `node --check .check-component.js` (extracted inline component script) — pass.
- `node harness.js` — HARNESS PASSED, covering:
  - VISIBLE painted text (all key strings found in visible tree walk skipping `display:none`),
  - full-loop node identity (tones → edit → recipient rename → attach remove/restore → send → sent → undo → discard → undo → menu; `els` registry same object, card/badge still attached),
  - zero `innerHTML` writes after init (setter trap count = 0 + static grep),
  - light AND dark theme tokens + toggle.

## How to test
- `open index.html in a browser` (double-click or `python3 -m http.server` then visit). Click recipient to switch, try tones, click body text to edit, `Cmd+Enter` to send, Discard/Undo, theme button top-right, narrow window for responsive.
- Re-run checks: `node --check harness.js && node harness.js` in this directory.

## Not verified in browser
- Pixel-perfect spacing vs original screenshot, popover overflow on very narrow trays, real focus-ring rendering, and smooth height animation (ResizeObserver path) were not visually compared; no browser was launched per task constraints.
