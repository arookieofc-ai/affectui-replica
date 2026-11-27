# fix-prompt-explorer — DATA FIDELITY report (targeted check, no rebuild)

## Verdict: faithful — changed NOTHING in `index.html`

The QA-flagged "defects" (unsorted Popular/Falling lists, repeated 2.1k deltas,
same-volume keywords across Rising/Falling) are **verbatim original behaviour**.
Per the task instruction, the replica was left identical.

## Evidence (every row vs `demo-original.js`)

Parsed `demo-original.js` `C(text, volume, change)` rows (47 total):

- `ALL` rows 0–25 match `index.html` `ALL` exactly (volumes, deltas, order).
- `POPULAR` = original rows 26–32, verbatim:
  1. `Northwind ai`, 205000, +2100 → `205k`
  2. `northwind vs semrush`, 195000, +2100 → `195k`
  3. `northwind ai visibility`, 147000, +2100 → `147k`
  4. `geo`, 133000, −2100 → `133k`
  5. `aeo`, 131000, +2100 → `131k`
  6. `seo vs aeo`, 108000, −2100 → `108k`
  7. `boost ai visibility`, 114000, +2100 → `114k`
  - Last two (`108k` then `114k`) are unsorted **in the original** — not a replica bug.
  - All magnitudes are 2.1k (sign varies) **in the original** — not fabricated.
- `RISING` = original rows 33–39, verbatim (sorted desc, as in original):
  `generative ai tools` 135000/+2100, `aeo` 120000/+1400,
  `generative ai` 97000/+1800, `boost ai visibility` 72000/+3400,
  `google ai overviews` 70000/+2900, `ai content optimization` 64000/+6400,
  `seo` 42000/+7100.
- `FALLING` = original rows 40–46, verbatim (unsorted, as in original):
  `best seo tools 2026` 88100/−5600 → `88.1k`,
  `geo` 133000/−2100, `seo vs aeo` 108000/−2100,
  `northwind ai` 35000/−2700 → `35.0k`,
  `keyword research tool` 51200/−1900 → `51.2k`,
  `backlink checker` 33800/−1400 → `33.8k`,
  `rank tracker` 27500/−1100 → `27.5k`.
- Rising vs Falling share **no keywords** in either file, so there is no
  same-volume/opposite-delta duplication to fix. `geo`/`seo vs aeo` repeat
  between Popular and Falling with the **same** volume and **same** delta in
  both files (faithful, not a bug).

No rows reordered, no deltas fabricated/duplicated by the replica.

## Root cause

No defect in the replica. The QA expectation (sorted lists, unique deltas) does
not match the original demo data, which is intentionally verbatim (including
quirk order and repeated 2.1k deltas).

## Fix

None. `index.html` untouched — preserves `/*noflash*/` guard, in-place updates,
zero `innerHTML` writes after init, and verbatim demo data.

## Verification (node only, in-dir)

- `node --check demo-original.js` → OK
- `node --check harness-fidelity.js` → OK
- Inline scripts syntax-checked via `vm.Script` inside the harness (equiv. of
  `node --check` for HTML-embedded JS; `node --check index.html` is not
  applicable to HTML).
- `node harness-fidelity.js` → ALL PASSED:
  - POPULAR / RISING / FALLING visible state (text, formatted vol, delta,
    arrow, `data-dir`, order) matches original rows in **light AND dark**
    (`data-theme="light"` / `"dark"` produce identical visible rows).
  - Full-loop node identity preserved (pop + trend + res pools `===` across
    rising→falling→rising + 14 live ticks).
  - Zero `innerHTML` writes after init; zero new DOM nodes after init
    (in-place updates only).

## How to test

Open `index.html` in a browser; compare Popular / Trending (Rising/Falling)
lists against the row tables above. Toggle the sun/moon theme button to confirm
dark mode stays legible.
