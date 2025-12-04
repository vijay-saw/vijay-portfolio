// frontend/src/components/WhyHireMe.jsx
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getWhyHireMe, getPublicWhyHireMe } from "../api";

/**
 * WhyHireMe
 * - If `items` prop given → render that list (public profile)
 * - Else:
 *    - isPublic = true  → site-owner public items
 *    - isPublic = false → logged-in user's items (dashboard)
 */
const WhyHireMe = ({ isPublic = true, items }) => {
  const [cards, setCards] = useState(items || []);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic" });

    if (items !== undefined && items !== null) {
      setCards(items || []);
      AOS.refresh();
      return;
    }

    setError(null);

    if (isPublic) {
      getPublicWhyHireMe()
        .then((res) => {
          setCards(res.data || []);
          AOS.refresh();
        })
        .catch(() => setError("Unable to load highlights."));
      return;
    }

    getWhyHireMe()
      .then((res) => {
        setCards(res.data || []);
        AOS.refresh();
      })
      .catch(() => setError("Unable to load highlights."));
  }, [isPublic, items]);

  if (error) {
    return (
      <section className="py-16 px-6">
        <h2 className="text-center text-4xl font-bold text-white mb-6">
          Why Hire Me?
        </h2>
        <p className="text-center text-gray-300">{error}</p>
      </section>
    );
  }

  if (!cards.length) return null;

  return (
    <section className="py-16 px-6">
      <h2 className="text-center text-4xl font-bold text-white mb-12">
        Why Hire Me?
      </h2>
      <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
        {cards.map((item, index) => (
          <div
            key={item.id || index}
            data-aos="fade-up"
            data-aos-delay={index * 100}
            className="p-6 rounded-xl bg-gradient-to-br from-[#0e1628] to-[#0a1220] border border-white/10 shadow-lg"
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {item.title}
            </h3>
            <p className="text-gray-300">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyHireMe;

