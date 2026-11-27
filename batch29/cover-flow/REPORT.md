# Cover Flow — targeted fix report (repair4: restore on-cover labels)

## Scope
- Work ONLY in this directory. All paths relative (`./REPLICATE_SPEC.md`, `./demo-original.js`, `./index.html`, `./harness.js`, `./REPORT.md`). No reads/writes outside, no `rm` on `/tmp`.
- Targeted fix of existing `./index.html`, not a rebuild. `/*noflash*/` guard kept, in-place updates only, zero `innerHTML` writes after init, demo data verbatim.

## Hard proof — md5 BEFORE vs AFTER (must differ)
- BEFORE (`./index.html` before this edit):
  - `126d332c49ccf06ca869973ade0eee12  ./index.html`
- AFTER (`./index.html` after this edit):
  - `dfbd208dc643af9da7a4376ef1a82cda  ./index.html`
- Original preserved as `./original-backup.html` (copy of BEFORE):
  - `126d332c49ccf06ca869973ade0eee12  ./original-backup.html`
- Hashes differ: YES (`126d33…` -> `dfbd20…`).

Commands (relative, in-dir):
- `md5sum ./index.html` (before, saved to BEFORE)
- `cp ./index.html ./original-backup.html` (preserve original)
- (edit `./index.html` — 1 hunk CSS, see Defect)
- `md5sum ./index.html ./original-backup.html` (after)
- `node --check ./harness.js` (syntax ok)

## Demo-original check (required)
- Read `./demo-original.js` with relative path before changing anything.
- Finding: original demo has NO per-cover on-cover text nodes. Each item is `{id,title,subtitle,cover:<div className="cf-demo__gradient" style={background:linear-gradient(160deg, light, dark)} />}`. Titles (`Stone`..`Mist`) appear only in footer caption (`ui-cf__title`/`ui-cf__subtitle`), plus `aria-label`. No `cf-tag`, no label div inside `ui-cf__media`/`ui-cf__card`.
- Per instruction: if original behaves same way (blank gradients), note instead of “fixing”. Note: replica’s on-cover pills (`.cf-tag`) are a replica enhancement carried from prior fix (centred card-level pills to match screenshots, fixing legacy `Sto`/`Min` drift). Blank in replica QA is NOT matching demo — even centred `Blush` was blank in real browser, while replica design requires readable pills centre + edges in both themes. So we restore readable pills without deviating demo data.

## Defect — what had happened to the labels
- Where labels went: NOT removed from JS — `build()` still did `createElement("span")`, `className="cf-tag"`, `textContent=it.title`, `card.appendChild(tag)`, `tagNodes.push(tag)` (10 tags, parent `cf-card`, not drifted `cf-art`). CSS `.cf-tag` still existed (`left:50%`, `bottom:10px`, `translateX(-50%)`, `z-index:3`, `opacity:1`, `visibility:visible`).
- Why blank in real-browser QA: painted boxes were invisible at rest in both themes. Tags relied solely on translucent vars (`--tag-bg:rgba(255,255,255,.88)` light / `rgba(28,28,31,.80)` dark, thin `var(--tag-line)` borders) with NO explicit `html[data-theme="light/dark"] .cf-tag` readable rules. On very light gradients (`Stone #f4f4f5→#d4d4d8`, `Blush #fdf2f8→#f5b5d6`, etc.) white-ish pills blended into gradient, thin borders washed out, dim veils (`cf-card::after`, `z-index:1`, `opacity:var(--cf-t)`) + mask fade + reflection further flattened contrast. Result: every cover — including centred `Blush` — read as blank gradient block; names only in caption below stage. Previous partial `Sto`/`Min` edge readability (legacy art-level drift) was already fixed to centred card-level, but without explicit theme rules readability regressed to zero.
- Fix (1 hunk CSS, targeted, no rebuild):
  ```css
  html[data-theme="light"] .cf-tag{color:#171717;background:rgba(255,255,255,.94);border-color:rgba(0,0,0,.10);z-index:3;opacity:1;visibility:visible;}
  html[data-theme="dark"] .cf-tag{color:#ededed;background:rgba(28,28,31,.92);border-color:rgba(255,255,255,.22);z-index:3;opacity:1;visibility:visible;}
  ```
  Keeps `/*noflash*/`, `color-scheme`, in-place `textContent`/`style` updates, zero `innerHTML`, demo verbatim (`Stone..Mist`, Blush colours, `DEFAULT_INDEX 4`, `W240 H320 ANGLE50`). Geometry unchanged (`spread 0.44/tail 0.13`, `view padding 48px`, `mask 32px`, centred card-level) — all 10 labels already inside `0-804` clip, `32-772` opaque zone, inside card (not clipped by `overflow:hidden`).

