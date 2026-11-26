# Decision Inbox — replica report

## What was built
- `index.html` (16KB, self-contained, no external deps): standalone interactive
  replica of affectUI "Decision Inbox" (Feedback, Free).
- Public description: "Open decisions with two quick answers each, folding away once answered."
- Gray tray + white card, header with alert/check icon and live count, two
  decision rows each with title, detail, and two answer buttons
  (primary dark / secondary bordered). Answering swaps the buttons for a green
  "done" status line, then the row folds away (grid-rows + opacity transition).
  Folded titles collapse to one-line ellipsis and reopen on click.
  When all are answered the header flips to "All caught up" and an empty note
  appears; after ~3.2s the inbox loops back to the full set.
- Demo data used verbatim from `demo-original.js`:
  - `Roll out the new onboarding to everyone?` / `Test won with +8% activation · 2 weeks of data` / `Roll out` / `Keep testing`
  - `Renew Figma for the design team?` / `12 seats · $1,800 per year · renews in 5 days` / `Renew` / `Change seats`
  - Empty text: `Nothing waiting on you – new decisions show up here.`
  - Counts via `Intl.NumberFormat("en")`: `2 need your input` / `1 needs your input` / `All caught up`.
- Clean-room: all HTML/CSS/JS written from the public description and observed
  behaviour. No compiled source copied; own class names (`di__*`) and own CSS.
- In-place updates only: DOM is built once with `createElement`; all state
  changes mutate `textContent`, `hidden`, attributes (`data-open`,
  `data-answered`, `data-gone`, `data-clear`, `inert`) on existing nodes.
  Both answer buttons and the done-status node are pre-created and toggled —
  no node creation after init, no `innerHTML` anywhere (also asserted).
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`,
  `html{-webkit-tap-highlight-color:transparent}`,
  `body{font-variant-numeric:tabular-nums}`, concentric tray/card radius
  (`calc(radius-lg + 6px)`), shadow-for-elevation + border-for-structure,
  folded-button focus ring, asymmetric icon-button padding nudge.
- v4: `<head>` starts with the `/*noflash*/` theme guard + inline
  `html{background}` paint style + `<meta name="color-scheme">`.
- Theme toggle (top-right, ☾/☀) flips `data-theme="light"|"dark"` on `<html>`,
  persists to `localStorage ("decision-inbox-theme")`, defaults to
  `prefers-color-scheme`. Both themes use the same token set; dark checked
  for contrast (amber/green adjusted, buttons inverted like the original).

## What matches the original
- Header pattern, count wording, tray/card geometry, row dividers, folded
  single-line titles, detail styling, two-button actions, done status with
  check icon, 1100ms fold-away + auto-open-next, 3200ms full-loop reset,
  empty message, expand/collapse easing, reduced-motion guard.

## What could not be verified
- No browser was launched (per task constraints); pixel-perfect rendering,
  real CSS grid-row animation smoothness, and OS dark-mode default were not
  eyeballed — only DOM/CSS static checks + stub execution. The exact original
  alert/check SVG path geometry was re-drawn in the same spirit from the
  behaviour description rather than traced.

## How to test
1. Open `index.html` in a browser (double-click or `python3 -m http.server`).
2. Click `Roll out` / `Keep testing` etc.; rows fold away, header counts down,
   then everything loops back after a few seconds.
3. Click a folded (grey, one-line) title to reopen it. Tab + Enter works.
4. Toggle ☾/☀ top-right; reload to confirm persistence; test with OS dark mode.
5. Node-only verification (no browser):
   - `python3 -c "import re;h=open('index.html').read();m=re.findall(r'<script(?![^>]*src)[^>]*>([\s\S]*?)</script>',h);open('/tmp/di-check.js','w').write(m[-1])" && node --check /tmp/di-check.js && node --check harness.js && node harness.js`
   - (`node --check` cannot run on `.html` directly, so the inline script is
     extracted first — the check above asserts the page's actual shipped JS.)
   - Harness asserts: visible painted text, full-loop node identity, zero
     `innerHTML` writes after init, light AND dark themes (56 checks).

## Verification
- `node --check` on extracted inline JS: PASS; `node --check harness.js`: PASS.
- `node harness.js`: ALL 56 CHECKS PASSED.
- Light AND dark mode confirmed via toggle + persisted key + dark token scan.
