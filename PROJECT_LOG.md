---
title: "Formula Fan — Project Log"
author: "Rish"
date: "August 2026"
geometry: margin=1in
fontsize: 11pt
mainfont: "Helvetica"
monofont: "Menlo"
colorlinks: true
linkcolor: "red"
---

# Formula Fan — Project Log

A running journal of the Formula Fan build: what we did, why, and what's next. Updated at the end of each working session.

---

## Overview

**What we're building:** A web app for Formula 1 enthusiasts — in-depth race, driver, and F1-related content. Positioned as a race weekend companion in v1, with historical, technical, and community angles layered on over time.

**Learning-focused build:** Each step is chosen not only for shipping value but for what it teaches about modern web development.

**Owner:** Rish
**Started:** August 2026

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | React-based, server components by default, file-based routing, deploys free on Vercel |
| Language | TypeScript | Type safety catches bugs early, better editor autocomplete |
| Styling | Tailwind CSS | Utility-first, fast iteration, no separate CSS files to maintain |
| Data (historical / results) | Jolpica-F1 API | Free, no auth, Ergast-compatible successor, covers 1950–present |
| Data (session / live — planned) | OpenF1 | Free, no auth, session-level data |
| Data (telemetry — planned) | FastF1 (Python) | Gold standard for lap times, tyres, telemetry |
| Runtime | Node.js (LTS via installer) | Required to run Next.js |
| Editor | VS Code | Best-in-class TypeScript / Next.js support |
| Deployment (planned) | Vercel | Free tier, first-party Next.js hosting |

---

## Architecture

Three tiers, in current form:

1. **Browser** — receives HTML/CSS/JS from Next.js and renders the UI. The user's device.
2. **Next.js app** — runs on the server. Server Components fetch data directly from Jolpica and return rendered HTML. Client Components handle interactive bits (countdowns, later: forms, filters).
3. **External F1 APIs** — Jolpica-F1 today; OpenF1, FastF1, and possibly others later.

We initially planned to route all data through internal `/api/*` routes as a middle layer. Turned out that with Server Components, calling Jolpica directly from a `lib/` function is cleaner and faster — no self-HTTP hop. API routes will come in when we need them (client-side calls, mobile clients, cached wrappers).

---

## Session log

### Session 1 — Environment setup

**Date:** early August 2026

**Done:**

- Installed Node.js on macOS (LTS)
- Verified `node --version` and `npm --version`
- Created project via `npx create-next-app@latest FormulaFan`
- Answered setup prompts: TypeScript, ESLint, Tailwind, src/ directory, App Router, Turbopack — all Yes
- Ran `npm run dev`, confirmed the default Next.js welcome page at localhost:3000

**Concepts introduced:**

- Node.js as a JavaScript runtime outside the browser
- npm and `npx` (execute a package without installing it globally)
- Hot Module Replacement — dev server auto-refreshes on save

**Files touched:** none manually — everything scaffolded by create-next-app

---

### Session 2 — Project tour + first real data

**Date:** August 6–7, 2026

**Done:**

- Toured the project structure — established that `src/app/` is where pages live, `src/lib/` for utilities, `public/` for static assets, everything at the root is config
- Replaced the default home page (`src/app/page.tsx`) with a "Formula Fan" placeholder
- Created `src/lib/jolpica.ts` with a `getDriverStandings()` function that fetches from `https://api.jolpi.ca/ergast/f1/current/driverstandings.json`
- Updated the home page to a Server Component that awaits standings data and renders a table
- Confirmed live 2026 season data (Antonelli, Hamilton, Russell, etc.) on localhost:3000

**Concepts introduced:**

- **Server Components** — the App Router default. Async, can `await` data fetches directly in the component body. No `useState` or `useEffect`.
- **The `@/` import alias** — maps to `src/`, avoids `../../../` paths.
- **TypeScript types for API responses** — we typed only the fields we care about, not the whole Jolpica response.
- **The `next: { revalidate: N }` fetch option** — Next.js's built-in caching. Set to 3600 seconds so we don't hammer a community-run API.
- **JSX and Tailwind classes in tandem** — how `className="..."` maps to real CSS.
- **`.map()` in JSX** — rendering a list of rows from an array, using `key` for React reconciliation.

**Files touched:**

- Created `src/lib/jolpica.ts`
- Modified `src/app/page.tsx`

---

### Session 3 — Design polish

**Date:** August 7, 2026

**Design goals:**

- Team colors on each row for instant visual identification
- F1-broadcast-style driver names (First **LASTNAME**)
- Driver numbers displayed like on the cars — italic, in team-colored pill
- Dark theme with subtle F1-themed background
- Header with a "starting lights" animation

**Done:**