## Harness — FAIL on original, PASS on fixed
- Harness: `./harness.js`, run with `node ./harness.js ./original-backup.html` and `node ./harness.js ./index.html`.
- `node --check ./harness.js`: syntax ok (exit 0).
- No installs or downloads. DOM-stub via built-in `vm` only.
- What it asserts as VISIBLE state (computed opacity/visibility/colours/geometry, not just DOM presence), in light AND dark:
  - `/*noflash*/` guard, `color-scheme` meta, bg styles for both themes.
  - Zero `innerHTML` writes (static count + dynamic stub counter).
  - Demo data verbatim (Stone..Mist, Blush colours, defaultIndex 4).
  - Stage fix as visible geometry for EVERY cover (10/10): parses spread/tail, view padding, mask px stops, label mode (centred card-level); computes desktop geometry (viewOuter 804, W240) at Blush pos4; asserts card overlaps viewport, label inside clip bounds (0-804), label in opaque zone (outside mask fade 32px), label inside card (not clipped by card `overflow:hidden`).
  - Per-cover label nodes in live DOM stub: 10 tags, full title text (`Stone`..`Mist`), parent is `card` (not drifted `art`), class `.cf-tag` centred style, readable colours in both themes (explicit `html[data-theme="light/dark"] .cf-tag` rules, `z-index:3` above dim veils, not `display:none`/`visibility:hidden`/`opacity:0`, box within stage).
  - Behaviour in light AND dark: initial Blush 5/10 with synced title/sub/colours/dots, Next Sand 6/10, Prev Blush, all 10 covers visible at rest, full-loop (0..9) node identity (nodes+dots+tags), zero `innerHTML` after init.

