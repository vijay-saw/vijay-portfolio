// src/pages/dashboard/ThemeSelector.jsx
import { useEffect, useState } from "react";
import { updateTheme, getProfile } from "../../api";

const THEMES = [
  { id: "default", name: "Default (Dark)" },
  { id: "light", name: "Light" },
  { id: "minimal", name: "Minimal" },
  { id: "vibrant", name: "Vibrant" },
];

function applyThemeToBody(themeId) {
  if (typeof document !== "undefined") {
    document.body.dataset.theme = themeId;
  }
}

export default function ThemeSelector() {
  const [selected, setSelected] = useState("default");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    let initial = "default";

    try {
      const global = JSON.parse(
        localStorage.getItem("local_theme") || "null"
      );
      if (global && typeof global === "string") {
        initial = global;
      }
    } catch (_) {}

    getProfile()
      .then((res) => {
        const data = res && res.data ? res.data : res;
        if (data && data.username) {
          setUsername(data.username);
          try {
            const userTheme = JSON.parse(
              localStorage.getItem(`local_theme_${data.username}`) || "null"
            );
            if (userTheme && typeof userTheme === "string") {
              initial = userTheme;
            }
          } catch (_) {}
        }
      })
      .catch(() => {})
      .finally(() => {
        setSelected(initial);
        applyThemeToBody(initial);
      });
  }, []);

  const handleSelect = (id) => {
    setSelected(id);
    applyThemeToBody(id);
    setMsg("");
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg("");

    // Save locally regardless of backend
    try {
      if (username) {
        localStorage.setItem(
          `local_theme_${username}`,
          JSON.stringify(selected)
        );
      } else {
        localStorage.setItem("local_theme", JSON.stringify(selected));
      }
    } catch (_) {}

    try {
      await updateTheme({ theme: selected, username: username || undefined });
      setMsg("Theme saved");
    } catch (err) {
      console.warn("updateTheme error:", err);
      setMsg("Theme saved locally");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 2500);
    }
  };

  const handlePreview = () => {
    applyThemeToBody(selected);
  };

  return (
    <div className="p-4 max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Theme Selector</h2>

      {msg && <div className="mb-3 text-emerald-400 text-sm">{msg}</div>}

      <div className="grid sm:grid-cols-2 gap-3">
        {THEMES.map((t) => (
          <label
            key={t.id}
            className={`p-3 border rounded cursor-pointer ${
              selected === t.id
                ? "border-indigo-500 bg-slate-800"
                : "border-slate-700 bg-slate-900"
            }`}
          >
            <input
              type="radio"
              name="theme"
              value={t.id}
              checked={selected === t.id}
              onChange={() => handleSelect(t.id)}
              className="mr-2"
            />
            <span className="font-medium">{t.name}</span>
            <p className="text-xs text-slate-400 mt-1">
              Preview style for {t.name}
            </p>
          </label>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded ${
            saving ? "bg-slate-700" : "bg-indigo-600 hover:bg-indigo-500"
          }`}
        >
          {saving ? "Saving..." : "Save Theme"}
        </button>

        <button
          onClick={handlePreview}
          className="px-4 py-2 rounded border border-slate-700"
        >
          Preview
        </button>
      </div>
    </div>
  );
}

