# DawaMZ — Web

> Find the nearest open pharmacy in Morocco — right now.

This is the **web version** of DawaMZ, a multilingual pharmacy finder available across two platforms:

| Platform                        | Repo                                                       | Status                |
| ------------------------------- | ---------------------------------------------------------- | --------------------- |
| 📱 Mobile (React Native + Expo) | [dawamz](https://github.com/Mohammed-Zaouk/DawaMZ)         | Live on Android & iOS |
| 🌐 Web (this repo)              | [dawamz-web](https://github.com/Mohammed-Zaouk/DawaMZ-web) | Live at dawamz.com    |

Both platforms share the same Supabase backend — same data, same schedule logic, same multilingual content.

The web version focuses on discoverability (SEO, shareable pharmacy URLs) while the mobile app handles the full native experience.

**Live:** [dawamz.com](https://www.dawamz.com)

---

## How Data Gets Into the App

Pharmacy and on-call schedule data reaches Supabase through two complementary approaches:

### 🤖 Automated Scraping (Primary)

A private Python scraper runs automatically via GitHub Actions on a daily schedule. It collects up-to-date on-call pharmacy data — cities, pharmacies, and full details — and pushes everything directly to Supabase.

The scraper is kept private for security and privacy reasons, but its pipeline looks like this:

```
GitHub Actions (scheduled daily)
  ↓
scrapers/cities.py       → collect all cities
  ↓
scrapers/pharmacies.py   → for each city, collect pharmacies
  ↓
scrapers/details.py      → for each pharmacy, collect full details
  ↓
parsers/pharmacy.py      → clean and structure the data
  ↓
seeds/push.py            → push to Supabase 🚀
```

This keeps the database fresh without any manual intervention.

### 🗺️ Manual Approach (Supplementary)

For pharmacies or cities not covered by the scraper, data can be added manually through direct Supabase inserts or via the built-in suggestion system, where users can submit missing pharmacies directly from the website.

---

## Stack

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![CSS Modules](https://img.shields.io/badge/CSS-Modules-000000?style=flat-square&logo=cssmodules&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

| Layer        | Choice                        |
| ------------ | ----------------------------- |
| Framework    | React 18 + TypeScript         |
| Bundler      | Vite                          |
| Backend / DB | Supabase (PostgreSQL + RLS)   |
| Auth         | Supabase Auth                 |
| Maps         | Google Maps (directions link) |
| Styling      | CSS Modules                   |
| Routing      | React Router v6               |
| Deployment   | Vercel                        |
| Icons        | Ionicons v4                   |

---

## Features

- **Real-time open/closed status** — computed from weekly schedules, lunch breaks, night shifts, and on-call duty periods
- **Multilingual** — Arabic, French, and English with full RTL support
- **Region → City → Pharmacy** navigation with SEO-friendly slugs
- **Google Maps integration** — one-tap directions from any pharmacy page
- **Pharmacy suggestions** — users can submit missing pharmacies with rate limiting

---

## Getting Started

```bash
git clone https://github.com/your-username/dawamz-website.git
cd dawamz-website
npm install
npm run dev
```

### Environment Variables

Create a `.env` file at the root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> None of these values should ever be committed. The `.gitignore` already excludes all `.env` files.

---

## Project Structure

```
src/
├── assets/
├── components/
│   ├── Background.tsx
│   ├── Footer.tsx
│   └── Navbar.tsx
├── context/
│   ├── language/
│   └── theme/
├── pages/
│   ├── legal/
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Privacy.tsx
│   │   └── Terms.tsx
│   ├── Home.tsx
│   ├── Cities.tsx
│   ├── Pharmacies.tsx
│   └── PharmacyDetail.tsx
├── services/
│   └── supabase.ts
├── styles/
│   ├── components-style/
│   ├── legal-styles/
│   ├── pages-style/
│   ├── global.css
│   └── theme.css
├── utils/                 # Schedule logic (isOpen, etc.)
├── App.tsx
└── main.tsx
```

---

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start local dev server               |
| `npm run build`   | Production build                     |
| `npm run preview` | Preview the production build locally |

---

## Database

Managed on Supabase with Row Level Security enabled on all tables. The public can only read pharmacy and city data.

Key tables: `regions`, `cities`, `pharmacies`, `pharmacy_suggestions`

---

## License

MIT
