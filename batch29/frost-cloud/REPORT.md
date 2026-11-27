# Frost Cloud — replica report (slug: frost-cloud)

## What was built
Single standalone interactive `index.html` (~22KB, inline CSS+JS, system fonts only, no external deps) replicating the affectUI **Frost Cloud**: a frosted white cloud with eyes on a sky gradient that floats, breathes, glances around, blinks (sometimes double-blinks), follows the pointer, and winks + squishes on click/tap/Enter/Space.

Page chrome: title + verbatim aria-label description ("A frosted white cloud with eyes that floats, looks around and blinks"), slug `frost-cloud`, live status pill + status line (`floating · look x, y · awake/blinking/winking`, `aria-live="polite"`), controls (Blue/Orange, Sky on/off, Follow on/off, Wink button), test/replica notes, and a sun/moon theme toggle top-right.

## What matches the original (demo data used verbatim)
- Cloud geometry: 5 circles `[{115,93,43},{163,111,39},{156,155,31},{107,155,35},{72,126,34}]` + base rect `{x:80,y:100,w:80,h:65}`, merged with goo filter (`blur 3.5`, matrix `28 -12`).
- Eyes: `{y:106,w:18,h:31,left:96.5,right:127.5}`, hole gradient `#3aaef2→#62cdfa`, drop + shade strokes, `rx=9`.
- Palette CSS vars verbatim (blue + `data-color="orange"` sets, sky gradient + radial light patch, dark-mode sky overrides).
- Filters: soft 12, halo 9, edge 1.6, shade 5; frost gradient white→`#eef8ff`; glint ellipse `(108,78,34,14)` white .75; ground shadow `(120,210,54,7)`.
- Motion constants verbatim: pivots `(120,120)/(120,180)`; look targets `[(0,0),(-1,.05),(1,-.05),(0,0),(.65,-.55),(-.7,.35)]`; look spring `70/13`, squash spring `220/9`; look cadence `1.4+rand*2.2`, blink cadence `2.4+rand*3` with 25% double-blink offset `.26`, blink window `.16`, wink window `.34`; float `sin(t*1.1)*5`, breathe `sin*0.012`; pupil `(*12,*7)`, face `(*4,*2)` + `rotate(*2.5)` + `scale(1-|x|*.025)`, glint `(-*7,-*3)`, shadow `scale(1-v*.12)` / opacity `.34-v*.1`.
- Behaviour: autonomous wander, pointer-follow (clamped ±1, gain 2.4), release recentres, pointerdown wink+squash, reduced-motion static-except-wink, IntersectionObserver pause off-screen.

## Clean-room / in-place rules
- Written from scratch from the public behaviour + numeric demo data above; no compiled source copied.
- DOM built once (static SVG in HTML). The rAF loop only mutates `transform`/`opacity`/`textContent`/attributes on cached nodes; no `innerHTML` writes after init (harness asserts count stays 0, node identity across a 500-frame full loop).

## Spec compliance (incl. v5 polish)
- Tokens via CSS vars; light (`surface #ffffff/page #fafaf9/ink #171717…`) and dark (`surface #1c1c1f/page #101012/ink #ededed…`, amber adjusted) both finished; toggle sets `data-theme` on `<html>`, default follows `prefers-color-scheme`, persisted as `frost-cloud-theme`.
- No-flash: `<head>` starts with `/*noflash*/` script + `html{background…}` + `<meta name="color-scheme" content="light dark">`.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric card/stage radii; borders for structure + shadows for elevation; stage gets neutral 10% inset outline (black light / white dark); icon-side padding nudged ~2px.
- v3 items applied where relevant (no generic dashboard chrome invented; card padding 12–16px, pills 999px, focus-visible outlines, responsive stack under 560px).

## Verification (node only, no browser)
- `node --check harness.js` ✅, `node --check app-extracted.js` (app script extracted from index.html) ✅
- `node harness.js` ✅ ALL CHECKS PASSED: visible painted text (title, description, live status); noflash/color-scheme/dark-token/hover-gate/tap-highlight/tabular-nums checks; stub-DOM run asserting full-loop node identity, zero post-init `innerHTML`, in-place float/blink transforms, pointer-steer, pointerdown wink, and light→dark→light theme toggle.

## How to test
Open `index.html` in a browser. Move the pointer over the cloud (eyes follow), leave (wanders), click/tap or Tab+Enter (winks). Try Blue/Orange, Sky, Follow, and the theme toggle in both light and dark OS modes.

## Could not verify
- Pixel-exact match to the original site (no screenshots taken; no browser launched per instructions).
- Real-frame timing smoothness and screen-reader narration beyond static ARIA attributes (covered by stub assertions only).