- Created `src/lib/teamColors.ts` — a constructorId → hex map based on 2026 team liveries, with a graceful fallback
- Redesigned `src/app/globals.css` — CSS variables for the dark palette, chequered flag background pattern (via a `conic-gradient` tiled at 60px), and a `@keyframes lightUp` animation for the gantry lights
- Rebuilt the home page layout:
    - Header with monospaced "2026 SEASON" overline, big title, F1-red accent bar, five red gantry lights that animate on page load
    - Standings section restyled: solid card floating over the chequered background with a soft shadow, team-color left border on each row, italic driver number pills, F1-broadcast name styling, tabular-nums for aligned numeric columns

**Concepts introduced:**

- **CSS custom properties** (`--bg-primary`, `--accent-f1`) for a single source of truth on colors
- **CSS `conic-gradient` as a checkerboard trick** — cleaner than an SVG background image
- **`background-attachment: fixed`** — makes the content feel like it moves *over* a stationary background
- **`@keyframes` + staggered `animation-delay`** — sequential lights on page load
- **Grid-based layout for tables** in Tailwind — more flexible than `<table>` for responsive tweaks
- **`tabular-nums`** — monospaced digits inside a proportional font, so numeric columns align

**Files touched:**

- Created `src/lib/teamColors.ts`
- Modified `src/app/globals.css`
- Modified `src/app/page.tsx`

---

### Session 4 — Next race section

**Date:** August 7, 2026 (evening)

**Done:**

- Extended `src/lib/jolpica.ts` with `Race` and `Session` types plus a `getNextRace()` function hitting `/current/next.json`
- Created `src/components/` folder for reusable UI pieces
- Created `src/components/RaceCountdown.tsx` — a **Client Component** with a live-updating countdown to lights-out
- Created `src/components/NextRaceCard.tsx` — a Server Component that renders the race header, circuit info, countdown, and full session schedule (with sprint-weekend awareness)
- Updated `src/app/page.tsx` to fetch standings and next race in parallel via `Promise.all` and render the card above the standings

**Concepts introduced:**

- **Client Components vs Server Components** — the `"use client"` directive, and why any component using `useState`, `useEffect`, or event handlers must be marked client-side
- **Hydration and the `null` initial state trick** — server render matches first client render (both show "--"), then `useEffect` kicks in with real values, avoiding hydration mismatches
- **`Promise.all` for parallel fetches** — starting both API calls simultaneously instead of sequentially
- **`toLocaleString`** with an `undefined` locale — automatically formats dates in the user's local timezone
- **Component composition** — the card is server-rendered except for the tiny countdown, which is a client island inside it

**Debugging notes:**

- Hit a `getNextRace is not defined` runtime error on first render — cause was calling the function without adding it to the existing import statement. Lesson: JS/TS files are isolated worlds; every function needed inside a file must be explicitly imported at the top, even if it lives in the same folder as another thing you're already importing.
- Session schedule initially rendered with labels and times mashed into one horizontal line, because `flex justify-between` inside narrow two-column cells pushed the label to the far left and the time to the far right, then the next column's label bumped against the previous column's time. Fixed by replacing the inner flex with a two-column grid (`grid grid-cols-[1fr_auto]`), and increasing the outer grid's horizontal gap. Lesson: `flex justify-between` needs breathing room to look good; when cells are narrow, `grid` gives more predictable alignment.

**Files touched:**

- Modified `src/lib/jolpica.ts`
- Created `src/components/RaceCountdown.tsx`
- Created `src/components/NextRaceCard.tsx`
- Modified `src/app/page.tsx`
- Modified `src/components/NextRaceCard.tsx` (session schedule layout fix)

---

### Session 5 — Constructor standings + multi-page planning

**Date:** August 8, 2026

**Done:**

- Added a `ConstructorStanding` type and a `getConstructorStandings()` function to `src/lib/jolpica.ts`, hitting `/current/constructorstandings.json`
- Fetched all three data sources in parallel via a single `Promise.all` in `page.tsx`
- Added a **Constructor Standings** section to the home page, reusing the same visual language as driver standings (dark card, team-color left border, monospaced numbers)
- Added a distinctive per-row detail: a thin vertical team-color bar next to the constructor name, echoing the row's left border — visually distinguishes constructor rows from driver rows while keeping the language consistent
- Reflected on the growing home page and planned the next structural move: proper multi-page navigation

**Concepts introduced:**

- **Extending an existing pattern rather than reinventing** — constructor standings borrowed almost every visual and technical decision from driver standings; the delta was small because the groundwork paid off
- **Three-way parallel fetching** — `Promise.all` scales linearly, no downside to fetching all three data sources at once
- **Recognizing when a page has grown past its natural size** — the home page now stretches well below the fold; the next design move is structural (routes + navigation), not visual

**Debugging notes:**

