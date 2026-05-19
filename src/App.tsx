import { Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
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
  );
}

function NotFound() {
  return (
    <div style={{ padding: "60px 32px", textAlign: "center" }}>
      <h1 style={{ color: "var(--text)" }}>404 — Page not found</h1>
    </div>
  );
}