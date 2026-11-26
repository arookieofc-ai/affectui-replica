# Thinking State — replica report

## What was built
- `index.html` (26 KB, single self-contained file, no network, system fonts only): AI "working" panel matching `demo-original.js` behaviour, plus a small page topbar (`Team Offsite · Lisbon` + working/done crumb + sun/moon theme toggle).
- Clean-room implementation: own HTML/CSS/JS from observed behaviour. Brand favicons are simplified coloured badges (letters), not copied SVG paths; globe/check/chevron icons are freshly drawn; CSS re-expresses the original token values.

## Original data/behaviour matched (verbatim)
- Steps: `search` row (`Searched` / active `Searching`) + `Reading 7 sources about the trip`, `Comparing flights and hotels`, `Checking dates against the team calendar`, `Drafting the offsite agenda`; done row `Finished thinking`.
- Sources (4): `Slack – #team-offsite`, `X – @lisbonguide`, `Notion – Offsite plan`, `Wikipedia – Lisbon`; more (3): `Google Flights – LIS`, `Booking.com – Lisbon`, `Airbnb – Alfama`, with original hrefs and `+3 more` / `Show less` toggle copy.
- Timings: 700 ms initial delay, 1300 ms per step, search row extended by `(min(4,12)+1)*160 = 800 ms`; source chips stagger `120 + n*160 ms`, more chips `n*70 ms`, more button `760 ms`; done at ~8.0 s; auto-loop restarts ~4 s after done; clicking `+3 more` pins the panel (stops auto-loop) — all per original.
- Live header timer (250 ms tick, `Xs` / `Xm SSs` formatter), collapsible header (`aria-expanded`, grid-rows animation), `aria-live="polite"` list, shimmer sweep on Thinking/active row, tooltip text from bare host (`slack.com`, `x.com`, …).
- Default theme = original demo appearance (light). Toggle switches `data-theme` light/dark with `localStorage` override and `prefers-color-scheme` fallback.
- No agent identities in this component, so the 3×3 pixel-mark rule is N/A (no pixel-marks added).

## Verification (node only, no browser)
- `node --check` on the extracted page script: passes.
- In-dir harness `node verify.cjs` (DOM stub + mocked clock, files inside this dir only): **PASS — all checks passed**, covering:
  - static: `/*noflash*/` guard + first-paint bg + `color-scheme` meta, `[hidden]{display:none}`, theme toggle, token vars (light + dark), no external scripts/assets, zero `innerHTML` in page script;
  - runtime: verbatim labels/sources; step 1 appears at 700 ms; active `Searching` visible; done at ~8 s with `Finished thinking` + `Worked for Ns` header; loop restart keeps identical node objects for rows/chips/more-button/done-row; **zero runtime `innerHTML` writes**; header collapse toggles; theme toggles light→dark→light; time node identity stable across 250 ms ticks; visible-text assertions skip `hidden`/`display:none` subtrees (text in markup/aria alone does not count).
- Light AND dark checked: toggle both directions asserted in harness; dark theme uses spec tokens (`#1c1c1f`/`#101012`/`#ededed`, amber adjusted) and was eyeballed via token review (no browser available in this environment).

## How to test
Open `index.html` in any browser. Watch one full loop (~12 s): Thinking + live seconds → rows appear sequentially → `Finished thinking` / `Worked for Ns` → auto-restart. Try `+3 more`, the header collapse, and the sun/moon toggle (persists via `localStorage`).