- Hit a JSX parse error (`Expected '</', got 'jsx text'`) with a misleading line number pointing to the constructor block's closing tag. Actual cause: pasting the new constructor code accidentally replaced the driver standings table's body, leaving an open `<section>` with only a header inside. Fix: reconstruct the driver table and reorder sections cleanly.
- **Big lesson:** JSX parser errors often flag the line where imbalance becomes *visible*, not where the imbalance *starts*. When a tag error points near the end of a file, walk backward looking for a section that opens but never properly closes.
- **VS Code tip:** clicking any opening or closing tag highlights its match. If clicking a tag highlights nothing, or something impossibly far away, that's your imbalance.

**Files touched:**

- Modified `src/lib/jolpica.ts` (added `ConstructorStanding` type and `getConstructorStandings()`)
- Modified `src/app/page.tsx` (added constructor standings section, reorganized imports and Promise.all)

---

### Session 6 — Multi-page structure + navigation

**Date:** August 8–9, 2026

Note on paths: this session confirmed the project uses a **flat** structure (no `src/` directory). All `@/` alias imports resolve to the project root. Path references from here on will match that reality — `components/Nav.tsx` rather than `src/components/Nav.tsx`.

**Done:**

- Created `components/Nav.tsx` — a sticky top navigation bar with links to Home and Standings, active-state highlighting via `usePathname()`, and a glass-morph effect (`backdrop-blur-md` over 95% opaque dark)
- Updated `app/layout.tsx` to include `<Nav />` above `{children}`, so the nav appears on every route without per-page imports
- Extracted the two full standings tables into their own reusable components:
    - `components/DriverStandingsTable.tsx`
    - `components/ConstructorStandingsTable.tsx`
- Created the `/standings` route at `app/standings/page.tsx` — fetches both standings in parallel and renders them stacked using the two extracted components
- Trimmed the home page (`app/page.tsx`) to: header + next race card + a compact "Championship Leaders" top-3 podium + a "Full standings →" link that navigates to the standings page
- Polished scroll behavior: added `overscroll-behavior-y: none` on the `html` element to disable macOS's elastic bounce; bumped the nav's opacity from 80% to 95% so content behind it isn't visible during scroll

**Concepts introduced:**

- **File-system routing** — folders in `app/` map directly to URLs. `app/standings/page.tsx` becomes `/standings`. There is no separate route configuration file to maintain.
- **The `<Link>` component** (from `next/link`) — replaces plain `<a href>` for internal navigation. Prevents full page reloads, prefetches destination pages on hover, and preserves scroll behavior where appropriate.
- **Root layouts** — `app/layout.tsx` wraps every page in the app. Anything placed there (nav, footer, metadata) appears on every route. `{children}` is where the current page renders inside the shared shell.
- **Server Components composing Client Components** — the layout is a Server Component but includes `<Nav />`, which is a Client Component (it uses `usePathname()`). This mixing is normal; the boundary is drawn at the `"use client"` directive.
- **`usePathname()`** — a client-side hook from `next/navigation` returning the current URL path. Enables active-state highlighting in navigation without prop-drilling.
- **Component extraction** — the same table markup lives in one file and is imported from two pages. Change the file once, both pages update. Precondition for scaling.
- **`overscroll-behavior`** — CSS property that disables browser rubber-banding at scroll boundaries. Makes app-like sites feel more anchored and native.

**Debugging notes:**

This session had a heavy debugging phase because the multi-page transition touches many files and partial setups render broken states in confusing ways. Key incidents:

- Home page returned 404 after moving `page.tsx` into `standings/` instead of creating a new one there. Fix: put page.tsx back in `app/`, create a fresh one in `standings/`.
- Nav wasn't appearing even though `Nav.tsx` existed. Cause: `layout.tsx` never imported and rendered `<Nav />`. Creating a file only makes code available — something has to actually use it.
- Repeated confusion between "compilation failed" errors and "route not found" errors. Next.js falls back to the built-in 404 page when a route's `page.tsx` fails to compile, which makes a build error look like a routing bug. Terminal messages are the ground truth.

Each of these is captured in the debugging journal below with the specific fix and lesson.

**Files touched:**

- Created `components/Nav.tsx`
- Created `components/DriverStandingsTable.tsx`
- Created `components/ConstructorStandingsTable.tsx`
- Created `app/standings/page.tsx`
- Modified `app/layout.tsx` (imported and rendered `<Nav />`)
- Modified `app/page.tsx` (trimmed to home dashboard shape)
- Modified `app/globals.css` (added `overscroll-behavior-y: none` on `html`)

---

### Session 7 — Dynamic routes + driver detail pages

**Date:** August 9, 2026

**Done:**

- Extended `lib/jolpica.ts` with `RaceResult` and `RaceWithResults` types plus a `getDriverSeason(driverId)` function that fetches a driver's current-season standing and full race results in parallel
- Created the dynamic route `app/drivers/[id]/page.tsx` — a driver detail page showing:
    - Hero card with big italic team-colored number pill, F1-broadcast styled name, team, driver code, nationality
    - Stats bar: position, points, wins, podiums (calculated from race results)
    - Full season results table: round, grand prix + country, grid position, finishing position, points, status
