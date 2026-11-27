# Message Actions — targeted auto-demo chain fix

## What was fixed (in-place, no rebuild)
`./index.html` only. No rebuild, demo data verbatim, `/*noflash*/` kept, in-place updates only, zero `innerHTML` writes after init.

## Hard proof — md5 BEFORE/AFTER (must differ)
- BEFORE (`./original-backup.html`): `8caef648ed2b45d1d5f02a0ce5a5da63`
- AFTER (`./index.html`): `ac259549f06f2d60cfe935a878316cd8`
- `md5sum ./index.html ./original-backup.html`:
```
ac259549f06f2d60cfe935a878316cd8  ./index.html
8caef648ed2b45d1d5f02a0ce5a5da63  ./original-backup.html
```
Hashes differ — file was edited in place.

## Harness — node only, in-dir stub, fake clock, TWO full cycles
- Harness: `./harness.js` — `node --check ./harness.js` PASS, `node --check` on extracted main script PASS.
- No installs/downloads. DOM stub + `getComputedStyle` asserting VISIBLE state (computed opacity/visibility/colours/geometry), light AND dark, node identity, zero innerHTML.
- Drive: page's OWN loop via fake `setTimeout`/`clearTimeout` through 2 full cycles + restart into cycle 3; forced throw injected into `next` step handler in cycle 2; asserts versions phase open state + answer text each cycle.

