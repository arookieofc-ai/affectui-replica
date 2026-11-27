# agent-thread rework — DATA/STRUCTURE fix

## What was done (targeted fix, not rebuild)
- Kept page chrome, theme system (`data-theme` light/dark + toggle), state tabs Live/Decision/Scrolled up/Offline/Uploading/Dictating/Away summary/Error/Loading, `/*noflash*/` guard, CSS tokens, composer, topbar, in-place update loop.
- Replaced thread content only:
  - Agent stream text now contains verbatim `I split it into four tasks`.
  - 3 task cards each with own counter:
    - `Client dashboard` — `Drawing the empty states` — `1 of 3 steps`
    - `API migration` — `Moving our own apps` — `1 of 4 steps`
    - `Ingest pipeline` — `Picking a queue` — `2 of 4 steps`
  - On load only first two cards visible; third (`Ingest pipeline`) unhidden in-place when streaming reply completes.
  - Decision state shows same 3 cards + decision card headed `1 of 2` asking `Which queue should the ingest service use?` with 5 options `Kafka`, `SQS`, `Postgres queue`, `NATS JetStream`, `Something else…`.
- Removed global `N of M steps` header: thread title/sub, proj meta, route, day, ctx never contain `\d+ of \d+ steps`. Only per-card counters contain it.
- In-place updates only, zero `innerHTML` writes after init, node identity preserved across full 60-tick loop restart.

## demo-original.js check
- `./demo-original.js` (951 bytes) only defines `simulate` states list `[live,decision,scrolled,offline,uploading,dictating,away,error,loading]` and DemoStage wiring. It contains no task titles, counters, or decision text, so it does not contradict the live-original data above. Fix proceeds as new data from QA defect, kept verbatim.

## Hard proof — md5 BEFORE/AFTER (must differ)
- BEFORE: `9ef22266fe126ef1d458cfc0379de836  ./index.html`
- AFTER:  `04536e7121495dd8054f3211905c084d  ./index.html`
- Differ: YES (`md5sum ./index.html` run before edit and after edit; original kept as `./original-backup.html` with BEFORE hash).

## Hard proof — harness FAIL on original, PASS on fixed
Harness: `./harness.js` — in-dir DOM-stub, node only, no installs. Asserts as VISIBLE state (hidden flag + style.display/visibility/opacity + getComputedStyle opacity/visibility + getBoundingClientRect width/height + colours), in light AND dark, plus full-loop node identity and zero innerHTML writes.

### FAIL against original (`node ./harness.js ./original-backup.html`, exit 1)
```
=== harness testing ./original-backup.html ===
PASS: noflash guard present
PASS: color-scheme meta
PASS: noflash inline bg
PASS: zero innerHTML in source
PASS: extract main script
PASS: main script syntax
PASS: script runs in stub
PASS: exposes __thread
PASS: no global 'of M steps' header
INFO initial live visible tasks: 1 / total 1
FAIL: Live has exactly 3 task cards visible after stream -- total=1 visible=1
INFO card0 text: "  Working Prepare launch checklist  ◧ ⧉ ✎ research-agent · 3 of 3 steps · 45k / 200k   ✓ Freeze scope  ✓ Verify billing webhooks  ○ Sign off staging Last run 2m ago · click to collapse details. Retries are queued and safe to interrupt — pick up where you left off."
INFO card1 text: ""
INFO card2 text: ""
FAIL: task cards have exact titles/counters -- ["  Working Prepare launch checklist  ◧ ⧉ ✎ research-agent · 3 of 3 steps · 45k / 200k   ✓ Freeze scope  ✓ Verify billing webhooks  ○ Sign off staging Last run 2m ago · click to collapse details. Retries are queued and safe to interrupt — pick up where you left off."]
PASS: task cards VISIBLE state in light
PASS: task cards VISIBLE state in dark
FAIL: thread text includes split phrase -- "Update — billing webhooks verified, only staging sign-off left."
PASS: Decision card present
FAIL: decision headed '1 of 2' -- "  Needs decision Approve staging deploy? orchestrator asks · plain answer inside · safe to interrupt Staging is green except sign-off. Approve deploy to prod-preview?  Approve Request changes Awaiting"
FAIL: decision question -- "  Needs decision Approve staging deploy? orchestrator asks · plain answer inside · safe to interrupt Staging is green except sign-off. Approve deploy to prod-preview?  Approve Request changes Awaiting your decision"
FAIL: decision 5 options listed -- missing ["Kafka","SQS","Postgres queue","NATS JetStream","Something else…"] got "  Needs decision Approve staging deploy? orchestrator asks · plain answer inside · safe to interrupt Staging is green except sign-off. Approve deploy to prod-preview?  Approve Request changes Awaiting your decision"
PASS: decision VISIBLE in light
PASS: decision VISIBLE in dark
FAIL: Decision shows same 3 task cards -- visible=1
FAIL: on load only first two cards show -- visible=1
FAIL: third card appears after stream completes -- visible=1
PASS: zero innerHTML writes after init
PASS: full-loop node identity
---
passes: 16 failures: 9
RESULT: FAIL
FAIL_EXIT:1
```

### PASS against fixed (`node ./harness.js ./index.html`, exit 0)
```
=== harness testing ./index.html ===
PASS: noflash guard present
PASS: color-scheme meta
PASS: noflash inline bg
PASS: zero innerHTML in source
PASS: extract main script
PASS: main script syntax
PASS: script runs in stub
PASS: exposes __thread
PASS: no global 'of M steps' header
INFO initial live visible tasks: 2 / total 3
PASS: Live has exactly 3 task cards visible after stream
PASS: task cards have exact titles/counters
PASS: task cards VISIBLE state in light
PASS: task cards VISIBLE state in dark
PASS: thread text includes split phrase
PASS: Decision card present
PASS: decision headed '1 of 2'
PASS: decision question
PASS: decision 5 options listed
PASS: decision VISIBLE in light
PASS: decision VISIBLE in dark
PASS: Decision shows same 3 task cards
PASS: on load only first two cards show
PASS: third card appears after stream completes
PASS: zero innerHTML writes after init
PASS: full-loop node identity
---
passes: 25 failures: 0
RESULT: PASS
PASS_EXIT:0
```

## Verify (node only, no installs)
- `node --check ./harness.js` → OK
- `node ./harness.js ./original-backup.html` → FAIL (exit 1, expected)
- `node ./harness.js ./index.html` → PASS (exit 0)
- Open `./index.html` in browser, click Live/Decision tabs, toggle sun/moon for light/dark, watch stream reveal third card.

## Matches / not verified
- Matches: per-card titles/counters/steps verbatim, split phrase, decision head/question/5 options verbatim, no global steps header, progressive third-card reveal, theme tokens, noflash, in-place.
- Other states keep previous treatment (banners, upload, dictating, skeleton) and do not contain contradicting steps.
- Could not verify against live site pixels (no browser); verified via DOM-stub visible-state + geometry + colours in both themes.
