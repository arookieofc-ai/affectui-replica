# Settings / Profile — replica report

## What was built
- Single self-contained `index.html` (inline CSS/JS, no external deps, ~21 KB) replicating affectUI **Settings / Profile** (`settings-profile`).
- Layout: sticky top bar (`affectUI / Settings / Profile` + theme toggle + mini avatar), left settings nav (Profile active), main column with 5 cards + sticky save bar + toast:
  1. **Profile picture** — initials avatar (AR), Upload new picture (FileReader preview, PNG/JPG ≤ 2 MB), Remove (restores initials). Avatar has 1px inset outline via `box-shadow: inset 0 0 0 1px var(--img-outline)`.
  2. **Basic info** — Display name (`Ava Reyes`), Role select (`Product Designer`), Email (`ava.reyes@example.com`).
  3. **Time** — Timezone select, 12-hour / 24-hour pill toggle, live ticking clock (`Local time: --` + date) updating in place every 1 s.
  4. **Context default** — Default-context select + right-aligned token label `44k / 200k` with thin 3 px bar (token counts, never percentages).
  5. **Password** — current / new / confirm, live strength meter (in-place width + label), Show/Hide toggle, Update password with validation.
- Sticky save bar: `No unsaved changes` pill + `All changes saved.` status, Discard / Save changes enable only when dirty, toast confirmations. Nav items outside Profile show a toast note.

## Demo data
- `./demo-original.js` in this directory is only a loader stub (`DemoStage` + `component`) with no profile fields, used verbatim (no fields to copy).
- All profile values above are plausible demo data in the expected shape (picture, name, role, email, time, context, password), noted here per spec.

## What matches the original (from prompt + spec tokens)
- Card look: 1 px border + soft shadow, radius-lg 16 / radius 10 / radius-sm 6, pills fully rounded, system sans 14 px, titles 15–16 semibold, meta 12–13 muted, gaps 8–12, transitions 150–200 ms.
- Tokens via CSS custom properties for every colour; dark theme via same tokens; amber kept amber in dark.
- No-flash guard, tabular-nums, hover gated, tap-highlight transparent, concentric-feel radii, borders-for-structure, optical nudge on icon button padding.

## Could not verify
- Pixel-exact comparison to the Pro `.tsx` / live affectUI CSS (not fetched, per clean-room rule); only the slug description (picture, name, role, email, time, context, password) was available.
- Real upload persistence and backend save; FileReader preview + local dirty state only.

## How to test
- Open `index.html` in a browser (double-click or `python3 -m http.server` then visit the file). Toggle sun/moon top-right for light/dark. Edit name/role/email/timezone/context/format and watch the save bar go dirty; Save/Discard work. Change new password to see the strength meter. Upload a PNG/JPG to preview the avatar.

## Verification (node only, no browser)
- `node --check` on extracted inline script: passes (no syntax error).
- In-dir DOM-stub harness asserts: visible painted text (Profile, Display name, Ava Reyes, Product Designer, Email, Timezone, Time format, Local time, Context default, 44k / 200k, Password, Save changes), full-loop node identity (same `clockTime`/`saveBtn`/etc. objects across ticks), zero `innerHTML` writes after init, light AND dark themes (toggle sets `data-theme` + persists).
- Checked light AND dark manually via token review (no grey-on-grey, borders visible in both).

## Clean-room
- Written from the prompt description + spec tokens only. No verbatim copy from any fetched bundle; `demo-original.js` has no copyable UI code.