### FIXED (`node ./harness.js ./index.html`) — PASS (exit 0)
```
init done. innerHTMLWrites=0
    dbgS[init-light] versions=null version=null run=null busy=null
    dbg[init-light] countAria=Version 1 of 1 prevDis=true nextDis=true sendDis=
  [init-light] theme=light versionsOpen=false totalIn=1 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=0.75 verOp=0 verVis=hidden verW=0px ansCol=#171717
--- cycle 1 (light) ---
  waitFor ok: c1 regen versions==2 after 6900ms
    dbgS[after-regen-c1] versions=null version=null run=null busy=null
    dbg[after-regen-c1] countAria=Version 2 of 2 prevDis=false nextDis=true sendDis=
  [after-regen-c1] theme=light versionsOpen=true totalIn=2 nowIn=2 answer30=Shared workspaces arrive in 2. barOp=1 verOp=1 verVis=visible verW=120px ansCol=#171717
  assert ok: c1 regen: versions carries open state
  assert ok: c1 regen: computed opacity==1 (got 1)
  assert ok: c1 regen: computed visibility==visible
  assert ok: c1 regen: computed geometry width>0 (got 120px)
  waitFor ok: c1 prev lands on VERSIONS[0] after 1500ms
    dbgS[after-prev-c1] versions=null version=null run=null busy=null
    dbg[after-prev-c1] countAria=Version 1 of 2 prevDis=true nextDis=false sendDis=
  [after-prev-c1] theme=light versionsOpen=true totalIn=2 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=1 verOp=1 verVis=visible verW=120px ansCol=#171717
  assert ok: c1 prev: answer equals VERSIONS[0]
  assert ok: c1 prev: pager still painted opacity 1
  assert ok: c1 prev: versions still open
  waitFor ok: c1 next lands on VERSIONS[1] after 1800ms
    dbgS[after-next-c1] versions=null version=null run=null busy=null
    dbg[after-next-c1] countAria=Version 2 of 2 prevDis=false nextDis=true sendDis=
  [after-next-c1] theme=light versionsOpen=true totalIn=2 nowIn=2 answer30=Shared workspaces arrive in 2. barOp=1 verOp=1 verVis=visible verW=120px ansCol=#171717
  assert ok: c1 next: answer equals VERSIONS[1] (got Shared workspaces arrive in 2.)
  assert ok: c1 next: versions open
  assert ok: c1 next: computed visible (op 1 vis visible)
  count colour light: #78716c
  waitFor ok: c1 reset back to 1/VERSIONS[0] after 2800ms
    dbgS[after-reset-c1 (should be cycle2 start)] versions=1 version=0 run=1 busy=false
    dbg[after-reset-c1 (should be cycle2 start)] countAria=Version 1 of 1 prevDis=true nextDis=true sendDis=
  [after-reset-c1 (should be cycle2 start)] theme=light versionsOpen=false totalIn=1 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=0.75 verOp=0 verVis=hidden verW=0px ansCol=#171717
  assert ok: c1 reset: answer back to VERSIONS[0]
  assert ok: c1 reset: total back to 1 (got 1)
--- switched to dark ---
    dbgS[dark-after-switch] versions=1 version=0 run=1 busy=false
    dbg[dark-after-switch] countAria=Version 1 of 1 prevDis=true nextDis=true sendDis=
  [dark-after-switch] theme=dark versionsOpen=false totalIn=1 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=0.75 verOp=0 verVis=hidden verW=0px ansCol=#ededed
--- cycle 2 (dark) with throw injection on next ---
  waitFor ok: c2 regen versions==2 after 6300ms
    dbgS[after-regen-c2-dark] versions=2 version=1 run=1 busy=false
    dbg[after-regen-c2-dark] countAria=Version 2 of 2 prevDis=false nextDis=true sendDis=
  [after-regen-c2-dark] theme=dark versionsOpen=true totalIn=2 nowIn=2 answer30=Shared workspaces arrive in 2. barOp=1 verOp=1 verVis=visible verW=120px ansCol=#ededed
  assert ok: c2 regen (dark): versions open
  assert ok: c2 regen (dark): computed opacity 1
  assert ok: c2 regen (dark): visibility visible
  assert ok: c2 dark: answer colour is dark token #ededed (got #ededed)
  waitFor ok: c2 prev lands after 1500ms
    dbgS[after-prev-c2-dark] versions=2 version=0 run=1 busy=false
    dbg[after-prev-c2-dark] countAria=Version 1 of 2 prevDis=true nextDis=false sendDis=
  [after-prev-c2-dark] theme=dark versionsOpen=true totalIn=2 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=1 verOp=1 verVis=visible verW=120px ansCol=#ededed
  assert ok: c2 prev (dark): answer VERSIONS[0]
    dbgS[after-next-c2-dark (injected throw should be swallowed, chain alive)] versions=2 version=0 run=1 busy=false
    dbg[after-next-c2-dark (injected throw should be swallowed, chain alive)] countAria=Version 1 of 2 prevDis=true nextDis=false sendDis=
  [after-next-c2-dark (injected throw should be swallowed, chain alive)] theme=dark versionsOpen=true totalIn=2 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=1 verOp=1 verVis=visible verW=120px ansCol=#ededed
  assert ok: c2 throw: error was logged to data-loop-error or console (got data-loop-error=next:injected throw for harness consoleErrors=1)
  assert ok: c2 next after throw: answer still equals a valid version text
  assert ok: c2 next after throw: pager still open (chain survived)
  assert ok: c2 next after throw: computed opacity still 1
  waitFor ok: c2 reset after 2500ms
    dbgS[after-reset-c2 (should restart to cycle3)] versions=1 version=0 run=2 busy=false
    dbg[after-reset-c2 (should restart to cycle3)] countAria=Version 1 of 1 prevDis=true nextDis=true sendDis=
  [after-reset-c2 (should restart to cycle3)] theme=dark versionsOpen=false totalIn=1 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=0.75 verOp=0 verVis=hidden verW=0px ansCol=#ededed
  assert ok: c2 reset: answer back to VERSIONS[0] (chain survived to reset)
  assert ok: c2 reset: total 1
  waitFor ok: cycle3 regen after 6300ms
    dbgS[cycle3-regen (restart proof)] versions=2 version=1 run=2 busy=false
    dbg[cycle3-regen (restart proof)] countAria=Version 2 of 2 prevDis=false nextDis=true sendDis=
  [cycle3-regen (restart proof)] theme=dark versionsOpen=true totalIn=2 nowIn=2 answer30=Shared workspaces arrive in 2. barOp=1 verOp=1 verVis=visible verW=120px ansCol=#ededed
  assert ok: restart: cycle3 regen re-opens pager (chain restarted)
  assert ok: restart: cycle3 total is 2 (got 2)
  assert ok: restart: cycle3 answer is a valid version text
  waitFor ok: cycle3 prev after 1500ms
    dbgS[cycle3-prev] versions=2 version=0 run=2 busy=false
    dbg[cycle3-prev] countAria=Version 1 of 2 prevDis=true nextDis=false sendDis=
  [cycle3-prev] theme=dark versionsOpen=true totalIn=2 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=1 verOp=1 verVis=visible verW=120px ansCol=#ededed
  waitFor ok: cycle3 next after 1800ms
    dbgS[cycle3-next] versions=2 version=1 run=2 busy=false
    dbg[cycle3-next] countAria=Version 2 of 2 prevDis=false nextDis=true sendDis=
  [cycle3-next] theme=dark versionsOpen=true totalIn=2 nowIn=2 answer30=Shared workspaces arrive in 2. barOp=1 verOp=1 verVis=visible verW=120px ansCol=#ededed
  assert ok: restart: cycle3 next lands on VERSIONS[1]
  assert ok: restart: cycle3 pager still open after prev/next
--- identity + innerHTML ---
  assert ok: node identity: answerLine same object across full loop
  assert ok: node identity: root same object
  assert ok: node identity: bar same object
  assert ok: node identity: versionsWrap same object
  assert ok: node identity: count same object
  assert ok: zero innerHTML writes after init (got 0)
  assert ok: light: answer colour is light token #171717 (got #171717)
  assert ok: light after restart: bar computed opacity 1 (pager open)
--- summary ---
pageErrors(uncaught): []
console.error calls: ["[loop] next Error: injected throw for harness"]
data-loop-error: next:injected throw for harness
HARNESS PASS
```

