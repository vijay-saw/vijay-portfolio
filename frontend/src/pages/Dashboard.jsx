// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import {
  getMe,
  getProfile,
  getSkills,
  getProjects,
  getExperience,
  getCertifications,
  updateProfile,
} from "../api";

// Editors / Panels
import SkillsEditor from "./dashboard/SkillsEditor";
import ProjectsEditor from "./dashboard/ProjectsEditor";
import ExperienceEditor from "./dashboard/ExperienceEditor";
import CertificationsEditor from "./dashboard/CertificationsEditor";
import ThemeSelector from "./dashboard/ThemeSelector";
import ProfileEditor from "./dashboard/ProfileEditor";
import MessagesPanel from "./dashboard/MessagesPanel.jsx";
import PublicViewControls from "./dashboard/PublicViewControls.jsx";

const SIDEBAR = [
  { key: "profile", label: "Profile Info" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "experience", label: "Experience" },
  { key: "certifications", label: "Certifications" },
  { key: "themes", label: "Themes" },
  { key: "public", label: "My Public Portfolio" },
  { key: "messages", label: "Messages" },
];

const DASHBOARD_ACTIVE_KEY = "dashboard_active_section";

function Sidebar({ active, setActive, unreadCount }) {
  const handleDashboardClick = () => {
    setActive("profile");

    // Smooth scroll to top of main content
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-screen p-6">
      {/* CLICKABLE Dashboard heading */}
      <h2
        onClick={handleDashboardClick}
        className="text-2xl font-bold text-indigo-400 mb-6 cursor-pointer hover:text-indigo-300 transition-colors"
      >
        Dashboard
      </h2>

      <nav className="flex flex-col gap-3">
        {SIDEBAR.map((s) => {
          const isActive = active === s.key;
          const baseClasses =
            "text-left px-3 py-2 rounded transition-colors flex items-center justify-between gap-2";
          const colorClasses = isActive
            ? "bg-slate-800 text-white"
            : "text-slate-300 hover:bg-slate-800";

          const showUnreadBadge = s.key === "messages" && unreadCount > 0;

          return (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`${baseClasses} ${colorClasses}`}
            >
              <span>{s.label}</span>
              {showUnreadBadge && (
                <span className="inline-flex items-center justify-center text-[11px] min-w-[18px] h-[18px] rounded-full bg-red-500 text-white px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default function Dashboard() {
  const { setUser } = useAuth();

  const [active, setActive] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [unreadCount, setUnreadCount] = useState(0); // 👈 NEW

  // Load profile
  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const me = await getMe();
      setProfile(me);
    } catch (err) {
      console.error("fetch profile error:", err);
      setProfileError("Unable to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // On mount: load profile + restore last active section from localStorage
  useEffect(() => {
    fetchProfile();

    try {
      const saved = window.localStorage.getItem(DASHBOARD_ACTIVE_KEY);
      if (saved && SIDEBAR.some((s) => s.key === saved)) {
        setActive(saved);
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }, []);

  // When changing tab, also persist it
  const handleSetActive = (key) => {
    setActive(key);
    try {
      window.localStorage.setItem(DASHBOARD_ACTIVE_KEY, key);
    } catch (e) {
      // ignore localStorage errors
    }
  };

  const displayName =
    profile?.full_name || profile?.username || profile?.email || "";

  const username = profile?.username;

  // Adjust this line if your field name is different (e.g. profile.is_public_profile)
  const isPublic = profile?.is_public ?? profile?.public ?? false;

  const publicUrl = username
    ? `${window.location.origin}/public/${username}`
    : null;

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyStatus("Link copied!");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch (e) {
      console.error("copy link error:", e);
      setCopyStatus("Failed to copy");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar
        active={active}
        setActive={handleSetActive}
        unreadCount={unreadCount} // 👈 pass into sidebar
      />

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Top header / greeting + quick public-link actions */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Welcome{displayName ? `, ${displayName}` : ""} 👋
              </h1>
              <p className="text-sm text-slate-400">
                Manage your portfolio content, themes, and messages from one place.
              </p>
            </div>

            {publicUrl && (
              <div className="flex flex-col items-end gap-1 text-right">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    Public portfolio
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      isPublic
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-800 text-slate-300 border-slate-600"
                    }`}
                  >
                    {isPublic ? "Live" : "Private"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                  <a
                    href={isPublic ? publicUrl : undefined}
                    target={isPublic ? "_blank" : undefined}
                    rel={isPublic ? "noreferrer" : undefined}
                    onClick={(e) => {
                      if (!isPublic) e.preventDefault();
                    }}
                    className={`px-3 py-1.5 text-xs rounded font-medium ${
                      isPublic
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    }`}
                  >
                    {isPublic ? "View Public Profile" : "Not public yet"}
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 text-xs rounded border border-slate-600 text-slate-200 hover:bg-slate-800"
                  >
                    Copy Link
                  </button>
                </div>

                {copyStatus && (
                  <span className="text-[11px] text-emerald-300 mt-0.5">
                    {copyStatus}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Panels */}
          {active === "profile" && (
            <ProfileEditor
              profile={profile}
              loading={profileLoading}
              error={profileError}
              refresh={fetchProfile}
            />
          )}

          {active === "skills" && <SkillsEditor />}
          {active === "projects" && <ProjectsEditor />}
          {active === "experience" && <ExperienceEditor />}
          {active === "certifications" && <CertificationsEditor />}
          {active === "themes" && <ThemeSelector />}

          {/* Public portfolio settings page (more detailed controls) */}
          {active === "public" && <PublicViewControls />}

          {active === "messages" && (
            <MessagesPanel
              onUnreadChange={setUnreadCount} // 👈 Messages will call this
            />
          )}
        </div>
      </main>
    </div>
  );
}

