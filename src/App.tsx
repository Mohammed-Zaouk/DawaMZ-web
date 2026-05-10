import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
// import Pharmacies from "./pages/Pharmacies";
// import Cities from "./pages/Cities";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import Login from "./pages/Login";
// import AdminDashboard from "./pages/admin/Dashboard";
// import ProtectedRoute from "./components/admin/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      {/* <Route path="/pharmacies" element={<Pharmacies />} />
      <Route path="/cities" element={<Cities />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} /> */}

      {/* Secret admin */}
      {/* <Route path="/x7k2-manage" element={<Login />} /> */}
      {/* <Route path="/zp9q-panel" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } /> */}

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-gray-950">
      <h1 className="text-2xl font-bold">404 — Page not found</h1>
    </div>
  );
}