# Chat Composer — replica report

## What was built
`index.html` (42 KB, single self-contained file, no network, system fonts only):
a clean-room replica of the **Chat Composer** prompt composer — tray + card layout,
textarea with auto-grow (1→2 rows), attach button, **Request approval** pill
(hand → shield swap, shimmer sweep + wave while loading, amber wash when done),
model picker (Auto / Claude / ChatGPT with descriptions), mic voice input with
live 16-bar trace + word-by-word dictation overlay, discard/use squares, send
button (enabled only with text), folder foot row, "Connect apps" foot row with
logos, three anchored popover menus with full keyboard support
(ArrowUp/Down, Home/End, Enter/Space, Esc, Tab), polite live region, page header
(`Chat Composer` + live status + `3 models · 4 folders · 3 apps`), and a visible
sun/moon theme toggle switching `data-theme="light"|"dark"` on `<html>`.

No agent identities exist in this component, so no 3×3 pixel-marks apply.
Default theme is **light** (the original demo's appearance); amber waiting tokens
are adjusted for dark (`#fbbf24` on `#451a03`, text `#fde68a`).

## Original data / behaviour matched (verbatim)
- Models, descriptions, folders (`Q3 Campaign`, `Brand assets`, `Hiring`, `Research`),
  apps (`Gmail`, `Slack`, `ClickUp`, default `gmail`), placeholder
  `Start by typing...`, dictation `Draft a short update for the team about this week's progress`.
- Timings: approval `1300ms`, dictation word every `320ms`, trace tick `120ms`, 16 bars.
- Announcements verbatim: `Requesting approval…`, `Unrestricted access granted.`,
  `{name} selected.`, `Working in {f}.`, `No folder selected.`,
  `{App} connected./disconnected.`, `Message sent.`,
  `Recording. Press Escape to discard.`, `Recording added to your message.`,
  `Recording discarded.` All labels (`Work in a folder`, `Connect apps`,
  `Select a model`, `Apps`, `Request approval`, `Unrestricted access`, …) verbatim.
- Hard-won rules honoured: tick loops touch only bar `style.height` + heard
  `textContent` (harness asserts bar count stays 16); menus open on
  `pointerdown` capture with outside-dismiss guard; hover/focus are CSS- or
  class-only, never a re-render; `[hidden]{display:none}` rule present;
  SVG classes set via `setAttribute`; no browser launched.

## Verification
- `node --check` on the extracted inline script: **OK**.
- `node verify.cjs` (in-dir DOM-stub harness: mini HTML parser, fake timer
  queue advancing the full loop, visibility walker that excludes
  `display:none`/`visibility:hidden`/`color:transparent`/`font-size:0`/sr-only/
  opacity-swapped labels): **ALL CHECKS PASSED** (~120 assertions) covering
  approval flow, model/folder/apps menus (mouse + keyboard + outside dismiss),
  full dictation loop, discard/use, send incl. Shift+Enter, and theme toggle.
- **Light AND dark checked**: toggle flips `data-theme`, key text stays visible
  in both; dark token set present in CSS. Page not screenshot-checked in a real
  browser (headless Chrome unavailable here) — open `index.html` in a browser
  to review visually.

## Browser-QA fix 2026-11-26 — model-menu descriptions cut off
- QA finding (confirmed, not one of the two prior false positives): model menu
  opened with Auto (checked), Claude, ChatGPT, but descriptions painted
  truncated mid-word (`Picks the best model for each t…`,
  `Quick answers for everyday ta…`).
- Ground truth checked first in `demo-original.js` (in-dir): verbatim
  descriptions match (`Picks the best model for each task`,
  `Thoughtful writing and code`, `Quick answers for everyday tasks`); timings
  match (`1300ms` approval, `320ms` word, `120ms` trace, 16 bars). Original CSS
  also uses `white-space:nowrap;overflow:hidden;text-overflow:ellipsis` for
  `.ui-chat-composer__option-desc`, but its menu is `1100*u` (~297px at
  `u=0.27px`) giving ~776u text width, enough for the ~704u longest desc to
  fit single-line. Replica used `width:280px` with larger chrome (22px logo +
  17px check + 24px opt padding + 12px panel padding), leaving only ~185px for
  12px text (~192px needed) — so ellipsis triggered where the original fits.
  Real defect, not a QA false alarm.
- Root causes: (1) menu too narrow (280px vs ~297px original); (2) `.opt-desc`
  hard single-line ellipsis with no wrap fallback, so any font-metric
  difference clips mid-word.
- Fix in `index.html` (CSS-only, no JS/DOM change): `.menu{width:340px}`
  (mobile `min(340px,calc(100vw - 40px))`); `.opt-desc` now
  `white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:break-word;line-height:1.35`
  so every description paints in full (single-line at desktop, wrapped fallback
  when narrow). Same tokens in both themes; hard-won rules untouched (no tick
  rebuild, pointerdown-capture open, `[hidden]{display:none}`, SVG
  `setAttribute`).
- Harness (`verify.cjs`, node-only, in-dir): fixed script extraction to use the
  last `<script>` block (first is noflash; greedy match previously pulled HTML
  and threw `Unexpected token '<'`). Added static FIX asserts (`.opt-desc`
  wraps, no nowrap/ellipsis, menu >=320px) plus VISIBLE painted asserts in
  LIGHT and DARK: open model menu (unhidden) and require full strings
  `Picks the best model for each task`, `Thoughtful writing and code`,
  `Quick answers for everyday tasks` in visible text in each theme.
- Result: `node verify.cjs` → **ALL CHECKS PASSED** (light + dark painted
  descs pass, specific fix asserts pass).
