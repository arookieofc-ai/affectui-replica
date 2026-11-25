# decision-card — replica report

## What was built
`index.html` (31 KB, self-contained, no network, system fonts) replicating the affectUI
`decision-card` demo: an agent question card above a composer, driven by a status line with a
3×3 pixel-mark. Clean-room: all HTML/CSS/JS written from the demo's observed behaviour; no code
copied from `demo-original.js`.

- **Status line**: pixel-mark with **exactly 9 `<i>` cells** (diagonal pattern, twinkle animation)
  + text starting at `Three tasks wait on you – everything else keeps running.`
- **Card**: tray + inner card, `Needs you` badge, task label, pager (`1 of 3` + prev/next chevrons,
  wraps around), `Later` button; question, facts list (max 3), numbered rows / tiles, custom-reply
  row (`Something else…` + send pill that appears only when text is present), `Recommended` tag.
- **Kinds**: `decision` → rows with summaries; `pick` → tile grid with wireframe SVG previews
  (3/2 aspect, page rect + tone blocks); `approval` → Approve/Decline rows + To/Subject/Body facts.
- **Interactions**: click answers, digits 1–5 answer, N+1 focuses custom input, arrows/Home/End move,
  Enter/Space selects, Esc folds to Later, Show unfolds; live-region announcements
  (`Answered: X. N decisions waiting / Nothing else waits`); focus moves to composer after the last
  card; pager keeps focus on the pager button.
- **Auto-demo**: untouched queue auto-advances every **3400 ms** using the original default answers,
  status lines `Kafka – on it.` / `Setup checklist – on it.` / `Approved – on it.`; empty queue
  resets after **2600 ms**; any user action halts auto-advance. New card pulses for **700 ms**.
- **Theme**: sun/moon toggle top-right flips `data-theme` on `<html>`, defaults to
  `prefers-color-scheme`, persists to localStorage.
- **Render discipline**: full re-render only on discrete state changes (7 renders over 10 s of
  100 ms timer steps); typing in the reply box never re-renders (only the send pill toggles, so
  focus is kept); all clicks use delegation on the static host, so no click is lost across a
  rebuild. No dialogs in this component, so the pointerdown-capture rule has no target.

## Original demo data used (from `demo-original.js`, behaviour only)
- Labels: `Needs you / Later / Show / Recommended / Approve / Decline / Something else… / Send /
  Answered / Previous decision / Next decision / Nothing else waits`, `N decision(s) waiting`,
  `A of B`. No invented strings.
- Decisions: `queue` (Ingest pipeline, 4 options, Kafka recommended + exact summaries),
  `empty-state` (Client dashboard pick, Illustration / Setup checklist★ / Sample data + exact
  wireframe block coordinates), `weekly` (approval, To/Subject/Body facts verbatim).
- Timings 3400/2600/700 ms; auto answers queue→kafka, empty-state→checklist, weekly→approve.
- Composer placeholder `Ask for anything…` (composer itself is a simple mock: posting echoes
  `“text” – on it.` to the status line).

## What was not verified
- Pixel-exact match to the Pro screenshots (no browser/screenshots in this environment); layout,
  spacing, and responsive breakpoints follow the original CSS values.
- `prefers-color-scheme: dark` default path (stub reports no-preference → light); dark theme
  verified by toggling `data-theme` and checking token-driven styles + contrast.

## How to test
Open `index.html` in a browser. Watch it auto-play, then click options, use keys 1–5/arrows/Esc,
type a custom reply, page through decisions, toggle the theme. Headless check:
`node verify-harness.js` (DOM-stub harness in this directory: syntax check, 30+ behaviour
assertions, timer advancement, contrast math). All 44 checks pass.

## Token audit
All colours via CSS custom properties; no hard-coded hex per element. Light: page `#fafaf9`,
surface `#ffffff`, ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`,
radius-lg `16px`/radius `10px`/radius-sm `6px`, shadow `0 1px 2px rgba(0,0,0,.05), 0 4px 16px
rgba(0,0,0,.05)`, waiting `#92400e`/`#fef3c7`. Dark: page `#101012`, surface `#1c1c1f`,
ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`, amber `#fbbf24`
on `#451a03`/text `#fde68a`. Component vars (tray/card/fill/well/wire tones) derive from these
tokens in both themes, mirroring the original's variable structure.

## Contrast results (computed, WCAG AA ≥ 4.5)
| Pair | Ratio |
|---|---|
| Light ink `#171717` / surface | 17.93:1 ✅ |
| Light muted `#78716c` / surface | 4.80:1 ✅ |
| Light badge `#92400e` / `#fef3c7` | 6.37:1 ✅ |
| Dark ink `#ededed` / `#1c1c1f` | 14.52:1 ✅ |
| Dark muted `#a1a1aa` / `#1c1c1f` | 6.63:1 ✅ |
| Dark badge `#fde68a` / `#451a03` | 12.03:1 ✅ |
