# Prompt Explorer — targeted data fix (second attempt)

## What was wrong (real-browser QA)
- Left `Popular Keywords` read `205k, 195k, 147k, 133k, 131k, 108k, 114k` (last two swapped, not volume-DESC) and ALL SEVEN delta values were identically `2.1k` (abs), collapsing distinct true changes into one string.
- Right `Trending Keywords` deltas read `2.1k, 1.4k, 1.8k, 3.4k, 2.9k, 6.4k, 7.1k` — NOT sorted by change DESC.
- Root cause in `./index.html`: `POPULAR`/`RISING` were copied verbatim from `demo-original.js` buggy `w`/`ae` arrays (`Northwind ai 205k`, `nviv 147k`, `aeo 131k`, `boost 114k`, etc.) instead of authoritative `ie` triples. `paintKwRow` shows `fmtVol(|change|)` + arrow, so `-2100` and `+2100` both render `2.1k`, hiding wrong data.

## Fix (targeted, no rebuild)
Only `var POPULAR` / `var RISING` in `./index.html` changed. No layout/CSS/DOM-structure changes. `ALL` (26 `ie` triples), `FALLING`, `fmtVol`/`fmtChg`, `/*noflash*/` guard, in-place painters, pools, and live tick preserved.

Authoritative `ie` in `./demo-original.js` (used EXACTLY, no invention):
- `northwind ai visibility 549400 +76200`, `answer engine optimization 58600 +5200`, `ai search visibility 47300 +7800`, `generative engine optimization 41200 +6900`, `geo vs seo 28400 +3300`, `aeo tools 22700 +4100`, `chatgpt brand mentions 19800 +4400`, `northwind pricing 18900 +2100`, `ai overviews tracking 15600 +2600`, `northwind review 12300 +900`, `chatgpt rank tracking 11400 +2300`, `perplexity citations 8900 +1900`, `northwind against semrush 6400 +1500` (plus remaining 13 `ie` entries unchanged in `ALL` for suggestions/analysis).

Fixed (7+7, top 7 of each ordering among full 26):
- `POPULAR` (volume DESC): `northwind ai visibility 549400/76200`, `northwind vs semrush 195000/2100`, `generative ai tools 135000/2100`, `geo 133000/-2100`, `aeo 120000/1400`, `seo vs aeo 108000/-2100`, `generative ai 97000/1800` → volumes `[549400,195000,135000,133000,120000,108000,97000]` DESC; changes own (`76.2k,+2.1k,+2.1k,−2.1k via ▼,1.4k,2.1k via ▼,1.8k`); duplicates only where data says so (`2100×2`, `-2100×2` distinguished by ▲/▼).
- `RISING` (change DESC): `northwind ai visibility 549400/76200`, `ai search visibility 47300/7800`, `seo 42000/7100`, `generative engine optimization 41200/6900`, `ai content optimization 64000/6400`, `answer engine optimization 58600/5200`, `chatgpt brand mentions 19800/4400` → changes `[76200,7800,7100,6900,6400,5200,4400]` DESC, each with own volume.

Formatting kept in page's existing style (`fmtVol`: `>=100k` → `0` decimals e.g. `549k,195k`; `<100k` → `1` decimal e.g. `76.2k,58.6k,900`).

## Hard proof (mechanically checked)
- BEFORE `md5sum ./index.html`: `0fc4c52d2c580cd4bcd270a8f5a2ebb3`
- AFTER `md5sum ./index.html`: `64a25e25caef405ad6ec895502fa1527`
- Hashes MUST differ: yes (`0fc4…` vs `64a2…`).
- Original kept as `./original-backup.html` (`0fc4c52d2c580cd4bcd270a8f5a2ebb3`, matches BEFORE).
- `node --check ./harness.js` → OK; `node --check ./demo-original.js` → OK.
- Harness `node ./harness.js ./original-backup.html` → FAIL (exit 1); `node ./harness.js ./index.html` → PASS (exit 0). No installs.

### Harness PASS (fixed `./index.html`, exit 0)
```
HARNESS target=./index.html
noflash=true innerAssign=0
--- light (light) Popular (vol DESC) ---
  [0] "northwind ai visibility" vol="549k"(549000) chg="▲76.2k" dir=up trueVol=549400 trueChg=76200
  [1] "northwind vs semrush" vol="195k"(195000) chg="▲2.1k" dir=up trueVol=195000 trueChg=2100
  [2] "generative ai tools" vol="135k"(135000) chg="▲2.1k" dir=up trueVol=135000 trueChg=2100
  [3] "geo" vol="133k"(133000) chg="▼2.1k" dir=down trueVol=133000 trueChg=-2100
  [4] "aeo" vol="120k"(120000) chg="▲1.4k" dir=up trueVol=120000 trueChg=1400
  [5] "seo vs aeo" vol="108k"(108000) chg="▼2.1k" dir=down trueVol=108000 trueChg=-2100
  [6] "generative ai" vol="97.0k"(97000) chg="▲1.8k" dir=up trueVol=97000 trueChg=1800
--- light (light) Trending (chg DESC) ---
  [0] "northwind ai visibility" vol="549k" chg="▲76.2k" dir=up trueVol=549400 trueChg=76200
  [1] "ai search visibility" vol="47.3k" chg="▲7.8k" dir=up trueVol=47300 trueChg=7800
  [2] "seo" vol="42.0k" chg="▲7.1k" dir=up trueVol=42000 trueChg=7100
  [3] "generative engine optimization" vol="41.2k" chg="▲6.9k" dir=up trueVol=41200 trueChg=6900
  [4] "ai content optimization" vol="64.0k" chg="▲6.4k" dir=up trueVol=64000 trueChg=6400
  [5] "answer engine optimization" vol="58.6k" chg="▲5.2k" dir=up trueVol=58600 trueChg=5200
  [6] "chatgpt brand mentions" vol="19.8k" chg="▲4.4k" dir=up trueVol=19800 trueChg=4400
--- dark (dark) Popular (vol DESC) --- (same 7 rows, same strings)
--- dark (dark) Trending (chg DESC) --- (same 7 rows, same strings)
RESULT: PASS — Popular vol DESC + own values, Trending chg DESC + own volumes, 7+7, distinct where data distinct, light+dark, node identity, zero innerHTML
```

