# REPORT — Custom endpoint `internal-gateway` frozen at `Probing…` (targeted fix)

## What was built / fixed
- Targeted fix of existing `./index.html` (no rebuild). One defect only: the Custom-endpoints probe for `internal-gateway` never left `Probing…`.
- Root cause: `wireEndpoints()` only wired manual `Test` button clicks (`setTimeout 600ms → Online 172ms`). There was no automatic probe timer for endpoints. `eu-proxy` starts as `Online 184ms` (resolved), but `internal-gateway` starts as `Probing…` with no timer to resolve it. The 5s `tick()` only cycles model latencies / `#pingLine` (`Last probe: …`), never touches `[data-epstat]`. So `internal-gateway` stayed frozen through 75s+ while model probes cycled.
- Fix (in `wireEndpoints()`, in-place only): added `EP_BASE={'eu-proxy':184,'internal-gateway':197}`, `paintEp()` (updates `textContent` + `className` on existing nodes only), `probeEndpoints()` (jittered `Online Nms` per endpoint, skips missing nodes), `setTimeout(probeEndpoints,1200)` for initial resolve + `setInterval(probeEndpoints,5000)` to cycle with the same cadence as the model tick (with `unref` guard like the existing timer). Both endpoints now resolve and keep cycling with changing latencies. Manual `Test` behaviour unchanged. No `innerHTML`, no list rebuild, no demo-data changes.

## `demo-original.js` check (required)
- `./demo-original.js` is a 305-byte stub: it only re-exports `DemoStage`/`component` wrappers (`jsx-runtime`, `DemoStage-Bd5MGvS8`, `index-aucBiVQ_`, `component-D8ycv3hq`). It contains zero probe/endpoint/latency logic, no `internal-gateway`, no `Probing`, no timer.
- So the original demo does NOT define the expected gateway behaviour to copy. The fix follows the replica's own established pattern (eu-proxy `Online Nms` + in-place `textContent`/`className` updates + `Probes run in place and never rebuild the list.` caption) and the QA requirement that the probe “resolve/cycle to a result (latency or error state)”.

## Constraints kept
- `/*noflash*/` guard kept verbatim (first `<script>` + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `<meta name="color-scheme" content="light dark">`).
- In-place updates only: fix uses only `stat.textContent` + `dot.className`; no `innerHTML` anywhere (`grep -c innerHTML` = 0), no `replaceChild`/full render from timer.
- Demo data verbatim: `internal-gateway`, `https://proxy.internal.example.com/v1`, `eu-proxy`, `https://eu-inference.example.com/v1`, `Online 184ms` / `Probing…` initials untouched.
- Toggling models still works (harness asserts `setModel` off/on + `tick()` cycles `Last probe:`).
- Verified with node only, no installs/downloads.

## Hard proof — hashes (must differ)
BEFORE (original):
```
c36d6b3035238fe0838c83b48cd3d938  ./index.html
c36d6b3035238fe0838c83b48cd3d938  ./original-backup.html
```
AFTER (fixed):
```
7d45449f22ab8ba56e408dbd42c9b84e  ./index.html
```
Hashes differ: YES (`c36d6b…` → `7d45449f…`).

## Hard proof — harness FAIL on original, PASS on fixed
Harness: `./harness-probe-gateway.js` (node only, in-dir DOM stub). Asserts fixed behaviour as VISIBLE `textContent` state in light AND dark, plus full-loop node identity and zero `innerHTML` writes after init. Run both ways:
- `node ./harness-probe-gateway.js ./original-backup.html` → must FAIL
- `node ./harness-probe-gateway.js ./index.html` → must PASS

### BEFORE run (`./original-backup.html`) — FAIL as required (exit 1)
```
PASS noflash guard present — inline /*noflash*/ script
PASS meta color-scheme present — meta color-scheme
PASS zero innerHTML occurrences (static) — no innerHTML string in file
PASS demo data verbatim: internal-gateway — gateway row intact
PASS demo data verbatim: eu-proxy — eu-proxy row intact
--- theme: light ---
PASS [light] zero innerHTML writes after init — writes=0
[light] t=0 internal-gateway="Probing…" eu-proxy="Online 184ms" ping=""
[light] t~2s internal-gateway="Probing…"
[light] t~80s internal-gateway="Probing…" eu-proxy="Online 184ms" ping="Last probe: gpt-4.1 295ms"
FAIL [light] internal-gateway leaves Probing… — got "Probing…"
FAIL [light] internal-gateway shows result (Online ms or error) — got "Probing…"
PASS [light] eu-proxy still Online — got "Online 184ms"
PASS [light] Last probe line cycles — got "Last probe: gpt-4.1 295ms"
PASS [light] endpoint node identity preserved — same objects
PASS [light] ping node identity preserved — same object
PASS [light] model lat node identity preserved — 13 lat nodes
PASS [light] toggling models works — before=true off=false on=true
PASS [light] model tick still cycles — tick={"model":"claude-sonnet","ms":252}
PASS [light] zero innerHTML writes total — writes=0
--- theme: dark ---
PASS [dark] zero innerHTML writes after init — writes=0
[dark] t=0 internal-gateway="Probing…" eu-proxy="Online 184ms" ping=""
[dark] t~2s internal-gateway="Probing…"
[dark] t~80s internal-gateway="Probing…" eu-proxy="Online 184ms" ping="Last probe: gpt-4.1 295ms"
FAIL [dark] internal-gateway leaves Probing… — got "Probing…"
FAIL [dark] internal-gateway shows result (Online ms or error) — got "Probing…"
PASS [dark] eu-proxy still Online — got "Online 184ms"
PASS [dark] Last probe line cycles — got "Last probe: gpt-4.1 295ms"
PASS [dark] endpoint node identity preserved — same objects
PASS [dark] ping node identity preserved — same object
PASS [dark] model lat node identity preserved — 13 lat nodes
PASS [dark] toggling models works — before=true off=false on=true
PASS [dark] model tick still cycles — tick={"model":"claude-sonnet","ms":252}
PASS [dark] zero innerHTML writes total — writes=0

23 passed, 4 failed
FAILURES: [light] internal-gateway leaves Probing… | [light] internal-gateway shows result (Online ms or error) | [dark] internal-gateway leaves Probing… | [dark] internal-gateway shows result (Online ms or error)
before exit:1
```

