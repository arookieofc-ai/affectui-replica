# Tooltip replica — REPORT

## What was built
`index.html` (19.7 KB, self-contained, system fonts, no network): a faithful
clean-room replica of the Tooltip demo — a "Run" card with a truncating title
button plus 4 tool buttons (Search runs / Filter / Pin run / Share) and a reply
block ("Summarised 14 support tickets …") with 4 action buttons (Copy,
Good answer, Regenerate, More). One shared `.ui-tip` label (dark `#171717` in
light mode, light `#fafafa` in dark mode, shortcut chip, 240 px wrap, 3 px
drift-in per side, instant/no-animation in the skip-delay window).

## Matched data / behaviour (verbatim from `demo-original.js`)
- All strings verbatim: title `Summarise last week's support tickets and draft
  replies for the billing team`, reply text, all 9 tooltip contents, shortcuts
  `⌘K F P ⇧⌘S ⌘C ⌘R`, sides (`bottom`+`start` title, `bottom` header tools,
  `top` reply actions), Good-answer pressed default `true`, Pin default `false`.
- Timings exact: hover delay 500 ms, pointer-leave grace 120 ms, warm
  skip-delay window 300 ms, Copied revert 1600 ms; Search tooltip open on load
  (controlled default, closes on first user dismiss).
- Semantics: single-open enforcement, per-trigger Escape/pointerdown
  suppression (cleared on leave/blur), focus-visible shows at once, touch
  hover ignored, click dismisses, `aria-describedby` wiring, side-flip +
  8 px clamp + RTL-aware positioning with offset 6, empty `title=""` to kill
  native tooltips.

## Structure / polish rules
- `/*noflash*/` guard is the first thing in `<head>` (before any CSS) +
  `meta color-scheme` + `html{background}` paint rule; default theme light
  (the original demo's appearance); visible sun/moon toggle persists to
  `localStorage` key `affectui-tooltip-theme`.
- In-place updates only: DOM built once, timers/events mutate
  `textContent`/`hidden`/attributes/`style` on existing nodes; zero
  `innerHTML` writes in page JS. No 3×3 pixel-marks: this component has no
  agent identities. No token bar: this demo has no token context.
- All `:hover` rules inside `@media (hover:hover) and (pointer:fine)`;
  `html{-webkit-tap-highlight-color:transparent}`;
  `body{font-variant-numeric:tabular-nums}`; concentric radii
  (card 16 / controls 10–999 / tip 8); shadows for elevation, borders only for
  structure; `[hidden]{display:none !important}`; icon SVGs static in markup,
  JS never assigns SVG `.className`.

## Verification (node only, no browser)
- `node --check tip-extract.js` (script extracted from `index.html`): passes.
- `node harness-verify.js` (in-dir DOM stub + fake timers): **46/46 pass** —
  initial visible `Search runs ⌘K`, grace 119→120 ms, warm instant with
  `data-instant`, cold 499→500 ms without it, Escape/focus/blur/touch-no-op,
  Copy→Copied→1600 ms revert with in-place tooltip update, pressed toggles,
  light→dark→light toggle, node identity held for all anchors across the full
  loop, zero `innerHTML` writes. Light AND dark both checked.

## How to test
Open `index.html` in a browser: hover any control (~500 ms) or Tab to it;
move between labels quickly for instant display; `Esc` dismisses; click Copy
to see the 1600 ms `Copied` state; toggle ☾/☀ top-right for dark mode.

## Not verified
Pixel-perfect match to the original site (no browser available here);
`prefers-reduced-motion` / coarse-pointer branches only code-reviewed.