### ORIGINAL (`node ./harness.js ./original-backup.html`) — FAIL (exit 1, chain-survival + throw-logging)
```
init done. innerHTMLWrites=0
    dbgS[init-light] versions=null version=null run=null busy=null
    dbg[init-light] countAria=Version 1 of 1 prevDis=true nextDis=true sendDis=
  [init-light] theme=light versionsOpen=false totalIn=1 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=0.75 verOp=0 verVis=hidden verW=0px ansCol=#171717
--- cycle 1 (light) ---
  waitFor ok: c1 regen versions==2 after 6900ms
    dbgS[after-regen-c1] versions=null version=null run=null busy=null
    dbg[after-regen-c1] countAria=Version 2 of 2 prevDis=false nextDis=true sendDis=
  [after-regen-c1] theme=light versionsOpen=true totalIn=2 nowIn=2 answer30=Shared workspaces arrive in 2. barOp=1 verOp=1 verVis=visible verW=120px ansCol=#171717
  assert ok: c1 regen: versions carries open state
  assert ok: c1 regen: computed opacity==1 (got 1)
  assert ok: c1 regen: computed visibility==visible
  assert ok: c1 regen: computed geometry width>0 (got 120px)
  waitFor ok: c1 prev lands on VERSIONS[0] after 1500ms
    dbgS[after-prev-c1] versions=null version=null run=null busy=null
    dbg[after-prev-c1] countAria=Version 1 of 2 prevDis=true nextDis=false sendDis=
  [after-prev-c1] theme=light versionsOpen=true totalIn=2 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=1 verOp=1 verVis=visible verW=120px ansCol=#171717
  assert ok: c1 prev: answer equals VERSIONS[0]
  assert ok: c1 prev: pager still painted opacity 1
  assert ok: c1 prev: versions still open
  waitFor ok: c1 next lands on VERSIONS[1] after 1800ms
    dbgS[after-next-c1] versions=null version=null run=null busy=null
    dbg[after-next-c1] countAria=Version 2 of 2 prevDis=false nextDis=true sendDis=
  [after-next-c1] theme=light versionsOpen=true totalIn=2 nowIn=2 answer30=Shared workspaces arrive in 2. barOp=1 verOp=1 verVis=visible verW=120px ansCol=#171717
  assert ok: c1 next: answer equals VERSIONS[1] (got Shared workspaces arrive in 2.)
  assert ok: c1 next: versions open
  assert ok: c1 next: computed visible (op 1 vis visible)
  count colour light: #78716c
  waitFor ok: c1 reset back to 1/VERSIONS[0] after 2800ms
    dbgS[after-reset-c1 (should be cycle2 start)] versions=1 version=0 run=1 busy=false
    dbg[after-reset-c1 (should be cycle2 start)] countAria=Version 1 of 1 prevDis=true nextDis=true sendDis=
  [after-reset-c1 (should be cycle2 start)] theme=light versionsOpen=false totalIn=1 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=0.75 verOp=0 verVis=hidden verW=0px ansCol=#171717
  assert ok: c1 reset: answer back to VERSIONS[0]
  assert ok: c1 reset: total back to 1 (got 1)
--- switched to dark ---
    dbgS[dark-after-switch] versions=1 version=0 run=1 busy=false
    dbg[dark-after-switch] countAria=Version 1 of 1 prevDis=true nextDis=true sendDis=
  [dark-after-switch] theme=dark versionsOpen=false totalIn=1 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=0.75 verOp=0 verVis=hidden verW=0px ansCol=#ededed
--- cycle 2 (dark) with throw injection on next ---
  waitFor ok: c2 regen versions==2 after 6300ms
    dbgS[after-regen-c2-dark] versions=2 version=1 run=1 busy=false
    dbg[after-regen-c2-dark] countAria=Version 2 of 2 prevDis=false nextDis=true sendDis=
  [after-regen-c2-dark] theme=dark versionsOpen=true totalIn=2 nowIn=2 answer30=Shared workspaces arrive in 2. barOp=1 verOp=1 verVis=visible verW=120px ansCol=#ededed
  assert ok: c2 regen (dark): versions open
  assert ok: c2 regen (dark): computed opacity 1
  assert ok: c2 regen (dark): visibility visible
  assert ok: c2 dark: answer colour is dark token #ededed (got #ededed)
  waitFor ok: c2 prev lands after 1500ms
    dbgS[after-prev-c2-dark] versions=2 version=0 run=1 busy=false
    dbg[after-prev-c2-dark] countAria=Version 1 of 2 prevDis=true nextDis=false sendDis=
  [after-prev-c2-dark] theme=dark versionsOpen=true totalIn=2 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=1 verOp=1 verVis=visible verW=120px ansCol=#ededed
  assert ok: c2 prev (dark): answer VERSIONS[0]
  timer threw (chain likely dead): injected throw for harness
    dbgS[after-next-c2-dark (injected throw should be swallowed, chain alive)] versions=2 version=0 run=1 busy=false
    dbg[after-next-c2-dark (injected throw should be swallowed, chain alive)] countAria=Version 1 of 2 prevDis=true nextDis=false sendDis=
  [after-next-c2-dark (injected throw should be swallowed, chain alive)] theme=dark versionsOpen=true totalIn=2 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=1 verOp=1 verVis=visible verW=120px ansCol=#ededed
  ASSERT FAIL: c2 throw: error was logged to data-loop-error or console (got data-loop-error=null consoleErrors=0)
  assert ok: c2 next after throw: answer still equals a valid version text
  assert ok: c2 next after throw: pager still open (chain survived)
  assert ok: c2 next after throw: computed opacity still 1
  waitFor TIMEOUT: c2 reset
    dbgS[after-reset-c2 (should restart to cycle3)] versions=2 version=0 run=1 busy=false
    dbg[after-reset-c2 (should restart to cycle3)] countAria=Version 1 of 2 prevDis=true nextDis=false sendDis=
  [after-reset-c2 (should restart to cycle3)] theme=dark versionsOpen=true totalIn=2 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=1 verOp=1 verVis=visible verW=120px ansCol=#ededed
  assert ok: c2 reset: answer back to VERSIONS[0] (chain survived to reset)
  ASSERT FAIL: c2 reset: total 1
  waitFor ok: cycle3 regen after 0ms
    dbgS[cycle3-regen (restart proof)] versions=2 version=0 run=1 busy=false
    dbg[cycle3-regen (restart proof)] countAria=Version 1 of 2 prevDis=true nextDis=false sendDis=
  [cycle3-regen (restart proof)] theme=dark versionsOpen=true totalIn=2 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=1 verOp=1 verVis=visible verW=120px ansCol=#ededed
  assert ok: restart: cycle3 regen re-opens pager (chain restarted)
  assert ok: restart: cycle3 total is 2 (got 2)
  assert ok: restart: cycle3 answer is a valid version text
  waitFor ok: cycle3 prev after 0ms
    dbgS[cycle3-prev] versions=2 version=0 run=1 busy=false
    dbg[cycle3-prev] countAria=Version 1 of 2 prevDis=true nextDis=false sendDis=
  [cycle3-prev] theme=dark versionsOpen=true totalIn=2 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=1 verOp=1 verVis=visible verW=120px ansCol=#ededed
  waitFor TIMEOUT: cycle3 next
    dbgS[cycle3-next] versions=2 version=0 run=1 busy=false
    dbg[cycle3-next] countAria=Version 1 of 2 prevDis=true nextDis=false sendDis=
  [cycle3-next] theme=dark versionsOpen=true totalIn=2 nowIn=1 answer30=Version 2.4 adds shared worksp barOp=1 verOp=1 verVis=visible verW=120px ansCol=#ededed
  ASSERT FAIL: restart: cycle3 next lands on VERSIONS[1]
  assert ok: restart: cycle3 pager still open after prev/next
--- identity + innerHTML ---
  assert ok: node identity: answerLine same object across full loop
  assert ok: node identity: root same object
  assert ok: node identity: bar same object
  assert ok: node identity: versionsWrap same object
  assert ok: node identity: count same object
  assert ok: zero innerHTML writes after init (got 0)
  assert ok: light: answer colour is light token #171717 (got #171717)
  assert ok: light after restart: bar computed opacity 1 (pager open)
--- summary ---
pageErrors(uncaught): [{"at":26000,"error":"injected throw for harness"}]
console.error calls: []
data-loop-error: null
HARNESS FAIL (3):
 - c2 throw: error was logged to data-loop-error or console (got data-loop-error=null consoleErrors=0)
 - c2 reset: total 1
 - restart: cycle3 next lands on VERSIONS[1]
```

