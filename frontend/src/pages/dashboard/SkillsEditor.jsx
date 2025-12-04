// src/pages/dashboard/SkillsEditor.jsx
import { useEffect, useState } from "react";
import { getSkills, updateSkills } from "../../api";

/**
 * SkillsEditor
 * - Matches Django Skill model: category, name, level, order
 * - Uses private /skills/ API (user-owned)
 * - Allows add/remove/edit + bulk save
 */
export default function SkillsEditor() {
  const [skills, setSkills] = useState([]); // [{id?, category, name, level, order}]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load skills for logged-in user
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    getSkills()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        if (!mounted) return;

        // Ensure each has all fields
        const normalized = data.map((s, idx) => ({
          id: s.id,
          category: s.category || "",
          name: s.name || "",
          level: s.level || "",
          order:
            typeof s.order === "number"
              ? s.order
              : typeof s.order === "string"
              ? Number(s.order) || idx
              : idx,
        }));
        setSkills(normalized);
      })
      .catch((err) => {
        console.error("Error loading skills:", err);
        if (mounted) setError("Unable to load skills. Please try again.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (index, field, value) => {
    setSkills((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              [field]:
                field === "order" ? (value === "" ? "" : Number(value)) : value,
            }
          : s
      )
    );
    setMessage("");
    setError("");
  };

  const addSkill = () => {
    setSkills((prev) => [
      ...prev,
      {
        category: "",
        name: "",
        level: "",
        order: prev.length,
      },
    ]);
    setMessage("");
  };

  const removeSkill = (index) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
    setMessage("");
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    // Basic validation: name required
    const invalid = skills.some((s) => !s.name.trim());
    if (invalid) {
      setSaving(false);
      setError("Each skill must have a name.");
      return;
    }

    try {
      // api.updateSkills can accept an array directly
      const payload = skills.map((s, idx) => ({
        // don't send id; backend bulk_update recreates them
        category: s.category || "",
        name: s.name.trim(),
        level: s.level || "",
        order:
          s.order === "" || typeof s.order !== "number" ? idx : s.order,
      }));

      await updateSkills(payload);
      setMessage("Skills saved successfully!");
    } catch (err) {
      console.error("Error saving skills:", err);
      setError("Failed to save skills. Check console/logs.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 2500);
    }
  };

  const handleReset = () => {
    // Hard reload from server
    setLoading(true);
    setError("");
    getSkills()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const normalized = data.map((s, idx) => ({
          id: s.id,
          category: s.category || "",
          name: s.name || "",
          level: s.level || "",
          order:
            typeof s.order === "number"
              ? s.order
              : typeof s.order === "string"
              ? Number(s.order) || idx
              : idx,
        }));
        setSkills(normalized);
      })
      .catch((err) => {
        console.error("Error reloading skills:", err);
        setError("Unable to reload skills.");
      })
      .finally(() => setLoading(false));
  };

  if (loading) return <div className="p-4">Loading skills...</div>;

  return (
    <div className="p-4 max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Skills</h2>

      {error && <div className="mb-3 text-red-400 text-sm">{error}</div>}
      {message && (
        <div className="mb-3 text-emerald-400 text-sm">{message}</div>
      )}

      <div className="overflow-x-auto mb-4">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-slate-200">
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Level</th>
              <th className="px-3 py-2 text-left w-20">Order</th>
              <th className="px-3 py-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {skills.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  No skills yet. Click “Add skill” to create one.
                </td>
              </tr>
            )}
            {skills.map((s, index) => (
              <tr
                key={s.id ?? index}
                className="border-b border-slate-800 last:border-b-0"
              >
                <td className="px-3 py-2">
                  <input
                    value={s.category}
                    onChange={(e) =>
                      handleChange(index, "category", e.target.value)
                    }
                    className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
                    placeholder="e.g. Cloud, DevOps"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={s.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
                    placeholder="e.g. AWS, Docker"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={s.level}
                    onChange={(e) =>
                      handleChange(index, "level", e.target.value)
                    }
                    className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
                    placeholder="Beginner / Intermediate / Expert"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={s.order}
                    onChange={(e) =>
                      handleChange(index, "order", e.target.value)
                    }
                    className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={addSkill}
          className="px-4 py-2 rounded bg-slate-800 border border-slate-600 hover:border-indigo-400"
        >
          Add skill
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded ${
            saving ? "bg-slate-700" : "bg-indigo-600 hover:bg-indigo-500"
          }`}
        >
          {saving ? "Saving..." : "Save Skills"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded border border-slate-700"
        >
          Reset from server
        </button>
      </div>
    </div>
  );
}

