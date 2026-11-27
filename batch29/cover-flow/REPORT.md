# Cover Flow — targeted fix report

## Scope
- Workdir only: `./REPLICATE_SPEC.md`, `./demo-original.js`, `./index.html` (relative paths, no reads/writes outside this dir).
- Targeted fix of existing `./index.html`, not a rebuild.
- Original preserved as `./original-backup.html`. Harness as `./harness.js` (node only, no installs).

## Hard proof — md5 BEFORE vs AFTER (must differ)
- BEFORE (`./index.html` before edit, same as backup):
  - `a0f7cb7ca2059d87cbac1a5e1e408e93  ./index.html`
  - `a0f7cb7ca2059d87cbac1a5e1e408e93  ./original-backup.html`
- AFTER (`./index.html` after edit):
  - `a8e28eb9733d0e5f4a69e74e867eecb5  ./index.html`
  - `a0f7cb7ca2059d87cbac1a5e1e408e93  ./original-backup.html`
- Hashes differ: YES (`a0f7cb...` -> `a8e28e...`). File changed.

Commands (relative, in-dir):
- `md5sum ./index.html` (before)
- `cp ./index.html ./original-backup.html`
- (edit `./index.html`)
- `md5sum ./index.html ./original-backup.html` (after)

## Harness — FAIL on original, PASS on fixed
- Harness: `./harness.js`, run with `node ./harness.js ./original-backup.html` and `node ./harness.js ./index.html`.
- `node --check ./harness.js`: syntax ok (exit 0).
- No installs or downloads. DOM-stub via built-in `vm` only.
- What it asserts:
  - `/*noflash*/` guard, `color-scheme` meta, bg style.
  - Zero `innerHTML` writes (static count + dynamic stub counter).
  - Demo data verbatim (Stone..Mist, Blush colours, defaultIndex 4).
  - Stage fix as VISIBLE state: parses `.cf-view` horizontal padding, `mask-image` px stops, `.cf-art > div > span` left, `spread/tail` factors; computes desktop geometry (viewOuter 804, W240, scale1) for Stone (off -4) and Mist (off +5) at Blush pos4; asserts card overlaps viewport, label inside clip bounds, label in opaque zone (outside mask fade).
  - Behaviour in light AND dark: initial Blush 5/10, Next -> Sand 6/10 with synced title/sub/colours/dots, Prev -> Blush, full-loop (0..9) node identity, zero innerHTML after init. Theme loop runs stub twice (light/dark); CSS dark tokens checked statically.

### Original result (expected FAIL, exit 1)
```
TARGET: ./original-backup.html
PASS 46:
  ok - noflash guard present
  ok - color-scheme meta present
  ok - noflash bg style present
  ok - zero innerHTML writes (found 0)
  ok - demo data has Stone
  ok - demo data has Mint
  ok - demo data has Sky
  ok - demo data has Sage
  ok - demo data has Blush
  ok - demo data has Sand
  ok - demo data has Lilac
  ok - demo data has Ice
  ok - demo data has Peach
  ok - demo data has Mist
  ok - Blush colours verbatim
  ok - Stone colours verbatim
  ok - default index 4 (Blush)
  ok - parsed spread/tail factors
  ok - inline script extracted (14787 chars) for theme light
  ok - test hook exposes 10 covers in light
  ok - [light] initial title Blush (got Blush)
  ok - [light] initial count 5/10 (got 5 / 10)
  ok - [light] initial Blush colours synced (got #FDF2F8 → #F5B5D6)
  ok - [light] initial dot 4 (got 4)
  ok - [light] nav enabled mid-list
  ok - [light] Next title Sand (got Sand)
  ok - [light] Next count 6/10 (got 6 / 10)
  ok - [light] Sand colours synced (got #FDFAF3 → #EAD9B8)
  ok - [light] dot follows Next (got 5)
  ok - [light] Prev back to Blush (got Blush)
  ok - [light] full-loop node identity preserved (10/10)
  ok - [light] zero innerHTML writes after init (found 0)
  ok - inline script extracted (14787 chars) for theme dark
  ok - test hook exposes 10 covers in dark
  ok - [dark] initial title Blush (got Blush)
  ok - [dark] initial count 5/10 (got 5 / 10)
  ok - [dark] initial Blush colours synced (got #FDF2F8 → #F5B5D6)
  ok - [dark] initial dot 4 (got 4)
  ok - [dark] nav enabled mid-list
  ok - [dark] Next title Sand (got Sand)
  ok - [dark] Next count 6/10 (got 6 / 10)
  ok - [dark] Sand colours synced (got #FDFAF3 → #EAD9B8)
  ok - [dark] dot follows Next (got 5)
  ok - [dark] Prev back to Blush (got Blush)
  ok - [dark] full-loop node identity preserved (10/10)
  ok - [dark] zero innerHTML writes after init (found 0)
FAIL 3:
  NOT OK - stage horizontal padding >=32px (found null)
  NOT OK - mask fade confined to padding (px stop found null)
  NOT OK - cover label left inside card (found 12px, need >=28 to offset -8% bleed)
```

