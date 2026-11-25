# Agent Findings — replica report

## What was built
`index.html` (30.9 KB, single self-contained file, no external dependencies):
a clean-room replica of the affectUI **Agent Findings** component — a verification
swarm with per-agent progress rows and a live findings feed, matching the original
demo's layout: tray → header bar ("Verification" + "N of 64 checks" + "2 critical
3 warnings" totals) → agent card → "Latest findings" head → feed card → footer
with Replay.

## Original demo data used (extracted from `demo-original.js`, exact values)
- Agents: **Auditor** (Opus 5.5, total 24, finish 25s), **Fuzzer** (GPT-6, 18, 24s),
  **Prover** (Gemini 3.8 Pro, 12, 26s), **Gas review** (Sonnet 5.5, 10, 17s),
  with their exact step labels (e.g. "Tracing calls in Vault.withdraw",
  "Fuzzing transfer with 10k inputs", "Proving totalSupply invariant",
  "Profiling storage reads").
- Findings (severity/title/location/timing): f0 note "Constant could be
  immutable" Pool.sol:12 @-40s; f1 critical "Reentrancy in withdraw()"
  Vault.sol:142 @2s; f2 warning "Return value of transfer not checked"
  Token.sol:88 @4.5s; f3 note "Loop reads storage on every pass" Pool.sol:61 @7s;
  f4 warning "Owner can mint without a cap" Token.sol:31 @9.5s; f5 critical
  "totalSupply can differ from the sum of balances" Token.sol:204 @12s;
  f6 warning "Price used without a staleness check" Oracle.sol:57 @15s;
  f7 note "Loop bound depends on user input" Vault.sol:96 @18.5s.
- Behaviour matched: relative-time format ("now / Ns / Nm / Nh / Nd"), per-agent
  critical/warning mini-counts, click-agent-to-filter with removable chip,
  animated progress fill with sheen while running, "All checks done" terminal
  step, latest-4-rows + 1 outgoing feed with slide animation, `aria-live`.
- Added (required by spec, not in original): severity filter pills
  (All/Critical/Warning/Note), click-finding detail expansion, Replay button.
- Avatars are my own original SVG glyphs (shield / waveform / badge / bolt);
  the original's three logo paths were not copied.

## Design tokens
All colours live in the `:root` (light) and `[data-theme="dark"]` blocks:
page `#fafaf9` / `#101012`, surface `#ffffff` / `#1c1c1f`, ink `#171717` /
`#ededed`, muted `#78716c` / `#a1a1aa`, subtle `#f5f5f4` / `#26262a`, border
`#e7e5e4` / `#2e2e33`, radii 16/10/6px, pill 999px, soft shadow, waiting amber
`#f59e0e`-family light / `#fbbf24` on `#451a03` dark, crit/warn/note per theme.

## Verification performed
- **Token audit**: regex scan — zero hex colours outside the token blocks. PASS.
- **Contrast** (computed): light ink 17.9, text 7.6, muted 4.8, crit 5.5,
  warn 4.7, note 5.9 (darkened to `#0369a1` so the active Note pill's white text
  also passes at 5.9); dark ink 14.5, muted 6.6, crit 7.4, warn 9.6, note 7.3,
  amber-on-dark 12.0. Time labels use `--af-muted` (not faint) in both themes.
  Dimmed rows stay at opacity 0.78 (≥ 0.75 per v3).
- **Light + dark checked**: dark theme values verified via token table + contrast
  math (no browser in this environment, so dark mode was verified by inspecting
  the `data-theme="dark"` token block and computing every dark pair above);
  toggle logic (prefers-color-scheme default + localStorage override + sun/moon
  swap) reviewed in code.
- **Runtime smoke test**: page script executed in Node with a DOM stub —
  14/14 assertions pass (rows render, "0 of 64 checks", done-state, exact demo
  counts 2 crit / 3 warn / 3 note, both filters, f0-at-t0 / f1-gating).
- `node --check`: JS syntax OK. No external URLs/imports in the file.

## How to verify
Open `index.html` in a browser: watch the 26s live run (progress bars fill,
findings stream in), click an agent to filter, use the severity pills, click a
finding to expand it, hit Replay, and toggle the sun/moon button (top-right)
to compare light vs dark. Resize below ~520px to check the stacked layout.

## What could not be verified
Pixel-perfect match against the original rendered demo (no browser/screenshot
tooling here); dark-mode visuals confirmed by token/contrast analysis, not by
screenshot. Reduced-motion path is implemented but not exercised.