- Introduced graceful 404 handling via `notFound()` — invalid driver IDs (e.g. `/drivers/foobar`) show the built-in 404 page instead of crashing
- Made driver names clickable throughout the app:
    - Home page top-3 podium
    - Full driver standings table on the /standings page
    - Both use a `<Link>` wrap with a subtle arrow appearing on hover (via `group` + `group-hover:opacity-100`)

**Concepts introduced:**

- **Dynamic route segments** — the `[id]` folder syntax in the App Router. One folder becomes N pages, one per matching URL segment
- **Route params in Next.js 15+** — the `params` prop is a `Promise` that must be `await`ed before use. This is a recent change; older tutorials still show synchronous params which no longer work
- **`notFound()`** — a special function from `next/navigation` that halts rendering and shows the built-in 404 page. Cleaner than throwing an error
- **Parallel driver-specific data fetching** — Jolpica has separate endpoints for standing and season results; `Promise.all` fetches both simultaneously in the `getDriverSeason` function
- **Group hover in Tailwind** — the `group` class on a parent plus `group-hover:*` on children lets you style children based on parent hover state, without JavaScript
- **Local sub-components** — the `StatBlock` component is defined inside the same file as the page and not exported. Common pattern when a small piece is used only in one place — no separate file needed
- **The pattern behind every "detail page" in every app you've ever used** — `/users/[id]`, `/posts/[slug]`, `/products/[handle]`. Learn it once, use it forever

**Debugging notes:**

- Hit "The default export is not a React Component in '/drivers/[id]/page'" — the file was created but something during paste corrupted the module structure. Cleanest fix: full file replacement (`Cmd+A`, delete, paste fresh)
- Lesson (added to debugging journal): this specific error is almost always paste-corruption, not a real code problem. Diagnostic time > clean-replacement time.

**Files touched:**

- Modified `lib/jolpica.ts` (added `RaceResult`, `RaceWithResults` types, `getDriverSeason` function)
- Created `app/drivers/[id]/page.tsx`
- Modified `app/page.tsx` (wrapped top-3 podium names in `<Link>`)
- Modified `components/DriverStandingsTable.tsx` (wrapped driver names in `<Link>`, added `Link` import)

---

### Session 8 — GitHub repo + Vercel deployment

**Date:** August 9, 2026

**Done:**

- Installed GitHub CLI (`brew install gh`)
- Configured git identity (`user.name`, `user.email`)
- Confirmed `create-next-app` had already initialized the local git repo (no need for `git init`)
- Made first meaningful commit with all sessions of work (12 files new/modified) — dashboard, standings, driver detail, next race card, all components, both lib files, project log
- Authenticated with GitHub via `gh auth login` (browser-based flow)
- Created public GitHub repo `RishWork/formula-fan` via `gh repo create --public --source=. --push` — one command creates the remote and pushes in one shot
- Housekeeping: removed unused AI-tool config files (`AGENTS.md`, `CLAUDE.md`), renamed the framework-generated `README.md` to `INFO.md` (keeping `PROJECT_LOG.md` as the primary doc), caught and unstaged a stray `.Rhistory` file that shouldn't have been in the project, updated `.gitignore` to cover it and similar OS/IDE artifacts
- Signed up for Vercel with "Continue with GitHub" — no separate account or credentials needed
- Imported the `formula-fan` repo into Vercel — auto-detected as Next.js, defaults were all correct
- First production deploy in ~60 seconds → live URL `formula-fan-iota.vercel.app`
- Verified home, `/standings`, and `/drivers/[id]` all render correctly in production with live Jolpica data

**Concepts introduced:**

- **Version control fundamentals** — `git init` (already done by create-next-app), `git add`, `git status`, `git commit -m`, `git push`
- **`.gitignore`** — why `node_modules/` and `.next/` never belong in the repo, and how OS/IDE artifacts (`.DS_Store`, `.Rhistory`, `.vscode/`) sneak in without a good ignore file
- **GitHub CLI (`gh`)** — hugely simpler than the traditional dance of Personal Access Tokens or SSH keys. Handles auth via browser, wraps common workflows in single commands
- **`gh repo create --source=. --push`** — creates a remote repo AND pushes local commits in one command, saves the manual `git remote add origin ...` step
- **Continuous deployment via Vercel** — every `git push origin main` automatically triggers a fresh build and deploy. No manual deploy step ever again
- **The three-command development loop** going forward:
    ```
    git add .
    git commit -m "Description of change"
    git push
    ```

**Debugging notes:**

- Initial `git status` returned "fatal: not a git repository" — cause was running the command from the parent folder (`FormulaOne/`) instead of the project folder (`formulafan/`). Fix: `cd formulafan` first.
- `.Rhistory` (an RStudio artifact) appeared as untracked. Caught before commit. Fix: unstage with `git restore --staged`, add pattern to `.gitignore`, use a comprehensive template from gitignore.io going forward.
- Lesson: always `git status` before committing. Blind `git add .` invites OS/editor artifacts into your public repo.

