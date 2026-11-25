# Permission Request — replica report

## What was built
`index.html` (33.7 KB, self-contained, no network, system fonts) replicating the
affectUI Pro **permission-request** card: an agent asks to do something sensitive,
with scope picker (Just once / 1 hour / Always), Deny / Allow buttons, expandable
preview list, and allowed / denied / expired result states with a timed-access
drain bar. All code is original (clean-room); the compiled demo bundle was read
only to extract data and timings.

Page shell follows spec v3: header with project name (`acme/web`) + live
requesting count + agent count (not a generic title), `44k / 200k` context label
with thin 3px bar, deterministic **3x3 pixel-mark per agent** (exactly 9 cells,
twinkle while pending), circular tool icons, and a sun/moon theme toggle.

## Original data used (verbatim from `demo-original.js`)
- **Coder / GPT-6 Sol** — action `push to main`, target `acme/web`, risk `risky`,
  reason `The fix for the flaky checkout test passed review and all 214 checks.`,
  previewTitle `What will happen`, items `src/checkout/cart.ts` (+12−4),
  `tests/checkout.spec.ts` (+31−2), `Deploys to production after the merge`;
  autoplay decision: allow + `timed`.
- **Sales agent / Sonnet 5.5** — action `send 40 emails`, target
  `Gmail · to customers`, risk `risky`, reason `Follow-ups for everyone who
  started a trial last week and hasn't logged in since.`, previewTitle
  `Recipients`, items `anna.berg@northwind.com` (Trial ends Fri),
  `j.chen@lumen.io` (Trial ends Sat), `maria@acme-retail.co` (Trial ends Sat)
  + 37 generated `customer4…customer40@example.com` (original builds 40 via
  `Array.from({length:37})`); autoplay decision: deny + `once`.
- **Ops agent / Gemini 3.8 Flash** — action `refund $240`, target
  `Stripe · live mode`, risk `destructive`, reason `Two orders were charged
  twice after the checkout outage this morning.`, previewTitle `Refunds`, items
  `Order #4821 · Lena Fischer` ($120.00), `Order #4822 · Tom Okafor` ($120.00);
  autoplay decision: allow + `once`.
- Timings/formats: scope switch @1500 ms, auto-decision @2900 ms, next request
  @4700 ms; 100 ms clock tick with 600× fast-forward while a timed grant is
  active; timed grant = 1 h (`until = at + 36e5`); duration label `1 hour`;
  countdown `X min/h/d left`; timestamp `HH:MM` today else `Weekday/Day HH:MM`;
  preview limit 3; destructive risk hides the `always` scope + hint
  `Destructive actions can't be allowed for always`; trusted pointer/keydown
  stops autoplay (user takes over); Enter = allow, Esc = deny, arrows move the
  scope radiogroup.

## Interactions
- Autoplay cycles the 3 requests (past run kept dimmed at 0.78 opacity, ≥0.75
  per spec); scenario pills + replay button; any trusted click/keypress switches
  to manual mode.
- Scope radio, Show more/less (40 recipients scroll), Deny / Allow with kbd
  hints, Revoke / Change / Ask again ghost button, drain bar + live countdown
  that expires to `Access expired` → `will ask again`.
- Keyboard: card-level Enter/Esc, scope arrow keys, visible focus outlines.
- Responsive: ≤360 px compacts reason margin/scope text and hides kbd hints;
  `prefers-reduced-motion` disables animation.

## Render-safety measures (per past component failures)
- The 100 ms tick **never rebuilds the DOM** — it only updates the drain-bar
  `transform` and note text via kept references; a rebuild happens only on the
  discrete pending→decided→expired transitions.
- No `querySelector`-after-`innerHTML` anywhere; elements are built with
  `createElement` and references kept in closures.
- Nav pills act on `pointerdown` (capture) so a real click can't be lost across
  a rebuild; pixel-mark grid is hard-coded to exactly 9 `<i>` cells
  (harness-asserted).

## Token audit
All colours go through CSS custom properties (no ad-hoc hex per element):
surface/page/ink/muted/subtle/border, radius-lg 16 / radius 10 / radius-sm 6,
soft shadow, 999 px pills, 150–200 ms transitions, amber waiting
(light `#f59e0b`/`#fef3c7`/`#92400e`, dark `#fbbf24`/`#451a03`/`#fde68a`).
One deliberate deviation: light `--ok-fg` darkened `#1e8a4f` → `#177245` so the
small `+12/−4` diff text passes AA. Dark theme redefines the same tokens
(surface `#1c1c1f`, page `#101013`-ish `#101012`, ink `#ededed`, muted
`#a1a1aa`, subtle `#26262a`, border `#2e2e33`, darker shadows); toggle flips
`data-theme` on `<html>`, defaults to `prefers-color-scheme`, persists to
`localStorage`. Both themes visually checked via token review + contrast table.

## Contrast results (normal-text AA ≥ 4.5)
Light: ink 17.93, body 17.49, muted 4.80 (4.40 on subtle), amber 6.37,
ok 5.32, danger 4.82, on-primary 17.93.
Dark: ink 14.52, muted 6.63 (5.88 on subtle), amber 12.03, ok 6.88,
danger 6.73, on-primary 16.11. All pass; no grey-on-grey or invisible borders.

## Verification
- `node harness.js` (kept in this directory): extracts the inline script,
  `node --check` passes, then a DOM-stub headless run asserts 33 checks —
  initial pending card, 9-cell pixel-marks, 1500/2900/4700 ms autoplay steps,
  timed `until`, countdown note, drain transform, 600× fast-forward to
  `expired`, scenario advance, manual takeover, destructive `always` hiding,
  formatters — **ALL HEADLESS CHECKS PASSED** (exit 0). Syntax check alone was
  not relied on.
- Could not verify: pixel-perfect match to the Pro marketing screenshot
  (no screenshot available); avatar/tool artwork is redrawn originals, not the
  vendors' logos.

## How to test
Open `index.html` in a browser (double-click or `python3 -m http.server`).
Watch the autoplay, click Deny/Allow, toggle the ◐/☾ button for dark mode.
