# DawaMZ — Web

> Find the nearest open pharmacy in Morocco — right now.

This is the **web version** of DawaMZ, a multilingual pharmacy finder available across two platforms:

| Platform | Repo | Status |
|---|---|---|
| 📱 Mobile (React Native + Expo) | [dawamz-app](https://github.com/your-username/dawamz-app) | Live on Android & iOS |
| 🌐 Web (this repo) | [dawamz-website](https://github.com/your-username/dawamz-website) | Live at dawamz.com |

Both platforms share the same Supabase backend — same data, same schedule logic, same multilingual content.

The web version focuses on discoverability (SEO, shareable pharmacy URLs) while the mobile app handles the full native experience with offline support and notifications.

**Live:** [dawamz.com](https://www.dawamz.com)

---

## Stack

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![CSS Modules](https://img.shields.io/badge/CSS-Modules-000000?style=flat-square&logo=cssmodules&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Bundler | Vite |
| Backend / DB | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Styling | CSS Modules |
| Routing | React Router v6 |
| Deployment | Vercel |
| Icons | Ionicons v4 |

---

## Features

- **Real-time open/closed status** — computed from weekly schedules, lunch breaks, night shifts, and on-call duty periods
- **Multilingual** — Arabic, French, and English with full RTL support
- **Region → City → Pharmacy** navigation with SEO-friendly slugs
- **Admin panel** — protected route for managing regions, cities, and pharmacies
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
VITE_ADMIN_EMAIL=your_admin_email
VITE_ADMIN_PATH=your_admin_path
VITE_LOGIN_PATH=your_login_path
```

> None of these values should ever be committed. The `.gitignore` already excludes all `.env` files.

---

## Project Structure

```
src/
├── components/        # Shared UI components (Navbar, Footer, etc.)
├── context/           # Language and theme context providers
├── pages/
│   ├── legal/         # About, Contact, Privacy, Terms
│   ├── xk72sat2/      # Admin login
│   ├── zp9qpanel/     # Admin panel (Regions, Cities, Pharmacies)
│   ├── Home.tsx
│   ├── Cities.tsx
│   ├── Pharmacies.tsx
│   └── PharmacyDetail.tsx
├── services/          # Supabase client
├── styles/            # CSS Modules
└── utils/             # Schedule logic (isOpen, getScheduleStatus)
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |

---

## Database

Managed on Supabase with Row Level Security enabled on all tables. The public can only read pharmacy and city data. All write operations go through the admin panel and require authentication.

Key tables: `regions`, `cities`, `pharmacies`, `pharmacy_suggestions`

---

## License

MIT