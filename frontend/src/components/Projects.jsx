import { useEffect, useState } from "react";
import { getProjects } from "../api";
import { ExternalLink } from "lucide-react";

const Projects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects().then((res) => setProjects(res.data));
  }, []);

  return (
    <section id="projects" className="pt-14 pb-16 px-6 max-w-6xl mx-auto">
      <h2
        className="text-center text-4xl font-bold text-white mb-16"
        data-aos="fade-down"
      >
        Projects
      </h2>

      <div className="grid md:grid-cols-2 gap-10">
        {projects.map((p, index) => (
          <div
            key={p.id}
            data-aos="fade-up"
            data-aos-delay={index * 150}  // stagger animation
            className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-6 
                       hover:scale-[1.02] transition-all shadow-md backdrop-blur-xl"
          >
            {p.project_image && (
              <img
                src={p.project_image}
                alt={p.title}
                data-aos="zoom-in"
                className="rounded-lg mb-5 w-full h-48 object-cover"
              />
            )}

            <h3 className="text-2xl font-semibold text-white mb-2">
              {p.title}
            </h3>

            <p className="text-slate-300 text-sm mb-4">
              {p.description}
            </p>

            <p className="text-indigo-300 text-xs mb-4">
              Tech Stack: {p.tech_stack}
            </p>

            <div className="flex gap-4 mt-4">
              {p.github_url && (
                <a
                  href={p.github_url}
                  target="_blank"
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm 
                             hover:bg-slate-700 transition"
                >
                  GitHub
                </a>
              )}

              {p.demo_url && (
                <a
                  href={p.demo_url}
                  target="_blank"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm 
                             hover:bg-indigo-500 transition"
                >
                  Live Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;

