# REPORT — fix-kbd (targeted tour fix)

## What was fixed (2 defects, `index.html` only)
- (a) PAUSED icon/label mismatch: `setTouring()` updated `tourBtnText` (`Pause`/`Play`) and `aria-pressed` but never touched the `.tri` icon span, so the icon stayed `❚❚` (pause bars) in both states. Fixed in place: cache `tourBtnIcon = tourBtn.querySelector('.tri')` once at init, then in `setTouring(on)` set `tourBtnIcon.textContent = on ? '❚❚' : '▶'` via `textContent` only (no `innerHTML`, no node replacement). Playing = `Pause` + `❚❚`; paused = `Play` + `▶`. Initial HTML (`Pause` + `❚❚`) already matched playing; `setTouring(true)` at init keeps it consistent.
- (b) Dots/step sync: `paintActive()` now snapshots `var cur = activeIdx` once and derives highlighted row (`is-active`), progress dot (`is-on`), `status` text, and `tourLabel` (`Touring cur+1 of 6`) all from that single `cur`. This guarantees the active dot always equals the step number in the label and the highlighted row at every step (1/6–6/6), removing any chance of label/dot/row drift or off-by-one from reading a mutating index mid-paint.

Diff is 3 small hunks only (icon ref + `paintActive` snapshot + icon update in `setTouring`). No HTML structure/CSS changes, no data changes.

## Original behaviour check (`./demo-original.js`)
- Read with relative path. The original demo chunk contains only the static `Kbd` component + `p` shortcut list (6 items) and `kbd-demo` styles; it has **no tour, no dots, no play/pause button, no `setInterval`/`activeIdx`**. Grep for `tour|dot|play|pause|interval|activeIdx` finds only CSS `display: inline-flex` false positives.
- Therefore both defects are replica-introduced (the tour is a replica embellishment to showcase the 6 shortcuts), not inherited from the original — safe to fix, nothing to preserve from the original here.
- Demo data kept verbatim: `SHORTCUTS` order/keys match `p` in `demo-original.js` (`Search runs and files [mod,K]`, `New task [C]`, `Run the agent [mod,enter]`, `Stop the run [mod,.]`, `Approve and continue [mod,shift,A]`, `Close the panel [esc]`).

## Preserved invariants
- `/*noflash*/` guard untouched (first inline script + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `<meta name="color-scheme" content="light dark">`, store key `kbd-theme`, `prefers-color-scheme` fallback).
- In-place updates only: `paintActive`/`refreshKbd`/`updatePreview` mutate `textContent`/`classList`/`attributes` on existing nodes; zero `innerHTML` strings in `index.html` and zero runtime `innerHTML` writes (asserted by harness).
- Full-loop node identity: row `<li>` and dot `<span>` objects are created once at init and reused across a full 6-step loop (asserted).

## Verification (node only, in-dir)
- `node --check ./demo-original.js` → OK.
- `node --check ./verify-tour.cjs` → OK; extracted main script `node --check` → OK.
- `node ./verify-tour.cjs` (DOM-stub harness) → HARNESS OK, covering as **visible state**:
  - init `Touring 1 of 6`, `Pause` + `❚❚`, dots `[1,0,0,0,0,0]`, row 1 active;
  - `tick()` → `Touring 2 of 6` dots/rows `[0,1,0,0,0,0]`;
  - `tick()` → `Touring 3 of 6` dots/rows `[0,0,1,0,0,0]` (the reported off-by-one case);
  - full loop 4/6, 5/6, 6/6, wrap to 1/6 each with matching dots/rows/label;
  - `setTouring(false)` → `Play` + `▶`, `aria-pressed=false`; `setTouring(true)` → `Pause` + `❚❚`;
  - same tour assertions repeated after `setTheme('dark')`, then restored to light;
  - full-loop node identity + `innerHTMLWrites === 0`.
- Light AND dark exercised via `setTheme('light'|'dark')` + `data-theme` assertions; amber dots use theme tokens in both.

## What could not be verified
- Real-browser paint/timing (2 s `setInterval` auto-advance, 160 ms dot transition, focus-visible, `prefers-reduced-motion`, forced-colors) — stub asserts logic/visible state, not pixels. Open `index.html` in a browser, click the play/pause button, and step through `Touring 1–6 of 6` in both themes to confirm visually.

## How to test
- `node --check ./demo-original.js && node --check ./verify-tour.cjs && node ./verify-tour.cjs` (all in this dir, no installs).
- Browser: open `index.html`, toggle sun/moon theme button, use macOS/Windows toggle, type in “Try your own combo”, press `?`, and let the tour run or pause/resume it.