**Files touched:**

- Deleted `AGENTS.md`, `CLAUDE.md`
- Renamed `README.md` → `INFO.md`
- Modified `.gitignore` (added `.Rhistory`, expanded for macOS/Node/VS Code coverage)
- Created GitHub repo `RishWork/formula-fan`
- Created Vercel project connected to that repo

---

### Session 9 — Schedule page

**Date:** August 9, 2026

**Done:**

- Added a `getSeasonSchedule()` function to `lib/jolpica.ts` that hits `/current.json` and returns all 24 races of the current season. Reused the existing `Race` type — same shape as the next-race response
- Extended `components/Nav.tsx` with a Schedule link between Home and Standings (one-line change; active-state highlighting worked automatically because `usePathname()` handles any route)
- Created `app/schedule/page.tsx` — a full 2026 calendar with:
    - Past races muted (40% opacity, "✓ Done" pill)
    - Next race highlighted with F1-red left border, red-tinted background, and a "NEXT UP" pill
    - Upcoming races at full opacity with "Upcoming" label
    - Sprint weekend indicator on relevant rounds
    - `findIndex` for locating the next race in the list; anything before it in the array is in the past, anything after is upcoming
- Deployed to production via `git push` — Vercel picked up and rebuilt in ~30 seconds

**Concepts introduced:**

- **Feature-in-production cycle** — save → `git push` → live on the internet in under a minute. This is the payoff for setting up GitHub + Vercel first
- **Conditional CSS classes via template literals** — `className={\`base ${cond ? "extra" : ""}\`}` for stateful styling (past vs next vs upcoming rows)
- **Conditional inline styles** — `style={cond ? {...} : undefined}` for when we need conditional CSS properties that aren't easily expressed with Tailwind
- **Reused everything** — no new visual concepts introduced, just applied existing design vocabulary (dark card, monospaced labels, tabular-nums, F1-red accent) to a new page

**Files touched:**

- Modified `lib/jolpica.ts` (added `getSeasonSchedule()`)
- Modified `components/Nav.tsx` (added Schedule link)
- Created `app/schedule/page.tsx`

---

### Session 10 — Last race card + race detail pages + team detail pages

**Date:** August 9, 2026

Big session; three related features shipped together. The through-line: filling in the missing detail pages so every entity (race, driver, team) has a dedicated page, and cross-linking all of them so users can navigate freely.

**Done:**

- Extended `lib/jolpica.ts` with:
    - New types `FullRaceResult` (per-driver row with Driver, Constructor, and optional FastestLap) and `FullRaceResults` (race + array of full results)
    - `getLastRace()` — hits `/current/last/results.json`, returns the most recently finished race
    - `getRaceResults(round)` — hits `/current/{round}/results.json`, returns a specific past race
    - `getConstructorSeason(constructorId)` — parallel fetch of a team's standing and all their season race results

- Created `components/LastRaceCard.tsx` — a home-page card showing the last race's podium with medal-colored position numbers (gold/silver/bronze), team-colored driver number pills, and a fastest-lap strip at the bottom in purple (matching F1 broadcast convention). Podium rows link to driver detail pages; "Full results →" links to the new race detail page

- Updated `app/page.tsx` to fetch and render the LastRaceCard between the next race and championship leaders sections. Home page is now a proper "before/after/context" dashboard: what's next → what just happened → who's leading overall

- Created dynamic route `app/races/[round]/page.tsx` — race detail page with:
    - Breadcrumb back to schedule
    - Full race header (round, name, circuit, locality, date)
    - Podium hero (3 cards, medal-colored position numbers, team-color top borders, click through to driver pages)
    - Full results table with all 20+ drivers (position, driver, team, grid, time/gap, points)
    - Fastest lap indicator in purple

- Made schedule rows clickable for past races (`app/schedule/page.tsx`). Used a conditional `<Link>` / `<div>` wrapper — past races become clickable, upcoming races remain non-interactive. Also added hover state for clickable rows

- Created dynamic route `app/teams/[id]/page.tsx` — constructor detail page with:
    - Breadcrumb back to standings
    - Hero with team color, name, nationality, and a 4-stat bar (position, points, wins, driver count)
    - Two clickable driver cards
    - Season results table with both drivers' results per race and combined team points per round

- Made constructor names clickable in `components/ConstructorStandingsTable.tsx` — same pattern as driver names, `<Link>` wrap with hover arrow

- Deployed to production with a single push

**Concepts introduced:**

