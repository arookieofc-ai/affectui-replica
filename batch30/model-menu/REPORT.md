# Model-menu Llama ghost fix — REPORT

Targeted fix of `./index.html` (no rebuild). Work dir only; harness + report in-dir; node only; no installs.

## 1. Hashes (MUST differ)

BEFORE (original `./index.html` at start, preserved as `./original-backup.html`):

```
690f7729fcb7fbf2936b1f2cf4fad401  ./index.html
690f7729fcb7fbf2936b1f2cf4fad401  ./original-backup.html
```

AFTER (fixed `./index.html`):

```
b83366c4c0d89b48d6889a865943ce4f  ./index.html
690f7729fcb7fbf2936b1f2cf4fad401  ./original-backup.html
```

`md5sum ./index.html` before `690f7729fcb7fbf2936b1f2cf4fad401`, after `b83366c4c0d89b48d6889a865943ce4f` — differ. `diff -u` is exactly 2 CSS lines.

## 2. Original-chunk verification (`./demo-original.js`)

Checked before changing anything. Models list present verbatim in chunk:

```
DeepSeek, GPT, Claude Opus, Gemini, Mistral Large, Qwen, Llama
```

Single `opacity: 0.6` occurrence at offset 12763, context:

```
color: var(--ui-mmn-ink)}
.ui-mmn__row[data-last] .ui-mmn__name{color: var(--ui-mmn-faint)}
.ui-mmn__row[data-last] .ui-mmn__logo{opacity: 0.6}
```

So the `0.6` belongs ONLY to `.ui-mmn__logo` inside `[data-last]` (the icon), NOT to the row and NOT to the text. Text dimming in the original is via colour token, not opacity:

- light: `--ui-mmn-ink: rgba(0,0,0,0.88)`, `--ui-mmn-faint: rgba(0,0,0,0.36)`
- dark: `--ui-mmn-ink: rgba(255,255,255,0.92)`, `--ui-mmn-faint: rgba(255,255,255,0.4)`

Same vertical mask in original and replica (`linear-gradient(180deg,#000 55%,transparent 94%)`), so mask is not the defect.

Per task instruction: “If the chunk shows the 0.6 belongs to something else, paint Llama exactly like the other rows and say so in REPORT.md.” The 0.6 belongs to the logo only — therefore Llama is painted exactly like the other rows (see §3). The faint-colour treatment from the original chunk (`0.36`/`0.4`) is intentionally NOT replicated because the QA defect requires Llama at ≥60% effective contrast of a normal row, which `0.36`/`0.4` cannot satisfy (original-faint ratios would be ~15% light / ~25% dark in WCAG terms).

## 3. Fix (2 lines, `./index.html` only)

```diff
-.mmn__row[data-last] .mmn__name{color:var(--row-faint)}
-.mmn__row[data-last] .mmn__logo{opacity:.9}
+.mmn__row[data-last] .mmn__name{color:var(--row-ink)}
+.mmn__row[data-last] .mmn__logo{opacity:1}
```

Effect: Llama row computed text colour/opacity identical to normal rows in both themes (light `rgba(0,0,0,.88)` over `#ffffff` → 16.56:1; dark `rgba(255,255,255,.92)` over `#141414` → 15.62:1). Logo at full opacity. `data-last` attribute still set by JS (unchanged); it just no longer dims. Preserved: `/*noflash*/` guard, in-place updates only, zero `innerHTML` writes after init, demo data verbatim (`NAMES` unchanged), 32px geometry, band logic.

Replica-before values for reference: `--row-faint` light `rgba(0,0,0,.66)`, dark `rgba(255,255,255,.78)`; logo `0.9`. Effective WCAG Llama/normal: light 43.8% (<60% → ghosted), dark 72.9%.

## 4. Verification (node only)

```
node --check ./harness.js        # OK
node ./harness.js ./original-backup.html  # exit 1 FAIL
node ./harness.js ./index.html            # exit 0 PASS
```

App inline script syntax also validated via `vm.Script` inside harness (`app inline script syntax OK len=8882`).

Harness asserts VISIBLE state (composited colour × opacity vs card background → WCAG contrast, computed opacity/visibility/geometry, not DOM presence), in light AND dark, plus full-loop node identity and zero `innerHTML` after init.

Threshold: Llama effective contrast ≥60% of normal row, both themes.

## 5. Harness log — ORIGINAL (`./original-backup.html`, MUST FAIL)