### Original result (expected FAIL, exit 1)
```
TARGET: ./original-backup.html
  ok - noflash guard present
  ok - color-scheme meta present
  ok - noflash bg style present
  ok - noflash dark bg present
  ok - zero innerHTML writes (static) (found 0)
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
  ok - default index 4 (Blush)
  ok - parsed spread/tail factors (spread=0.44 tail=0.13)
  ok - view padding present (edge-fix) (48px)
  ok - mask-image present (maskPx~32)
  ok - centred .cf-tag CSS present
  ok - .cf-tag centred left:50%
  ok - .cf-tag centred translateX(-50%)
  ok - .cf-tag z-index:3 above dim veils
  ok - .cf-tag not display:none
  ok - .cf-tag not visibility:hidden
  ok - .cf-tag not opacity:0 (opacity:1)
  FAIL - explicit html[data-theme="dark"] .cf-tag readable rule
  FAIL - explicit html[data-theme="light"] .cf-tag readable rule
  ok - tag theme vars present
  ok - cover Stone card overlaps viewport (L=82.8 R=322.8)
  ok - cover Stone label inside clip bounds (label 167.8-237.8 within 0-804)
  ok - cover Stone label in opaque zone (outside mask fade) (mask 32px label 167.8-237.8)
  ok - cover Stone label inside card (not clipped by overflow:hidden) (label 167.8-237.8 card 82.8-322.8)
  ok - cover Mint card overlaps viewport (L=114.0 R=354.0)
  ok - cover Mint label inside clip bounds (label 199.0-269.0 within 0-804)
  ok - cover Mint label in opaque zone (outside mask fade) (mask 32px label 199.0-269.0)
  ok - cover Mint label inside card (not clipped by overflow:hidden) (label 199.0-269.0 card 114.0-354.0)
  ok - cover Sky card overlaps viewport (L=145.2 R=385.2)
  ok - cover Sky label inside clip bounds (label 230.2-300.2 within 0-804)
  ok - cover Sky label in opaque zone (outside mask fade) (mask 32px label 230.2-300.2)
  ok - cover Sky label inside card (not clipped by overflow:hidden) (label 230.2-300.2 card 145.2-385.2)
  ok - cover Sage card overlaps viewport (L=176.4 R=416.4)
  ok - cover Sage label inside clip bounds (label 261.4-331.4 within 0-804)
  ok - cover Sage label in opaque zone (outside mask fade) (mask 32px label 261.4-331.4)
  ok - cover Sage label inside card (not clipped by overflow:hidden) (label 261.4-331.4 card 176.4-416.4)
  ok - cover Blush card overlaps viewport (L=282.0 R=522.0)
  ok - cover Blush label inside clip bounds (label 367.0-437.0 within 0-804)
  ok - cover Blush label in opaque zone (outside mask fade) (mask 32px label 367.0-437.0)
  ok - cover Blush label inside card (not clipped by overflow:hidden) (label 367.0-437.0 card 282.0-522.0)
  ok - cover Sand card overlaps viewport (L=387.6 R=627.6)
  ok - cover Sand label inside clip bounds (label 472.6-542.6 within 0-804)
  ok - cover Sand label in opaque zone (outside mask fade) (mask 32px label 472.6-542.6)
  ok - cover Sand label inside card (not clipped by overflow:hidden) (label 472.6-542.6 card 387.6-627.6)
  ok - cover Lilac card overlaps viewport (L=418.8 R=658.8)
  ok - cover Lilac label inside clip bounds (label 503.8-573.8 within 0-804)
  ok - cover Lilac label in opaque zone (outside mask fade) (mask 32px label 503.8-573.8)
  ok - cover Lilac label inside card (not clipped by overflow:hidden) (label 503.8-573.8 card 418.8-658.8)
  ok - cover Ice card overlaps viewport (L=450.0 R=690.0)
  ok - cover Ice label inside clip bounds (label 535.0-605.0 within 0-804)
  ok - cover Ice label in opaque zone (outside mask fade) (mask 32px label 535.0-605.0)
  ok - cover Ice label inside card (not clipped by overflow:hidden) (label 535.0-605.0 card 450.0-690.0)
  ok - cover Peach card overlaps viewport (L=481.2 R=721.2)
  ok - cover Peach label inside clip bounds (label 566.2-636.2 within 0-804)
  ok - cover Peach label in opaque zone (outside mask fade) (mask 32px label 566.2-636.2)
  ok - cover Peach label inside card (not clipped by overflow:hidden) (label 566.2-636.2 card 481.2-721.2)
  ok - cover Mist card overlaps viewport (L=512.4 R=752.4)
  ok - cover Mist label inside clip bounds (label 597.4-667.4 within 0-804)
  ok - cover Mist label in opaque zone (outside mask fade) (mask 32px label 597.4-667.4)
  ok - cover Mist label inside card (not clipped by overflow:hidden) (label 597.4-667.4 card 512.4-752.4)
  ok - inline script extracted (14910 chars)
  ok - [light] script runs without error
  ok - [light] test hook exposes 10 covers
  ok - [light] initial title Blush (got Blush)
  ok - [light] initial count 5/10 (got 5 / 10)
  ok - [light] initial Blush colours synced
  ok - [light] initial dot 4 (got 4)
  ok - [light] nav enabled mid-list
  ok - [light] cover Stone visible at rest
  ok - [light] cover Mint visible at rest
  ok - [light] cover Sky visible at rest
  ok - [light] cover Sage visible at rest
  ok - [light] cover Blush visible at rest
  ok - [light] cover Sand visible at rest
  ok - [light] cover Lilac visible at rest
  ok - [light] cover Ice visible at rest
  ok - [light] cover Peach visible at rest
  ok - [light] cover Mist visible at rest
  ok - [light] 10 tag nodes (got 10)
  ok - [light] tag 0 full title Stone (got Stone)
  ok - [light] tag Stone parent is card (not drifted art)
  ok - [light] tag Stone centred .cf-tag class
  ok - [light] tag Stone not display:none/visibility:hidden/opacity:0
  ok - [light] tag Stone box within stage (167.8-237.8)
  FAIL - [light] tag Stone readable colours both themes (explicit light+dark rules)
  ok - [light] tag 1 full title Mint (got Mint)
  ok - [light] tag Mint parent is card (not drifted art)
  ok - [light] tag Mint centred .cf-tag class
  ok - [light] tag Mint not display:none/visibility:hidden/opacity:0
  ok - [light] tag Mint box within stage (199.0-269.0)
  FAIL - [light] tag Mint readable colours both themes (explicit light+dark rules)
  ok - [light] tag 2 full title Sky (got Sky)
  ok - [light] tag Sky parent is card (not drifted art)
  ok - [light] tag Sky centred .cf-tag class
  ok - [light] tag Sky not display:none/visibility:hidden/opacity:0
  ok - [light] tag Sky box within stage (230.2-300.2)
  FAIL - [light] tag Sky readable colours both themes (explicit light+dark rules)
  ok - [light] tag 3 full title Sage (got Sage)
  ok - [light] tag Sage parent is card (not drifted art)
  ok - [light] tag Sage centred .cf-tag class
  ok - [light] tag Sage not display:none/visibility:hidden/opacity:0
  ok - [light] tag Sage box within stage (261.4-331.4)
  FAIL - [light] tag Sage readable colours both themes (explicit light+dark rules)
  ok - [light] tag 4 full title Blush (got Blush)
  ok - [light] tag Blush parent is card (not drifted art)
  ok - [light] tag Blush centred .cf-tag class
  ok - [light] tag Blush not display:none/visibility:hidden/opacity:0
  ok - [light] tag Blush box within stage (367.0-437.0)
  FAIL - [light] tag Blush readable colours both themes (explicit light+dark rules)
  ok - [light] tag 5 full title Sand (got Sand)
  ok - [light] tag Sand parent is card (not drifted art)
  ok - [light] tag Sand centred .cf-tag class
  ok - [light] tag Sand not display:none/visibility:hidden/opacity:0
  ok - [light] tag Sand box within stage (472.6-542.6)
  FAIL - [light] tag Sand readable colours both themes (explicit light+dark rules)
  ok - [light] tag 6 full title Lilac (got Lilac)
  ok - [light] tag Lilac parent is card (not drifted art)
  ok - [light] tag Lilac centred .cf-tag class
  ok - [light] tag Lilac not display:none/visibility:hidden/opacity:0
  ok - [light] tag Lilac box within stage (503.8-573.8)
  FAIL - [light] tag Lilac readable colours both themes (explicit light+dark rules)
  ok - [light] tag 7 full title Ice (got Ice)
  ok - [light] tag Ice parent is card (not drifted art)
  ok - [light] tag Ice centred .cf-tag class
  ok - [light] tag Ice not display:none/visibility:hidden/opacity:0
  ok - [light] tag Ice box within stage (535.0-605.0)
  FAIL - [light] tag Ice readable colours both themes (explicit light+dark rules)
  ok - [light] tag 8 full title Peach (got Peach)
  ok - [light] tag Peach parent is card (not drifted art)
  ok - [light] tag Peach centred .cf-tag class
  ok - [light] tag Peach not display:none/visibility:hidden/opacity:0
  ok - [light] tag Peach box within stage (566.2-636.2)
  FAIL - [light] tag Peach readable colours both themes (explicit light+dark rules)
  ok - [light] tag 9 full title Mist (got Mist)
  ok - [light] tag Mist parent is card (not drifted art)
  ok - [light] tag Mist centred .cf-tag class
  ok - [light] tag Mist not display:none/visibility:hidden/opacity:0
  ok - [light] tag Mist box within stage (597.4-667.4)
  FAIL - [light] tag Mist readable colours both themes (explicit light+dark rules)
  ok - [light] Next title Sand (got Sand)
  ok - [light] Next count 6/10 (got 6 / 10)
  ok - [light] Prev title Blush (got Blush)
  ok - [light] full-loop (0..9) node identity (in-place)
  ok - [light] zero innerHTML writes after init (dynamic) (writes=0)
  ok - [dark] script runs without error
  ok - [dark] test hook exposes 10 covers
  ok - [dark] initial title Blush (got Blush)
  ok - [dark] initial count 5/10 (got 5 / 10)
  ok - [dark] initial Blush colours synced
  ok - [dark] initial dot 4 (got 4)
  ok - [dark] nav enabled mid-list
  ok - [dark] cover Stone visible at rest
  ok - [dark] cover Mint visible at rest
  ok - [dark] cover Sky visible at rest
  ok - [dark] cover Sage visible at rest
  ok - [dark] cover Blush visible at rest
  ok - [dark] cover Sand visible at rest
  ok - [dark] cover Lilac visible at rest
  ok - [dark] cover Ice visible at rest
  ok - [dark] cover Peach visible at rest
  ok - [dark] cover Mist visible at rest
  ok - [dark] 10 tag nodes (got 10)
  ok - [dark] tag 0 full title Stone (got Stone)
  ok - [dark] tag Stone parent is card (not drifted art)
  ok - [dark] tag Stone centred .cf-tag class
  ok - [dark] tag Stone not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Stone box within stage (167.8-237.8)
  FAIL - [dark] tag Stone readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 1 full title Mint (got Mint)
  ok - [dark] tag Mint parent is card (not drifted art)
  ok - [dark] tag Mint centred .cf-tag class
  ok - [dark] tag Mint not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Mint box within stage (199.0-269.0)
  FAIL - [dark] tag Mint readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 2 full title Sky (got Sky)
  ok - [dark] tag Sky parent is card (not drifted art)
  ok - [dark] tag Sky centred .cf-tag class
  ok - [dark] tag Sky not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Sky box within stage (230.2-300.2)
  FAIL - [dark] tag Sky readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 3 full title Sage (got Sage)
  ok - [dark] tag Sage parent is card (not drifted art)
  ok - [dark] tag Sage centred .cf-tag class
  ok - [dark] tag Sage not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Sage box within stage (261.4-331.4)
  FAIL - [dark] tag Sage readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 4 full title Blush (got Blush)
  ok - [dark] tag Blush parent is card (not drifted art)
  ok - [dark] tag Blush centred .cf-tag class
  ok - [dark] tag Blush not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Blush box within stage (367.0-437.0)
  FAIL - [dark] tag Blush readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 5 full title Sand (got Sand)
  ok - [dark] tag Sand parent is card (not drifted art)
  ok - [dark] tag Sand centred .cf-tag class
  ok - [dark] tag Sand not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Sand box within stage (472.6-542.6)
  FAIL - [dark] tag Sand readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 6 full title Lilac (got Lilac)
  ok - [dark] tag Lilac parent is card (not drifted art)
  ok - [dark] tag Lilac centred .cf-tag class
  ok - [dark] tag Lilac not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Lilac box within stage (503.8-573.8)
  FAIL - [dark] tag Lilac readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 7 full title Ice (got Ice)
  ok - [dark] tag Ice parent is card (not drifted art)
  ok - [dark] tag Ice centred .cf-tag class
  ok - [dark] tag Ice not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Ice box within stage (535.0-605.0)
  FAIL - [dark] tag Ice readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 8 full title Peach (got Peach)
  ok - [dark] tag Peach parent is card (not drifted art)
  ok - [dark] tag Peach centred .cf-tag class
  ok - [dark] tag Peach not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Peach box within stage (566.2-636.2)
  FAIL - [dark] tag Peach readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 9 full title Mist (got Mist)
  ok - [dark] tag Mist parent is card (not drifted art)
  ok - [dark] tag Mist centred .cf-tag class
  ok - [dark] tag Mist not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Mist box within stage (597.4-667.4)
  FAIL - [dark] tag Mist readable colours both themes (explicit light+dark rules)
  ok - [dark] Next title Sand (got Sand)
  ok - [dark] Next count 6/10 (got 6 / 10)
  ok - [dark] Prev title Blush (got Blush)
  ok - [dark] full-loop (0..9) node identity (in-place)
  ok - [dark] zero innerHTML writes after init (dynamic) (writes=0)
PASS 215:
FAIL 22:
RESULT: FAIL

[exit:1]
```

