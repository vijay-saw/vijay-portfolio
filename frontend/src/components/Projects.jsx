// frontend/src/components/Projects.jsx
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { getProjects, getPublicProjects } from "../api";

/**
 * Projects
 * - items prop → render directly (public profile)
 * - else:
 *    - isPublic = true  → site-owner projects
 *    - isPublic = false → logged-in user's projects
 */
const Projects = ({ isPublic = true, items }) => {
  const [projects, setProjects] = useState(items || []);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic" });

    if (items !== undefined && items !== null) {
      setProjects(items || []);
      AOS.refresh();
      return;
    }

    setError(null);

    if (isPublic) {
      getPublicProjects()
        .then((res) => {
          setProjects(res.data || []);
          AOS.refresh();
        })
        .catch(() => setError("Unable to load projects."));
      return;
    }

    getProjects()
      .then((res) => {
        setProjects(res.data || []);
        AOS.refresh();
      })
      .catch(() => setError("Unable to load projects."));
  }, [isPublic, items]);

  if (error) {
    return (
      <section className="py-16 px-6">
        <h2 className="text-center text-4xl font-bold text-white mb-6">
          Projects
        </h2>
        <p className="text-center text-gray-300">{error}</p>
      </section>
    );
  }

  if (!projects.length) return null;

  return (
    <section id="projects" className="py-16 px-6">
      <h2 className="text-center text-4xl font-bold text-white mb-12">
        Projects
      </h2>
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {projects.map((p, index) => (
          <div
            key={p.id || index}
            data-aos="fade-up"
            data-aos-delay={index * 100}
            className="bg-slate-900 border border-slate-700 rounded-xl p-6"
          >
            {p.project_image && (
              <img
                src={p.project_image}
                alt={p.title}
                className="w-full h-40 object-cover rounded mb-4"
              />
            )}
            <h3 className="text-xl font-semibold text-white">{p.title}</h3>
            <p className="text-slate-300 mt-2">{p.description}</p>
            {p.tech_stack && (
              <p className="text-indigo-300 text-xs mt-2">
                Tech Stack: {p.tech_stack}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;

