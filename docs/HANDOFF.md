# Handoff — where this stands and what's next

Written for whoever opens this repo next, human or Claude. Read `CLAUDE.md`
and `docs/BRIEF.md` first — this file only says what's already done and what
to do in what order. Update the checklists below as you go so the next
handoff is just as clean.

## What's done

- [x] `docs/BRIEF.md` — full spec, `docs/MODEL.md` — data model contract.
- [x] `src/data/seed.json` — the model, unmodified from source.
- [x] `src/engine/engine.ts` — pure calculation engine, unmodified. **Never
      edit this file to make a component easier to write** — add a selector
      next to the component instead (see `CLAUDE.md` rule 1).
- [x] `verify.ts` — regression harness. `npm run verify` reproduces the
      known-good numbers in `CLAUDE.md` exactly (Δ 0 against the sheet except
      the documented Apartment Middle correction — that Δ is expected, not a
      bug: see `docs/MODEL.md` "Known issue carried from the source").
- [x] Vite + React + TypeScript scaffold, with Tailwind v4, Recharts, zod, and
      Vitest installed and wired in (`vite.config.ts` has the Tailwind plugin,
      `src/index.css` is `@import "tailwindcss";`).
- [x] `npm run build` and `npm run dev` both work. (They didn't as of the last
      commit before this handoff — the Vite template's `App.tsx` imported
      assets that had been deleted, and Tailwind was installed but never
      added to `vite.config.ts`. Both are fixed now.)
- [x] Design directions chosen — see item 1 below.
- [x] `src/data/schema.ts` + `src/data/index.ts` — zod schema matching `Model`,
      validates `seed.json` on load, throws a specific error if the shape
      drifts. This is now the only place components import model data from.
- [x] `src/lib/format.ts` — the one formatting utility. `formatHeadline` (the
      `147.6` register, pair with a literal "M EGP" unit), `formatExact` (the
      `147,629,110.42` register), `formatPercent`, `formatInt`, `formatLabel`
      (generic acronym-vs-sentence-case rule, not a hardcoded discipline
      list), and the shared `numClass` for `tabular-nums`.
- [x] `src/engine/engine.extension.test.ts` — proves acceptance criteria #2
      and #3 (9th activity, 4th building) plus a basement-shaped fixture
      (0 units, lump sums only) against fixture models, independent of
      `seed.json`. `npm test` passes.
- [x] `src/selectors/overview.ts` — Overview-only derived shapes
      (`clusterSplit`, `byBuilding`, `byDiscipline`, `byActivity`,
      `costPerM2`, `avgCostPerApartment`), built on `summarise()`/`lineItems()`
      without touching `engine.ts`.
- [x] `src/screens/Overview.tsx` — the first real screen, built to Direction C
      (schedule board). Wired into `App.tsx`, replacing the placeholder.
      Verified in a real browser (Chromium via Playwright) at 1280px and at
      375px — renders correctly at both, basement's 100%-lump-sum bar and
      "no units" label render without special-casing.
- [x] `src/design/direction-c.tsx` — the shared Direction C tokens and
      components (`PageShell`, `Bar`, `SplitMeter`, `weightStyle`, colour
      constants) factored out of `Overview.tsx` so every screen extends the
      same system instead of redefining it. Overview now imports from here.
- [x] `src/routing/router.ts` + `src/components/ScreenNav.tsx` — a small
      hand-rolled path router (no library — two-to-five screens don't
      warrant one, and it's not in the brief's tech stack) and the shared nav
      component every screen renders at the bottom. Flip `built: true` on a
      `NAV_ITEMS` entry in `ScreenNav.tsx` as each screen ships; nothing else
      about navigation changes.
- [x] `src/selectors/layouts.ts` + `layouts.test.ts` — space-by-space
      breakdown per layout. A test asserts the space-level sum always equals
      engine `layoutTotal` (so the displayed breakdown can never silently
      disagree with the header figure), reproduces the five known-good
      per-apartment costs, and covers both null-handling cases: a space
      absent from a layout (both areas null → "not in this layout", not a
      silent zero) vs. a present space with no applicable rates (public
      corridor → present, zero cost, "no activity applies here").
- [x] `src/screens/Layouts.tsx` — second real screen, Direction C. Five
      layout summary cards (click to switch), per-apartment activities
      (doors/windows, not tied to a space), then all 17 named spaces as
      cards — present spaces with their rate × qty breakdown, absent ones
      grouped below with a dashed "not in this layout" treatment. Verified
      in-browser at 1280px and 375px, and a real click-through (Overview →
      Layouts nav link → switch to Apartment Middle) confirmed navigation
      and the absent-space rendering both work.
