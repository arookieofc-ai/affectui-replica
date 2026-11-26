# Prompt Explorer — REPORT

## What was built
Standalone `index.html` (~37KB, inline CSS+JS, system fonts, no external deps) replicating the affectUI **AI Search / Prompt Explorer** (slug `prompt-explorer`).

- Hero: “Explore what people are prompting ChatGPT” with animated gradient backdrop, centred search box (max 600px).
- Search box: auto-growing textarea (combobox) + `Relevant searches` dropdown (max 5, starts-with first then includes), volume + change per row, typed-substring highlight, full keyboard (ArrowDown/Up, Escape, Enter).
- Modes: `Prompts and keywords` / `A page's address` radios + `Bulk analysis` switch + prompt counter + `Analyse` button. URL mode disables bulk, matching original.
- Analysis card: `Analysing…` skeleton (2 rows) → header (`Analysis` / `N prompts`) + grid rows `Prompt | Prompts/mo | Change | 12 months sparkline | Mentions you meter+%`, clear button.
- Keywords split card: `Popular Keywords` (7 verbatim) + `Trending Keywords` with Rising/Falling toggle (7+7 verbatim). Clicking any keyword analyses it. Live highlight rotates every 4s in place.
- Top bar: Northwind + Pro plan + nav (Conversations active) + sun/moon theme toggle.
- Toast for empty input. Responsive: split→stack, result trend/share columns hide ≤860px, hero/box tighten ≤560px.

## Data (verbatim from demo-original.js)
- `ALL` (26): northwind ai visibility 549.4k +76.2k … perplexity citations 8.9k +1.9k (full list in code).
- `POPULAR` (7), `RISING` (7), `FALLING` (7) with volumes/changes as in source. Trend sparklines regenerated with the same seeded hash (12 pts); share % via same `(hash>>9)%70/100+.04` fallback. Formatting `k/M/B`, `+`/`−`, `%` matches original helpers.

## What matches / what was approximated
- Matches: layout, copy, counts, filtering order, keyboard map, bulk counting, skeleton → results flow, meters, sparklines, toggle semantics, tokens.
- Approximated (clean-room): hero artwork is CSS gradients (original embeds a base64 photo strip); icons are text glyphs (⌕ ⇅ ↗ ↘ ▲▼ ◐ ☾) instead of the proprietary icon set; app chrome simplified to a single top bar (original lives inside a DemoStage shell). No Pro .tsx fetched or copied.

## In-place updates (v4)
- DOM built once at init (suggestion pool 5, result pool 12 + 2 skeletons, keyword pools 7+7). All ticks/inputs/loop-restarts update `textContent`/`hidden`/`aria-*`/`style.width`/`d` on existing nodes only. **Zero `innerHTML` writes** anywhere (harness counts setter after init).

## v5 polish
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (`--r-lg 16px/--r 10px/--r-sm 6px`); borders only on dividers/inputs/selected, depth via layered box-shadows; hero image outline via inset shadow; icon buttons optically padded.

## Verification (node only, in-dir)
- `node --check _pex-check.js` (app JS extracted from index.html) → OK.
- `node --check harness-stub.js` → OK.
- `node harness-stub.js` (DOM stub, no browser) → **ALL HARNESS CHECKS PASSED**: noflash guard + `color-scheme` meta + bg style; light (`#fafaf9/#171717`) and dark (`#101012/#1c1c1f`) tokens; gated hover; tabular-nums; visible painted text (title, Popular/Trending, Analyse, Bulk, Relevant searches, Northwind + verbatim rows); pool sizes 5/12/7+7; full-loop (14-tick) node identity; trend-switch node reuse + verbatim repaint; 2-row analyse paints volumes; zero innerHTML after init; theme toggle flips light→dark→light.

## How to test
Open `index.html` in a browser. Try: type `northwind` (dropdown appears) → Enter; toggle Bulk + paste 3 lines → Analyse; switch Rising/Falling; toggle theme (top-right) in both OS light and dark; narrow window to mobile width. No server needed.

## Light AND dark
Checked via tokens + toggle in harness; visually the page uses the same token set with dark surface/page/ink/muted/subtle/border and amber-adjusted waiting tones. Toggle persists to `localStorage (pex-theme)`, defaults to `prefers-color-scheme`.
