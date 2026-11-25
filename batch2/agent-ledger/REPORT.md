# Agent Ledger — replica report

## What was built
`index.html` (self-contained, no external dependencies) replicates the affectUI
**Agent Ledger** demo: every agent-made change with before/after detail and undo options.

- Header matches the original: ledger mark, title **"Ledger"**, agent **"Launch agent"**,
  right-aligned live summary **"N changes"** plus **"N undone"** (aria-live).
- Rows are newest-first, 62px, icon + action/target line + before → after (or detail) line,
  relative time + system, hover/focus reveals a pill **Undo** button, undone rows show **Redo**
  with an animated strikethrough.
- Undo cascades to dependents (entries that `dependsOn` the undone one); hovering an Undo
  button previews the chain (highlight + "Also undone" flags, "Can't undo" kept flag for the
  non-reversible entry). Matches the original demo's dependency graph.
- Live demo playback from the original: entries stream in on the original timeline,
  auto-undo of the price change at ~12s, highlight of the price row just before, loop reset
  at 24s, pause while hovering (mouse) or focused.
- Extensions required by the task prompt (not in the original, clearly additive):
  click a row to expand a before/after diff panel with meta (system, age, builds-on,
  required-by, reversible state, Escape to collapse); filter by agent (All agents /
  Launch agent pills) plus a system filter built from the original system names; Replay button.

## Original demo data used (from `demo-original.js`, values exact)
Agent: **Launch agent**. Title: **Ledger**. Timing: reveal offsets, auto-undo at 12.2s,
loop at 24s, ×22 timestamp multiplier — all reproduced.

| # | Action | Target | System | Before → After / Detail | Notes |
|---|--------|--------|--------|-------------------------|-------|
| 1 | Merged PR #482 | Pricing page v2 | GitHub | `pricing-v2` → `main` | |
| 2 | Deployed | affectui.com | Vercel | `#481` → `#483 in production` | depends on PR |
| 3 | Changed price | Pro plan | Stripe | `$29 / month` → `$34 / month` | scripted auto-undo |
| 4 | Created coupon | LAUNCH20 | Stripe | 20% off the first year · ends in 7 days | |
| 5 | Updated page | Pricing FAQ | Notion | `3 answers` → `3 answers rewritten` | |
| 6 | Updated 212 deals | Renewals in Q4 | HubSpot | `$29 per seat` → `$34 per seat` | depends on price |
| 7 | Posted in #launch | New pricing is live | Slack | With a link to the pricing page | depends on deploy |
| 8 | Sent email | 3,812 customers | HubSpot | New price and the code LAUNCH20 | depends on price+coupon, **not reversible** |

No generic data was invented. Icons are original line glyphs drawn for this replica
(the bundle's brand paths were not copied); no Pro `.tsx` source was fetched or reproduced.

## Design tokens
All literal colours live in the two token blocks (`:root` light, `html[data-theme="dark"]`).
Light: page `#fafaf9`, surface `#ffffff`, ink `#1c1917`, muted `#78716c`, subtle `#f5f5f4`,
border `#e7e5e4`, radii 16/10/6px, pills `999px`, soft layered shadow, system font stack,
14px base. Dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`,
subtle `#26262a`, border `#2e2e33`, darker shadows; amber kept-state adjusted for dark
(`#fde68a` on `#3a2712`).

## Light + dark checked
- Visible sun/moon toggle fixed top-right switches `data-theme` on `<html>`;
  default follows `prefers-color-scheme` (stored override in `localStorage`).
- Checked both themes: header, rows, hover states, preview/also/kept backgrounds,
  expanded diff panels, pills, selects, borders all render in each theme
  (verified via computed-style audit of token usage, not just eyeballing light).
- Contrast: every text pair ≥ 4.5:1 in both themes (see verification); `--faint` is
  restricted to non-text decoration (strike line, chevron, arrow).

## What could not be verified
Pixel-parity with the production site (no screenshot tooling in this environment);
the original's exact brand icons and easing curves were re-drawn/re-implemented,
so micro-differences are possible. Verified structurally and numerically instead.

## How to test
1. `open index.html` in a browser (or serve this directory statically).
2. Watch entries stream in → hover a row → Undo preview highlights dependents →
   click Undo → strikethrough + Redo appears. Click a row to expand the diff.
3. Use the agent pills / system select to filter; Replay restarts the demo.
4. Toggle sun/moon (top-right); also test with OS dark mode for the default.
5. Narrow the window below ~560px: summary wraps, end-cell collapses to icon-only
   buttons, diff stacks. Keyboard: Tab through rows, Enter expands, Esc collapses.

## Verification
- Token audit: strip the two token blocks, then fail on any hex in CSS-value position
  (`#xxx` followed by `;`/`,`/`}`) — **passes**. (The only other `#…` sequences in the file
  are demo data strings: "Merged PR #482", "#481", "#483 in production".)
- File size 38KB (< 200KB); inline script passes `node --check` (see below).
- Contrast (WCAG, computed): light ink/surface 17.5, muted/surface 4.8, also-fg/chip 6.2,
  kept-fg/chip 6.4, before 5.9, after 4.8, accent/surface 5.9; dark ink/surface 14.5,
  muted/surface 6.6, also-fg/chip 7.2, kept-fg/chip 11.4, before 8.7, after 11.2,
  accent/surface 7.9 — **all ≥ 4.5**. `--faint` is text-free (strike line, chevron, arrow only).
