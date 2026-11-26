# Tips Panel — replica report

## What was built
ONE self-contained `index.html` (17 KB, no network, system fonts) replicating the
affectUI **Tips Panel** (`ui-tp`) from `demo-original.js`. Clean-room code: own
HTML/CSS/JS matching the observed look and behaviour, no copied bundle source.

Layout:
- Gray tray (`6px` padding, `22px` radius = `16px + 6px`, concentric) with header +
  white card + footer, max-width `760px`, centered on a page (`#fafaf9` / `#101012`).
- Header: `Tips` title (16px/600) + live count `0/9 done` (13px muted, tabular-nums,
  `aria-live="polite"`), exactly like the original `X/Y done` with
  `Intl.NumberFormat('en')` (no spaces around `/`).
- Card: `ul.tp__grid`, 3 columns → 2 columns ≤620px (container query ≤560px too)
  → 1 column ≤430px (container ≤380px), `14px` padding, `12px` gap, `420px`
  max-height scroll.
- Each tip: title (14px/500), description (13px muted, `pre-line`), action button
  (`30px` min-height, ring + soft shadow) or done badge (check circle SVG +
  label, `tp-pop` animation). Stagger `80 + min(i,12)*50ms`. `pro` tip uses the
  dark-gradient primary button (inverts in dark mode, like the site).
- Footer: `Close` button. Clicking fades the panel (`data-closing`, 650ms) then
  resets all tips to un-done in place — the demo loop (original used 900ms +
  remount; this replica keeps node identity per v4).
- Page chrome: minimal top bar with `Tips Panel` subtitle and a visible
  sun/moon theme toggle (top-right).

## Matched data / behaviour (verbatim from demo-original.js)
- All 9 tips with exact titles, descriptions, actions, doneLabels:
  Invite your team / Invite / Invite sent; Quick search / `Press ⌘K …` (real
  `<kbd>⌘K</kbd>`) / Try it / Got it; Weekly digest / Turn on / Turned on;
  Connect Slack / Connect / Connected; Mobile app / Get the app / Link sent;
  Ready for Pro? / See plans / Opened (primary); Dark mode / Switch / Switched;
  API keys / Create key / Key created; Export data / Export / Export started.
- Default title `Tips`, close label `Close`, count format, duplicate-id key
  scheme (`id` / `id#n`), check icon (`circle r=7` + `m5 8.2 2 2 4-4.2` stroke).
- No agent identities in this component, so no pixel-marks (spec: only if the
  component has agent identities).
- Default theme = original demo appearance (light). Toggle switches
  `<html data-theme="light|dark">`, persisted as `tips-panel-theme`.

## Polish / spec compliance
- Tokens via custom props for every colour; light (`surface #ffffff`,
  `page #fafaf9`, `ink #171717`, `muted #78716c`, `subtle #f5f5f4`,
  `border #e7e5e4`) and dark (`surface #1c1c1f`, `page #101012`, `ink #ededed`,
  `muted #a1a1aa`, `subtle #26262a`, `border #2e2e33`); component tray/card
  tokens match original (`#f0f0f0`/`#ffffff` light, `#161618`/`#232326` dark).
- `/*noflash*/` guard first in `<head>` + `html{background}` inline +
  `<meta name="color-scheme">`; dark never flashes white.
- In-place updates only: DOM built once at init; clicks and the close timer
  swap only the affected slot badge/button and the count text. Zero
  `innerHTML` writes after init; hover/focus never re-render.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`,
  `html{-webkit-tap-highlight-color:transparent}`,
  `body{font-variant-numeric:tabular-nums}`, concentric tray radius,
  shadows for elevation / borders for structure, `focus-visible` outlines,
  `[hidden]{display:none}`, SVG attrs via `setAttribute` only.

## Verification (node only, no browser)
- `node --check` on the extracted panel script: **OK**; on harness: **OK**.
- In-dir stub harness `harness-verify.js` (`node harness-verify.js`):
  loads the page script in a stub DOM, asserts **visible** text/state,
  advances timers through the full loop. All passed:
  - 9 rows, exact titles/actions, `⌘K` kbd visible, primary on Pro.
  - Click all 9 → count `9/9 done`, each badge shows its doneLabel
    (`Invite sent`, `Got it`, … `Export started`), `data-done` set.
  - Close → `data-closing`, timer fires → reset to `0/9 done`, buttons restored.
  - Node identity held for section, count, and all 9 `li`s across the full
    loop; `innerHTML` writes = 0 after init; single section (no rebuild).
  - Light default, toggle dark → light both verified; dark/light tokens present.
- Open `index.html` in a browser to test manually (click actions, Close reset,
  theme toggle, narrow widths, keyboard Tab/Enter).

## Not verified / notes
- No browser run (per instructions); container-query breakpoints covered by a
  media-query fallback and eyeballed via CSS values.
- Original wrapper scale-to-fit (`--fit`, 720×410 preview) is preview chrome,
  not part of the component — omitted.
