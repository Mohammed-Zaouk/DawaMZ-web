import { Routes, Route, Navigate } from "react-router-dom";
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
import { PharmacyList, PharmacyCreate, PharmacyEdit } from "./pages/zp9qpanel/Pharmacies";
import { CityList, CityCreate, CityEdit } from "./pages/zp9qpanel/Cities";
import { RegionList, RegionCreate, RegionEdit } from "./pages/zp9qpanel/Regions";

export default function App() {
  return (
    <>
      <Routes>
        {/* Admin routes */}
        <Route path="/xk72sat2" element={<AdminLogin />} />
        <Route path="/zp9qpanel" element={<AdminPanel />}>
          {/* Default: redirect to regions (the new top-level nav) */}
          <Route index element={<Navigate to="regions" replace />} />

          {/* Regions */}
          <Route path="regions" element={<RegionList />} />
          <Route path="regions/create" element={<RegionCreate />} />
          <Route path="regions/edit/:id" element={<RegionEdit />} />

          {/* Cities (managed from regions UI, but still need standalone routes for create/edit) */}
          <Route path="cities" element={<CityList />} />
          <Route path="cities/create" element={<CityCreate />} />
          <Route path="cities/edit/:id" element={<CityEdit />} />

          {/* Pharmacies — supports ?cityId= query param for filtering */}
          <Route path="pharmacies" element={<PharmacyList />} />
          <Route path="pharmacies/create" element={<PharmacyCreate />} />
          <Route path="pharmacies/edit/:id" element={<PharmacyEdit />} />
        </Route>

        {/* Public routes */}
        <Route
          path="*"
          element={
            <>
              <Background />
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/:regionSlug" element={<Cities />} />
                  <Route path="/:regionSlug/:citySlug" element={<Pharmacies />} />
                  <Route path="/:regionSlug/:citySlug/:pharmacySlug" element={<PharmacyDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </>
  );
}

function NotFound() {
  return (
    <div style={{ padding: "60px 32px", textAlign: "center" }}>
      <h1 style={{ color: "var(--text)" }}>404 — Page not found</h1>
    </div>
  );
}