The harness FAILS on the original for the throw-injection and chain-survival assertions at minimum (`c2 throw: error was logged`, `c2 reset: total 1`, `restart: cycle3 next lands`), and PASSES on the fixed file. Original kept as `./original-backup.html`.

## `demo-original.js` check (did the original behave the same?)
Checked `./demo-original.js` (React compiled demo, autoplay `_()`):
- `n=[[700,copy],[1000,down],[700,chip],[900,send],[2600,regen],[2800,prev],[2000,next],[3000,reset]]` with `reset=>{s(1),l(0),i(e=>e+1)}` — pure React state sets, no DOM surgery, no `setSwapText`/pager bookkeeping in the reset path.
- Swap animation `a()` uses React state + 300ms timeout to clear previous node; no synchronous `appendChild` wedge, no `refreshPanel`/`refreshChips` DOM surgery in the loop.
- The freeze (DOM advanced to `Version 2 of 2` but paint never changed, pager unpainted, reset never ran) is specific to the shipped in-place port's synchronous `refreshVersions`/`setSwapText` + unguarded `scheduleLoop`. The original does NOT wedge the same way, so a fix is warranted (not a wont-fix).

## Throw / wedge candidates found and neutralised
1. **Unguarded scheduler** — `loopTimer=later(function(){fireStep(LOOP[idx][1]);scheduleLoop(idx+1);},...)` with NO try/catch. Any throw in `fireStep` (copy/down/chip/send/regen/prev/next/reset) aborts `scheduleLoop(idx+1)` and the 1600ms restart never runs — matches QA freeze (pager `< 1/2 >` painted, next DOM advanced but paint stuck, reset never ran, frozen 90s+).
   - Neutralised: `scheduleLoop` now `try{fireStep(step)}catch→noteLoopError` then `try{scheduleLoop(idx+1)}`, restart path also guarded. `fireStep` itself is guarded per-branch. Error logged to `root[data-loop-error]` + `console.error`, chain always continues.
