# REPORT — agent-chat (AI Chat / Agents)

## What I built
Standalone `index.html` (~34KB, no deps) replicating the affectUI **AI Chat / Agents** App screen:
"Chat with orchestrating agent, active agents, and a fill-in brief beside it."

- **Left — chat:** crumb bar `Home / Generate on-brand creative` + theme toggle + chat-options menu
  (Pin/Rename/Share/Delete); user bubble (`Desire-driven`); orchestrator answer
  ("I'll pull your bestseller first…", `Worked for 3m 38s` with live 3×3 pixel-mark,
  bestseller paragraph, "how should we sell this shirt?" question, `Agents working` +
  5 agent pills: Campaign manager, Brand research, Creative pipeline, Audience research,
  Creative direction); composer with `Orchestrator — Routes each request` and
  `Ask anything or @ to add context` input. Sending a message shows the 3 pipeline steps
  (Reading the brief / Checking 412 orders… / Lining up the creative pipeline) then an
  angle-aware reply (verbatim logic from the demo: `Good call…` vs `Noted: "…"…`).
- **Right — fill-in brief** (380px, tabs `Brief | Assets | Activity` with arrow-key support):
  product card (Linen Overshirt, $89 · 412 sold this month, Bestseller), Selling-angle
  radiogroup (Desire-driven / Problem–solution / Social proof + notes + 3/2/1 signal bars),
  Audience pills, Channels switches (Instagram/TikTok on, Facebook off), Palette
  (Sand/Olive/Off-white/Ink) + Formats (Feed/Story/Banner) split card, Details
  (Mon, Jun 2 / $2,400 / week / US, UK, AU), Files
  (brand-guide.md, launch-budget.csv, product-photos), sticky go-bar (`6 ads · ~2 min` +
  Generate ads → `Generating…` → `Generate again`). Assets tab empty → generating →
  6 ad cards (verbatim titles/channels/colors); Activity feed updates in place.
- All demo data (angles, ads, audience, channels, palette, formats, details, files, steps,
  reply copy, activity entries) taken verbatim from `demo-original.js`. Hand-written
  CSS/SVG-free glyphs only — no copied source.

## How to test
1. `open index.html` in a browser (or serve the directory), toggle ☀/☾ top-right.
2. Node only: `node --check harness.js && node harness.js`
   (plus: extract inline script → `node --check` — both syntax-clean).

## Verification (node only, no browser)
- `node --check` on extracted inline script: OK; on `harness.js`: OK.
- `node harness.js` → **ALL CHECKS PASSED** in **light and dark**:
  - 45 visible strings painted (angles, agents, ads, details, files, brief, activity…),
    plus composer placeholder attribute.
  - Full loop (angle change → 2 sends → Generate ads → 6 ad cards + `6 ads generated`
    activity) paints correctly.
  - Node identity preserved across the whole loop (column/product/brief/assets/activity/
    angle buttons/user bubble/ads grid are the same objects).
  - Zero `innerHTML`/`outerHTML`/`insertAdjacentHTML` writes after init (setter trap;
    source contains none; all updates via `textContent`/attributes/hidden/class).
- Static spec checks: `/*noflash*/` first in `<head>` + `color-scheme` meta + bg style,
  full token set (light + dark incl. amber/green adjustments), `:hover` only inside
  `@media (hover:hover) and (pointer:fine)`, tap-highlight reset, `tabular-nums`.

## Light AND dark
Both themes verified in the harness (init with `prefers-color-scheme` light and dark,
plus in-place toggle round-trip). Dark uses the same tokens remapped
(surface #1c1c1f, page #101012, ink #ededed…) with adjusted thumb/signal colors;
borders stay visible, no grey-on-grey.

## Could not verify / notes
- No pixel-diff against the original (no browser/screenshots per task constraints);
  match is by behavior + tokens + layout from the demo chunk's CSS/text.
- Artifact previews for `brand-guide.md / launch-budget.csv / product-photos` are file
  chips only (original opens a viewer panel); chat @-mention tray omitted (`tray:!1`).
- Icon glyphs are clean-room unicode marks, not the original icon paths.
