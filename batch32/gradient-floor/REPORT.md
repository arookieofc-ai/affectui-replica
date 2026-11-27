# Gradient Floor — caption readability targeted fix (REPORT)

## What was wrong (real-browser QA)
- Content slot white caption (`Glow stays behind text · content never blocks the drift` + `Deploy preview ready`) blended into the light gradient band and was nearly invisible at multiple phases of the 3s gradient cycle, in both themes (readable only at 2x zoom).
- Root cause in `./index.html`: `.ui-gf-overlay` used bare white text (`color:#fff`) with a weak single shadow (`0 1px 8px rgba(0,0,0,.35)`) directly over the bright morphing glow. No scrim/backdrop. At light-band phases the effective contrast vs white is ~1.26 (model below), far below readable.
- The Ocean preset switch itself worked and was kept working.

## Original behaviour (`./demo-original.js`) — checked before changing anything
- Read the full 4768-byte `./demo-original.js` in-dir. The exported demo renders `GradientFloor` with **no children** (empty floor panel, `className: gradient-floor-demo__panel`), i.e. an empty `.ui-gf-content` slot.
- The original CSS (`d`) keeps the glow truly behind the text layer: `.ui-gf{isolation:isolate}`, `.ui-gf-layer{position:absolute;pointer-events:none}`, `.ui-gf-content{position:relative;z-index:1}`, light layer `mix-blend-mode:plus-lighter`. There is no caption and no caption shadow/backdrop treatment in the original because there is no caption text.
- Conclusion: the wash-out is replica-only (the replica added the `Deploy preview ready` overlay). So a fix is warranted and does not contradict the original; the fix restores the original's invariant (glow stays behind text, content never blocks drift) while making the added caption readable. No change to geometry numbers, morph math, stops, timing, or presets.

## Fix (targeted, CSS-only, no rebuild)
File: `./index.html` only. No JS/DOM changes, no new elements, no innerHTML, demo text verbatim.
```css
.ui-gf-overlay{
  position:relative;isolation:isolate;
  height:100%;display:flex;flex-direction:column;justify-content:flex-end;
  padding:18px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.85),0 2px 12px rgba(0,0,0,.55);
  background:linear-gradient(to top,rgba(10,10,12,.62) 0%,rgba(10,10,12,.34) 46%,rgba(10,10,12,0) 78%);
}
.ui-gf-overlay h3{position:relative;z-index:1;margin:0;...}
.ui-gf-overlay p{position:relative;z-index:1;margin:4px 0 0;...opacity:.92;...}
```
Why this preserves everything:
- Scrim is a `background` on the existing overlay inside `.ui-gf-content{z-index:1}`, i.e. above the glow layers, translucent so the 2.5s drift stays visible through/above it. Drift keyframes, durations, throttle, IntersectionObserver pause untouched — drift never stops.
- Text stays `#fff`; stronger two-layer shadow plus bottom-anchored dark scrim (darkest where the text sits, transparent at top) gives contrast 6.59 vs white in the worst-case light band, in both themes.
- `.ui-gf-layer{pointer-events:none}` and `.ui-gf-content{z-index:1}` untouched — glow stays behind text, content never blocks drift.
- Ocean/Sunset/Mint `applyColors`, speed, pause, theme toggle, `/*noflash*/`, tabular-nums, hover media, reduced-motion all untouched.

## Hard proof (a) — md5 BEFORE / AFTER (commands run in-dir)
```
md5sum ./index.html   # BEFORE editing
d6ba9bb36f00bab3b33f84a63e76ae96  ./index.html
md5sum ./index.html   # AFTER editing
369eb18044c45ee402a97d471649591e  ./index.html
```
Hashes differ. Original kept as `./original-backup.html` (`d6ba9bb36f00bab3b33f84a63e76ae96`).

## Hard proof (b) — harness FAIL→PASS (DOM-stub, node only, in-dir)
Harness: `./harness.cjs`, run as `node ./harness.cjs ./original-backup.html` and `node ./harness.cjs ./index.html`.
It asserts VISIBLE state (parsed computed colour/scrim/shadow, opacity, visibility, `getBoundingClientRect` geometry, contrast model), in light AND dark, plus Ocean switch, full 3s-loop node identity, drift morph, zero innerHTML writes. Syntax: `node --check ./harness.cjs` → OK.

