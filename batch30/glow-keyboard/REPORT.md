# REPORT — glow-keyboard invisible demo text (second repair attempt)

## 1. Result
Targeted 2-line fix in `./index.html`. The auto-demo's typed text is now visibly
painted inside the chat input in BOTH themes. Harness: FAIL on original, PASS on fixed.

## 2. Hard proof — md5 BEFORE / AFTER (must differ: they do)
- BEFORE: `b89445d116acf4ae44b3bfee2675fac4` (`./index.html` at start, preserved byte-identical as `./original-backup.html`)
- AFTER:  `316e3a70d10c53b1cae0e5c4735117a1` (`./index.html` after fix)

`diff ./original-backup.html ./index.html` shows exactly 2 changed lines (see §5).

## 3. Paint-level root cause (browser-verified defect, twice)
Symptom: during auto-demo typing the input box paints NO text in either theme
(3x zoom: empty box, only the orb glow at its left), while the DOM holds the
typed string and the page chrome claims the full prompt.

Differing property: **`background` (+ `backdrop-filter`) of the inner glass
overlay `.gk-glass--inner`** — the last, topmost layer of the input stack:

```html
<div class="gk-input" id="gk-inputbox">
  <div class="gk-glass"></div>          <!-- input background, behind text -->
  <svg class="gk-orb">…</svg>
  <span class="gk-field"><span class="gk-caret"></span><input class="gk-prompt" …></span>
  <div class="gk-glass gk-glass--inner"></div>  <!-- paints OVER the typed text -->
</div>
```

- `.gk-glass{position:absolute;inset:0;…}` and
  `.gk-input>.gk-glass{background:var(--gk-input-bg);…backdrop-filter:blur(…)}`
  (specificity 0,2,0) match BOTH glass divs → near-opaque background
  (light `rgba(255,255,255,.9)`, dark `rgba(24,24,27,.88)`) + a live backdrop blur.
- The reset rule was written as `.gk-glass--inner{background:none;…}`
  (specificity 0,1,0), so it LOSES the cascade: the topmost overlay keeps the
  opaque background AND the blur, and it sits `absolute/inset:0` directly over
  the `<input>`. Typed text is veiled in both themes (only the bright orb shows
  faintly through on the left — exactly the QA observation). It also lacked the
  `backdrop-filter:none` reset, so even a transparent veil would smear the text.

Full computed-style chain I compared (input itself + every ancestor
`html→body→.wrap→.card→.gk→.gk-frame→.gk-composer→.gk-input→.gk-field→input`):
colour (5.63 light / 14.08 dark — fine), opacity (1), visibility, font-size
(20.3px), box (458×67px at (253,101) inside the 964×526 frame), overflow
(`hidden` only on `.gk-frame`, input well inside), clip, text-indent (0),
caret/placeholder handling, transform (none). ALL clean — which is why the
first fix's DOM-state assertions passed while the real browser still showed an
empty box. The single broken link is the veil overlay's computed background/
backdrop-filter, i.e. a paint-order/occlusion defect, not a DOM-presence defect.

Comparison against a state where text IS painted: the original demo
(`./demo-original.js`) does NOT have this bug — its rule is
`.ui-gk-input > .ui-gk-glass--inner{background:none;-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:…}`
(specificity 0,2,0, later in source → wins → transparent, no blur → text paints).
The replica dropped the `.gk-input >` prefix and the `backdrop-filter:none`
resets when renaming classes: a specificity regression, not original behaviour,
so fixing (not documenting) is correct. Manual typing in the replica would be
equally veiled, so no "manual works" state exists in the replica; the reference
painted state is the original demo plus this replica's own un-veiled elements
(submitted-prompt log, `visible text` readout), which were always legible.

Fix (root cause): restore the original's winning selector + resets —
`.gk-input>.gk-glass--inner{background:none;-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:…}`
(box-shadow/inset highlight unchanged). Typed text now paints over the input
background with contrast 5.63 (light) / 14.08 (dark).

Second one-line alignment (same loop, content-level, verified against
`./demo-original.js`): the typo-correction branch animated `w`+`Backspace` keys
but never put the `w` into the input, so `slice(0,-1)` deleted a REAL character
(`q` → DOM showed `Find a uiet…`, submitted `Find a uiet hike near Zermatt`).
The original's `X('w')` appends `w` first (`J(t.value+'w')`) and the slice then
removes the typo `w`. The replica now does `setInput(input.value+"w")` after
the `w` tap, mirroring the original; history shows `Find a q → Find a qw →
Find a q → Find a qu…` and the loop submits the verbatim prompt. Demo data is
otherwise untouched and verbatim.