```
TARGET: ./original-backup.html
[guards]
  PASS noflash-guard-present — inline /*noflash*/ script
  PASS noflash-sets-data-theme — data-theme + prefers-color-scheme
  PASS noflash-style — first-paint bg light/dark
  PASS color-scheme-meta — meta color-scheme
  PASS no-innerHTML-in-source — zero innerHTML writes in source
[tokens]
  light --row-ink=rgba(0,0,0,.88) --row-faint=rgba(0,0,0,.66) --card=#ffffff
  dark  --row-ink=rgba(255,255,255,.92) --row-faint=rgba(255,255,255,.78) --card=#141414
  normal .mmn__name color=var(--row-ink) | llama .mmn__name color=var(--row-faint) | llama logo opacity=0.9
  [light] card=#ffffff normal={"r":30.599999999999998,"g":30.599999999999998,"b":30.599999999999998} c=16.558 llama={"r":86.69999999999999,"g":86.69999999999999,"b":86.69999999999999} c=7.260 ratio=43.8%
  FAIL llama-contrast>=60%-light — effective contrast ratio 43.8% (llama 7.26:1 vs normal 16.56:1)
  [dark] card=#141414 normal={"r":236.20000000000002,"g":236.20000000000002,"b":236.20000000000002} c=15.622 llama={"r":203.3,"g":203.3,"b":203.3} c=11.390 ratio=72.9%
  PASS llama-contrast>=60%-dark — effective contrast ratio 72.9% (llama 11.39:1 vs normal 15.62:1)
[visible-state css]
  FAIL llama-text-same-as-normal — llama color var(--row-faint) vs normal var(--row-ink)
  FAIL llama-logo-full-opacity — logo opacity=0.9
  PASS row-geometry-32px — .mmn__row height 32px
  PASS no-display-none-on-row — rows not hidden
  PASS band-geometry — .mmn__band 32px
[runtime]
  PASS app-script-found — inline app script with __modelMenu hook
  PASS app-runs-in-stub — vm executed without throwing
  PASS test-hook-exposed — window.__modelMenu
  PASS demo-data-verbatim — ["DeepSeek","GPT","Claude Opus","Gemini","Mistral Large","Qwen","Llama"]
  PASS row-count-7 — rows=7
  PASS row-h-32 — rowH=32
  PASS hold-2200 — hold=2200
  PASS walk-3 — walk=3
  PASS last-row-marked — Llama row carries data-last (styled identically post-fix)
  PASS zero-innerHTML-after-init — writes=0
  PASS full-loop-node-identity — 7/7 row objects identical across full loop
  PASS band-identity — band object identical
  PASS zero-innerHTML-after-loop — writes=0
  PASS at-var-tracks-selection — --at=1 selected=1
RESULT: FAIL (3 failures)
```

## 6. Harness log — FIXED (`./index.html`, MUST PASS)

```
TARGET: ./index.html
[guards]
  PASS noflash-guard-present — inline /*noflash*/ script
  PASS noflash-sets-data-theme — data-theme + prefers-color-scheme
  PASS noflash-style — first-paint bg light/dark
  PASS color-scheme-meta — meta color-scheme
  PASS no-innerHTML-in-source — zero innerHTML writes in source
[tokens]
  light --row-ink=rgba(0,0,0,.88) --row-faint=rgba(0,0,0,.66) --card=#ffffff
  dark  --row-ink=rgba(255,255,255,.92) --row-faint=rgba(255,255,255,.78) --card=#141414
  normal .mmn__name color=var(--row-ink) | llama .mmn__name color=var(--row-ink) | llama logo opacity=1
  [light] card=#ffffff normal={"r":30.599999999999998,"g":30.599999999999998,"b":30.599999999999998} c=16.558 llama={"r":30.599999999999998,"g":30.599999999999998,"b":30.599999999999998} c=16.558 ratio=100.0%
  PASS llama-contrast>=60%-light — effective contrast ratio 100.0% (llama 16.56:1 vs normal 16.56:1)
  [dark] card=#141414 normal={"r":236.20000000000002,"g":236.20000000000002,"b":236.20000000000002} c=15.622 llama={"r":236.20000000000002,"g":236.20000000000002,"b":236.20000000000002} c=15.622 ratio=100.0%
  PASS llama-contrast>=60%-dark — effective contrast ratio 100.0% (llama 15.62:1 vs normal 15.62:1)
[visible-state css]
  PASS llama-text-same-as-normal — llama color var(--row-ink) vs normal var(--row-ink)
  PASS llama-logo-full-opacity — logo opacity=1
  PASS row-geometry-32px — .mmn__row height 32px
  PASS no-display-none-on-row — rows not hidden
  PASS band-geometry — .mmn__band 32px
[runtime]
  PASS app-script-found — inline app script with __modelMenu hook
  PASS app-runs-in-stub — vm executed without throwing
  PASS test-hook-exposed — window.__modelMenu
  PASS demo-data-verbatim — ["DeepSeek","GPT","Claude Opus","Gemini","Mistral Large","Qwen","Llama"]
  PASS row-count-7 — rows=7
  PASS row-h-32 — rowH=32
  PASS hold-2200 — hold=2200
  PASS walk-3 — walk=3
  PASS last-row-marked — Llama row carries data-last (styled identically post-fix)
  PASS zero-innerHTML-after-init — writes=0
  PASS full-loop-node-identity — 7/7 row objects identical across full loop
  PASS band-identity — band object identical
  PASS zero-innerHTML-after-loop — writes=0
  PASS at-var-tracks-selection — --at=1 selected=1
RESULT: PASS (26 checks)
```

## 7. How to test

- Open `./index.html` in a browser; toggle sun/moon button for light/dark. Llama reads at full strength like DeepSeek/GPT rows.
- `node --check ./harness.js && node ./harness.js ./original-backup.html; echo $?` → FAIL (1); `node ./harness.js ./index.html; echo $?` → PASS (0).
- Files in this dir: `./index.html` (fixed), `./original-backup.html` (pre-fix), `./harness.js`, `./harness-original.log`, `./harness-fixed.log`, `./REPLICATE_SPEC.md`, `./demo-original.js`, `./REPORT.md`.
