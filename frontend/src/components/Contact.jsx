import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!formData.name || !formData.email || !formData.message) {
      return setStatus("Please fill all fields.");
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(formData.email)) {
      return setStatus("Please enter a valid email.");
    }

    try {
      setLoading(true);
       const res = await fetch("http://localhost:8000/api/contact/", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("Something went wrong.");
      }
    } catch (error) {
      setStatus("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-20 px-4 bg-[#050816] text-white"
      data-aos="fade-up"
    >
      <div className="max-w-xl mx-auto">
        <h2
          className="text-center text-4xl font-bold mb-8"
          data-aos="fade-down"
        >
          Contact Me
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          data-aos="fade-up"
          data-aos-delay="150"
        >
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full p-3 rounded bg-[#0b1221] border border-gray-700 focus:border-blue-500 outline-none"
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email"
            className="w-full p-3 rounded bg-[#0b1221] border border-gray-700 focus:border-blue-500 outline-none"
          />

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            placeholder="Your Message"
            className="w-full p-3 rounded bg-[#0b1221] border border-gray-700 focus:border-blue-500 outline-none"
          />

          <button
            disabled={loading}
            type="submit"
            className="w-full p-3 rounded bg-blue-600 hover:bg-blue-700"
            data-aos="fade-up"
            data-aos-delay="250"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>

          {status && (
            <p className="text-center text-green-400 mt-2">{status}</p>
          )}
        </form>
      </div>
    </section>
  );
}