### Original (`./original-backup.html`) — FAIL (expected)
```
  ok - noflash guard present
  ok - color-scheme meta present
  ok - zero innerHTML writes in file (no innerHTML literal)
  ok - demo caption text verbatim
  ok - overlay h3 verbatim
  ok - Ocean preset markup present
  ok - overlay rule exists
  ok - content layer z-index above glow (position:relative;z-index:1;height:100%;)
  ok - layers pointer-events none (content never blocks drift)
  ok - drift animation color kept (2.5s)
  ok - drift animation light kept (2.5s)
  ok - Ocean preset JS present
  info - overlay background: (none)
  info - overlay color: #fff
  info - overlay text-shadow: 0 1px 8px rgba(0,0,0,.35)
  info - caption p opacity: 0.92
  FAIL - overlay has dark scrim (linear-gradient, alpha>=0.3) (max dark alpha=0)
  FAIL - text-shadow strong (alpha>=0.5) (max shadow alpha=0.35)
  ok - caption color stays white (#fff)
  info - effective caption bg rgb(207,232,255) lum=0.782 contrast vs white=1.26
  FAIL - caption contrast vs white >= 4.5 (light band worst case) (ratio=1.26)
  info - mini css: height:190px; hero: height:300px;
  ok - mini panel has height (geometry visible)
  ok - overlay fills height 100%
  ok - overlay bottom-anchored (flex-end)
  ok - overlay padding keeps text off edge
  ok - caption p opacity keeps text visible (>=0.85) (opacity=0.92)
  ok - overlay not display:none / visibility hidden
  ok - page script runs in stub (__gf exposed)
  ok - theme light applied (data-theme=light)
  ok - theme light caption color computed white (#fff)
  FAIL - theme light scrim computed (bg image) (none)
  ok - theme light caption box visible geometry (800x154)
  FAIL - theme light contrast>=4.5 (model) (ratio=1.26)
  ok - theme dark applied (data-theme=dark)
  ok - theme dark caption color computed white (#fff)
  FAIL - theme dark scrim computed (bg image) (none)
  ok - theme dark caption box visible geometry (800x154)
  FAIL - theme dark contrast>=4.5 (model) (ratio=1.26)
  ok - Ocean preset stop0 (#00C2FF)
  ok - Ocean preset stop1 (#0073FF)
  ok - Ocean preset stop2 (#7A00FF)
  ok - Ocean aria-pressed
  ok - Sunset restore stop0
  ok - full-loop node identity (same objects)
  ok - drift morphs paths (d changes across loop) (len 146/146)
  ok - zero innerHTML writes after init (writes=0)
./original-backup.html: FAIL (34 ok, 7 failed)
```

### Fixed (`./index.html`) — PASS
```
  ok - noflash guard present
  ok - color-scheme meta present
  ok - zero innerHTML writes in file (no innerHTML literal)
  ok - demo caption text verbatim
  ok - overlay h3 verbatim
  ok - Ocean preset markup present
  ok - overlay rule exists
  ok - content layer z-index above glow (position:relative;z-index:1;height:100%;)
  ok - layers pointer-events none (content never blocks drift)
  ok - drift animation color kept (2.5s)
  ok - drift animation light kept (2.5s)
  ok - Ocean preset JS present
  info - overlay background: linear-gradient(to top,rgba(10,10,12,.62) 0%,rgba(10,10,12,.34) 46%,rgba(10,10,12,0) 78%)
  info - overlay color: #fff
  info - overlay text-shadow: 0 1px 2px rgba(0,0,0,.85),0 2px 12px rgba(0,0,0,.55)
  info - caption p opacity: 0.92
  ok - overlay has dark scrim (linear-gradient, alpha>=0.3) (max dark alpha=0.62)
  ok - text-shadow strong (alpha>=0.5) (max shadow alpha=0.85)
  ok - caption color stays white (#fff)
  info - effective caption bg rgb(85,94,104) lum=0.109 contrast vs white=6.59
  ok - caption contrast vs white >= 4.5 (light band worst case) (ratio=6.59)
  info - mini css: height:190px; hero: height:300px;
  ok - mini panel has height (geometry visible)
  ok - overlay fills height 100%
  ok - overlay bottom-anchored (flex-end)
  ok - overlay padding keeps text off edge
  ok - caption p opacity keeps text visible (>=0.85) (opacity=0.92)
  ok - overlay not display:none / visibility hidden
  ok - page script runs in stub (__gf exposed)
  ok - theme light applied (data-theme=light)
  ok - theme light caption color computed white (#fff)
  ok - theme light scrim computed (bg image) (linear-gradient(to top,rgba(10,10,12,.62) 0%,rgba(10,10,12,.34) 46%,rgba(10,10,12,0) 78%)
  ok - theme light caption box visible geometry (800x154)
  ok - theme light contrast>=4.5 (model) (ratio=6.59)
  ok - theme dark applied (data-theme=dark)
  ok - theme dark caption color computed white (#fff)
  ok - theme dark scrim computed (bg image) (linear-gradient(to top,rgba(10,10,12,.62) 0%,rgba(10,10,12,.34) 46%,rgba(10,10,12,0) 78%)
  ok - theme dark caption box visible geometry (800x154)
  ok - theme dark contrast>=4.5 (model) (ratio=6.59)
  ok - Ocean preset stop0 (#00C2FF)
  ok - Ocean preset stop1 (#0073FF)
  ok - Ocean preset stop2 (#7A00FF)
  ok - Ocean aria-pressed
  ok - Sunset restore stop0
  ok - full-loop node identity (same objects)
  ok - drift morphs paths (d changes across loop) (len 146/146)
  ok - zero innerHTML writes after init (writes=0)
./index.html: PASS (41 ok, 0 failed)
```

## Verification checklist
- `node --check ./harness.cjs` → OK; page script executes in stub via `window.__gf`.
- Light AND dark: scrim + white + strong shadow + 800x154 box + contrast 6.59 in both.
- Ocean preset: stops become `#00C2FF/#0073FF/#7A00FF`, `aria-pressed` flips, Sunset restores — kept working.
- Full-loop (64 steps over 3.0s) node identity: same objects; `d` changes across loop so drift not frozen.
- Zero `innerHTML` writes after init (counter + file grep).
- `/*noflash*/`, `color-scheme`, tokens, in-place `setAttribute/textContent/classList` updates only, demo strings verbatim, `<200KB` single file.

## How to test (browser)
Open `./index.html`. Scroll to `With content slot`. Watch the caption across the 3s morph in light, then toggle sun/moon to dark — text stays readable throughout while the glow keeps drifting behind it. Click Ocean — glow recolours, caption stays readable. Drag Speed, press Pause — same.
