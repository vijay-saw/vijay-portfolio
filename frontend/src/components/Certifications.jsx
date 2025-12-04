// frontend/src/components/Certifications.jsx
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { getCertifications, getPublicCertifications } from "../api";

/**
 * Certifications
 * - items prop → render directly (public profile)
 * - else:
 *    - isPublic = true  → site-owner public certs
 *    - isPublic = false → logged-in user's certs
 */
const Certifications = ({ isPublic = true, items }) => {
  const [certs, setCerts] = useState(items || []);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic" });

    if (items !== undefined && items !== null) {
      setCerts(items || []);
      AOS.refresh();
      return;
    }

    setError(null);

    if (isPublic) {
      getPublicCertifications()
        .then((res) => {
          setCerts(res.data || []);
          AOS.refresh();
        })
        .catch(() => setError("Unable to load certifications."));
      return;
    }

    getCertifications()
      .then((res) => {
        setCerts(res.data || []);
        AOS.refresh();
      })
      .catch(() => setError("Unable to load certifications."));
  }, [isPublic, items]);

  if (error) {
    return (
      <section className="py-16 px-6">
        <h2 className="text-center text-4xl font-bold text-white mb-6">
          Certifications
        </h2>
        <p className="text-center text-gray-300">{error}</p>
      </section>
    );
  }

  if (!certs.length) return null;

  return (
    <section id="certifications" className="py-16 px-6">
      <h2 className="text-center text-4xl font-bold text-white mb-12">
        Certifications
      </h2>
      <div className="space-y-5 max-w-4xl mx-auto">
        {certs.map((c, index) => (
          <div
            key={c.id || index}
            data-aos="fade-up"
            data-aos-delay={index * 100}
            className="bg-slate-900 border border-slate-700 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white">{c.title}</h3>
            {c.issuer && <p className="text-slate-300">{c.issuer}</p>}
            {c.date && (
              <p className="text-slate-500 text-xs mt-1">{c.date}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Certifications;

