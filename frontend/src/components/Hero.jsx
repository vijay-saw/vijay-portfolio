// src/components/Hero.jsx
import { useEffect, useState } from "react";
import { getProfile } from "../api";

const Hero = () => {
  const [profile, setProfile] = useState(null);

  const scrollToContact = () => {
    const section = document.getElementById("contact");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    getProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!profile) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-10 pt-14 text-center sm:flex-row sm:text-left">

      {/* Profile Image */}
      <div className="relative">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 opacity-60 blur-md" />

        <img
          src={profile.photo}
          alt={profile.name}
          className="relative h-40 w-40 rounded-full border border-slate-700 object-cover shadow-xl sm:h-48 sm:w-48"
        />
      </div>

      {/* Details */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-indigo-300">
          CLOUD · DEVOPS · SRE
        </p>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl md:text-5xl">
          {profile.name}
        </h1>

        <p className="mt-2 text-lg font-medium text-indigo-200">
          {profile.role}
        </p>

        <p className="mt-4 max-w-xl text-sm text-slate-300 md:text-base">
          {profile.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">

          <button
            onClick={scrollToContact}
            className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:bg-indigo-400"
          >
            Hire me
          </button>

          {profile.resume && (
            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-400 hover:text-indigo-300"
            >
              Download Resume
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;

