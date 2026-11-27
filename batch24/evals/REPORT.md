# fix-evals — targeted fix report

## Defect (from real-browser QA)
After clicking the **Fail** filter, the table correctly showed only 1 row (TC-10) but the footer still read **"1–25 of 25"** instead of **"1–1 of 1"**.

## Root cause
`updateTable()` in `./index.html` computed the filtered list (`vis = filteredCases()`) and correctly hid non-matching rows, but the pager label was hard-coded to the total:

```js
document.getElementById("pagerLabel").textContent="1–"+CASES.length+" of "+CASES.length;
```

So filtering never updated the visible range/total text.

Checked `./demo-original.js` first: the original does **not** behave this way. It builds `K` = filtered list and renders the pager from `K.length`:

- `K = _.map(...).filter(M==="all" || status===M)`
- pager span: `D.format(Y*T+1)` – `D.format(Y*T+X.length)` of `D.format(K.length)`

i.e. the original footer reflects the **filtered** set. The replica was simply wrong vs the original, so a fix was warranted.

## Fix (one line, everything else identical)
In `updateTable()`, use the already-computed filtered length:

```js
document.getElementById("pagerLabel").textContent=vis.length?"1–"+vis.length+" of "+vis.length:"0–0 of 0";
```

- Fail → `1–1 of 1` (row TC-10 only)
- Partial → `1–2 of 2` (TC-05, TC-20)
- Pass → `1–22 of 22`
- All → `1–25 of 25`
- Empty (not reachable with current data) → `0–0 of 0` instead of a nonsensical `1–0 of 0`

No other behaviour changed: header count stays total (`25`), filter-button counts unchanged, no pagination logic added, rows still toggled in place via `style.display`.

## Secondary: "Pass rate 92%" — checked, left as-is
QA noted Pass shows 92% while 22/25 = 88%. Checked the original's definition in `./demo-original.js`:

```js
O = e => e.length ? Math.round(e.reduce((sum,t)=> sum + (C(t.score)==="pass"?1:C(t.score)==="partial"?0.5:0),0) / e.length*100) : 0
```

Partial counts as **half**: (22×1 + 2×0.5)/25 = 23/25 = **92%**. The replica's `passRate()` does exactly the same (`pass=1, partial=0.5`), and chart `92%` matches `RATES[11]=92`. So the number is correct per the original — **not** changed. Noted here instead.

## Constraints kept
- `/*noflash*/` guard kept at top of `<head>`, plus `html{background:...}` paint guard and `<meta name="color-scheme" content="light dark">`.
- In-place updates only: rows/bars/filters/stats built once in `buildOnce()`; `updateTable()` mutates `textContent`/`className`/`style`/attributes on existing nodes.
- Zero `innerHTML` writes: `grep -c innerHTML ./index.html` → `0`.
- Demo data verbatim: `CASES` (TC-01…TC-25), `VERSIONS`/`RATES`/`DATES`, prompts, model `claude-sonnet-5-5` untouched.

## Verification (node only, in-dir)
- `node --check` on extracted main script: OK.
- `./harness.js` (DOM-stub, no browser): asserts **visible** `pagerLabel.textContent` + visible-row indices per filter, in **light AND dark** (via theme toggle), plus full-loop node identity and zero `innerHTML` writes:
  - `node ./harness.js` → `HARNESS OK: Fail=1–1 of 1, Partial=1–2 of 2, Pass=1–22 of 22, All=1–25 of 25; light+dark; identity ok; innerHTML=0; passRate=92%`
- Manual: open `./index.html` in a browser, click All/Pass/Partial/Fail, check footer; toggle theme (◐, top-right) and repeat.

## Files
- `./index.html` — one-line pager fix only.
- `./harness.js` — in-dir DOM-stub verification harness.
- `./REPORT.md` — this file.