- **Third dynamic route in the app** — `/races/[round]` now joins `/drivers/[id]` and `/teams/[id]`. The pattern is fully absorbed at this point; adding new dynamic routes is muscle memory
- **Data reshaping in a Server Component** — the team detail page uses a `Map` to deduplicate drivers across all season races. Server Components are just async functions; any data transformation JS can do, they can do
- **Local sub-components (redux)** — the team page defines `StatBlock` and `DriverResultCell` at the bottom of the file, unexported. When a piece is used only in one place, it lives with the place; no need for its own file
- **Cross-linking across pages** — the app now has a genuine web of connections: schedule → race → driver, standings → team → driver, home podium → race → driver, home leaders → driver, and driver → team. Everything is navigable in multiple directions
- **Purple as the "fastest lap" accent** — matches F1's broadcast convention. Small touch, real F1-fan-recognizable

**Files touched:**

- Modified `lib/jolpica.ts` (added `FullRaceResult`, `FullRaceResults` types + three new functions)
- Created `components/LastRaceCard.tsx`
- Modified `app/page.tsx` (imported `getLastRace` and `LastRaceCard`, rendered card between next race and championship leaders)
- Created `app/races/[round]/page.tsx`
- Modified `app/schedule/page.tsx` (past races are `<Link>` wrappers, upcoming stay as `<div>`)
- Created `app/teams/[id]/page.tsx`
- Modified `components/ConstructorStandingsTable.tsx` (constructor names now clickable, added `Link` import)

---

## Data sources — current status

| API | Endpoint(s) in use | Purpose | Cache |
|---|---|---|---|
| Jolpica-F1 | `/current/driverstandings.json` | Driver standings on home page | 1 hour |
| Jolpica-F1 | `/current/constructorstandings.json` | Constructor standings on home page | 1 hour |
| Jolpica-F1 | `/current/next.json` | Next race info + countdown | 30 min |
| Jolpica-F1 | `/current/drivers/{id}/driverstandings.json` | Driver detail page — season standing | 1 hour |
| Jolpica-F1 | `/current/drivers/{id}/results.json` | Driver detail page — race results | 1 hour |
| Jolpica-F1 | `/current.json` | Schedule page — full season calendar | 1 hour |
| Jolpica-F1 | `/current/last/results.json` | Last race card on home page | 30 min |
| Jolpica-F1 | `/current/{round}/results.json` | Race detail page | 1 hour |
| Jolpica-F1 | `/current/constructors/{id}/constructorstandings.json` | Team detail page — season standing | 1 hour |
| Jolpica-F1 | `/current/constructors/{id}/results.json` | Team detail page — race results | 1 hour |

Base URL: `https://api.jolpi.ca/ergast/f1`. All requests cached via Next.js's built-in fetch cache.

---

## Design language

- **Background:** near-black (`#0A0A0F`) with a subtle chequered-flag pattern (conic-gradient, 60px tiles, ~8% opacity)
- **Card surface:** slightly lighter dark (`#14141A`), soft dark shadow, thin zinc-800 border
- **Accent color:** F1 red (`#E10600`) — used for the header underline, the "NEXT UP" pill, the gantry lights
- **Team colors:** used for row left-borders (3px), driver-number pills (drivers), and a vertical bar next to the team name (constructors). Custom map by Jolpica `constructorId`
- **Typography:**
    - System sans-serif for body content
    - Monospaced (`font-mono`) for uppercase labels and overlines, giving a broadcast/telemetry feel
    - `tabular-nums` on numeric columns so digits align vertically
- **Driver names:** F1-broadcast style — first name in a lighter weight, LASTNAME in bold uppercase
- **Driver numbers:** italic, mirroring the forward-leaning treatment on actual F1 car liveries
- **Motifs:** gantry-lights sequential animation on page load (once), grid pattern behind content
- **Navigation:** sticky top nav with glass effect (`backdrop-blur-md` over 95% opaque dark), an F1-red logo dot with a soft red glow, monospaced brand mark, monospaced route labels with active-state highlighting
- **Scroll behavior:** overscroll bounce disabled at page boundaries — content feels anchored, no background peek at the edges

---

## Debugging journal

A running list of every bug we've hit and the lesson from each. Useful reference when a similar shape appears again.

### 1. Module not found: `teamColors`

- **What we saw:** Build error, "Module not found: Can't resolve '@/lib/teamColors'"
- **Cause:** The file didn't exist yet — hadn't been created before saving `page.tsx`
- **Fix:** Create the file
- **Lesson:** "Module not found" always means one of three things: file doesn't exist, filename has a typo (case-sensitivity!), or path is wrong. Check in that order.

### 2. Case sensitivity: `teamcolors.ts` vs `teamColors.ts`

- **What we saw:** Same "Module not found" as #1, but the file *appeared* to exist
- **Cause:** File was created with a typo in the case. macOS's filesystem is case-insensitive so Finder didn't care, but Next.js's imports are case-sensitive
- **Fix:** Rename to match the import exactly
- **Lesson:** Even on macOS, treat filenames as case-sensitive. Match the import string exactly.

### 3. `getNextRace is not defined`

