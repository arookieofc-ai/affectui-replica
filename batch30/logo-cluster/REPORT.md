# Logo Cluster — replica report

## What was built
Standalone `index.html` (14 KB, inline CSS + JS, no external deps) replicating the
affectUI **Logo Cluster** illustration (slug `logo-cluster`, "Card illustrations", Free).

- Page: card with title "Logo Cluster", public description
  ("Central mark on a white disc with company logos bouncing out and settling around."),
  theme toggle (top-right), Replay + Pause/Resume controls, square stage, live status
  line, 7-logo legend, category note.
- Cluster behaviour (re-implemented, own class names/code): white centre disc pops in
  first (420 ms back-ease); 7 logo bubbles bounce out from centre with staggered
  delays (520 ms back-ease, 0.180 s + i·0.045 s); the whole orbit then rotates slowly
  clockwise (48 s linear); each face counter-rotates so logos stay upright; hover lifts
  a bubble (scale 1.12 + wider shadow); off-screen scroll pauses via
  IntersectionObserver; `prefers-reduced-motion` lands everything in final state.
- Demo data verbatim from the demo chunk — positions/sizes in 320-unit space and
  brand colours: Notion (−29,−97,56, currentColor), Spotify (82,−67,48, #1ED760),
  Stripe (96,−14,72, #635BFF), Google Calendar (53,86,60, #4285F4),
  Linear (−63,70,42, #5E6AD2), GitHub (−88,64,20, currentColor), Figma (−93,−1,72, #F24E1E).
- Clean-room: all HTML/CSS/JS written from the public description + observed
  behaviour. Logo glyphs are own simple letter marks (not copied path data); the
  centre mark is an own three-bar abstraction, not the copied path. No verbatim
  source excerpts.

## What matches the original
Layout (square 1:1 stage, max 420 px, centre disc ≈132/320 units), entrance order
and stagger, 48 s orbit with counter-rotating faces, hover lift, dark-mode token
swap, pause off-screen, reduced-motion final state.

## What could not be verified
Pixel-exact logo artwork (brand SVG paths intentionally not copied — letter marks
used instead); exact back-ease curve values were re-authored to the same feel.
v3 "project name + agent count / token bar / pixel-mark" rules target crew-style
items and do not apply to this illustration; noted, not forced.

## How to test
1. `open index.html` in a browser (or any static server).
2. Watch entrance → orbit; hover bubbles; Replay; Pause/Resume; theme toggle.
3. `node harness.js` — DOM-stub harness asserting visible painted text, full-loop
   node identity, zero `innerHTML` writes after init, light + dark themes.
4. `node -e "...extract inline script..." && node --check` — syntax check (passed).

## Theme check
Verified light AND dark: CSS uses shared tokens (`--surface`, `--page`, `--ink`,
`--muted`, `--subtle`, `--border`); dark tokens (`#1c1c1f/#101012/#ededed/#a1a1aa/
#26262a/#2e2e33`, amber `#fbbf24 on #451a03`) checked in harness; toggle switches
`data-theme` on `<html>` and persists to localStorage; default follows
`prefers-color-scheme`; `/*noflash*/` guard + matching first-paint background +
`color-scheme` meta prevent white flash. v5 polish applied: hover gated behind
`@media (hover:hover) and (pointer:fine)`, tap-highlight cleared, tabular numerals,
concentric-feel radii, shadow-vs-border discipline, face outline at 10%.

---

## QA fix (targeted) — GitHub tiny disc + replay angle

### Requested files
`./REPLICATE_SPEC.md` and `./demo-original.js` do not exist in this directory
(`batch30/logo-cluster/` contains only `index.html` + `REPORT.md`; repo-wide glob
found `REPLICATE_SPEC.md` only under `pilot/` and `batch1/`, no `demo-original.js`
anywhere). So the original demo could not be inspected. Per the task instruction,
since original behaviour could not be confirmed to behave the same way, the fix
below follows the QA description (all 7 discs comparable/readable; GitHub must
reach full size at front; replay should visibly replay).

### Defect
GitHub disc rendered ~26px (15–30px range) at every orbit angle in both themes,
while the other 6 rendered 55–95px. GitHub sat tight against/behind the Linear
disc, showing only a small "G".

### Root cause
`ITEMS` lists GitHub size as 20 units vs 42–72 for the others. Displayed diameter
is `--u * --sz` where `--u = 100cqw/320` (≈1.3125 at 420px max-width), so GitHub
= 26.3px, others = 55.1–94.5px. No per-bubble depth/scale update exists (rigid
CSS `cspin` rotation), so GitHub never grows. Secondary: `show()` did not reset
`spinDeg`, so Replay re-ran CSS entrance but the orbit angle continued from its
old value (angle barely changed → no visible replay).

### Fix (2 hunks, targeted — not a rebuild)
1. `build()`: keep `ITEMS` byte-for-byte verbatim (including GitHub 20 for
   provenance), but clamp the *display* size to a minimum of 42 units
   (`var effSz = Math.max(sz, 42)`), the smallest non-GitHub size. Only GitHub
   is affected (20 → 42 = 55.1px, bottom of the 55–95px band, ratio min/max
   0.28 → 0.58). Positions, names, colours unchanged.
2. `show()`: reset `spinDeg = 0` so Replay visibly restarts the orbit angle
   (status resets to `0 / 7 … orbit 0°` and counts back to `7 / 7`).

### Invariants preserved
- `/*noflash*/` guard kept (1 occurrence in both files).
- In-place updates only: same 7 nodes across entrance, replay, and full 48s loop
  (harness asserts node identity); timers touch only text/attributes.
- Zero `innerHTML` writes after init (`grep -c innerHTML ./index.html` = 0;
  harness counter = 0).
- Demo data verbatim: `ITEMS`/`COLORS`/`GLYPH` text unchanged (GitHub entry still
  `["GitHub",-88,64,20]`); only the derived `--sz` is clamped.

### Hard proof
Before (original):
`md5sum ./index.html` → `43d062cd12f7d035408737a2c285a158`
After (fixed):
`md5sum ./index.html` → `7b48ce0eb80463e24459c1b6196a3cc3`
Hashes differ. Original kept as `./original-backup.html` (md5 `43d062cd12f7d035408737a2c285a158`).

`node --check` on extracted inline script: OK (both files).

Harness: `node harness.js` (in-dir DOM stub; asserts VISIBLE state as computed
sizes/opacity/colours — not just DOM presence — in light AND dark, plus
full-loop node identity and zero innerHTML writes).

Against original (`node harness.js ./original-backup.html` → FAIL, exit 1):
```
bubble=Notion sz=56 px@420=73.5
bubble=Spotify sz=48 px@420=63.0
bubble=Stripe sz=72 px@420=94.5
bubble=Google Calendar sz=60 px@420=78.8
bubble=Linear sz=42 px@420=55.1
bubble=GitHub sz=20 px@420=26.3
bubble=Figma sz=72 px@420=94.5
minPx=26.3 maxPx=94.5 ratio=0.28
theme=light data-theme=light GitHubInk=auto status="7 / 7 logos landed · orbit 19°"
theme=dark data-theme=dark status="7 / 7 logos landed · orbit 19°"
dark GitHub sz=20 px=26.3 ink=auto(--cink)
pre-replay orbit=94deg status="7 / 7 logos landed · orbit 94°"
post-replay immediate status="0 / 7 logos landed · orbit 0°"
1s-after-replay orbit=101deg status="7 / 7 logos landed · orbit 101°"
full-loop identity=same-7-nodes status="7 / 7 logos landed · orbit 120°"
innerHTMLWrites=0
FAIL file=./original-backup.html (5 checks failed)
 - GitHub display size too small: sz=20 (need >=42 for 55px+ full disc)
 - GitHub VISIBLE diameter too small: 26.3px (need >=55px; others are 55-95px)
 - smallest disc too small for comparability: 26.3px
 - discs not comparable (min/max ratio 0.28 < 0.5; GitHub stuck tiny?)
 - replay should visibly restart orbit angle (got 101deg, want <30deg 1s after replay; angle barely changes = no visible replay)
```

Against fixed (`node harness.js ./index.html` → PASS, exit 0):
```
bubble=Notion sz=56 px@420=73.5
bubble=Spotify sz=48 px@420=63.0
bubble=Stripe sz=72 px@420=94.5
bubble=Google Calendar sz=60 px@420=78.8
bubble=Linear sz=42 px@420=55.1
bubble=GitHub sz=42 px@420=55.1
bubble=Figma sz=72 px@420=94.5
minPx=55.1 maxPx=94.5 ratio=0.58
theme=light data-theme=light GitHubInk=auto status="7 / 7 logos landed · orbit 19°"
theme=dark data-theme=dark status="7 / 7 logos landed · orbit 19°"
dark GitHub sz=42 px=55.1 ink=auto(--cink)
pre-replay orbit=94deg status="7 / 7 logos landed · orbit 94°"
post-replay immediate status="0 / 7 logos landed · orbit 0°"
1s-after-replay orbit=7deg status="7 / 7 logos landed · orbit 7°"
full-loop identity=same-7-nodes status="7 / 7 logos landed · orbit 26°"
innerHTMLWrites=0
PASS file=./index.html GitHub=55.1px light+dark OK full-loop identity OK innerHTML=0 replay-angle OK
```

Diff (`diff -u ./original-backup.html ./index.html`):
```
@@ -239,11 +239,13 @@
-      b.style.setProperty("--sz",String(sz));
+      /* QA fix: keep ITEMS verbatim, but clamp display size so GitHub (20) reaches full size like the others. Min 42 = smallest non-GitHub size; only GitHub is affected. */
+      var effSz=Math.max(sz,42);
+      b.style.setProperty("--sz",String(effSz));
@@ -281,7 +283,7 @@
-  startedAt=0; landed=-1; lastTick=0;
+  startedAt=0; landed=-1; lastTick=0; spinDeg=0;
```