## 4. Harness (`./harness.js`, node only, no installs/downloads)
Stub-DOM + micro-CSS-cascade harness asserting VISIBLE state per theme
(computed colour/contrast through every covering layer, geometry, clipping
chain) plus a virtual-clock fast-forward of one full demo loop (node identity
of all 77 key nodes / 79 board children / input+root, zero `innerHTML` writes).
Run from this directory: `node ./harness.js [./file.html]` (default `./index.html`).

### 4a. Against ORIGINAL (`node ./harness.js ./original-backup.html`) → FAIL, exit 1
```
TARGET: ./original-backup.html
  PASS noflash guard kept :: head keeps /*noflash*/ + color-scheme meta
  PASS zero innerHTML writes in file :: no innerHTML substring anywhere
  PASS demo data verbatim :: all 3 prompts present verbatim
  PASS in-place loop (no full render) :: updates via value/setAttribute/textContent only
  parsed 95 css rules
THEME light (typing state: value present):
  PASS [light] typed-text vs input-box contrast>=4.5 :: fg=var(--gk-text) bg=var(--gk-input-bg) frame=var(--gk-bg) ratio=5.63
  FAIL [light] veil overlay transparent (no opaque cover over text) :: veil background=var(--gk-input-bg) -> alpha=0.9
  FAIL [light] veil backdrop-filter none (must not smear text beneath) :: backdrop-filter=blur(calc(25.48 * var(--u))) / -webkit-blur(calc(25.48 * var(--u)))
  FAIL [light] text legible THROUGH veil contrast>=3.0 :: through-veil ratio=1.14
  PASS [light] input geometry non-zero :: font=20.34478181818182px box=458.4x67.0px
  PASS [light] input inside frame, no clip :: box@(252.8,100.8) frame=964x526
  PASS [light] no hiding ancestor (opacity/visibility/display/indent/transform) :: chain clean
THEME dark (typing state: value present):
  PASS [dark] typed-text vs input-box contrast>=4.5 :: fg=var(--gk-text) bg=var(--gk-input-bg) frame=var(--gk-bg) ratio=14.08
  FAIL [dark] veil overlay transparent (no opaque cover over text) :: veil background=var(--gk-input-bg) -> alpha=0.88
  FAIL [dark] veil backdrop-filter none (must not smear text beneath) :: backdrop-filter=blur(calc(25.48 * var(--u))) / -webkit-blur(calc(25.48 * var(--u)))
  FAIL [dark] text legible THROUGH veil contrast>=3.0 :: through-veil ratio=1.36
  PASS [dark] input geometry non-zero :: font=20.34478181818182px box=458.4x67.0px
  PASS [dark] input inside frame, no clip :: box@(252.8,100.8) frame=964x526
  PASS [dark] no hiding ancestor (opacity/visibility/display/indent/transform) :: chain clean
BEHAVIOUR (stub DOM, virtual clock, one full demo loop):
  PASS exactly one main inline script :: found 1
  PASS main script has no innerHTML :: clean
  PASS node --check equivalent: main script parses :: vm.Script compiled
  PASS page booted, debug api exposed :: keys=77
  PASS full loop completed (>=1 submit) :: loops=1 submits=1 steps=140
  FAIL submitted prompt verbatim (typo corrected like original) :: "Find a uiet hike near Zermatt"
  FAIL typo transient painted then removed (original X-w semantics) :: history tail: ["Find a q"]
  PASS full-loop node identity (keys map) :: 77 key nodes identical
  PASS full-loop node identity (board children) :: 79 board children identical
  PASS full-loop node identity (input+root) :: same objects
  PASS zero innerHTML writes after init :: 0 writes
HARNESS RESULT: FAIL (8) :: 29 checks on ./original-backup.html
EXIT=1
```
Note the trap the first fix fell into: plain text-vs-box contrast PASSES
(5.63/14.08) and geometry PASSES — DOM-state assertions alone say "visible".
Only the through-veil paint computation (1.14/1.36) reproduces the browser.

