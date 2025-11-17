import { useEffect, useState } from "react";
import { getExperience } from "../api";

const Experience = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getExperience().then((res) => setItems(res.data));
  }, []);

  return (
    <section
      id="experience"
      className="px-6 py-14 max-w-6xl mx-auto scroll-mt-24"
      data-aos="fade-up"
    >
      <h2 className="text-center text-4xl font-bold text-white mb-16"
          data-aos="fade-down">
        Experience
      </h2>

      <div className="relative">

        {/* Horizontal Line */}
        <div
          className="absolute top-14 left-[8%] right-[8%] h-[2px] bg-slate-600/40 rounded-full"
          data-aos="fade-right"
          data-aos-delay="200"
        />

        {/* Timeline Wrapper */}
        <div className="flex flex-col sm:flex-row sm:justify-evenly sm:gap-10 gap-24">

          {items.map((exp, index) => (
            <div
              key={exp.id}
              className="flex flex-col items-center text-center w-full sm:w-[30%]"
              data-aos="fade-up"
              data-aos-delay={index * 150}  // staggered animation
            >
              {/* Icon */}
              <div
                className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/40"
                data-aos="zoom-in"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                >
                  <path d="M4 7V6a4 4 0 014-4h8a4 4 0 014 4v1h1a1 1 0 011 1v5a3 3 0 01-3 3h-1v3a1 1 0 01-1 1H7a1 1 0 01-1-1v-3H5a3 3 0 01-3-3V8a1 1 0 011-1h1zm2 0h12V6a2 2 0 00-2-2H8a2 2 0 00-2 2v1z" />
                </svg>
              </div>

              {/* Card */}
              <div
                className="rounded-xl bg-[#0b1221] p-5 shadow-md border border-slate-700 hover:border-indigo-400 transition w-full"
                data-aos="fade-up"
                data-aos-delay={index * 200}
              >
                <h3 className="text-lg font-semibold text-indigo-300">
                  {exp.role}
                </h3>

                <p className="text-sm text-gray-400 mt-1">{exp.company}</p>

                <p className="text-xs text-gray-500 mt-1">
                  {exp.start_date} – {exp.end_date}
                </p>

                <p className="text-sm text-gray-300 mt-4 leading-relaxed">
                  {exp.description}
                </p>
              </div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Experience;