- [x] `src/routing/router.ts` grew from path-only to path + `URLSearchParams`
      (`{ pathname, search, navigate, setSearch }`). `src/filters/filters.ts`
      converts between that and a typed `Filters` object
      (`building`/`layout`/`discipline` so far — see its header comment for
      why `substantiated`/`activity`/`cluster` aren't wired yet).
      `src/components/FilterBar.tsx` is the shared control, rendering only
      the dimensions a screen passes options for.
- [x] `src/selectors/activities.ts` + `activities.test.ts` — per-activity
      totals narrowed by the active filters, plus `groupLinesByRate`, which
      answers "why are windows 10 million" by grouping an activity's lines
      by rate (e.g. two tiers for windows: 120,000/unit × 56 units in
      Edge/Middle, 82,881/unit × 42 units in Apt 1/2/3) instead of dumping
      a hundred-plus raw building×layout×space rows. A test asserts every
      rate group's `rate × quantity` reconciles exactly to its `total`, and
      that filtering to the basement (zero measured activities) returns an
      empty list rather than crashing.
- [x] `src/screens/Activities.tsx` — third real screen, Direction C. Filter
      bar (building/layout/discipline, reflected in the URL, e.g.
      `/activities?building=b12`), 8 activity cards, and the selected
      activity's rate-group breakdown below. Empty-filter state has real
      next-step copy ("Try clearing it — the basement, for example, has no
      measured activities at all") rather than "no data found." Verified
      in-browser at 1280px and 375px, plus filtering to Building 12 and to
      the basement (empty state) by clicking through in a real browser.
- [x] `src/selectors/split.ts` — pulled the `SplitFigure` type and its
      `split()` helper out of `overview.ts` into one shared module (it had
      drifted into two near-identical copies — one in `overview.ts`, one
      redeclared in `design/direction-c.tsx` while factoring that out
      earlier). Both now import from here; `overview.ts` re-exports the type
      so nothing importing it from there broke.
- [x] `src/selectors/buildings.ts` + `buildings.test.ts` — one building's
      layouts (measured) and `lump_sums[]` (unmeasured) side by side, first
      screen to render individual lump-sum line items rather than a rolled-up
      split. A test asserts total/measured/lump match `byBuilding()` in
      `overview.ts` exactly for every building, reproduces the four
      known-good building totals, and confirms the basement (0 units, 3 lump
      sums) yields `layouts: []` with all three lump sums intact rather than
      breaking.
- [x] `src/screens/Buildings.tsx` — fourth real screen, Direction C. Four
      building cards, then the selected building's split meter, its layouts
      (measured, with count × cost/apartment), and its lump sums as
      individual cards — each carries the `note` field verbatim where the
      seed has one (the basement's three alternative-figure notes). "No
      apartments in this building" replaces an empty layouts list rather
      than rendering nothing. Verified in-browser at 1280px and 375px on
      both a normal building and the basement; one apparent bug (a lump-sum
      split meter showing a partial fill for the 0%-measured basement)
      turned out to be the `motion-safe` width transition still animating at
      screenshot time, not a real defect — confirmed by reading the DOM
      after the transition settled.
- [x] **Fixed a real navigation bug** while building Rates: `useRoute()` was
      a plain hook, so `App` and `ScreenNav` each held an independent
      `useState` copy of the route. `pushState` doesn't fire `popstate`, so
      clicking a nav link updated `ScreenNav`'s own state and the address
      bar, but `App` — which decides which screen to render — never found
      out, and silently kept rendering the previous screen while the URL and
      the nav pill both said otherwise. Only caught because a Playwright
      click-through test showed the URL change but the old screen's content.
      Fixed by converting `src/routing/router.tsx` (renamed from `.ts`) into
      a `RouteProvider` context, same pattern as `ModelContext` — one shared
      state instance, every consumer sees the same update. `App.tsx` now
      wraps the tree in `<RouteProvider>`. Re-verified all cross-screen
      navigation and the Activities filter afterward; both correct.
- [x] `src/data/ModelContext.tsx` — the edited-state layer Rates needs.
      `ModelProvider` holds the live `Model` in `useState`, seeded from a
      `structuredClone` of the static `model` export in `src/data/index.ts`
      (which is never itself mutated). `update(mutator)` clones-then-mutates
      a draft and commits it; `reset()` restores a fresh clone of the seed.
      Every screen now reads `const { model } = useModel()` instead of
      importing the static `model` directly — Overview, Layouts, Activities,
      and Buildings were all switched over, which is what makes an edit on
      Rates show up on every other screen immediately: they share the same
      state, not a copy.
- [x] `src/selectors/rates.ts` + `rates.test.ts` — pure `deltaSummary(seed,
      current)` for the persistent banner (seed total, current total, delta,
      delta %, `isDirty`). `isDirty` is a deep compare, not `delta !== 0` — a
      test covers an edit that changes the model but leaves the total
      unchanged (swapping two same-rate spaces' areas) and confirms it still
      reads dirty.
- [x] `src/screens/Rates.tsx` — fifth and last screen, Direction C. Persistent
      delta banner (ochre border while dirty), Export JSON (downloads the
      current model — re-validated with `modelSchema` and re-summarised in a
      one-off script to confirm it reproduces the edited total exactly),
      Reset to seed (`window.confirm`, disabled when not dirty), an
      apartment-count editor per building/layout, and a per-layout editor for
      every present space's floor/wall area and activity rates plus the two
      per-unit rates (windows, doors). Editing is via a `NumberField` that
      tracks local text and commits on blur, so the field doesn't fight you
      mid-edit.

      **Verified functionally, not just visually**, in a real browser: edited
      Apartment Edge's window rate (+10,000/apartment × 28 apartments), then
      clicked through Overview, Activities, Buildings, and Layouts via the
      actual nav links (not `page.goto`, which would hard-reload and reset
      the in-memory state — that's not the scenario acceptance criterion #4
      describes) and confirmed all four updated by the correct amount
      simultaneously — this is what caught the router bug above. Exported
      the edited state, parsed the downloaded file, validated it against
      `modelSchema`, and confirmed `summarise()` on the re-imported model
      reproduces the edited total exactly (criterion #5). Clicked Reset and
      confirmed the banner returns to "matches the seed exactly" and every
      other screen reverts too (criterion #6). Also checked 375px.

## Direction D — Phase 1 UI fully rebuilt (supersedes Direction C)

**2026-07-23, later the same day as the above:** the user supplied a new,
finished design system — `design/direction-d-capital-executive.md` (tokens)
and `design/direction-d-capital-executive.html` (a static mockup, "Capital
Executive Dashboard") — and asked for a full replace. Confirmed explicitly
via `AskUserQuestion` before touching anything, since it discarded Direction
C, which had just been built and verified across all five screens. The
mockup's sidebar nav items (Cost Analysis, Project Health, Vendor
Management, Archive) don't correspond to anything in this app — adopted the
visual language (navy/slate palette, IBM Plex Sans + JetBrains Mono, the
built-up/lump-sum hatch-vs-dashed signature) but wired the sidebar to the
five real screens instead of copying dead links. Flagged this substitution
to the user rather than deciding it silently.

- [x] `src/index.css` — Direction D's tokens as a Tailwind v4 `@theme` block
      (colours, font roles, radii) plus `.built-up-pattern` /
      `.lump-sum-dashed`, the new measured/lump-sum signature (a diagonal
      hatch vs. a dashed border — replaces Direction C's border-weight
      system). **Fonts are self-hosted** (`public/fonts/*.woff2` — IBM Plex
      Sans, JetBrains Mono, Material Symbols Outlined, all variable fonts,
      ~1.2 MB total), not linked from Google Fonts: a board dashboard that
      might get presented on a restricted network or a projector with no
      internet shouldn't depend on an external CDN for its own text to
      render. Caught two real bugs verifying this in a browser (not by
      reading the CSS): (1) the mockup's own `.material-symbols-outlined`
      class never sets `font-family`, so icons silently rendered as literal
      words ("dashboard", "link", "edit") — fixed by adding the missing
      declaration; (2) this sandbox's headless Chromium doesn't route
      through the outbound proxy the way `curl`/Node do, so the Google
      Fonts CDN version failed with `ERR_CONNECTION_RESET` in-browser while
      `curl` to the same URL succeeded — self-hosting sidesteps this
      entirely rather than fighting proxy config for a network dependency
      the app shouldn't have anyway.
- [x] `src/design/direction-d.tsx` — replaces `direction-c.tsx` (deleted).
      `StatusIcon` (the "link"/"edit" icon pair, filled-navy vs. grey — a
      second cue alongside the pattern, never colour alone), `CompositionBar`
      (the built-up/lump-sum split bar), `Card`, `StatTile`, `PageContent`
      (the page-level padding wrapper).
- [x] `src/components/AppShell.tsx` — replaces `ScreenNav.tsx` (deleted). A
      persistent top bar (title, inert Projects/Financials/Compliance links,
      inert notification/settings icons, a working "Download report" button
      that calls the same export as Rates) and a desktop sidebar
      (`hidden md:flex`) wired to the same `useRoute()`/`ModelContext` every
      screen already used — navigation and editing logic are unchanged, only
      the chrome around them is new. **Mobile has no sidebar** (a 256px fixed
      rail has nowhere to go at 375px) — `AppShell` renders a fixed bottom
      tab bar below `md` instead, same `NAV_ITEMS`, same routing.
- [x] `src/lib/export.ts` — `downloadModelJson()` pulled out of `Rates.tsx`
      so both Rates' "Export JSON" and the top bar's "Download report" call
      the same function. One thing "export" means in this app, not two.
- [x] All five screens (`Overview`, `Layouts`, `Activities`, `Buildings`,
      `Rates`) rebuilt for Direction D. **No selector changed** — every
      screen still calls the exact same functions in `src/selectors/*.ts` it
      did under Direction C; only the JSX/styling changed. This is the
      payoff of the selector/component split established in item 1: a full
      visual replatform touched zero business logic.
- [x] Re-ran the full acceptance-criteria verification from scratch after
      the rebuild — all ten still pass, including the real-browser
      propagation/export/reset check for #4/#5/#6 (see item 6 below; the
      router-context fix from before Direction D obviously carried over,
      re-verified it still works under the new chrome). Also re-checked
      375px on every screen.

Confirm all of the above still holds before doing anything else:

```
npm install
npm run verify
npm test
npm run lint
npm run build && rm -rf dist
```

## What's not done

**All five screens are built and all ten acceptance criteria pass** (see the
table in item 6 below — every row is done, verified in a real browser, not
just by reading code). Items 1–5 below are kept for context/history, not
because anything is outstanding in them.

What's genuinely left, in rough priority order:

1. **A pass through `docs/BRIEF.md` section 4's "what to avoid" list against
   the finished product**, not just the three static mockups. The mockups
   were checked; five real screens of cumulative detail (many number-heavy
   cards) haven't been re-checked together for whether they still read as
   distinctive rather than generic. Worth 20 minutes with fresh eyes before
   calling this done-done.
2. **`npm run lint` (oxlint)** — now run and clean of errors. Five warnings
   remain, all `react(only-export-components)` on files that mix a
   component with constants/hooks (`ModelContext.tsx`, `router.tsx`,
   `ScreenNav.tsx`, `direction-c.tsx`) — a Fast Refresh DX note, not a
   correctness issue; splitting those files just to silence it isn't worth
   it at this size. Not in the verify chain in `package.json` scripts;
   consider adding it there if the pattern above stops feeling like enough.
3. **No automated test drives the app through a browser** (all the
   click-through verification this session was manual Playwright scripts,
   written and thrown away each time, not committed). If this repo is going
   to keep growing, consider whether a couple of committed Playwright specs
   for the criteria in item 6 (especially #4, since that's exactly the class
   of bug — state not actually shared — that a unit test can't catch) are
   worth the added tooling. Not required by the brief; a judgment call for
   whoever picks this up.
4. **The `Filters` type (`src/filters/filters.ts`) still only has
   `building`/`layout`/`discipline`.** `substantiated` and `activity` were
   never needed by any screen that got built — Buildings and Rates each grew
   their own single-item selector instead. That's fine (YAGNI held), but
   don't assume the filter set is "done" in the sense of covering
   `docs/BRIEF.md` section 5's full list; it covers what got used.
5. **Phase 2 planning** (`docs/BRIEF.md` section 11) — Supabase, auth,
   revisions, audit log. Explicitly out of scope for Phase 1; don't start it
   without the user asking. `src/data/index.ts` is still the one seam to
   swap.

The numbered list below (screens, design, etc.) is left as a build log — read
it if you want the history of *how* each piece was built, not to find
outstanding work.

### 1. Design directions — done, decision recorded

Produce **2–3 distinct static HTML directions** for the Overview screen only,
using real numbers from `seed.json` (not placeholder data). Follow the
constraints in `docs/BRIEF.md` section 4 — tabular numerals, EGP formatting,
the measured-vs-lump-sum signature treatment, and the "what to avoid" list
(no cream/terracotta AI-dashboard look, no dark-mode-crypto look, no
gradient hero cards).

**Show them and wait for a decision before writing any React component.**

**Decision recorded 2026-07-23: Direction C — "Schedule board" — chosen,
then superseded the same day.** The three original directions live in
`design/` (`direction-a-drawing-set.html`, `direction-b-site-ledger.html`,
`direction-c-schedule-board.html`, `index.html` to compare) — kept for
history, no longer the build target.

**Direction C was replaced by Direction D — "Capital Executive Dashboard" —
later on 2026-07-23**, supplied by the user as finished tokens/mockup
(`design/direction-d-capital-executive.md` / `.html`). See "Direction D —
Phase 1 UI fully rebuilt" further down for the full account. Direction D
(navy/slate, IBM Plex Sans + JetBrains Mono, a persistent top bar + sidebar,
hatch-vs-dashed for built-up/lump-sum) is the current and only visual system
— don't introduce a third one without an equally explicit decision.

### 2. Data-access layer — done

`src/data/schema.ts` + `src/data/index.ts`, per the plan above. Nothing else
imports `seed.json` directly — keep it that way as new screens are built.

### 3. Currency + number formatting utility — done

`src/lib/format.ts`, per the plan above.

### 4. Extension tests — done

`src/engine/engine.extension.test.ts` covers the 9th-activity and 4th-building
cases (acceptance criteria #2, #3) plus a basement-shaped fixture. As each new
screen's selectors ship, prefer extending these fixture-based tests over
hand-checking against `seed.json`.

### 5. Screens, in this order

Build one screen at a time. Run `npm run verify` after each one; stop and
investigate if totals drift.

1. **Overview — done.** `src/screens/Overview.tsx`. Cluster total with
   substantiation split, apartment count, cost per apartment, cost per m²,
   cost by building, cost by discipline, cost by activity (apartment
   finishes).
2. **Layouts — done.** `src/screens/Layouts.tsx` + `src/selectors/layouts.ts`.
   The five apartment types, space by space. See "What's done" above for
   detail. Real navigation is now wired (`src/routing/router.ts` +
   `ScreenNav`) between Overview and Layouts.
3. **Activities — done.** `src/screens/Activities.tsx` +
   `src/selectors/activities.ts`. See "What's done" above. This is also
   where the global filters (`src/filters/filters.ts`, `FilterBar`) were
   introduced — reuse them here, don't reinvent per screen.
4. **Buildings — done.** `src/screens/Buildings.tsx` +
   `src/selectors/buildings.ts`. See "What's done" above. Buildings does
   *not* use the URL filters (it has its own building-card selector, same
   pattern as Layouts/Activities) — the `ScreenNav.navigate()` query-reset
   note below is still accurate, since Buildings never wrote to `search`.
5. **Rates — done.** `src/screens/Rates.tsx` + `src/data/ModelContext.tsx` +
   `src/selectors/rates.ts`. See "What's done" above for the full account,
   including the navigation bug this screen's verification caught and fixed.
   Edited state lives in `ModelProvider` at the app root; every screen reads
   `useModel()` instead of the static `model` export now.

Filters (cluster, building, layout, discipline, activity, substantiated) are
global and reflected in the URL per `docs/BRIEF.md` section 5.
`building`/`layout`/`discipline` are wired (`src/filters/filters.ts`,
`FilterBar`) and used by Activities. Buildings and Rates each ended up with
their own single-item selector instead of the shared filter bar — that's a
reasonable call for a single-building or single-layout drill-down, not a gap
to close reflexively. `substantiated`, `activity`, and `cluster` were never
added to `Filters` because nothing built needed them; add them if and when
something does.

`ScreenNav`'s `navigate()` resets the query string on every screen change
(see `src/routing/router.tsx`). Still fine today — only Activities reads
`search`, and no other screen deep-links into it with filters pre-set.

### 6. Full acceptance criteria (`docs/BRIEF.md` section 7)

Check every one before calling Phase 1 done:

| # | Criterion | Status |
|---|---|---|
| 1 | `npx tsx verify.ts` reproduces documented numbers | done |
| 2 | 9th activity flows through every screen, covered by a test | done — fixture tests in `engine.extension.test.ts`, `activities.test.ts`, `layouts.test.ts` |
| 3 | 4th building flows through every roll-up, covered by a test | done — fixture tests in `engine.extension.test.ts`, `buildings.test.ts` |
| 4 | Editing window rate updates total/chart/building/per-apartment together | **done — verified in a real browser**: edited Edge's window rate on Rates, clicked through Overview/Activities/Buildings/Layouts via the actual nav (not a page reload), all four updated by the correct amount. Caught and fixed a real router bug in the process (see "What's done") |
| 5 | Export JSON re-imports and reproduces edited state | done — downloaded file re-validated against `modelSchema` and re-summarised; total matched the edited state exactly |
| 6 | Reset returns exactly to seed | done — verified in-browser: banner returns to "matches the seed exactly," every other screen reverts |
| 7 | Basement (0 units, 3 lump sums) renders correctly everywhere | done — Overview, Buildings, Rates (0 apartments, all fields still editable/visible); N/A on Layouts/Activities (space/activity-level, no per-building rendering) |
| 8 | Filtering to one activity doesn't break chart layout | done — verified in-browser on Activities, incl. the basement empty state |
| 9 | Usable at 375px width | done — all five screens verified in-browser at 375px |
| 10 | Every figure shows measured vs. lump sum | done — all five screens; Layouts/Activities are 100% measured and say so explicitly, Rates' editable fields are all measured/build-up inputs by definition (lump sums aren't edited per-line here) |

**All ten criteria pass.** Phase 1 is functionally complete against the brief's
acceptance criteria. See "What's not done" above for the handful of
non-blocking follow-ups (a fresh-eyes design pass, lint in the verify chain,
committed browser tests, Phase 2 planning) before calling it fully closed.

## Phase 2 — authorized, not yet started

**2026-07-23:** the user explicitly chose "start real Phase 2 (Supabase,
auth, API)" via `AskUserQuestion`, overriding `docs/CLAUDE.md`'s Phase 1
scope note below for that specific decision. This does **not** mean Phase 2
is built — nothing in `src/data/index.ts` has changed, the app still reads
`seed.json` directly. What actually blocks starting:

- **A live Supabase project.** Cannot be provisioned by an AI session —
  needs a URL + anon key (and, for schema work, a service-role key or the
  Supabase CLI) from the user, or explicit direction to scaffold against a
  local Supabase (Docker is available in this sandbox; the Supabase CLI is
  not yet installed).
- **An auth provider.** The brief's Phase 2 plan (`docs/BRIEF.md` section 11)
  specifies Google SSO — needs an OAuth client from Google Cloud Console.
- **A schema decision.** `docs/MODEL.md`'s structure (clusters → activities/
  layouts/buildings, no stored totals) maps reasonably directly to tables,
  but revisions, the audit log, and the editor/viewer role split (also
  section 11) need actual design before a migration gets written, not just
  a literal translation of the current TypeScript types.

Next session: ask the user for the above before writing schema/migration
code — don't guess a Supabase project structure and build against it
speculatively.

## Things to not do

Everything in `docs/BRIEF.md` section 8 remains out of scope **except**
Phase 2 backend work, which the user explicitly authorized (see above) —
but "authorized" isn't "built"; see the blockers above before writing
Supabase code. Service worker, PWA manifest, and Excel import are still not
requested and still shouldn't be started speculatively.

## If you're an AI picking this up cold

1. Run the four verify commands above. If any fail, that's the first thing
   to fix — don't build on top of a broken state.
2. All five screens exist and all ten acceptance criteria pass (item 6
   above). This is not a "pick up where the last session left off mid-build"
   situation — it's "the brief is met; what's next is either the follow-ups
   in 'What's not done' or new scope the user asks for."
3. If asked to change or extend a screen: read the relevant selector's test
   file first — it documents the invariants (e.g. space totals always sum to
   `layoutTotal`, rate groups always sum to the activity total) that a change
   must not break.
4. Trust the browser over the code for anything involving cross-component
   state or navigation, or an external asset (a font, an icon set). This
   session shipped two real bugs that every static read of the code looked
   correct for: `useRoute()` as a plain hook instead of shared context
   (only surfaced via a click-through test comparing the URL against what
   actually rendered), and a missing `font-family` on the Material Symbols
   class (only surfaced by screenshotting and seeing literal words instead
   of icons). `npm test` and `tsc` stayed green through both.
5. The UI is Direction D now, not Direction C — see "Direction D — Phase 1
   UI fully rebuilt" above. Fonts are self-hosted in `public/fonts/`; don't
   re-add a Google Fonts `<link>`.
6. Phase 2 is authorized but not started — see "Phase 2 — authorized, not
   yet started" above before writing any Supabase/auth code. It needs
   information only the user can provide (project credentials, OAuth
   client, schema decisions), not more scaffolding built on guesses.
