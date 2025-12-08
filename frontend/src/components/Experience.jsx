// frontend/src/components/Experience.jsx
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { getExperience, getPublicExperience } from "../api";

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
 * Experience
 * - items prop → render directly (public profile)
 * - otherwise:
 *   - isPublic = true  → site-owner public experience
 *   - isPublic = false → logged-in user's experience
 */
const Experience = ({ isPublic = true, items }) => {
  const [experience, setExperience] = useState(toArray(items));
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic" });

    if (items !== undefined && items !== null) {
      setExperience(toArray(items));
      AOS.refresh();
      return;
    }

    setError(null);

    if (isPublic) {
      getPublicExperience()
        .then((res) => {
          setExperience(toArray(res?.data));
          AOS.refresh();
        })
        .catch(() => {
          setError("Unable to load experience.");
          setExperience([]); // keep as array on error
        });
      return;
    }

    getExperience()
      .then((res) => {
        setExperience(toArray(res?.data));
        AOS.refresh();
      })
      .catch(() => {
        setError("Unable to load experience.");
        setExperience([]); // keep as array on error
      });
  }, [isPublic, items]);

  if (error) {
    return (
      <section className="py-16 px-6">
        <h2 className="text-center text-4xl font-bold text-white mb-6">
          Experience
        </h2>
        <p className="text-center text-gray-300">{error}</p>
      </section>
    );
  }

  const safeExperience = Array.isArray(experience) ? experience : [];
  if (!safeExperience.length) return null;

  return (
    <section id="experience" className="py-16 px-6">
      <h2 className="text-center text-4xl font-bold text-white mb-12">
        Experience
      </h2>
      <div className="space-y-6 max-w-6xl mx-auto">
        {safeExperience.map((exp, index) => (
          <div
            key={exp.id || index}
            data-aos="fade-up"
            data-aos-delay={index * 100}
            className="bg-slate-900 border border-slate-700 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-indigo-200">
              {exp.role}
            </h3>
            <p className="text-slate-300">{exp.company}</p>
            <p className="text-slate-500 text-xs mt-1">
              {exp.start_date} – {exp.end_date || "Present"}
            </p>
            {exp.description && (
              <p className="text-slate-300 mt-3 whitespace-pre-line">
                {exp.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experience;