- **What we saw:** Runtime ReferenceError once the page tried to render
- **Cause:** The function was called in `page.tsx` without being added to the import statement
- **Fix:** Add the function name to the existing import from `@/lib/jolpica`
- **Lesson:** Every function/type/component used in a file must be explicitly imported. There is no automatic sibling-file resolution.

### 4. Session schedule labels/times mashing together

- **What we saw:** In the session schedule, labels from one column bumped against times from the previous column
- **Cause:** Inner `flex justify-between` on narrow cells pushed content to opposite edges, then the outer grid didn't have enough gap between columns
- **Fix:** Replace inner flex with `grid grid-cols-[1fr_auto]`, add `gap-x-8` to the outer grid
- **Lesson:** `flex justify-between` works best in wide containers. In narrow ones, use `grid` with explicit column sizing for predictable alignment.

### 5. JSX build error with misleading line number

- **What we saw:** "Expected '</', got 'jsx text'" pointing to the constructor section's closing tag
- **Cause:** New constructor code was pasted *over* part of the existing driver standings, leaving a `<section>` open with only an `<h2>` inside. The parser sailed past the imbalance and only complained many lines later
- **Fix:** Reconstruct the driver table, reorder sections
- **Lesson:** JSX parse errors flag where imbalance becomes visible, not where it starts. Walk backwards to find a section that opens but never properly closes. VS Code's click-to-highlight-matching-tag helps enormously.

### 6. Home page 404 after "moving" page.tsx into a subfolder

- **What we saw:** Every request to `/` returned 404 after creating the /standings route
- **Cause:** When setting up the /standings route, `app/page.tsx` was *moved* into `app/standings/` rather than a new file being created inside standings/. This left `app/` with no `page.tsx`, so the `/` route had no component to render
- **Fix:** Move `page.tsx` back into `app/`, create a *new* file from scratch for `app/standings/page.tsx`
- **Lesson:** In Next.js App Router, every route needs its own `page.tsx` file. You never move `page.tsx` files between folders — you create new ones. Two files with the same name in different folders is normal and expected.

### 7. 404 fallback disguised as a routing bug

- **What we saw:** All requests to `/` returned 404 even after `page.tsx` was present at the right path
- **Cause:** The page had a JSX parse error, so Next.js couldn't produce a valid component. It fell back to the built-in 404 page as if the route didn't exist. The terminal showed "Parsing ecmascript source code failed" between the 200 and 404 responses
- **Fix:** Fix the parse error (usually a paste-over leaving unbalanced tags)
- **Lesson:** A 404 in dev doesn't always mean the URL is wrong. If the terminal shows "Parsing ecmascript source code failed" or a red build error alongside 404 responses, **compilation is the actual problem** — the route is fine, it just has nothing valid to render. Fix the code, the 404 goes away.

### 8. Nav bar defined but not appearing

- **What we saw:** `Nav.tsx` existed in the components folder with the correct code, but no navigation bar appeared on any page
- **Cause:** `app/layout.tsx` wasn't updated to import and render `<Nav />`
- **Fix:** Add `import Nav from "@/components/Nav"` at the top of layout.tsx, and place `<Nav />` inside the body, before `{children}`
- **Lesson:** Creating a component only makes the code available. It doesn't automatically appear anywhere until something *renders* it. For shared UI like a nav, that "something" is the root layout.

### 9. Content peeking through nav during scroll

- **What we saw:** As the page scrolled, the "2026 SEASON" overline was faintly visible *through* the sticky nav
- **Cause:** Nav's background was set to 80% opacity (`bg-[#0a0a0f]/80`). Content behind it was 20% visible
- **Fix:** Bump to 95% opacity (`bg-[#0a0a0f]/95`) — keeps enough depth for `backdrop-blur` to still do subtle work, but content is effectively invisible
- **Lesson:** Glass effects (`backdrop-blur`) always need enough base opacity to hide content behind them, but low enough to let the blur do interesting work. 90–95% is the sweet spot.

### 10. Elastic overscroll revealing page background

- **What we saw:** Pulling down on the page (already at the top) let it rubber-band, revealing the chequered background above the nav
- **Cause:** macOS's default `overscroll-behavior: auto` allows the browser's native elastic scroll at boundaries
- **Fix:** Add `html { overscroll-behavior-y: none; }` to globals.css
- **Lesson:** For dashboard/app-like sites (as opposed to marketing pages), disabling overscroll makes the whole thing feel more anchored and native. Small polish detail with outsized impact on perceived quality.

### 11. "Default export is not a React Component" runtime error

- **What we saw:** Navigating to `/drivers/leclerc` produced a runtime error: `The default export is not a React Component in "/drivers/[id]/page"`
- **Cause:** Paste corruption in the page file — something during the paste garbled either the `export default` line or introduced a syntax error deeper in the file that prevented the module from exporting properly
- **Fix:** Cmd+A in the file, delete everything, paste the whole known-good version fresh
- **Lesson:** This specific error is almost always paste-related, not a code logic issue. Full clean replacement is faster than diagnostic. Same lesson as the JSX parse errors — when in doubt, replace the whole file rather than surgically edit.

