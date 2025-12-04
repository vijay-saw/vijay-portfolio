// src/App.jsx
import { Routes, Route } from "react-router-dom";

// your existing components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Certifications from "./components/Certifications";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhyHireMe from "./components/WhyHireMe";
import Chatbot from "./components/Chatbot";

import PublicProfile from "./pages/PublicProfile";

// pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./auth/ProtectedRoute";

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_#4f46e5_0,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e9_0,_transparent_55%)] opacity-40" />
      <div className="relative">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <section id="home" className="scroll-mt-24"><Hero /></section>
          <section id="whyhireme" className="mt-16 scroll-mt-24"><WhyHireMe /></section>
          <section id="skills" className="mt-16 scroll-mt-24"><Skills /></section>
          <section id="experience" className="mt-16 scroll-mt-24"><Experience /></section>
          <section id="projects" className="mt-16 scroll-mt-24"><Projects /></section>
          <section id="certifications" className="mt-16 scroll-mt-24"><Certifications /></section>
          <section id="contact" className="mt-16 scroll-mt-24"><Contact /></section>
        </main>
        <Chatbot />
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Protected dashboard must appear BEFORE /:username */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Explicit public profile route */}
      <Route path="/public/:username" element={<PublicProfile />} />

      {/* last: single-segment username fallback (if you still want it) */}
      <Route path="/:username" element={<PublicProfile />} />
    </Routes>
  );
}

export default App;

