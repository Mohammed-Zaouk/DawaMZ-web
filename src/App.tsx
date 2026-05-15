import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Background from "./components/Background";
import Home from "./pages/Home";
import Cities from "./pages/Cities";
import Pharmacies from "./pages/Pharmacies";
import PharmacyDetail from "./pages/PharmacyDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";

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
          <Route path="/:regionId" element={<Cities />} />
          <Route path="/:regionId/:cityId" element={<Pharmacies />} />
          <Route path="/:regionId/:cityId/:pharmacyId" element={<PharmacyDetail />} />
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
      <h1 style={{ color: "var(--text-primary)" }}>404 — Page not found</h1>
    </div>
  );
}