### AFTER run (`./index.html`) — PASS (exit 0)
```
PASS noflash guard present — inline /*noflash*/ script
PASS meta color-scheme present — meta color-scheme
PASS zero innerHTML occurrences (static) — no innerHTML string in file
PASS demo data verbatim: internal-gateway — gateway row intact
PASS demo data verbatim: eu-proxy — eu-proxy row intact
--- theme: light ---
PASS [light] zero innerHTML writes after init — writes=0
[light] t=0 internal-gateway="Probing…" eu-proxy="Online 184ms" ping=""
[light] t~2s internal-gateway="Online 183ms"
[light] t~80s internal-gateway="Online 209ms" eu-proxy="Online 179ms" ping="Last probe: gpt-4.1 295ms"
PASS [light] internal-gateway leaves Probing… — got "Online 209ms"
PASS [light] internal-gateway shows result (Online ms or error) — got "Online 209ms"
PASS [light] eu-proxy still Online — got "Online 179ms"
PASS [light] Last probe line cycles — got "Last probe: gpt-4.1 295ms"
PASS [light] endpoint node identity preserved — same objects
PASS [light] ping node identity preserved — same object
PASS [light] model lat node identity preserved — 13 lat nodes
PASS [light] toggling models works — before=true off=false on=true
PASS [light] model tick still cycles — tick={"model":"claude-sonnet","ms":252}
PASS [light] zero innerHTML writes total — writes=0
--- theme: dark ---
PASS [dark] zero innerHTML writes after init — writes=0
[dark] t=0 internal-gateway="Probing…" eu-proxy="Online 184ms" ping=""
[dark] t~2s internal-gateway="Online 183ms"
[dark] t~80s internal-gateway="Online 209ms" eu-proxy="Online 179ms" ping="Last probe: gpt-4.1 295ms"
PASS [dark] internal-gateway leaves Probing… — got "Online 209ms"
PASS [dark] internal-gateway shows result (Online ms or error) — got "Online 209ms"
PASS [dark] eu-proxy still Online — got "Online 179ms"
PASS [dark] Last probe line cycles — got "Last probe: gpt-4.1 295ms"
PASS [dark] endpoint node identity preserved — same objects
PASS [dark] ping node identity preserved — same object
PASS [dark] model lat node identity preserved — 13 lat nodes
PASS [dark] toggling models works — before=true off=false on=true
PASS [dark] model tick still cycles — tick={"model":"claude-sonnet","ms":252}
PASS [dark] zero innerHTML writes total — writes=0

27 passed, 0 failed
ALL CHECKS PASSED
after exit:0
```

## Syntax check
- Extracted inline scripts to `./.check-tmp.js` and ran `node --check ./.check-tmp.js` → `node --check OK`.
- Harness itself: `node --check` passes implicitly (it runs).

## How to test (browser)
1. Open `./index.html` in a browser (no server needed).
2. Scroll to Custom endpoints: `internal-gateway` starts `Probing…`, within ~1.2s becomes `Online Nms`; every 5s both `eu-proxy` and `internal-gateway` update latencies in place.
3. Toggle theme (sun/moon top-right): verify legible in both light and dark, probes keep cycling in both.
4. Toggle any model switch: `Saved` time updates, counts update, `Last probe:` keeps rotating among enabled models.
5. Click `Test` on `internal-gateway`: briefly `Probing…` → `Online 172ms`, then auto-cycle resumes.

## Files in this directory
- `./index.html` (fixed, 7d45449f…)
- `./original-backup.html` (original, c36d6b30…, for before-run)
- `./harness-probe-gateway.js` (node-only DOM-stub harness)
- `./REPORT.md` (this file)
