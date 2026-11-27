# fix-tooltip — REPORT

## What was built / fixed
Targeted fix of existing `./index.html` (no rebuild). The page is the standalone
Tooltip — Run replica (card with title, Search/Filter/Pin/Share tools, reply text,
Copy/Good/Regenerate/More actions, theme toggle, single `.ui-tip` node updated in place).

## Original behaviour (./demo-original.js) — checked before changing
- `function C()` holds `const [b,x] = useState(true)` for the Search tooltip.
- Search tooltip is controlled: `open: b || void 0, onOpenChange: e => !e && x(false)` —
  i.e. a default-open one-shot tour highlight that permanently disarms on first close.
- Same file suppresses it in embedded contexts:
  `useLayoutEffect(() => { ref.current?.closest('.card__preview') && x(false) }, [])`.
  Effect user-facing initial state in docs/preview contexts is **NO tooltip visible**;
  the standalone classic route is the only place the tour-step paints on load.
- The replica has no `.card__preview` ancestor but unconditionally reproduced the
  tour-step open, outside its intended one-shot context. Real-browser QA is therefore
  correct to call it a defect for this page: the replica painted `Search runs ⌘K`
  with zero hover/focus input and latched it.

## Root cause (replica defect)
`index.html` init did:
`var searchArmed = true … var searchBtn = …; if (searchBtn && searchArmed) doShow(searchBtn, false);`
- Paints `Search runs ⌘K` (`side=bottom`) on page load in both themes, over the
  divider/summary area, with no hover/focus.
- Latches: since the pointer never entered the trigger, no `pointerleave` ever fires;
  moving the mouse to blank page area does nothing. Only `Esc` (or hovering another
  trigger, which steals the singleton) dismisses it. Matches QA:
  survives 25 s elsewhere, 5 s over blank area, `Esc` only; Filter hover otherwise correct.

## Fix (2 lines, everything else identical)
- Deleted the init auto-show block (`var searchBtn… / if…doShow(searchBtn,false)`).
- Set `searchArmed = false` initially (dead latch can never re-arm).
- No other changes: `/*noflash*/` guard kept, DOM built once at init, in-place
  `textContent/hidden/style/attrs` updates only, zero `innerHTML`, demo strings verbatim,
  hover/focus/warm/Esc/Copy/Pin/Good/theme logic untouched.

## Verification (node only, in-dir)
- `node --check ./.tmp-main.js` (extracted inline script from `./index.html`) → OK.
- `node ./verify-fix.js` (DOM-stub harness, relative `./index.html`) → ALL PASSED:
  - light + dark: initial VISIBLE state is clean (`tip.hidden === true`, `open === false`,
    empty text — no tooltip painted until real hover/focus).
  - hover Filter shows `Filter` + `F` after 500 ms delay; leave hides it.
  - on-demand Search hover still works (`Search runs` + `⌘K`).
  - full-loop node identity preserved (tip/text/keys/triggers keep `===`).
  - zero `innerHTML` writes after init (static grep + runtime setter count).

## How to test (browser)
Open `index.html` in light theme with no input: no tooltip should paint.
Hover Filter ~500 ms → `Filter F`; leave → hides. Same in dark (toggle ☾/☀).
`Esc` dismisses any open tip. Copy confirms 1600 ms.

## Light AND dark
Checked both via harness (`data-theme` light/dark stubs) and token review
(`--tip-bg/ink/muted/key` swap in `html[data-theme="dark"]`).
