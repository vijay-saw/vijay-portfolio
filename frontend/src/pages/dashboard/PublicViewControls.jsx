// src/pages/dashboard/PublicViewControls.jsx
import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../api.js";

export default function PublicViewControls() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Default owner username from Vite env (same as Hero)
  const defaultOwner =
    (import.meta &&
      import.meta.env &&
      import.meta.env.VITE_DEFAULT_OWNER_USERNAME) ||
    "vijay";

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data || res);
    } catch (e) {
      setError("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (!profile) return null;

  const isOwner = profile.username === defaultOwner;

  // ✅ Owner → root ("/"), others → /public/username
  const publicUrl = isOwner
    ? `${window.location.origin}/`
    : `${window.location.origin}/public/${profile.username}`;

  const togglePublic = async () => {
    setSaving(true);
    try {
      await updateProfile({ public: !profile.public });
      setProfile({ ...profile, public: !profile.public });
    } catch {
      alert("Failed to update.");
    }
    setSaving(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(publicUrl);
    alert("Copied!");
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl shadow">
      <h2 className="text-xl font-bold text-indigo-400 mb-4">
        Your Public Portfolio
      </h2>

      <p className="text-slate-300 mb-2">
        <strong>URL:</strong>{" "}
        <a
          href={publicUrl}
          target="_blank"
          className="text-indigo-400 underline"
        >
          {publicUrl}
        </a>
      </p>

      {isOwner && (
        <p className="text-xs text-slate-500 mb-2">
          (You are the site owner, so your public portfolio is shown on the
          homepage.)
        </p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => window.open(publicUrl, "_blank")}
          className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
        >
          View Public Profile
        </button>

        <button
          onClick={copy}
          className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
        >
          Copy Link
        </button>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <label>Public:</label>
        <input
          type="checkbox"
          checked={profile.public}
          disabled={saving}
          onChange={togglePublic}
          className="w-5 h-5 accent-indigo-500"
        />
      </div>
    </div>
  );
}

