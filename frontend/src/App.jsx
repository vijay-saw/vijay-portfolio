// src/App.jsx
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

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">

      {/* background gradients */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_#4f46e5_0,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e9_0,_transparent_55%)] opacity-40" />

      <div className="relative">
        
        <Navbar />

        {/* Main content */}
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">

          {/* HERO */}
          <section id="home" className="scroll-mt-24">
            <Hero />
          </section>

          {/* WHY HIRE ME */}
          <section id="whyhireme" className="mt-16 scroll-mt-24">
            <WhyHireMe />
          </section>

          {/* SKILLS */}
          <section id="skills" className="mt-16 scroll-mt-24">
            <Skills />
          </section>

          {/* EXPERIENCE */}
          <section id="experience" className="mt-16 scroll-mt-24">
            <Experience />
          </section>

          {/* PROJECTS */}
          <section id="projects" className="mt-16 scroll-mt-24">
            <Projects />
          </section>

          {/* CERTIFICATIONS */}
          <section id="certifications" className="mt-16 scroll-mt-24">
            <Certifications />
          </section>

          {/* CONTACT */}
          <section id="contact" className="mt-16 scroll-mt-24">
            <Contact />
          </section>

        </main>

        {/* Chatbot must be outside main but inside layout */}
        <Chatbot />

        <Footer />
      </div>
    </div>
  );
}

export default App;

