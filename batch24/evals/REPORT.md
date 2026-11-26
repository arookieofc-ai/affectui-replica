# Evals replica — REPORT

## What I built
Standalone `index.html` (48KB, inline CSS+JS, system fonts only) replicating affectUI **Evals** (`Support reply prompt`).

- Header: `Evals / Support reply prompt` + version chip `v12 current` with dropdown (v12…v1, `Current · 92% pass`), model chip `claude-sonnet-5-5`, meta `Last run 2 hours ago` / `Running x of 25…`, `Run eval` button (▶, optical-aligned padding), sun/moon theme toggle, thin progress bar.
- Sidebar (clean-room, same demo labels): `Home, Chat, Evals (3), Datasets, Analytics` + Prompts group `Support reply, Ticket triage, Refund check, Onboarding`.
- 4 stat cards: `Pass rate 92%`, `Avg score`, `Latency p50 1.2s`, `Cost per 1k runs $1.84` with `vs v11` deltas.
- Chart `Pass rate by version`: 12 bars (61,64,70,68,74,79,77,83,85,81,88,92), value + footer `Last 12 versions · 25 test cases · claude-sonnet-5-5`. Clicking a bar selects that version.
- Diff `Changes in v12 · system prompt, edited by Mara Klein`: current vs suggested prompts verbatim, `Approve` / `Reject` → toast `Prompt changes reviewed`.
- `Test cases 25` table: `Input | Expected | v12 output | Score | Latency`, pills `Pass/Partial/Fail/Queued/Running` + `n/5`, latency `1.2s` style. Filter `All / Pass / Partial / Fail` with counts, pager `1–25 of 25`, row click/Enter/Space opens detail, Esc closes, ArrowUp/Down moves, Re-run single case, Re-run all via `Run eval` with sequential `150+(ms%7)*22ms` timing, auto-scroll, toast `Eval finished · 92% of 25 cases passed`.
- Detail panel shows `Input / Expected / Previous answer (n/5) / Current output`, pill + `Latency · model`.

## Demo data verbatim
- Model `claude-sonnet-5-5`, versions `v1…v12`, rates `[61,64,70,68,74,79,77,83,85,81,88,92]`, dates `Jan 8…Today`.
- Prompts: original (“…in as much detail as possible…link to our blog.”) and suggested (“…in three sentences or fewer…link the refund policy instead.”), editor `Mara Klein`.
- All 25 cases `TC-01…TC-25` with exact `input/expected/prev/output/prevScore/score/ms` from `demo-original.js` (e.g. TC-10 Salesforce fail 2/5, TC-03 German, TC-17 French).
- No invented data.

## What matches the original
Layout, card/border/shadow language, sticky header + sticky `th`, norrow stacked responsive, focus-visible + hover lift, spinner + pop animations, `…` / `–` queued states, aria-selected running chain highlight.

## Clean-room + in-place updates
Written from behaviour/API only, no copied bundle code. DOM built once in `buildOnce()`; timers/filters/version/detail update `textContent/class/style` on existing nodes only. No `innerHTML/insertAdjacentHTML/outerHTML/document.write` anywhere. Verified zero writes after init.

## v5 polish
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`.
- `html{-webkit-tap-highlight-color:transparent}`.
- `body{font-variant-numeric:tabular-nums}`.
- Concentric radius (`radius-lg+2` outer, `radius` inner), shadows for elevation / borders for structure, image inset-outline rule, icon-side 2px less button padding.

## What I could not verify
No browser available (per task constraints). Visual pixel-match vs original screenshots, real `prefers-color-scheme` first paint, and exact easing perception were not eyeballed — only DOM/text/theme logic via node stub.

## How to test
1. `open index.html` in a browser (or `python3 -m http.server` then visit).
2. Click `Run eval`, click rows, switch filter/version, Approve/Reject, toggle theme.
3. Node-only checks: `node --check <extracted JS>` and `node verify.js` (in-dir DOM-stub: visible text, node identity across full loop, zero innerHTML, light+dark).

## Theme check
Confirmed light AND dark: `data-theme` toggles via button + `localStorage affectui-evals-theme`, dark tokens (`#1c1c1f/#101012/#ededed/#a1a1aa`, amber `#fbbf24` on `#451a03`), `verify.js` asserts painted text persists in both themes. `ALL CHECKS PASSED`.
