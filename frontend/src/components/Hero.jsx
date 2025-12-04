// frontend/src/components/Hero.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicProfile } from "../api";
import { useAuth } from "../auth/AuthProvider";

/**
 * Hero component
 *
 * - On HOME page: no props → it loads the DEFAULT owner (Vijay).
 * - On PUBLIC page later: we can pass `profile` (already loaded) OR `username`.
 *   If `profile` prop is given, it will NOT call the API again.
 */
const Hero = ({ username, profile: profileProp }) => {
  const [profile, setProfile] = useState(profileProp || null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const scrollToContact = () => {
    const section = document.getElementById("contact");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  // Default owner for homepage (from env or fallback)
  const defaultOwner =
    (import.meta &&
      import.meta.env &&
      import.meta.env.VITE_DEFAULT_OWNER_USERNAME) ||
    "vijay";

  // If username prop is provided (for public profile), use that.
  // Otherwise use defaultOwner (homepage).
  const effectiveUsername = username || defaultOwner;

  useEffect(() => {
    // If parent already passed a profile object, just use it.
    if (profileProp) {
      setProfile(profileProp);
      setError(null);
      return;
    }

    setError(null);
    setProfile(null);

    getPublicProfile(effectiveUsername)
      .then((res) => {
        const data = res?.data || res;
        setProfile(data);
      })
      .catch((err) => {
        console.error("Failed to load public profile:", err);
        setError("Profile not found.");
      });
  }, [effectiveUsername, profileProp]);

  if (error) {
    return (
      <div className="py-14 text-center">
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  if (!profile) return null;

  const isOwner =
    isAuthenticated &&
    user &&
    user.username &&
    user.username === effectiveUsername;

  const handlePrimaryCta = () => {
    if (isOwner) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  const primaryLabel = isOwner ? "Go to Dashboard" : "Create Your Portfolio";

  return (
    <div className="flex flex-col items-center justify-center gap-10 pt-14 text-center sm:flex-row sm:text-left">
      <div className="relative">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 opacity-60 blur-md" />

        <img
          src={profile.photo}
          alt={profile.name}
          className="relative h-40 w-40 rounded-full border border-slate-700 object-cover shadow-xl sm:h-48 sm:w-48"
        />
      </div>

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

          {/* CTA for visitors / owners */}
          <button
            onClick={handlePrimaryCta}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;

