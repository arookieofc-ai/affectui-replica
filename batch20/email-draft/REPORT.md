# Email Draft — targeted chip fix (REPORT)

## What this page is
Standalone replica of the `EmailDraft` demo (`SUB-1182`, Renewal agent): record header, recipient picker, attachment chip, editable body with tone pills, Send/Discard with receipt + Undo, Ready/Sent/Discarded badge. Demo data verbatim (`Jonas Weber`, `Lena Hart`, `Finance team`, `Renewal-quote.pdf`, `Review quote`, tones Friendly/Short/Formal).

## Targeted defects (from real-browser QA) — all in attachment chip, both themes
1. File icon painted as plain black slanted block (nearly invisible in dark).
2. Filename showed `Renew…` though DOM held `Renewal-quote.pdf` and there was room.
3. Remove button painted as empty box / thin bar — × glyph missing.

## Original behaviour check (`demo-original.js`)
- Checked before changing: original does **not** behave this way. Original renders a proper stroked file (paperclip) icon, the full `Renewal-quote.pdf` name (ellipsis only on real overflow), and a visible × remove button.
- Original mechanism: global ` .ui-ed svg { fill:none; stroke:currentColor; … }` + ` .ui-ed__file-name { min-width:0; overflow:hidden; text-overflow:ellipsis }` (no restrictive max-width) + file/attach as direct flex items of ` .ui-ed__meta` (both `min-width:0`). Icon helper `d()` emits bare `<svg viewBox><path d=…>` and relies on that CSS. Paths: clip `m15.5 7.5-6.4 …l6-6`, × `M7 7l10 10M17 7 7 17` — same as replica JS, so JS needed no change.

## Root causes in `./index.html`
1. **Missing SVG presentation rule.** Replica had only `.ed-recip svg` sized; no global `.ed svg` rule. `svgEl()` creates bare SVG+path with no fill/stroke attrs, so browser defaults apply: `fill:#000; stroke:none`. Filling the open paperclip path yields a solid slanted blob; filling the open × path yields near-nothing (thin bar/empty box). In dark (`--surface:#1c1c1f`) the black blob vanishes into the card.
2. **Introduced `.ed-side` wrapper with no CSS.** Original puts file/attach directly in `.ui-ed__meta` (flex, `min-width:0`). Replica wraps both in `<div class="ed-side">` with zero styles: default `display:block; min-width:auto`. As a flex item of `.ed-meta` it refuses to shrink, squeezing the inner `inline-flex` file to a few px, so `.ed-fname` (ellipsis) collapses to `Renew…` despite room. Also missing `white-space:nowrap`/`flex` on `.ed-fname` and `flex:none` on the clip svg made it worse.

## Fixes (in-place, everything else identical)
- Added global icon rule (before `.ed-recip` so specifics still win):
  `.ed svg{width:15px;height:15px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}`
  plus `.ed-fremove svg{width:13px;height:13px}` matching original `13px` remove icon. Icons now inherit `var(--muted)` → `currentColor`, visible in light (`#78716c` on `#ffffff`) and dark (`#a1a1aa` on `#1c1c1f`).
- Added shrink-safe layout:
  `.ed-side{display:flex;align-items:center;min-width:0;flex:0 1 auto}`
  `.ed-file{…flex:0 1 auto;max-width:100%;…}` + `.ed-file>svg{flex:none}`
  `.ed-fname{min-width:0;flex:0 1 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}` (no restrictive max-width; `title` + `aria-label` still carry full name).
- No JS changes; no data changes; `/*noflash*/` guard, in-place updates, zero `innerHTML` preserved.

## Verification (node only, in-dir)
- `node --check verify-chip.cjs` → ok; extracted inline scripts also `node --check` clean; `innerHTML` count in `index.html` = 0.
- `node verify-chip.cjs` (DOM-stub harness, no deps) → ALL PASS:
  - static: noflash, color-scheme, `stroke:currentColor`+`fill:none`, 13px ×, muted colors differ from surfaces in both themes, clip/× paths byte-match original, `.ed-side` flex+`min-width:0`, `.ed-fname` nowrap+ellipsis with no restrictive max-width;
  - live stub: `fname.textContent/title === "Renewal-quote.pdf"`, remove `aria-label` full, file visible, inline SVGs present with correct `d`, in **light AND dark** (`data-theme` toggled);
  - full loop (`pickTone`, `pickRecipient`, edit, remove/re-attach, `send→sent→undo→discard→undo`): every captured node (`file/fname/fremove/attach/text/textBody/card/receipt/badge/send/tonesWrap`) keeps object identity; `innerHTML` writes = 0.

## How to test in a browser
Open `index.html` → chip shows paperclip + `Renewal-quote.pdf` + ×; click × → `Attach Renewal-quote.pdf` CTA; click it → chip returns. Toggle ☾/☀ (top-right): icon (muted) and × stay legible, never black block / empty box; name stays full unless the viewport is narrowed to force real ellipsis (hover shows full `title`).

## What was not changed / not verified
- No full-browser screenshot; harness is a DOM stub + CSS-text assertions, not layout pixels.
- Narrow-viewport (`≤480px`) and `prefers-reduced-motion` paths untouched; receipt/tones/menu logic untouched except exercised for identity.
