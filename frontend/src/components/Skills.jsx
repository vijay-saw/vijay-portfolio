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
    <section id="skills" className="py-20 px-6">
      <h2 className="text-center text-4xl font-bold text-white mb-14">
        Skills
      </h2>

      {/* Compact Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">

        {Object.entries(grouped).map(([category, items], index) => (
          <div
            key={category}
            data-aos="fade-up"
            data-aos-delay={index * 100}   // staggered animation
            className="rounded-xl bg-[#0b1221] border border-slate-800 p-5
                       shadow-md hover:border-indigo-400 transition"
          >
            {/* Category Title */}
            <h3 className="text-xl font-semibold text-indigo-300 mb-4 capitalize">
              {category}
            </h3>

            {/* Skill Badges */}
            <div className="flex flex-wrap gap-2">
              {items.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs rounded-full bg-slate-800
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