### Harness FAIL (original `./original-backup.html`, exit 1, 56 problems)
```
HARNESS target=./original-backup.html
noflash=true innerAssign=0
--- light (light) Popular (vol DESC) ---
  [0] "Northwind ai" vol="205k"(205000) chg="▲2.1k" dir=up trueVol=35000 trueChg=-2700
  [1] "northwind vs semrush" vol="195k"(195000) chg="▲2.1k" dir=up trueVol=195000 trueChg=2100
  [2] "northwind ai visibility" vol="147k"(147000) chg="▲2.1k" dir=up trueVol=549400 trueChg=76200
  [3] "geo" vol="133k"(133000) chg="▼2.1k" dir=down trueVol=133000 trueChg=-2100
  [4] "aeo" vol="131k"(131000) chg="▲2.1k" dir=up trueVol=120000 trueChg=1400
  [5] "seo vs aeo" vol="108k"(108000) chg="▼2.1k" dir=down trueVol=108000 trueChg=-2100
  [6] "boost ai visibility" vol="114k"(114000) chg="▲2.1k" dir=up trueVol=72000 trueChg=3400
--- light (light) Trending (chg DESC) ---
  [0] "generative ai tools" vol="135k" chg="▲2.1k" dir=up trueVol=135000 trueChg=2100
  [1] "aeo" vol="120k" chg="▲1.4k" dir=up trueVol=120000 trueChg=1400
  [2] "generative ai" vol="97.0k" chg="▲1.8k" dir=up trueVol=97000 trueChg=1800
  [3] "boost ai visibility" vol="72.0k" chg="▲3.4k" dir=up trueVol=72000 trueChg=3400
  [4] "google ai overviews" vol="70.0k" chg="▲2.9k" dir=up trueVol=70000 trueChg=2900
  [5] "ai content optimization" vol="64.0k" chg="▲6.4k" dir=up trueVol=64000 trueChg=6400
  [6] "seo" vol="42.0k" chg="▲7.1k" dir=up trueVol=42000 trueChg=7100
RESULT: FAIL — 56 problem(s):
  - [light] Popular[0] "Northwind ai" vol visible "205k" != own fmtVol(35000)="35.0k"
  - [light] Popular[0] chg "2.1k" != own "2.7k", dir "up" != "down"
  - [light] Popular[2] vol "147k" != own "549k", chg "2.1k" != "76.2k"
  - [light] Popular[4] vol "131k" != own "120k", chg "2.1k" != "1.4k"
  - [light] Popular[6] vol "114k" != own "72.0k", chg "2.1k" != "3.4k"
  - [light] Popular vols NOT DESC at 5: 108k(108000) < 114k(114000)
  - [light] Popular distinct FAIL (true distinct but visible "up|2.1k" shared, 11 pairs)
  - [light] Popular NOT top7 vol: got [35000,195000,549400,133000,120000,108000,72000] expected [549400,195000,135000,133000,120000,108000,97000]
  - [light] Trending chgs NOT DESC (1400<1800, 1800<3400, 2900<6400, 6400<7100)
  - [light] Trending NOT top7 chg: got [2100,1400,1800,3400,2900,6400,7100] expected [76200,7800,7100,6900,6400,5200,4400]
  - (same 28 mirrored in dark) + order broken after loop
```

## Invariants kept
- `/*noflash*/` guard + `meta color-scheme` + `html{background…}` present; `data-theme="light"|"dark"` toggle works, both themes render identical rows (harness runs both).
- In-place updates only: pools built once (`buildKwList` 7+7), `paintKwRow`/`paintLive` mutate `textContent`/`class`/`attributes`/`d`/`width`; no `innerHTML` code writes (`innerAssign=0`, stub counter `0` after init + 14 ticks).
- Full-loop node identity: `__pex.pools.pop/trend` `btn`/`li` references `===` before/after 14 `tick()`s (full 14-node cycle), `createdCount` unchanged, order preserved after loop.
- Verify: `node --check ./harness.js`, `node --check ./demo-original.js`, `node ./harness.js ./index.html` (PASS), `node ./harness.js ./original-backup.html` (FAIL). Open `index.html` in browser for visual light/dark check.

## Not verified in browser
Real-browser pixel/contrast QA not re-run here; DOM-stub covers VISIBLE text (`kw-text`, `kw-vol`, `▲/▼+chg`, `data-dir`) in both themes. Reduced-motion/touch hover rules untouched.
