import { useState } from "react";
import { sendContact } from "../api";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      await sendContact(form);
      setStatus("Message sent!");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus("Something went wrong. Try again.");
    }
  };

  return (
    <section id="contact" className="pt-20 pb-32" data-aos="fade-right" data-aos-duration="1200">
      <h2 className="text-4xl font-bold mb-8 text-center">Contact Me</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 max-w-xl mx-auto space-y-5 border"
      >
        <div>
          <label className="block font-semibold mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            name="email"
            value={form.email}
            type="email"
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            placeholder="Your email"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            placeholder="Your message"
          ></textarea>
        </div>

        <button className="bg-blue-600 text-white p-3 rounded-lg w-full hover:bg-blue-700 transition font-semibold">
          Send Message
        </button>

        {status && (
          <p className="text-center text-gray-700 pt-2">{status}</p>
        )}
      </form>
    </section>
  );
}