### 4b. Against FIXED (`node ./harness.js ./index.html`) → PASS, exit 0
```
TARGET: ./index.html
  PASS noflash guard kept :: head keeps /*noflash*/ + color-scheme meta
  PASS zero innerHTML writes in file :: no innerHTML substring anywhere
  PASS demo data verbatim :: all 3 prompts present verbatim
  PASS in-place loop (no full render) :: updates via value/setAttribute/textContent only
  parsed 95 css rules
THEME light (typing state: value present):
  PASS [light] typed-text vs input-box contrast>=4.5 :: fg=var(--gk-text) bg=var(--gk-input-bg) frame=var(--gk-bg) ratio=5.63
  PASS [light] veil overlay transparent (no opaque cover over text) :: veil background=none -> alpha=0
  PASS [light] veil backdrop-filter none (must not smear text beneath) :: backdrop-filter=none / -webkit-none
  PASS [light] text legible THROUGH veil contrast>=3.0 :: through-veil ratio=5.63
  PASS [light] input geometry non-zero :: font=20.34478181818182px box=458.4x67.0px
  PASS [light] input inside frame, no clip :: box@(252.8,100.8) frame=964x526
  PASS [light] no hiding ancestor (opacity/visibility/display/indent/transform) :: chain clean
THEME dark (typing state: value present):
  PASS [dark] typed-text vs input-box contrast>=4.5 :: fg=var(--gk-text) bg=var(--gk-input-bg) frame=var(--gk-bg) ratio=14.08
  PASS [dark] veil overlay transparent (no opaque cover over text) :: veil background=none -> alpha=0
  PASS [dark] veil backdrop-filter none (must not smear text beneath) :: backdrop-filter=none / -webkit-none
  PASS [dark] text legible THROUGH veil contrast>=3.0 :: through-veil ratio=14.08
  PASS [dark] input geometry non-zero :: font=20.34478181818182px box=458.4x67.0px
  PASS [dark] input inside frame, no clip :: box@(252.8,100.8) frame=964x526
  PASS [dark] no hiding ancestor (opacity/visibility/display/indent/transform) :: chain clean
BEHAVIOUR (stub DOM, virtual clock, one full demo loop):
  PASS exactly one main inline script :: found 1
  PASS main script has no innerHTML :: clean
  PASS node --check equivalent: main script parses :: vm.Script compiled
  PASS page booted, debug api exposed :: keys=77
  PASS full loop completed (>=1 submit) :: loops=1 submits=1 steps=140
  PASS submitted prompt verbatim (typo corrected like original) :: "Find a quiet hike near Zermatt"
  PASS typo transient painted then removed (original X-w semantics) :: history tail: ["Find a q","Find a qw","Find a q","Find a qu","Find a qui","Find a quie"]
  PASS full-loop node identity (keys map) :: 77 key nodes identical
  PASS full-loop node identity (board children) :: 79 board children identical
  PASS full-loop node identity (input+root) :: same objects
  PASS zero innerHTML writes after init :: 0 writes
HARNESS RESULT: PASS :: 29 checks on ./index.html
EXIT=0
```

## 5. Exact change (2 lines, targeted — no rebuild)
```diff
129c129
< .gk-glass--inner{background:none;box-shadow:inset 0 0 calc(35.91 * var(--u)) 0 var(--gk-input-inner),inset 0 0 calc(35.91 * var(--u)) 0 var(--gk-input-inner)}
---
> .gk-input>.gk-glass--inner{background:none;-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:inset 0 0 calc(35.91 * var(--u)) 0 var(--gk-input-inner),inset 0 0 calc(35.91 * var(--u)) 0 var(--gk-input-inner)}
459c459
<             return tap("w").then(function(){return wait(rand(320,420));})
---
>             return tap("w").then(function(){setInput(input.value+"w");return wait(rand(320,420));})
```

## 6. Constraints checklist
- `/*noflash*/` guard kept (harness asserts); no white first frame.
- In-place updates only: DOM built once, loop mutates `value`/`setAttribute`/`textContent`; zero `innerHTML` writes after init (asserted statically + dynamically).
- Demo data verbatim: all 3 prompts byte-identical; loop now submits them exactly.
- Light AND dark verified (all paint checks run per theme; toggle + `prefers-color-scheme` + localStorage override untouched).
- `node --check ./harness.js` OK; extracted page script `node --check` OK.
- Worked only in this directory (`./` paths); no installs/downloads; no `/tmp` writes.

## 7. How to test (browser)
Open `./index.html` in a browser, watch one auto-demo loop in light, then flip
the sun/moon toggle and watch in dark: each prompt (starting `Find a quiet hike
near Zermatt`, with its brief `w`-typo/correction) must be visibly painted
inside the glass input while keys ripple. Type any key to take over (autopilot
stops); `↻ Replay loop` restarts; submitted prompts appear in the log verbatim.
