// src/pages/PublicProfile.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getPublicProfile,
  getPublicSkills,
  getPublicProjects,
  getPublicExperience,
  getPublicCertifications,
  getPublicWhyHireMe,
} from "../api";

import Hero from "../components/Hero";
import Skills from "../components/Skills";
import Experience from "../components/Experience";
import Projects from "../components/Projects";
import Certifications from "../components/Certifications";
import WhyHireMe from "../components/WhyHireMe";
import Contact from "../components/Contact";
import Chatbot from "../components/Chatbot";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function PublicProfile() {
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [whyhireme, setWhyHireMe] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const p = await getPublicProfile(username);
        const sk = await getPublicSkills(username);
        const ex = await getPublicExperience(username);
        const pr = await getPublicProjects(username);
        const ce = await getPublicCertifications(username);
        const wh = await getPublicWhyHireMe(username);

        setProfile(p.data || p);
        setSkills(sk.data || sk);
        setExperience(ex.data || ex);
        setProjects(pr.data || pr);
        setCertifications(ce.data || ce);
        setWhyHireMe(wh.data || wh);
      } catch (e) {
        console.error(e);
        setError("Profile not found or private");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading…
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-xl">
        {error || "Unable to load profile"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        {/* Use Hero with username override */}
        <Hero username={username} />

        <section id="whyhireme" className="mt-16 scroll-mt-24">
          <WhyHireMe items={whyhireme} />
        </section>

        <section id="skills" className="mt-16 scroll-mt-24">
          <Skills skills={skills} isPublic />
        </section>

        <section id="experience" className="mt-16 scroll-mt-24">
          <Experience experience={experience} />
        </section>

        <section id="projects" className="mt-16 scroll-mt-24">
          <Projects projects={projects} />
        </section>

        <section id="certifications" className="mt-16 scroll-mt-24">
          <Certifications certifications={certifications} />
        </section>

        <section id="contact" className="mt-16 scroll-mt-24">
          <Contact />
        </section>
      </main>

      <Chatbot
        ownerUsername={username}
        assistantName={`${profile.name}'s AI Assistant`}
      />

      <Footer />
    </div>
  );
}

