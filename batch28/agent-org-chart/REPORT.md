# REPORT — targeted fix of ./index.html (fix-agent-org-chart)

Targeted fix only. No rebuild. `/*noflash*/` kept, in-place updates only, zero `innerHTML` writes after init, demo data verbatim (NODES/INITIAL/STEPS untouched).

## What was checked in ./demo-original.js BEFORE changing anything

- Read with relative paths (`./REPLICATE_SPEC.md`, `./demo-original.js`, `./index.html`) in this dir only.
- Original component CSS (`var fe`) has no `hint` class and no `overflow:auto` on the chart (`.ui-aoc__chart{position:relative;min-width:0}` — visible, no internal scrollbars).
- Original dialog `aria-label` is `` `${Z(K)} – details` `` (name + U+2013 EN-DASH + `details`), e.g. `Noah Bennett – details`.
- Original visible pop stacks name above sub (`.ui-aoc__pop-text{display:grid}`, `.ui-aoc__pop-name` block, `.ui-aoc__pop-sub{display:flex}`) — not glued inline.
- Original demo data: same 8 nodes (Lena/Noah/Mara/Triage/Refunds/Review/Tests/Docs), same `O={triage:working,refunds:working,review:working,tests:working,docs:idle}`, same loop `k=[{wait:1600,add:e1},{wait:3400,status:{docs:working}},{wait:2800,add:e2},{wait:4200,drop:e1},{wait:3200,drop:e2+idle},{wait:3400,reset}]` with `setTimeout` chain. It **animates** when `prefers-reduced-motion` is off, and is intentionally static when reduced-motion is on (initial `e1-0` only, no timers). Replica already matched this, so defect (4) needed no behaviour change — loop kept, verified animating.

## Defects fixed (real-browser QA)

1. **DARK hint bar never paints.** `./index.html` had no hint element at all (text not in DOM, nothing to paint). Added bottom hint bar per page chrome, styled as dark pill in light with token inversion for dark (per original token approach like `btn--primary`: `bg var(--ink)` / `fg var(--page)`):
   - light: `bg #171717 / fg #fafaf9` = dark pill, white text (as QA described light).
   - dark: `bg #ededed / fg #101012` = light pill, black text — paints, high contrast, uses same tokens so it cannot go pure-black.
   - `HTML: <div class="hint" id="hint"><span class="hint-pill">Click a card for details · Hover highlights the chain · Arrow keys move · Esc closes</span></div>` + CSS `.hint{...} .hint-pill{...background:var(--ink);color:var(--page);border-radius:999px...}`.
2. **Dialog title glues `Noah BennettSupport lead`.** Root cause: `span.pop-text` had no CSS (inline spans on one line) + `pop` aria-label stayed static `"Details"`. Fixed per original:
   - CSS: `.pop-text{display:grid;flex:1;min-width:0}`, `.pop-name{display:block;...}`, `.pop-sub{display:flex;...}` (matches `.ui-aoc__pop-text/grid`, `.ui-aoc__pop-name`, `.ui-aoc__pop-sub/flex`).
   - JS in `openPop`: `pop.setAttribute("aria-label",node.name+" – details")` (U+2013, same as `` `${Z(K)} – details` ``).
   - After fix, `openPop('noah')` gives name `Noah Bennett`, sub contains `Support lead`, aria-label `Noah Bennett – details`, grid stacking (not glued). Node click → Details still works.
3. **Chart internal h+v scrollbars.** Root cause: `.chart{...overflow:auto}` (plus abs-positioned `.lines` SVG + `.pop` overflow) creates internal scrollbars. Original has no overflow (visible). Fixed: `.chart{...overflow:visible;min-width:0}`. No other `overflow:auto/scroll` remains. Content already fits at desktop (max row ~392px < 948px inner) with `flex-wrap:wrap`; pop can now overflow visibly as in original.
4. **Auto-demo appeared static over 25s.** Checked original: it animates (6-step ~18.6s loop, verified in harness: escalations appear, `docs:working`, `triage:idle`, then `reset`). Replica `STEPS`/`step()`/`loop()` already identical and animates (harness proves state changes across full loop). No fix applied beyond keeping loop; noted here per instruction. If QA env had `prefers-reduced-motion: reduce`, both original and replica are intentionally static — that matches original, not a bug.

Kept: `/*noflash*/` script + `<style>html{background:#fafaf9}html[data-theme="dark"]{background:#101012}</style>` + `<meta name="color-scheme">` untouched; timers update only in place (`textContent`/`setAttribute`/`appendChild`/`removeChild` on existing nodes, `cards` Map identity preserved); `NODES`/`INITIAL`/`STEPS`/labels byte-identical.

## Hard proof

BEFORE (original file):
```
6a918907568de5b527fec7f23f629e06  ./index.html
```

AFTER (fixed file):
```
bb587311f32b43d351eea175bb365a1a  ./index.html
```
Hashes differ → file changed.

