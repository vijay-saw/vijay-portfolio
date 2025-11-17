import { useEffect, useState } from "react";
import { getCertifications } from "../api";

const Certifications = () => {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    getCertifications().then((res) => setCerts(res.data));
  }, []);

  return (
    <section id="certifications" className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
      <h2
        className="text-center text-4xl font-bold text-white mb-16"
        data-aos="fade-down"
      >
        Certifications
      </h2>

      <div className="grid md:grid-cols-2 gap-10">
        {certs.map((c, index) => (
          <div
            key={c.id}
            data-aos="fade-up"
            data-aos-delay={index * 150}   // staggered animation
            className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-6 shadow-md backdrop-blur-xl"
          >
            <h3 className="text-2xl font-semibold text-white mb-2">
              {c.title}
            </h3>

            <p className="text-slate-300 text-sm mb-1">
              <strong>Issued by:</strong> {c.issuer}
            </p>

            <p className="text-slate-400 text-xs mb-4">
              <strong>Date:</strong> {c.date}
            </p>

            {c.certificate_file && (
              <a
                href={c.certificate_file}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-indigo-400 text-sm font-medium hover:text-indigo-300 underline"
              >
                View Certificate →
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Certifications;

