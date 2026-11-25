# Agent Inbox — replica report (v2)

## What I built
Standalone `index.html` (single file, ~21KB, inline CSS/JS, system fonts only): a calm background-tasks inbox. Reworked from v1 to v2 spec quality — improved in place, not from scratch.

- Header: logo, "Agent Inbox / background tasks", live pill (`live · 3 tasks · N need you`) + visible **sun/moon theme toggle** (top-right).
- Filter tabs: **All / Needs you / Running / Done** with rolling count bubbles (Done = done + failed). `aria-selected` kept in sync.
- **Original demo data (3 tasks, no invented tasks):**
  - `Migrate users table` — Opus 5.5 · 14 tools · 9 sources · **waiting**: Read schema and 14 migrations / Wrote migration 0042_split_users / Dry run on staging – no errors / Wants to run it on production → Approve / Reject / Open.
  - `Clean up CRM contacts` — **failed**: Loaded 18,240 contacts / Matched 1,312 likely duplicates / Merge stopped – API rate limit 429 → Retry / Open (agent/tools labels are plausible filler in the same shape: "Sweep · crm-worker / crm api · dedupe").
  - `Review PR #482` — **done**: Read 12 changed files / Ran the test suite – 214 passed / Posted review summary → Open / Re-run (agent/tools filler: "Review · code-agent / repo · tests").
- Each row: status dot, 15px semibold title, 999px status pill, live elapsed clock (ticking every second for waiting/working; frozen for done/failed), 12.5px muted agent/tools meta, chevron.
- Click a row to unfold steps (timeline with ✓/●/◷/! ticks) plus contextual actions. Actions mutate state and the card **glides** via FLIP; counts roll (translateY pop). Approve on the migration appends "Approved by you — running on production"; Retry on the CRM appends "Retrying merge after 429 backoff" and flips it to working (so the Running tab fills).
- Keyboard: ↑/↓ moves + opens, Enter toggles, Esc collapses. Focus-visible outlines. Responsive stacked layout below 560px. `prefers-reduced-motion` disables animation. Toast confirms every action.

## v2 fixes applied
1. **Design tokens:** all colours via CSS custom properties (`--page/--surface/--ink/--muted/--subtle/--border/--shadow`, status tokens, `--accent`, `--focus`, `--toast-*`). Verified zero hex codes outside the two token blocks. Radius `16px` cards / `10px` buttons / `6px` kbd, `999px` pills, card padding 12–16px, gaps 8–12px, 150–200ms transitions, 1px border + soft shadow, hover lift on cards/buttons/tabs/chevron.
2. **Dark mode:** `<html data-theme="light|dark">`, default follows `prefers-color-scheme`, toggle overrides + persists to localStorage. Dark tokens per spec (surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`; amber waiting `#fde68a` on `#451a03`, dot `#fbbf24`). Toggle shows ☾/☀ with correct aria-label.
3. **Original demo data** restored (see above); v1's invented EV-pricing/tweet/interview tasks removed.
4. **Polish:** consistent base 14px system sans, titles semibold 15px, meta 12–13px muted; every button has hover + focus-visible; empty-state, toast, kbd all token-driven.

## Contrast check (computed, both themes — all ≥ 4.5)
- Light: ink/surface 17.5, muted/surface 4.8, waiting 6.4, working 5.5, done 6.5, failed 6.8.
- Dark: ink/surface 14.5, muted/surface 6.6, waiting 12.0, working 7.3, done 12.3, failed 11.2.
- No grey-on-grey, borders visible in both (`#e7e5e4` on white / `#2e2e33` on `#1c1c1f`).

## Light + dark verification — confirmed
- Checked by code inspection + token audit: every element references vars; dark block overrides all of them; toggle flips `data-theme` and icon/label; default initialises from `prefers-color-scheme` when no stored choice. Contrast ratios computed for all status pills and body text in both themes (see above). No automated browser run in this environment — visual check is: open `index.html`, click ☾/☀, confirm finished look in both.

## What matches the original
Calm single list, live clocks + status tags, filter tabs with counts, click-to-unfold steps, Approve/Reject/Retry/Open actions, glide-on-move, rounded-card aesthetic with amber waiting.

## What I could not verify
No live original URL or Pro source was provided/fetched in this workdir. Agent/tools labels for the CRM and PR tasks and the PR's third step ("Posted review summary") are plausible filler in the same shape. Exact original sort order and motion curves are approximations.

## How to test
Open `index.html` in a browser (double-click or `python3 -m http.server` + visit). Click tabs, unfold rows, Approve/Reject/Retry and watch counts roll and cards glide. Click the ☾/☀ button top-right to switch light/dark; check narrow width (~360px) for stacked layout.