`node --check`:
```
node --check ./harness.js → syntax OK
node --check ./extracted-check.js (app <script> extracted in-dir) → syntax OK
node --check ./extracted-orig-check.js → syntax OK
```

Harness: `node ./harness.js <file>` (in-dir DOM-stub, no installs). Asserts fixed behaviour as VISIBLE state in light AND dark (token contrast), plus full-loop node identity and zero `innerHTML` writes after init.

### Harness vs ORIGINAL (`./original-backup.html`) — MUST FAIL (exit 1)

```
PASS: chart rule exists
FAIL: chart has no internal scrollbars (no overflow:auto/scroll) — position:relative;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface);box-shadow:var(--shadow);padding:16px;overflow:auto
FAIL: chart overflow is visible/clip/hidden (fits without internal scrollbars) — position:relative;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface);box-shadow:var(--shadow);padding:16px;overflow:auto
FAIL: pop-text CSS rule exists (dialog title layout) — missing .pop-text rule — name+role glue inline
FAIL: hint bar element exists in DOM — no .hint#hint element
FAIL: hint pill CSS rule exists — no .hint/.hint-pill rule
FAIL: hint bar has visible text — hint text len=0
FAIL: dialog sets aria-label with en-dash separator (per original `${Z(K)} – details`) — no setAttribute aria-label with – details
PASS: noflash guard kept
PASS: zero innerHTML writes after init (static)
PASS: noflash sets a theme (light/dark)
PASS: app exposes __aoc test API
PASS: click/details opens pop (not hidden)
PASS: pop targets clicked node
FAIL: dialog aria-label has en-dash separator with name (VISIBLE title state) — aria-label=""
PASS: pop has name node
PASS: pop has sub node
PASS: pop name is Noah Bennett
PASS: pop sub mentions Support lead
FAIL: title not glued without separator (grid stacks name/sub) — "Noah BennettSupport lead"
FAIL: hint visible text mentions Click a card — hint text missing
PASS: unchanged nodes keep object identity across full loop
PASS: auto-demo animates node states over full loop (not static)
PASS: full loop returns to baseline (escalations cleared after reset)
PASS: zero innerHTML writes after init
FAIL: dialog separator holds in dark too — ""
SUMMARY: 15 passed, 11 failed (target: ./original-backup.html)
```

### Harness vs FIXED (`./index.html`) — MUST PASS (exit 0)

```
PASS: chart rule exists
PASS: chart has no internal scrollbars (no overflow:auto/scroll)
PASS: chart overflow is visible/clip/hidden (fits without internal scrollbars)
PASS: pop-text CSS rule exists (dialog title layout)
PASS: pop-text uses grid stacking (name above role)
PASS: hint bar element exists in DOM
PASS: hint pill CSS rule exists
PASS: hint pill uses token bg (var(--ink)) so it paints in both themes
PASS: hint pill uses token fg (var(--page)) so text stays legible
PASS: light tokens give hint contrast (ink != page)
PASS: dark tokens give hint contrast (ink != page)
PASS: hint pill is pill-shaped (border-radius 999px)
PASS: hint bar has visible text
PASS: dialog sets aria-label with en-dash separator (per original `${Z(K)} – details`)
PASS: noflash guard kept
PASS: zero innerHTML writes after init (static)
PASS: noflash sets a theme (light/dark)
PASS: app exposes __aoc test API
PASS: click/details opens pop (not hidden)
PASS: pop targets clicked node
PASS: dialog aria-label has en-dash separator with name (VISIBLE title state)
PASS: pop has name node
PASS: pop has sub node
PASS: pop name is Noah Bennett
PASS: pop sub mentions Support lead
PASS: title not glued without separator (grid stacks name/sub)
PASS: hint visible text mentions Click a card
PASS: unchanged nodes keep object identity across full loop
PASS: auto-demo animates node states over full loop (not static)
PASS: full loop returns to baseline (escalations cleared after reset)
PASS: zero innerHTML writes after init
PASS: dialog separator holds in dark too
SUMMARY: 32 passed, 0 failed (target: ./index.html)
ALL CHECKS PASSED
```

## How to test

- `open index.html in a browser` (no server needed). Toggle sun/moon button (top-right) — check light AND dark: page, cards, amber waiting pills, hint pill below chart (dark pill/white text in light; light pill/black text in dark, always visible).
- Click `Noah Bennett` → Details dialog shows `Noah Bennett` above `Support lead` (two lines) and aria-label `Noah Bennett – details`. `Esc` closes, arrow keys move, hover highlights chain.
- Desktop width: chart shows no internal scrollbars; only page scrolls if needed.
- Wait ~19s: `Refunds`/`Tests` waiting badges appear, `Docs` flips working→idle, `Triage` idles, then reset — full loop. With OS reduced-motion on, loop stays static (matches original).

## Files in this dir

- `./index.html` (fixed), `./original-backup.html` (pre-fix copy for both-ways harness), `./harness.js` (DOM-stub, `node ./harness.js ./index.html`), `./REPORT.md` (this file).
