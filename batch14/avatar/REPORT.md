# Avatar — clean-room replica report

## What was built
`index.html` (22 KB, single self-contained file, no network, no external assets,
system fonts only) replicating the affectUI **Avatar** component demo:
person picture/initials, status dot, agent pixel-marks, and overlapping groups.

- **Header pattern**: project name + live counts derived from the demo data —
  `Release 4.2` / `1 working · 1 agent · 9 people` — with a sun/moon theme
  toggle at top-right. No generic component title.
- **Demo card (data verbatim from `demo-original.js`)**: head row with title
  `Release 4.2` and a size-24 group (`max=4, total=9`, aria
  `9 people on this release`) showing Mara Lindqvist, Triage agent, Jonas Weber,
  Priya Raman + a `+5` overflow pill (`5 more`); six rows — Mara Lindqvist
  (online, `Design lead`), Jonas Weber (away, `Reviewing PR #482`), Priya Raman
  (busy, `In a call until 15:30`), Christopher Montgomery III
  (`Joined yesterday`, initials `CM` via Jr/Sr/III suffix filtering), Triage
  agent (working, `Writing the summary for 14 tickets`), Northwind
  (square, `Workspace · 24 members`, initial `N`).
- **Component behaviour matched**: sizes 20/24/32/40; circle default for people,
  rounded-square for agents/workspace; name-hash hue tint (8 buckets); initials
  with emoji-first and suffix rules, anonymous-person outline glyph fallback;
  `<img>` fades in over initials on load and is removed on error (offline-safe:
  initials show); status dots online/away/busy with `Name, status` aria-labels;
  agent identities render a deterministic **3×3 pixel-mark with exactly 9 cells**
  (≥5 on, diagonal-wave `animation-delay` 0/120/240/…/480 ms) that twinkles on a
  1.2 s loop only when `working`; group overlaps by a quarter with a
  background-colour ring and a `+N` (99+ capped) pill inheriting the last
  visible avatar's shape.
- **In-place updates only**: DOM is built once at `init` via `createElement` /
  `setAttribute` (zero `innerHTML` anywhere). No JS timers — the only loop is
  the CSS working twinkle, exactly like the original, which has no JS timers
  either (only 180/240 ms transitions + 1.2 s keyframes). The toggle updates
  `data-theme`/icons/aria in place.
- **Hard-won rules honoured**: single click handler (no pointerdown+click double
  toggle); hover/focus are pure CSS, never re-render; explicit
  `[hidden]{display:none}` rule; SVG classes only via `setAttribute`; no browser
  launched (node-only verification).

## What could not be verified
Pixel-perfect visual match (no browser available in this environment) and the
real `/avatars/*.jpg` photo fade-in (offline file has no images, so the
verified failure path — initials with tint — is what renders). Dark/light
*appearance* was verified at the token/DOM level, not by screenshot.

## How to test
Open `index.html` in a browser (double-click works, no server needed).
Click the sun/moon button to switch themes; broken avatar URLs fall back to
initials; the Triage agent mark twinkles. Narrow widths stack cleanly.

## Verification (node only, harness files removed after the run)
- `node --check` on the extracted page script: **passed**.
- In-dir DOM-stub harness loaded the page script, advanced virtual timers
  through a 10 s full loop, and asserted **visible** text/state (hidden/aria-only
  text does not count) plus node identity — **ALL CHECKS PASSED** in three
  scenarios: light default (light OS), dark default (dark OS), stored-override.
  - all 16 verbatim strings + initials ML/JW/PR/CM/N visible; no rule hides them
  - 2 pixel-marks × exactly 9 cells (≥5 on); 1 working avatar; 3 status dots;
    pill `+5`/`5 more`; 6 rows in verbatim order
  - toggle flips light↔dark, persists to storage, flips back
  - 102 nodes keep object identity across loop + toggles; **zero innerHTML
    writes after init**; noflash guard precedes first CSS; `[hidden]` rule present
- Light AND dark checked: token sets differ per spec (`--page #fafaf9/#101012`,
  `--surface #ffffff/#1c1c1f`, amber adjusted for dark, etc.).
