import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { getWhyHireMe } from "/src/api";

const WhyHireMe = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-out-cubic" });

    getWhyHireMe()
      .then(res => {
        setItems(res.data);
        AOS.refresh();  // IMPORTANT for newly loaded content
      })
      .catch(err => console.error("Error loading WhyHireMe:", err));
  }, []);

  return (
    <section className="py-20 px-6 md:px-20">
      <h2 
        className="text-center text-4xl font-bold text-white mb-14"
        data-aos="fade-up"
      >
        Why Hire Me?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {items.map((item, index) => (
          <div
            key={index}
            data-aos="fade-up"
            data-aos-delay={index * 150}   // Stagger animation
            className="p-8 rounded-xl bg-gradient-to-br from-[#0e1628] to-[#0a1220] border border-white/10 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300"
          >
            <div className="text-4xl mb-4">{item.icon}</div>

            <h3 className="text-xl font-semibold text-white mb-3">
              {item.title}
            </h3>

            <p className="text-gray-300 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyHireMe;

