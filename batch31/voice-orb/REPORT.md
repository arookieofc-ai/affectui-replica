# Voice Orb — Thinking-ring collapse fix (TARGETED FIX)

## What was built / fixed
TARGETED FIX of existing `./index.html` (2 lines, no rebuild).
Defect from real-browser QA: in THINKING state the 520-point sphere collapsed
into a thin diagonal line (~160x15px) in both themes and never opened into the
thinking ring, even 2s after manually selecting Thinking. Idle/Listening rendered normally.

Root cause (formation positions collapse):
- `drawFrame` yaw step was correct (`rx=qx*cS+qz*sS`, `rz=-qx*sS+qz*cS`),
  but the pitch/tilt step reused `rx` twice:
  `var dy=qy*cT-rx*sT, dz=qy*sT+rx*cT;`
  Both `dy` and `dz` were linear functions of the SAME variable `rx`
  (plus tiny `qy`), so all thinking points (`qy=py*0.2` small, `qx,qz` on circle)
  were projected onto a 1-D line `sy-mid = -sT*(sx-mid)`.
  PCA: corr `|r|~0.99`, minor/major `~0.004`. Axis-aligned bbox still looked
  large (~158x130) because the line is diagonal; orthogonal thickness is ~15px,
  matching QA.
- Secondary deviation: `Math.atan2(px,pz)` swapped args vs original
  `Math.atan2(a,n)` = `atan2(z,x)`, misplacing the bright comet arc.

Fix (matches `./demo-original.js`):
- `var dy=qy*cT-rz*sT, dz=qy*sT+rz*cT;`
- `var ang=Math.atan2(pz,px)+spin;`
- State buttons / auto-cycle / timings untouched and still working.

## Original behaviour check (`./demo-original.js`)
Read with relative path before changing anything. Original thinking block:
`p+=(n/t*r-p)*o, g+=(i*.2-g)*o, y+=(a/t*r-y)*o` (ring formation, radius `r~1`),
then `T=p*I+y*F, E=-p*F+y*I, D=g*P-E*N, O=g*N+E*P` — i.e. second rotation uses
`E` (z') not `T` (x'), and `Math.atan2(a,n)` = `atan2(z,x)`.
So the original forms a visible tilted ring/disc, NOT a thin line.
The collapse is a transcription error in `./index.html`, not original behaviour,
so fixing is warranted (not noting as "same as original").

## What matches / demo data verbatim
- `SIZE=220, COUNT=520`, Fibonacci sphere, `SPEEDS={idle:0.16,listening:0.30,thinking:1.9,speaking:0.42}`
- States + timings verbatim: Idle 2000ms / Listening 3200ms / Thinking 2600ms / Speaking 3600ms
- Captions `Tap to speak / Listening / Thinking / Speaking`, footer
  `Canvas sphere · 520 dots · breathing / listening swell / thinking ring / speaking ripple`
- `/*noflash*/` guard kept first in `<head>` + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `<meta name="color-scheme">`
- In-place updates only: `paintState` updates text/attrs/classes/styles on existing nodes; full loop keeps node identity (harness asserts); zero `innerHTML` writes after init (static grep 0 + runtime setter count 0).

## How to test (node only, no installs/downloads)
- `node --check ./harness.cjs` — harness syntax
- Extract inline main script and `node --check` it (both passed, see below)
- `node ./harness.cjs ./original-backup.html` — MUST FAIL (thin line)
- `node ./harness.cjs ./index.html` — MUST PASS (real ring, light+dark)
- Open `./index.html` in a browser, click Thinking, wait 2s, check ring in light + dark (theme toggle top-right).

## HARD PROOF (a) md5 BEFORE/AFTER — MUST differ
- BEFORE (`./original-backup.html`, copy of pre-fix `./index.html`): `ab947db0716c7574730f33a7c6a40767`
- AFTER (`./index.html` fixed): `586d15011df8db6d37b02f44603a1c1f`
- `md5sum ./index.html ./original-backup.html`:
  `586d15011df8db6d37b02f44603a1c1f  ./index.html`
  `ab947db0716c7574730f33a7c6a40767  ./original-backup.html`