2. **`setSwapText` swap bookkeeping wedge** — `if(item.textContent!==txt){item.textContent=txt; wrap.appendChild(item);}` — `appendChild` on same node to replay blur-in could throw (removed node, null wrap/item, detached DOM) AFTER text set, or wedge if animation path never settles; no fallback, exception propagates to scheduler and kills chain.
   - Neutralised: settle text synchronously first (guarded, `String(txt)`), then best-effort `appendChild` in separate try/catch. Text ALWAYS settles even if animation re-insert fails. No pending swap, no timer, no removed-node wedge.
3. **`refreshVersions` pager paint wedge** — set total text, toggle `inert`/`data-open` + `void offsetWidth` reflow, `setAnswer(newest)`, aria, `refreshBarActive` — all unguarded sequential; a throw mid-way leaves pager half-painted (DOM `Version 2 of 2` but opacity/visibility stale → unpainted pager in real browser).
   - Neutralised: each step best-effort with fallback (`countTotalIn.textContent=String(S.versions)` fallback, open-state fallback, `setAnswer` fallback to 0, aria/bar-active guarded). Pager count text + open state ALWAYS settle synchronously.
4. **`fireStep('next')` / `prevBtn.click()`** — `nextBtn.click()` on disabled button is no-op in real browsers; if versions state diverged (e.g., regen failed), `next` silently does nothing while DOM aria already advanced → painted text never changes. Throw in `click`/`gotoVersion`/`setAnswer` also killed chain.
   - Neutralised: `fireStep` next/prev wrapped in try/catch + `noteLoopError`; `setAnswer` clamps `i` to `[0,S.versions-1]`, guards `VERSIONS[i]` fallback to `VERSIONS[0]`, guards all DOM writes. Click on disabled remains no-op by design, but no longer throws or kills chain.
