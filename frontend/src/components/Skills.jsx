// frontend/src/components/Skills.jsx
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { getSkills, getPublicSkills } from "../api";

/**
 * Normalize any incoming data to an array
 */
const toArray = (data) => {
  if (Array.isArray(data)) return data;
  // handle DRF pagination style: { results: [...] }
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

/**
 * Skills component
 *
 * - If `items` prop is provided → uses that list directly (no API call).
 * - Else:
 *    - isPublic = true  → uses getPublicSkills()  (default Vijay homepage)
 *    - isPublic = false → uses getSkills()        (logged-in dashboard)
 */
const Skills = ({ isPublic = true, items }) => {
  const [skills, setSkills] = useState(toArray(items));
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic" });

    // If parent passed skills explicitly (public profile),
    // just use them and skip API calls.
    if (items !== undefined && items !== null) {
      setSkills(toArray(items));
      AOS.refresh();
      return;
    }

    setError(null);

    // PUBLIC MODE (homepage)
    if (isPublic) {
      getPublicSkills()
        .then((res) => {
          setSkills(toArray(res?.data));
          AOS.refresh();
        })
        .catch(() => {
          setError("Unable to load skills.");
          setSkills([]); // keep as array on error
        });
      return;
    }

    // PRIVATE MODE (dashboard)
    getSkills()
      .then((res) => {
        setSkills(toArray(res?.data));
        AOS.refresh();
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          setError("Please log in to view skills.");
        } else {
          setError("Unable to load skills right now.");
        }
        setSkills([]); // keep as array on error
      });
  }, [isPublic, items]);

  // Always work with a safe array to avoid .reduce/.map errors
  const safeSkills = Array.isArray(skills) ? skills : [];

  // Group by category
  const grouped = safeSkills.reduce((acc, skill) => {
    const cat = skill.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill.name);
    return acc;
  }, {});

  return (
    <section id="skills" className="py-16 px-6">
      <h2 className="text-center text-4xl font-bold text-white mb-12">
        Skills
      </h2>

      {error ? (
        <p className="text-center text-gray-300 text-lg" data-aos="fade-up">
          {error}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {Object.entries(grouped).map(([category, items], index) => (
            <div
              key={category}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="rounded-xl bg-[#0d152b] border border-slate-800 p-5
                         shadow-md hover:border-indigo-400 transition h-full"
            >
              <h3 className="text-lg font-semibold text-indigo-300 mb-3 capitalize">
                {category}
              </h3>

              <div className="flex flex-wrap gap-1.5">
                {items.map((item, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 text-[11px] rounded-lg bg-slate-900
                               border border-slate-700 text-slate-200
                               hover:border-indigo-400 hover:text-indigo-300 transition"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Skills;

