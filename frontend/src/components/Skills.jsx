import { useEffect, useState } from "react";
import { getSkills } from "../api";

const Skills = () => {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    getSkills().then((res) => setSkills(res.data));
  }, []);

  // Group by category
  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill.name);
    return acc;
  }, {});

  return (
    <section id="skills" className="py-16 px-6">
      <h2 className="text-center text-4xl font-bold text-white mb-12">
        Skills
      </h2>

      {/* Compact 3-column grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">

        {Object.entries(grouped).map(([category, items], index) => (
          <div
            key={category}
            data-aos="fade-up"
            data-aos-delay={index * 100}
            className="rounded-xl bg-[#0d152b] border border-slate-800 p-5 
                       shadow-md hover:border-indigo-400 transition h-full"
          >
            {/* Category Title */}
            <h3 className="text-lg font-semibold text-indigo-300 mb-3 capitalize">
              {category}
            </h3>

            {/* More compact badges */}
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
    </section>
  );
};

export default Skills;