5. **`fireStep('reset')`** — `S.versions=1;...otherInput.value='';refreshVote();refreshPanel();refreshVersions();setAnswer(0);S.run++` — five throw candidates in one line: `otherInput` null, `refreshVote`/`refreshPanel`/`refreshChips` DOM surgery (`sendCheck`/`sendThanks`/`sendLabel` parent checks, `disabled` toggles, `otherFold`), `refreshVersions`/`setAnswer`. Any throw skipped `S.run++` and killed restart.
   - Neutralised: reset split line-by-line, each in try/catch with `noteLoopError('reset-*')`, `otherInput` guarded, `refreshVersions` fallback to `setAnswer(0)`, `S.run++` guarded. Reset can never throw outward.
6. **`refreshPanel`/`refreshChips` DOM surgery** — `fold`/`otherFold` open toggles, chip `disabled`/`aria-pressed` loops, `sendBtn` child swaps (`sendCheck`/`sendThanks` vs `sendLabel`) — `parentNode` checks + `appendChild`/`removeChild` could throw on detached nodes, killing `down`/`chip`/`send` steps.
   - Neutralised: `refreshPanel` wraps fold toggle + `refreshChips` + `refreshBarActive` each guarded; `refreshChips` failures log via `noteLoopError('chips')` and never propagate. In-place updates preserved, node identity preserved.
7. **Async callbacks (`doRegenerate` 1000ms, `doSend` 1200/1500ms, `doCopy` 1600ms)** — unguarded `refresh*` inside `later` could throw and leave `busy`/`sent`/`copied` stuck, poisoning next cycle's versions state.
   - Neutralised: callbacks wrapped in try/catch + `noteLoopError('regen'/'send-close')`, each inner DOM write guarded. State always settles.

Logging: `noteLoopError(kind,err)` sets `root[data-loop-error]="kind:msg"` and `console.error('[loop]',kind,err)` — asserted by harness (`data-loop-error=next:injected throw...` on fixed, `null` on original).

## Preserved constraints (verified)
- `/*noflash*/` guard kept at `<head>` start + `html{background}` + `meta color-scheme` — untouched.
- In-place updates only: harness asserts `root/bar/versions/count/answerLine` same objects across full loop (PASS).
- Zero `innerHTML` writes after init: stub counts setter, `innerHTMLWrites===0` both files (PASS on fixed, also 0 on original — fix did not introduce any).
- Demo data verbatim: `VERSIONS`/`REASONS`/`LOOP` byte-identical between `./index.html` and `./original-backup.html` (checked via python `re`).
- Light AND dark: harness checks computed `color` (`#171717` light vs `#ededed` dark), `opacity`/`visibility`/`width` for pager (`1`/`visible`/`120px` open vs `0`/`hidden`/`0px` closed), bar `1` when active. Both themes PASS on fixed.
- `node --check ./harness.js` PASS, `node --check` extracted main script PASS.

## How to test
```
node --check ./harness.js
node ./harness.js ./index.html        # expect HARNESS PASS
node ./harness.js ./original-backup.html  # expect HARNESS FAIL (chain dies)
```
Open `./index.html` in a browser: demo loops copy→dislike→reason→send→regenerate→versions until hover/click/keypress; toggle sun/moon for dark.
