# Settings / Models — replica report

## What was built
- Single self-contained `index.html` (43KB, inline CSS/JS, no external deps, system fonts only).
- Layout: settings shell (left nav: General / Models [active] / Members / Security / Notifications / Billing) + main column.
- Hero: `Models` title, description, `5 providers · 13 models` crumb, `8 enabled` pill, theme toggle, counts pills, thin 3px quota bar (`8 / 13 enabled`), search + region + access filters, `Saved …` / `Showing …` / `Last probe …` meta line.
- 5 provider sections (OpenAI US, Anthropic US, Google Global, Mistral EU, Cohere EU) with deterministic letter mark, region badge, `x of y enabled` subline, master `role=switch`, and model rows (name, mono id + context, Production/Beta/Restricted badge, latency, per-model switch).
- Custom endpoints card (2 seeded rows with status dot, Test/Remove, add form with https validation) and API keys card (3 seeded masked rows with Reveal/Copy/Delete, add form). Toast + sr-live announcer.
- Interactions, all in-place: search/region/access filter via `display` + `textContent`; per-model and per-provider switches update `aria-checked`, latency text, counts, quota width, saved stamp; 5s latency probe ticks one enabled model; endpoint Test flips `Probing…` → `Online …ms`; keys reveal/copy only touch the row; add/remove use `createElement`/`removeChild`, never rebuild sections.

## What matches the original
- Brief: model settings by provider and region with switches, access, search, custom endpoints, keys.
- Spec tokens, radii, shadows, pills, card padding/gaps, focus-visible, 150–200ms transitions.
- v3: header keeps project + provider/model counts; thin 3px bar; no invented dot-mark overload (letter marks with inset outline); dimmed sections stay legible; single-line ellipsis titles.
- v4: `/*noflash*/` guard first in head + `html{background…}` + `color-scheme`; DOM built once (static HTML hydrated), all ticks/filters/toggles mutate nodes in place.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (16/10/6); shadows for lift, borders for structure; marks use 10% inset outline; icon-side optical padding.

## Demo data note
- `./demo-original.js` verbatim is a 1-line stub (`DemoStage` + `component` re-export, no models/providers/keys). No usable demo data exists, so plausible data in the same shape was used (13 models across 5 providers, 2 endpoints, 3 keys) and baked as static painted HTML.

## What could not be verified
- Pixel comparison vs the live affectUI page (no browser/fetch allowed here). Checked structure/behaviour via stub only.
- Real clipboard and real endpoint probing (stubbed to toast + fake `Online …ms`).
- No `Pro .tsx` source was fetched or copied (clean-room).

## How to test
- Open `index.html` in a browser (double-click or `python3 -m http.server` then visit the file).
- Toggle any model/provider switch → counts, quota bar, saved time update.
- Type `claude` in search; try Region `EU`, Access `Beta`; clear to restore.
- Test/Remove/Add an endpoint; Reveal/Copy/Delete/Add a key.
- Click `◐/◑` top-right → dark/light; reload keeps choice (`affectui-settings-models-theme`, defaults to `prefers-color-scheme`).
- Node-only verification (no browser, no rm, in-dir only):
  - `node --check harness.cjs`
  - `node harness.cjs` (asserts visible painted text, full-loop node identity, zero `innerHTML` writes after init, light AND dark themes)

## Verification
- `node --check harness.cjs` → pass.
- `node harness.cjs` → HARNESS PASSED (21 visible-text checks, noflash/polish checks, zero `innerHTML` occurrences, theme flip light→dark→light, 30-tick full-loop identity preserved, filter/switch/tick in-place checks).
- Checked light AND dark themes via CSS tokens (`#ffffff/#fafaf9` vs `#1c1c1f/#101012`) and stub theme-toggle flip.
