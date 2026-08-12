# Formula Fan 🏎️

A Formula 1 companion for the 2026 season — live standings, race schedules, and detail pages for every driver, team, and race.

**Live app →** [formula-fan-iota.vercel.app](https://formula-fan-iota.vercel.app)

![Formula Fan](./public/screenshot.png)

## Features

- **Race weekend dashboard** — live countdown to lights-out, session schedule in your local timezone, sprint weekend detection, and the most-recent race podium
- **Full 2026 calendar** — all 24 rounds with past/next/upcoming states; click any completed race for full results
- **Championship standings** — driver and constructor tables with team-liveried row accents
- **Detail pages** for every driver, team, and race with season stats, race-by-race results, and cross-links between them
- **Head-to-head comparison** — pick any two drivers for a side-by-side stat breakdown. URL-based state, so comparisons are shareable
- **F1-broadcast aesthetic** — dark theme, team colors, italic driver numbers, animated starting lights, subtle chequered background, sticky glass-morph navigation

## Tech Stack

- **[Next.js 16](https://nextjs.org)** — App Router, Server Components, Turbopack
- **TypeScript**
- **[Tailwind CSS](https://tailwindcss.com)**
- **[Jolpica-F1 API](https://github.com/jolpica/jolpica-f1)** — live season data (Ergast successor, coverage from 1950)
- **[Vercel](https://vercel.com)** — hosting with continuous deployment from `main`

## Getting started

```bash
git clone https://github.com/RishWork/formula-fan.git
cd formula-fan
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## How it was built

Formula Fan was built as a learning project — every technical decision chosen for both shipping value and pedagogical value. The full journey (multiple sessions, every feature, every bug, every lesson) is captured in [PROJECT_LOG.md](./PROJECT_LOG.md).

---

Built by [Rish](https://github.com/RishWork).