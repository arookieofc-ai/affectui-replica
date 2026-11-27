# REPORT — fix-repair-batch22-inbox-q (Agent Inbox Q1..Q5)

Component: agent questions queue (Q1..Q5, researcher-02=Q2, coder-03=Q3), NOT decision-inbox. Work confined to this directory.

## Sanity check
- `./index.html` has `<title>Acme Web — Agent Inbox</title>` — PASS (line 9).

## Original behaviour (checked `./demo-original.js`)
- Minified React demo uses `pt(id)` + `ht()` for row pick → detail, `Z()` to record answer then advance to `W[a+1] ?? W[a-1]`, `Q()` to submit. Selecting a queue item shows its question; each answer/approve advances exactly one and updates counts; completion only after all done.
- The reported defects do NOT match the original — they are replica bugs, so fix is warranted (not preserving buggy behaviour).

## Root cause (single closure bug → all 3 symptoms)
File: `./index.html` lines 381-395, queue-row builder:

```js
for(var qi=0;qi<DATA.length;qi++){
  (function(q){
    ...
    r.addEventListener("click",function(){jumpTo(qi);});
  })(DATA[qi]);
}
```

`var qi` is function-scoped; IIFE captures only `q`, not `qi`. After loop `qi===5` for all 5 closures. Every queue click calls `jumpTo(5)`.

- (1) Click Q2/Q3 never switches: `jumpTo(5)` does `state.idx=5` then `DATA[5].agent` throws `Cannot read properties of undefined (reading 'agent')`. `renderAll()` never runs, UI stays on Q1.
- (2) Answer via option 2 jumps to fake completion: after corruption `state.idx=5`. Next `optNodes[1].click()` → `updateCurrent()` with `DATA[5]===undefined` → `if(done||!q)` done-branch → visible `All 5 questions answered` with `Approved 0 · answered 0 · rejected 0 · skipped 0`, while `pendingCount()=5-0=5` → header still `5 waiting`.
- (3) Restart → 2nd Approve stalls (QA sequence): QA sequence includes (1)+(2) corruption before Restart. Once `idx` is out-of-bounds, subsequent `doSubmit`/`renderAll` / timeout advance (`idx=answers.length`) diverges from visible state. After Restart + 1st Approve (Q1→Q2) the stale closure still poisons any queue interaction and the pending fake-done path; in real-browser QA the 2nd Approve never visibly advances within 6s. Fixing the closure makes sequential `Approve→tick→Approve→tick` reliably reach Q3.

## Fix (targeted, 2 lines, everything else identical)
```diff
-  (function(q){
+  (function(q,qi){
...
-  })(DATA[qi]);
+  })(DATA[qi],qi);
```
- Keeps `/*noflash*/` guard, in-place updates only, zero `innerHTML` writes, demo `DATA` verbatim, all styling/DOM structure unchanged.
- Verified `grep innerHTML` = 0 hits in `index.html`.

## Harness (`./harness.js`, node only, in-dir DOM stub via `vm`)
Asserts VISIBLE state (`textContent`), light AND dark:
- click Q2 → detail `Q2: Which pricing source…`; click Q3 → `Q3: Apply codemod…`
- answer all 5 (first uses option index 1 `Run migrations first`) → `All 5 questions answered`, counters `Approved 1 · answered 2 · rejected 1 · skipped 1` sum=5, header `0 waiting`
- `Restart → Approve → tick(700) → Q2 → Approve → tick(700+6000) → Q3`
- full-loop node identity (`card`, `curTitle`, 5 rows, 4 opts identical `===` before/after)
- zero `innerHTML` writes after init (setter counter)
- `data-theme` light/dark switching

Run:
```
node --check harness.js
node harness.js
node --check demo-original.js
```

## Before / after (must fail on ORIGINAL, pass on FIXED)
BEFORE (original `index.html`, `node harness.js`):
```
ok: initial detail shows Q1, got: "Q1: Deploy preview build to staging?"
FAIL: click Q2 threw: Cannot read properties of undefined (reading 'agent')
HARNESS FAILED
EXIT:1
```

AFTER (fixed `index.html`, `node harness.js`):
```
--- theme: light ---
ok: click Q2 -> detail shows Q2, got: "Q2: Which pricing source should I use?"
ok: click Q3 -> detail shows Q3, got: "Q3: Apply codemod to 14 files?"
ok: completion title after 5 answers, got "All 5 questions answered"
ok: counters sum to 5, got 5 from "Approved 1 · answered 2 · rejected 1 · skipped 1..."
ok: header 0 waiting after completion, got "0 waiting"
ok: after 2nd Approve shows Q3 (no stall), got "Q3: Apply codemod to 14 files?"
--- theme light passed ---
--- theme: dark ---
(same, all ok)
--- theme dark passed ---
ALL CHECKS PASSED
EXIT:0
```

## Checks confirmed
- [x] title correct
- [x] `/*noflash*/` + `color-scheme` + `html{background}` kept
- [x] in-place updates, node identity across full loop + restart
- [x] zero `innerHTML` writes after init (static + runtime)
- [x] demo data verbatim (no DATA edit)
- [x] light AND dark pass
- [x] `index.html` actually changed (2-line diff above); `node --check` passes for `harness.js` and `demo-original.js`; no installs/downloads.