---

## Next actions

**Live URL:** `https://formula-fan-iota.vercel.app`
**Repo:** `https://github.com/RishWork/formula-fan`

**Immediate — small polish wins:**

- **Polished README on GitHub** — replace the auto-generated boilerplate with a proper project pitch: what it is, live URL, screenshot(s), tech stack, "how it was built" nod to PROJECT_LOG.md. Makes the repo portfolio-ready. ~15 min
- **Race weekend "LIVE" indicator** — pulsing red dot on the next race card when a session is currently active
- **404 page polish** — currently uses Next.js's default. Custom 404 that matches the app's aesthetic (~30 min)

**Short term — new features:**

- **Head-to-head driver comparison** — pick two drivers, compare their season side-by-side. First feature that requires real UI state (form/selection), which introduces `useState` and event handlers in a page context
- **Historical seasons browser** (`app/seasons/[year]/page.tsx`) — travel back through F1 history. Powerful because Jolpica has data from 1950
- **Circuit detail pages** (`app/circuits/[id]/page.tsx`) — track info, history of winners, lap records

**Medium term:**

- **Search / driver picker** — a header search that filters drivers as you type. Real client-side interactivity
- **Favourites** — mark drivers/teams as favourites, persist to localStorage. First real state management
- **Loading states / skeleton screens** — Next.js `loading.tsx` files for each route

**Longer term (unchanged):**

- Predictions game — requires user accounts (Supabase auth) and a database
- Telemetry pages — requires standing up a Python service using FastF1
- Live-timing during race sessions (once we decide on OpenF1 vs the official feed)
- Community features (favourites, comments) — needs users and moderation

**Longer term (needs bigger tools):**

- Predictions game — requires user accounts (Supabase auth) and a database
- Telemetry pages — requires standing up a Python service using FastF1
- Live-timing during race sessions (once we decide on OpenF1 vs the official feed)
- Community features (favourites, comments) — needs users and moderation

---

## Open questions / decisions parked

- **Live timing feed:** official F1 feed has murky ToS for third-party apps. Skip until we decide the app's monetisation/status. OpenF1 covers most use cases.
- **Auth solution:** likely Supabase or Clerk, choose when we need the first authenticated feature (predictions).
- **Database:** Postgres via Supabase or Neon. Not needed until user-generated content arrives.
- **Real-time updates during a race:** WebSockets? Polling? Decide when we build the live experience.

---

## How to run locally

```
cd ~/Desktop/FormulaOne/FormulaFan
npm run dev
```

Then open `http://localhost:3000`. Stop the server with `Ctrl+C`.

---

## Current project structure

The project uses a **flat** structure (no `src/` directory). The `@/` alias resolves to the project root.

```
formulafan/
├── app/
│   ├── page.tsx                       # / — Home (next race + last race + top-3)
│   ├── layout.tsx                     # Root layout with <Nav />
│   ├── globals.css                    # Global styles + F1 theme + overscroll fix
│   ├── schedule/
│   │   └── page.tsx                   # /schedule — full season calendar
│   ├── standings/
│   │   └── page.tsx                   # /standings — driver + constructor tables
│   ├── drivers/
│   │   └── [id]/
│   │       └── page.tsx               # /drivers/<id> — driver detail (dynamic)
│   ├── races/
│   │   └── [round]/
│   │       └── page.tsx               # /races/<round> — race detail (dynamic)
│   └── teams/
│       └── [id]/
│           └── page.tsx               # /teams/<id> — team detail (dynamic)
├── components/
│   ├── Nav.tsx                        # Sticky navigation (Client Component)
│   ├── NextRaceCard.tsx               # Next race hero (Server Component)
│   ├── RaceCountdown.tsx              # Live countdown (Client Component)
│   ├── LastRaceCard.tsx               # Last race podium (Server Component)
│   ├── DriverStandingsTable.tsx       # Driver table (reusable, clickable names)
│   └── ConstructorStandingsTable.tsx  # Constructor table (reusable, clickable names)
├── lib/
│   ├── jolpica.ts                     # Data fetching + types (8 exported functions)
│   └── teamColors.ts                  # constructorId → hex color map
├── public/                            # Static assets
├── .gitignore                         # Git ignores (node_modules, .next, .env*, macOS)
├── INFO.md                            # Framework-generated Next.js info
├── package.json
└── PROJECT_LOG.md                     # This file
```

**Routes currently defined:** `/`, `/schedule`, `/standings`, `/drivers/[id]`, `/races/[round]`, `/teams/[id]`. Six distinct page types, three of which are dynamic.

**Deployed:** `https://formula-fan-iota.vercel.app` (auto-deploys on push to `main`).
**Source:** `https://github.com/RishWork/formula-fan`
