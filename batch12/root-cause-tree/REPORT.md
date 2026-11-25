# Root Cause Tree — replica report

## What was built
ONE self-contained `index.html` (36.8KB, inline CSS+JS, system fonts, no network/assets).
Clean-room re-implementation of the `ui-rct` Root Cause Tree: a fault tree of a failing
`Checkout tests failing` suite (detail `4 of 12`) with 5 hypotheses that get checked,
ruled out, and confirmed, plus an evidence panel with verdicts, file lists, and
kind/source/content evidence blocks. Header has the component mark, `Root cause` title,
a live `Investigating` badge (spinner, only while something is `checking`), and a
right-aligned `N hypotheses · M ruled out` summary (`M/N ruled out` in narrow mode).
Tree cards show icon tile, single-line title, file chip (+N), status glyph + status line
(`Not checked` / `Checking` / `Ruled out · m:ss` / `Root cause`), `Failed` + `Cause found`
badges on the root, `OR`/`AND` gate labels on the connectors, dashed lines for ruled-out
branches and an animated blue path highlight to confirmed causes. Narrow widths collapse
to an indented stacked list with inline gates. Cards are keyboard navigable
(`role=tree/treeitem`, arrows/Home/End, Enter/Space to pin evidence, Escape to unpin);
clicking a card pins it and dims the rest (opacity 0.78, stays legible). Confirmed-leaf
selection reveals `Retry from here` (resets loop to tick 0) and `Fix it` (sets
`Fix pushed – re-running` detail and jumps to tick ≥ 15) buttons.

## Original data/behaviour matched (from demo-original.js, verbatim)
- Tree: `failure/Checkout tests failing/tests/checkout.test.ts/4 of 12/or` →
  `coupon/Coupon ignored` (`app/checkout/coupon.ts`, `app/cart/total.ts`, gate `and`,
  verdict `Both halves are true – …`) → `percent/Sent as amount` (`app/checkout/coupon.ts`,
  Diff `app/checkout/coupon.ts`, `- discounts: [{ coupon: code, amount_off: value }]` /
  `+ discounts: [{ coupon: code, percent_off: value }]`), `recompute/Cart drops it`
  (Log `checkout.test.ts`, `applyCoupon(LAUNCH20) total 199.00 → 159.20` /
  `updateCart() total 159.20 → 199.00` / `✕ expected 159.20, received 199.00`);
  `stripe/Stripe errors` (`logs/stripe.log`, Tool call `stripe.logs.list`,
  `{ "since": "14:02", "status": "error" } → 0 results`);
  `fixtures/Stale fixtures` (Query `fixtures/prices.json`,
  `price_monthly 1900 ✓ in Stripe` / `price_yearly 18000 ✓ in Stripe`).
- Timeline: 900ms tick, loop 0→24→0; events at ticks
  2 stripe checking / 4 ruled-out / 5 fixtures checking / 7 ruled-out /
  8 coupon checking / 9 percent checking / 11 percent confirmed /
  12 recompute checking / 14 recompute+coupon confirmed.
  Timestamps `BASE 161s + at×4s` formatted `m:ss`; verdict/evidence hidden while
  `checking` or `open`; panel auto-follows selected ?? checking ?? first confirmed leaf ?? root.
- Statuses, labels (`Not checked/Checking/Ruled out/Confirmed`), placeholders
  (`N hypotheses to check.`, `Checking this now…`, `Not checked yet.`), gate semantics,
  curved connectors, path animation, shimmer-on-checking, pop/fade animations.

## Notes / deviations
- Layout widths are fixed approximations (root 232px, parents 184px, leaves 160px,
  12px gap, 128px rows, 84px cards) instead of canvas-measured text widths; geometry is
  equivalent for the given strings.
- No agent identities exist in this component, so the 3×3 pixel-mark rule does not apply
  (no invented agents added). No token counts exist either; the header summary uses the
  original's hypothesis-count style, right-aligned like a context label.
- Default theme is light (= this demo's original appearance); toggle overrides, and
  stored/system preference is respected on load.

## Verification (node only, no browser)
- `node --check` on the script extracted from `index.html`: passes.
- In-dir DOM-stub harness `verify.cjs`: loads the page script with stubbed DOM,
  steps ticks 0→24 asserting `checking` (tick 2), `ruled-out` (tick 4), `confirmed`
  (tick 11), `Root cause` badge (tick 14), loop wrap 24→0, and that every title, file,
  verdict, and evidence string above is present in rendered tree/panel markup when its
  node is selected; asserts dark-theme selectors + tokens + visible toggle exist, no CSS
  rule hides text elements (`display:none`/`visibility:hidden`/`color:transparent`/
  `font-size:0` — except the intentional checking shimmer), `[hidden]{display:none}`
  present, and file < 200KB: **ALL CHECKS PASSED**.
- Light AND dark checked: both token sets defined (`:root` light + `html[data-theme=dark]`
  overrides incl. adjusted amber `#fbbf24/#451a03/#fde68a`); contrast verified by token
  values (ink `#171717` on `#ffffff`/`#fafaf9`; `#ededed` on `#1c1c1f`/`#101012`).

## How to test
Open `index.html` in a browser. Watch the 900ms loop (summary counts, Investigating badge,
then Cause found + Root cause badges + Retry/Fix buttons). Click cards / use arrow keys +
Enter to pin evidence; resize narrow to see the stacked list; toggle sun/moon top-right
for light/dark. Re-run checks: `node verify.cjs`.