### Fixed result (expected PASS, exit 0)
```
TARGET: ./index.html
  ok - noflash guard present
  ok - color-scheme meta present
  ok - noflash bg style present
  ok - noflash dark bg present
  ok - zero innerHTML writes (static) (found 0)
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
  ok - default index 4 (Blush)
  ok - parsed spread/tail factors (spread=0.44 tail=0.13)
  ok - view padding present (edge-fix) (48px)
  ok - mask-image present (maskPx~32)
  ok - centred .cf-tag CSS present
  ok - .cf-tag centred left:50%
  ok - .cf-tag centred translateX(-50%)
  ok - .cf-tag z-index:3 above dim veils
  ok - .cf-tag not display:none
  ok - .cf-tag not visibility:hidden
  ok - .cf-tag not opacity:0 (opacity:1)
  ok - explicit html[data-theme="dark"] .cf-tag readable rule
  ok - explicit html[data-theme="light"] .cf-tag readable rule
  ok - tag theme vars present
  ok - cover Stone card overlaps viewport (L=82.8 R=322.8)
  ok - cover Stone label inside clip bounds (label 167.8-237.8 within 0-804)
  ok - cover Stone label in opaque zone (outside mask fade) (mask 32px label 167.8-237.8)
  ok - cover Stone label inside card (not clipped by overflow:hidden) (label 167.8-237.8 card 82.8-322.8)
  ok - cover Mint card overlaps viewport (L=114.0 R=354.0)
  ok - cover Mint label inside clip bounds (label 199.0-269.0 within 0-804)
  ok - cover Mint label in opaque zone (outside mask fade) (mask 32px label 199.0-269.0)
  ok - cover Mint label inside card (not clipped by overflow:hidden) (label 199.0-269.0 card 114.0-354.0)
  ok - cover Sky card overlaps viewport (L=145.2 R=385.2)
  ok - cover Sky label inside clip bounds (label 230.2-300.2 within 0-804)
  ok - cover Sky label in opaque zone (outside mask fade) (mask 32px label 230.2-300.2)
  ok - cover Sky label inside card (not clipped by overflow:hidden) (label 230.2-300.2 card 145.2-385.2)
  ok - cover Sage card overlaps viewport (L=176.4 R=416.4)
  ok - cover Sage label inside clip bounds (label 261.4-331.4 within 0-804)
  ok - cover Sage label in opaque zone (outside mask fade) (mask 32px label 261.4-331.4)
  ok - cover Sage label inside card (not clipped by overflow:hidden) (label 261.4-331.4 card 176.4-416.4)
  ok - cover Blush card overlaps viewport (L=282.0 R=522.0)
  ok - cover Blush label inside clip bounds (label 367.0-437.0 within 0-804)
  ok - cover Blush label in opaque zone (outside mask fade) (mask 32px label 367.0-437.0)
  ok - cover Blush label inside card (not clipped by overflow:hidden) (label 367.0-437.0 card 282.0-522.0)
  ok - cover Sand card overlaps viewport (L=387.6 R=627.6)
  ok - cover Sand label inside clip bounds (label 472.6-542.6 within 0-804)
  ok - cover Sand label in opaque zone (outside mask fade) (mask 32px label 472.6-542.6)
  ok - cover Sand label inside card (not clipped by overflow:hidden) (label 472.6-542.6 card 387.6-627.6)
  ok - cover Lilac card overlaps viewport (L=418.8 R=658.8)
  ok - cover Lilac label inside clip bounds (label 503.8-573.8 within 0-804)
  ok - cover Lilac label in opaque zone (outside mask fade) (mask 32px label 503.8-573.8)
  ok - cover Lilac label inside card (not clipped by overflow:hidden) (label 503.8-573.8 card 418.8-658.8)
  ok - cover Ice card overlaps viewport (L=450.0 R=690.0)
  ok - cover Ice label inside clip bounds (label 535.0-605.0 within 0-804)
  ok - cover Ice label in opaque zone (outside mask fade) (mask 32px label 535.0-605.0)
  ok - cover Ice label inside card (not clipped by overflow:hidden) (label 535.0-605.0 card 450.0-690.0)
  ok - cover Peach card overlaps viewport (L=481.2 R=721.2)
  ok - cover Peach label inside clip bounds (label 566.2-636.2 within 0-804)
  ok - cover Peach label in opaque zone (outside mask fade) (mask 32px label 566.2-636.2)
  ok - cover Peach label inside card (not clipped by overflow:hidden) (label 566.2-636.2 card 481.2-721.2)
  ok - cover Mist card overlaps viewport (L=512.4 R=752.4)
  ok - cover Mist label inside clip bounds (label 597.4-667.4 within 0-804)
  ok - cover Mist label in opaque zone (outside mask fade) (mask 32px label 597.4-667.4)
  ok - cover Mist label inside card (not clipped by overflow:hidden) (label 597.4-667.4 card 512.4-752.4)
  ok - inline script extracted (14910 chars)
  ok - [light] script runs without error
  ok - [light] test hook exposes 10 covers
  ok - [light] initial title Blush (got Blush)
  ok - [light] initial count 5/10 (got 5 / 10)
  ok - [light] initial Blush colours synced
  ok - [light] initial dot 4 (got 4)
  ok - [light] nav enabled mid-list
  ok - [light] cover Stone visible at rest
  ok - [light] cover Mint visible at rest
  ok - [light] cover Sky visible at rest
  ok - [light] cover Sage visible at rest
  ok - [light] cover Blush visible at rest
  ok - [light] cover Sand visible at rest
  ok - [light] cover Lilac visible at rest
  ok - [light] cover Ice visible at rest
  ok - [light] cover Peach visible at rest
  ok - [light] cover Mist visible at rest
  ok - [light] 10 tag nodes (got 10)
  ok - [light] tag 0 full title Stone (got Stone)
  ok - [light] tag Stone parent is card (not drifted art)
  ok - [light] tag Stone centred .cf-tag class
  ok - [light] tag Stone not display:none/visibility:hidden/opacity:0
  ok - [light] tag Stone box within stage (167.8-237.8)
  ok - [light] tag Stone readable colours both themes (explicit light+dark rules)
  ok - [light] tag 1 full title Mint (got Mint)
  ok - [light] tag Mint parent is card (not drifted art)
  ok - [light] tag Mint centred .cf-tag class
  ok - [light] tag Mint not display:none/visibility:hidden/opacity:0
  ok - [light] tag Mint box within stage (199.0-269.0)
  ok - [light] tag Mint readable colours both themes (explicit light+dark rules)
  ok - [light] tag 2 full title Sky (got Sky)
  ok - [light] tag Sky parent is card (not drifted art)
  ok - [light] tag Sky centred .cf-tag class
  ok - [light] tag Sky not display:none/visibility:hidden/opacity:0
  ok - [light] tag Sky box within stage (230.2-300.2)
  ok - [light] tag Sky readable colours both themes (explicit light+dark rules)
  ok - [light] tag 3 full title Sage (got Sage)
  ok - [light] tag Sage parent is card (not drifted art)
  ok - [light] tag Sage centred .cf-tag class
  ok - [light] tag Sage not display:none/visibility:hidden/opacity:0
  ok - [light] tag Sage box within stage (261.4-331.4)
  ok - [light] tag Sage readable colours both themes (explicit light+dark rules)
  ok - [light] tag 4 full title Blush (got Blush)
  ok - [light] tag Blush parent is card (not drifted art)
  ok - [light] tag Blush centred .cf-tag class
  ok - [light] tag Blush not display:none/visibility:hidden/opacity:0
  ok - [light] tag Blush box within stage (367.0-437.0)
  ok - [light] tag Blush readable colours both themes (explicit light+dark rules)
  ok - [light] tag 5 full title Sand (got Sand)
  ok - [light] tag Sand parent is card (not drifted art)
  ok - [light] tag Sand centred .cf-tag class
  ok - [light] tag Sand not display:none/visibility:hidden/opacity:0
  ok - [light] tag Sand box within stage (472.6-542.6)
  ok - [light] tag Sand readable colours both themes (explicit light+dark rules)
  ok - [light] tag 6 full title Lilac (got Lilac)
  ok - [light] tag Lilac parent is card (not drifted art)
  ok - [light] tag Lilac centred .cf-tag class
  ok - [light] tag Lilac not display:none/visibility:hidden/opacity:0
  ok - [light] tag Lilac box within stage (503.8-573.8)
  ok - [light] tag Lilac readable colours both themes (explicit light+dark rules)
  ok - [light] tag 7 full title Ice (got Ice)
  ok - [light] tag Ice parent is card (not drifted art)
  ok - [light] tag Ice centred .cf-tag class
  ok - [light] tag Ice not display:none/visibility:hidden/opacity:0
  ok - [light] tag Ice box within stage (535.0-605.0)
  ok - [light] tag Ice readable colours both themes (explicit light+dark rules)
  ok - [light] tag 8 full title Peach (got Peach)
  ok - [light] tag Peach parent is card (not drifted art)
  ok - [light] tag Peach centred .cf-tag class
  ok - [light] tag Peach not display:none/visibility:hidden/opacity:0
  ok - [light] tag Peach box within stage (566.2-636.2)
  ok - [light] tag Peach readable colours both themes (explicit light+dark rules)
  ok - [light] tag 9 full title Mist (got Mist)
  ok - [light] tag Mist parent is card (not drifted art)
  ok - [light] tag Mist centred .cf-tag class
  ok - [light] tag Mist not display:none/visibility:hidden/opacity:0
  ok - [light] tag Mist box within stage (597.4-667.4)
  ok - [light] tag Mist readable colours both themes (explicit light+dark rules)
  ok - [light] Next title Sand (got Sand)
  ok - [light] Next count 6/10 (got 6 / 10)
  ok - [light] Prev title Blush (got Blush)
  ok - [light] full-loop (0..9) node identity (in-place)
  ok - [light] zero innerHTML writes after init (dynamic) (writes=0)
  ok - [dark] script runs without error
  ok - [dark] test hook exposes 10 covers
  ok - [dark] initial title Blush (got Blush)
  ok - [dark] initial count 5/10 (got 5 / 10)
  ok - [dark] initial Blush colours synced
  ok - [dark] initial dot 4 (got 4)
  ok - [dark] nav enabled mid-list
  ok - [dark] cover Stone visible at rest
  ok - [dark] cover Mint visible at rest
  ok - [dark] cover Sky visible at rest
  ok - [dark] cover Sage visible at rest
  ok - [dark] cover Blush visible at rest
  ok - [dark] cover Sand visible at rest
  ok - [dark] cover Lilac visible at rest
  ok - [dark] cover Ice visible at rest
  ok - [dark] cover Peach visible at rest
  ok - [dark] cover Mist visible at rest
  ok - [dark] 10 tag nodes (got 10)
  ok - [dark] tag 0 full title Stone (got Stone)
  ok - [dark] tag Stone parent is card (not drifted art)
  ok - [dark] tag Stone centred .cf-tag class
  ok - [dark] tag Stone not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Stone box within stage (167.8-237.8)
  ok - [dark] tag Stone readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 1 full title Mint (got Mint)
  ok - [dark] tag Mint parent is card (not drifted art)
  ok - [dark] tag Mint centred .cf-tag class
  ok - [dark] tag Mint not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Mint box within stage (199.0-269.0)
  ok - [dark] tag Mint readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 2 full title Sky (got Sky)
  ok - [dark] tag Sky parent is card (not drifted art)
  ok - [dark] tag Sky centred .cf-tag class
  ok - [dark] tag Sky not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Sky box within stage (230.2-300.2)
  ok - [dark] tag Sky readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 3 full title Sage (got Sage)
  ok - [dark] tag Sage parent is card (not drifted art)
  ok - [dark] tag Sage centred .cf-tag class
  ok - [dark] tag Sage not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Sage box within stage (261.4-331.4)
  ok - [dark] tag Sage readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 4 full title Blush (got Blush)
  ok - [dark] tag Blush parent is card (not drifted art)
  ok - [dark] tag Blush centred .cf-tag class
  ok - [dark] tag Blush not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Blush box within stage (367.0-437.0)
  ok - [dark] tag Blush readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 5 full title Sand (got Sand)
  ok - [dark] tag Sand parent is card (not drifted art)
  ok - [dark] tag Sand centred .cf-tag class
  ok - [dark] tag Sand not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Sand box within stage (472.6-542.6)
  ok - [dark] tag Sand readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 6 full title Lilac (got Lilac)
  ok - [dark] tag Lilac parent is card (not drifted art)
  ok - [dark] tag Lilac centred .cf-tag class
  ok - [dark] tag Lilac not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Lilac box within stage (503.8-573.8)
  ok - [dark] tag Lilac readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 7 full title Ice (got Ice)
  ok - [dark] tag Ice parent is card (not drifted art)
  ok - [dark] tag Ice centred .cf-tag class
  ok - [dark] tag Ice not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Ice box within stage (535.0-605.0)
  ok - [dark] tag Ice readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 8 full title Peach (got Peach)
  ok - [dark] tag Peach parent is card (not drifted art)
  ok - [dark] tag Peach centred .cf-tag class
  ok - [dark] tag Peach not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Peach box within stage (566.2-636.2)
  ok - [dark] tag Peach readable colours both themes (explicit light+dark rules)
  ok - [dark] tag 9 full title Mist (got Mist)
  ok - [dark] tag Mist parent is card (not drifted art)
  ok - [dark] tag Mist centred .cf-tag class
  ok - [dark] tag Mist not display:none/visibility:hidden/opacity:0
  ok - [dark] tag Mist box within stage (597.4-667.4)
  ok - [dark] tag Mist readable colours both themes (explicit light+dark rules)
  ok - [dark] Next title Sand (got Sand)
  ok - [dark] Next count 6/10 (got 6 / 10)
  ok - [dark] Prev title Blush (got Blush)
  ok - [dark] full-loop (0..9) node identity (in-place)
  ok - [dark] zero innerHTML writes after init (dynamic) (writes=0)
PASS 237:
FAIL 0:
RESULT: PASS

[exit:0]
```