- Diff is exactly 2 lines (see harness section); no rebuild.

## HARD PROOF (b) harness FAIL on original, PASS on fixed
Harness: `./harness.cjs` (in-dir DOM-stub, node only). Stubs document/canvas/window/performance/rAF,
runs the real inline script via `vm`, selects Thinking via `window.__voiceOrb.goTo(2,true)`,
pumps 2.2s of frames, records per-dot `ctx.arc` positions + `fillStyle` colours.
Asserts as VISIBLE state (not DOM presence): arc count>300, bbox w>100/h>30,
correlation `|r|<0.9`, PCA minor/major `>0.20`, parsed colours, light-vs-dark delta,
`data-state`, dots visibility, label text, blend convergence, full-loop node identity,
zero runtime `innerHTML`, state-button `goTo` response. Light AND dark both tested.

### `node --check` results
- `node --check ./harness.cjs` → OK
- inline main script extracted to temp in-dir file → `node --check` → OK (temp file removed afterwards)

### FAIL against original (`node ./harness.cjs ./original-backup.html`, exit 1)
```
HARNESS target: ./original-backup.html
static innerHTML writes: 0
[light] dots hidden? false (want false)
[light] label="Thinking" status="Thinking — reasoning in a ring"
[light] blend.thinking after 2.2s = 1.000
[light] arcs=502 bbox w=157.9 h=130.1 corr=-0.991 pcaRatio=0.004 (l1=4187 l2=17) meanRGB=(27,36,59)
[dark] dots hidden? false (want false)
[dark] label="Thinking" status="Thinking — reasoning in a ring"
[dark] blend.thinking after 2.2s = 1.000
[dark] arcs=501 bbox w=156.1 h=129.8 corr=-0.991 pcaRatio=0.004 (l1=4199 l2=17) meanRGB=(217,224,240)
mean-R light vs dark delta = 190.6
innerHTML writes at runtime: 0
FAIL ./original-backup.html
 - [light] dots collapsed to diagonal line (|corr|=0.991 want <0.9)
 - [light] ring not 2-D (pca minor/major=0.004 want >0.20) — thin-line collapse
 - [dark] dots collapsed to diagonal line (|corr|=0.991 want <0.9)
 - [dark] ring not 2-D (pca minor/major=0.004 want >0.20) — thin-line collapse
```

### PASS against fixed (`node ./harness.cjs ./index.html`, exit 0)
```
HARNESS target: ./index.html
static innerHTML writes: 0
[light] dots hidden? false (want false)
[light] label="Thinking" status="Thinking — reasoning in a ring"
[light] blend.thinking after 2.2s = 1.000
[light] arcs=502 bbox w=152.2 h=128.5 corr=-0.000 pcaRatio=0.618 (l1=2546 l2=1574) meanRGB=(27,36,59)
[dark] dots hidden? false (want false)
[dark] label="Thinking" status="Thinking — reasoning in a ring"
[dark] blend.thinking after 2.2s = 1.000
[dark] arcs=501 bbox w=153.0 h=129.8 corr=-0.003 pcaRatio=0.614 (l1=2554 l2=1569) meanRGB=(217,224,240)
mean-R light vs dark delta = 190.6
innerHTML writes at runtime: 0
PASS ./index.html
```

## Light AND dark
Both themes pass geometry (ring 2-D, ~152x129, 501-502 dots) and colours differ
correctly (light mean ~27,36,59 ink-dark-on-light; dark mean ~217,224,240; deltaR 190.6).
Theme toggle (`data-theme` light/dark) verified via stub + `currentTheme()`.

## Could not verify
Real-browser pixel screenshot (no browser here); harness uses stub canvas recording
`arc()` geometry + `fillStyle` colours as computed visible state. No Tailwind/build step (none used).

