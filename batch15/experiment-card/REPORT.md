# Experiment Card — Replica Report

## What was built
ONE self-contained `index.html` (32.5 KB, no network, system fonts) replicating the affectUI **Experiment Card** (`Signup button copy`) as clean-room code. Card sits in a centered tray (`max-width 340px`) under a page header `Growth · 1 running · 3 variants` with a visible sun/moon theme toggle (top-right).

Layout matches the original: header (mini bar chart + title/status/note + leader pill), unfolding body (metric switch with sliding thumb + 3 winner rows with badge/label/value/lift pill/track bar), footer (live caption + `Ship X` action). Folds use `grid-template-rows 0fr→1fr`; tag/lead/lift are fully-rounded pills; cards have 1px border + soft shadow + hover lift + focus-visible outline; single-line ellipsis titles; container query ≤300px + coarse-pointer + reduced-motion respected.

## Data / behaviour matched verbatim (from demo-original.js)
- Title `Signup button copy`, status `Running` (green), note `Day 9 of 14`.
- Metrics: `Conversion` (`v.toFixed(1)+"%"`), `Revenue` (`"$"+v.toFixed(2)`), `Bounce` (`v.toFixed(1)+"%"`, lowerIsBetter).
- Variants: A `Start free trial` control 4790 {4.2, 18.4, 41.3}; B `Try it free` 4812 {4.7, 19.1, 38.2} conf {96,81,93}; C `Get started – $0` (en-dash) 4755 {4.0, 21.6, 43.9} conf {62,97,71}.
- Lifts: raw `(k-j)/|j|*100`, adjusted `*-1` for bounce; formatted `+X.X%` / `−X.X%` (U+2212), 1-decimal `Intl`. Leaders: Conversion B `+11.9%`, Revenue C `+17.4%`, Bounce B raw `−7.5%` with flipped arrow (original shows raw + down arrow).
- Captions: hover `B · 4,812 visitors · 96% confidence` / `· baseline` for control; winner `Try it free picked`; default `Pick a winner`; action `Ship B/C`.
- Loop: 700ms delay then every 2200ms cycle 5 → open → revenue → bounce → conversion → close; paused on `pointerenter`/`pointerdownCapture`/`keydownCapture`/`focusCapture`. Hover open 90ms / close 220ms (mouse only), outside `pointerdown` capture closes, `Escape` closes + refocuses toggle, metric radiogroup arrows/Home/End, animated numbers 620ms easeOutQuart (reduced-motion jumps), thumb follows checked metric.

## In-place updates
DOM built once (`buildOnce`); timers only mutate text/`data-*`/`aria-*`/styles on existing nodes. No `innerHTML`/`outerHTML` anywhere. Hover/focus only updates dims + caption.

## Verification (node only, in-dir)
- `node --check .extracted.js` → OK.
- `node verify.cjs` (in-dir DOM stub, mock timers) → **ALL CHECKS PASSED**:
  - Static: noflash early in `<head>`, `color-scheme`, `[hidden]{display:none}`, tokens light (`#fafaf9/#ffffff/#171717/#78716c/#f5f5f4/#e7e5e4`) + dark (`#101012/#1c1c1f/#ededed/#a1a1aa/#26262a/#2e2e33`), no network, header pattern.
  - Visible (textContent, not markup-only): title, Running, Day 9, 3 metrics, 3 names, `Pick a winner`, `B +11.9%`.
  - Full loop via `advance()`: closed→open(700)→revenue `$18.40/$21.60` leader `C +17.4%`→bounce `38.2%`→conversion `4.7%`→closed.
  - Identity: root/toggle/lead/caption/cols/rows/value nodes `===` across full loop; `__innerHTMLWrites===0` after init and after loop.
  - Hover `B · 4,812 visitors · 96% confidence`, control `baseline`, winner `Ship B` shows/hides.
  - Light AND dark: `setTheme('dark'/'light')` flips `data-theme`, toggle icon/aria updates, dark tokens present.

## How to test
Open `index.html` in a browser. Watch auto-loop (opens, cycles Revenue→Bounce→Conversion, closes); hover chart/rows for confidence captions; click card to pin; click a row to pick winner → `Ship X` appears; toggle sun/moon for dark mode. No server needed.