### Fixed result (expected PASS, exit 0)
```
TARGET: ./index.html
PASS 55:
  ok - noflash guard present
  ok - color-scheme meta present
  ok - noflash bg style present
  ok - zero innerHTML writes (found 0)
  ok - demo data has Stone
  ok - demo data has Mint
  ok - demo data has Sky
  ok - demo data has Sage
  ok - demo data has Blush
  ok - demo data has Sand
  ok - demo data has Lilac
  ok - demo data has Ice
  ok - demo data has Peach
  ok - demo data has Mist
  ok - Blush colours verbatim
  ok - Stone colours verbatim
  ok - default index 4 (Blush)
  ok - parsed spread/tail factors
  ok - stage horizontal padding >=32px (found 48)
  ok - mask fade confined to padding (px stop found 32)
  ok - cover label left inside card (found 32px, need >=28 to offset -8% bleed)
  ok - Stone card overlaps viewport (L=21.0 R=231.0)
  ok - Stone label inside clip bounds (label 33.8-103.8 within 0-804)
  ok - Stone label in opaque zone (mask 32px, label 33.8-103.8)
  ok - Mist card overlaps viewport (L=621.0 R=831.0)
  ok - Mist label inside clip bounds (label 633.8-703.8 within 0-804)
  ok - Mist label in opaque zone (mask 32px, label 633.8-703.8)
  ok - inline script extracted (14847 chars) for theme light
  ok - test hook exposes 10 covers in light
  ok - [light] initial title Blush (got Blush)
  ok - [light] initial count 5/10 (got 5 / 10)
  ok - [light] initial Blush colours synced (got #FDF2F8 → #F5B5D6)
  ok - [light] initial dot 4 (got 4)
  ok - [light] nav enabled mid-list
  ok - [light] Next title Sand (got Sand)
  ok - [light] Next count 6/10 (got 6 / 10)
  ok - [light] Sand colours synced (got #FDFAF3 → #EAD9B8)
  ok - [light] dot follows Next (got 5)
  ok - [light] Prev back to Blush (got Blush)
  ok - [light] full-loop node identity preserved (10/10)
  ok - [light] zero innerHTML writes after init (found 0)
  ok - inline script extracted (14847 chars) for theme dark
  ok - test hook exposes 10 covers in dark
  ok - [dark] initial title Blush (got Blush)
  ok - [dark] initial count 5/10 (got 5 / 10)
  ok - [dark] initial Blush colours synced (got #FDF2F8 → #F5B5D6)
  ok - [dark] initial dot 4 (got 4)
  ok - [dark] nav enabled mid-list
  ok - [dark] Next title Sand (got Sand)
  ok - [dark] Next count 6/10 (got 6 / 10)
  ok - [dark] Sand colours synced (got #FDFAF3 → #EAD9B8)
  ok - [dark] dot follows Next (got 5)
  ok - [dark] Prev back to Blush (got Blush)
  ok - [dark] full-loop node identity preserved (10/10)
  ok - [dark] zero innerHTML writes after init (found 0)
RESULT: PASS
```

## Defect (1) — EDGE covers clipped (FIXED)
- Symptom: leftmost pill shows only `tone` (Stone `S` cut), rightmost (Mist) invisible. Both themes. Viewport `overflow:hidden` + `mask 9%/91%` fades/clips edges; `.cf-art{inset:0 -8%}` bleeds 19.2px so `span{left:12px}` sits ~7px outside card and is card-clipped; `spread 0.78/tail 0.27` pushes Stone to L=-84 / Mist to R=953 on 804px desktop view (outside + in fade zone).
- Fix (in-place, CSS+one JS constant, same tokens both themes):
  - `.cf-view`: `padding: ... 0 0` -> `padding: ... 48px 0` + `mask ... #000 9% / 91%` -> `#000 32px / calc(100%-32px)` (fade only in padding). Narrow `@media(max-width:560px)` adds `padding 24px` + `mask 16px`.
  - `.cf-art > div > span`: `left:12px` -> `left:32px` (12px inside card after 19px bleed).
  - `layout()`: `spread 0.78/tail 0.27` -> `spread 0.55/tail 0.20` (tighten stack; depth unchanged). Stone now L=21/R=231 label 33-103 opaque; Mist L=621/R=831 label 633-703 opaque (was outside/faded).
- Preserved: `/*noflash*/` guard untouched, DOM built once, in-place `textContent/attr/style` only, zero `innerHTML` (verified), demo `ITEMS` verbatim, `data-refl`, reflections, dots, keyboard/wheel/drag, `window.__cf` hook.

## Defect (2) — No auto-demo in 25s (NOT a bug, left manual)
- Checked `./demo-original.js` BEFORE changing (relative path, `grep`/`python3` in-dir):
  - No `setInterval`, no `autoplay`/`autoAdvance`. Only `setTimeout` is wheel-settle `setTimeout(()=>z(...),110)` + `clearTimeout`. All `requestAnimationFrame` uses are spring physics (`tick`/`kick`), not auto-advance.
  - `defaultIndex:4` (Blush), manual controls only: `onClick=>z(...)` nav, `ticks`, `onKeyDown` arrows/Home/End, pointer drag/flick, wheel scrub. No timer loop.
  - `s` items list is 10 gradients Stone..Mist, demo `c()` renders `<a items defaultIndex=4 ...>` with no auto prop.
- Conclusion: original is manual-only. Stays at Blush 5/10 until user acts is correct. Did NOT add auto-demo (would deviate from original). Noted here per instructions. Next/Prev still works (Blush->Sand with synced title/colours/dots, verified in harness light+dark).

## Verification (node only)
- `node --check ./harness.js` -> ok.
- `node ./harness.js ./original-backup.html` -> FAIL 3 (padding/mask/label), exit 1.
- `node ./harness.js ./index.html` -> PASS 55, exit 0, including light+dark visible-state geometry, full-loop node identity 10/10, zero innerHTML.
- Open `./index.html` in a browser for visual check (drag/flick, arrows, dots, theme toggle). Dark verified via tokens (`html[data-theme="dark"]`) + same layout fix applies (no theme-specific clipping).

## Files changed (in-dir only)
- `./index.html` (targeted 4-hunk fix, see diff vs `./original-backup.html`).
- `./harness.js` (new, in-dir DOM-stub).
- `./REPORT.md` (this file).
- `./original-backup.html` (kept, byte-identical to BEFORE hash).
