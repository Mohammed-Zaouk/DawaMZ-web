import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Background from "./components/Background";
import Home from "./pages/Home";
import Cities from "./pages/Cities";
import Pharmacies from "./pages/Pharmacies";
import PharmacyDetail from "./pages/PharmacyDetail";
import About from "./pages/legal/About";
import Contact from "./pages/legal/Contact";
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import AdminPanel from "./pages/zp9qpanel/index";
import AdminLogin from "./pages/xk72sat2/index";
import {
  PharmacyList,
  PharmacyCreate,
  PharmacyEdit,
} from "./pages/zp9qpanel/Pharmacies";
import { CityCreate, CityEdit } from "./pages/zp9qpanel/Cities";
import {
  RegionList,
  RegionCreate,
  RegionEdit,
} from "./pages/zp9qpanel/Regions";

// ─── Public layout wrapper ────────────────────────────────────────────────────

function PublicLayout() {
  return (
    <>
      <Background />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

// ─── 404 ──────────────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div style={{ padding: "60px 32px", textAlign: "center" }}>
      <h1 style={{ color: "var(--text)" }}>404 — Page not found</h1>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH as string;
  const LOGIN_PATH = import.meta.env.VITE_LOGIN_PATH as string;
  return (
    <Routes>
      {/* ── Admin ── */}
      <Route path={`/${LOGIN_PATH}`} element={<AdminLogin />} />
      <Route path={`/${ADMIN_PATH}`} element={<AdminPanel />}>
        <Route index element={<Navigate to="regions" replace />} />

        {/* Regions */}
        <Route path="regions" element={<RegionList />} />
        <Route path="regions/create" element={<RegionCreate />} />
        <Route path="regions/edit/:id" element={<RegionEdit />} />

        {/* Cities — create/edit only (list lives inside RegionList) */}
        <Route path="cities/create" element={<CityCreate />} />
        <Route path="cities/edit/:id" element={<CityEdit />} />

        {/* Pharmacies */}
        <Route path="pharmacies" element={<PharmacyList />} />
        <Route path="pharmacies/create" element={<PharmacyCreate />} />
        <Route path="pharmacies/edit/:id" element={<PharmacyEdit />} />

        {/* Fallback — redirect unknown admin paths back to regions */}
        <Route path="*" element={<Navigate to="regions" replace />} />
      </Route>

      {/* ── Public ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/:regionSlug" element={<Cities />} />
        <Route path="/:regionSlug/:citySlug" element={<Pharmacies />} />
        <Route
          path="/:regionSlug/:citySlug/:pharmacySlug"
          element={<PharmacyDetail />}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
