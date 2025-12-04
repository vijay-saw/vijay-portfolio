// src/pages/dashboard/ExperienceEditor.jsx
import { useEffect, useState } from "react";
import { getExperience, updateExperience } from "../../api";

function ExperienceForm({ exp, onChange, onCancel, onSave, saving }) {
  return (
    <div className="p-4 bg-slate-800 rounded shadow">
      <label className="block mb-2">
        <span className="text-sm text-slate-300">Company / Org</span>
        <input
          name="company"
          value={exp.company}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Company name"
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm text-slate-300">Role / Title</span>
        <input
          name="role"
          value={exp.role}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Senior DevOps Engineer"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block mb-2">
          <span className="text-sm text-slate-300">Start Date</span>
          <input
            name="start"
            value={exp.start}
            onChange={onChange}
            className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
            placeholder="YYYY-MM (e.g. 2023-06)"
          />
        </label>

        <label className="block mb-2">
          <span className="text-sm text-slate-300">
            End Date (or leave blank if current)
          </span>
          <input
            name="end"
            value={exp.end}
            onChange={onChange}
            className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
            placeholder="YYYY-MM or Present"
            disabled={exp.is_current}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 mb-2 mt-1">
        <input
          type="checkbox"
          name="is_current"
          checked={!!exp.is_current}
          onChange={onChange}
          className="h-4 w-4"
        />
        <span className="text-sm text-slate-300">
          I am currently working in this role
        </span>
      </label>

      <label className="block mb-2">
        <span className="text-sm text-slate-300">Location</span>
        <input
          name="location"
          value={exp.location}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="City, Country"
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm text-slate-300">
          Description / Achievements
        </span>
        <textarea
          name="description"
          value={exp.description}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          rows={4}
          placeholder="Brief bullets or summary"
        />
      </label>

      <div className="flex gap-3 mt-3">
        <button
          onClick={onSave}
          disabled={saving}
          className={`px-4 py-2 rounded ${
            saving ? "bg-slate-700" : "bg-indigo-600 hover:bg-indigo-500"
          }`}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded border border-slate-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ExperienceEditor() {
  const [exps, setExps] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    getExperience()
      .then((res) => {
        const data = res && res.data ? res.data : res;
        const raw = Array.isArray(data) ? data : data.experience || [];

        const normalized = raw.map((e, idx) => ({
          company: e.company || "",
          role: e.role || "",
          start: e.start_date || "",
          end:
            e.end_date && e.end_date !== "Present" ? e.end_date : "",
          location: "", // optional, not stored in backend
          description: e.description || "",
          is_current: !!e.is_current,
          order:
            typeof e.order === "number"
              ? e.order
              : typeof e.order === "string"
              ? Number(e.order) || idx
              : idx,
        }));

        setExps(normalized);
      })
      .catch(() => {
        const stored = JSON.parse(
          localStorage.getItem("local_experience") || "[]"
        );
        setExps(Array.isArray(stored) ? stored : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const startAdd = () => {
    setDraft({
      company: "",
      role: "",
      start: "",
      end: "",
      location: "",
      description: "",
      is_current: false,
      order: exps.length,
    });
    setEditingIndex(exps.length);
    setMsg("");
  };

  const startEdit = (i) => {
    const e = exps[i];
    setDraft({ ...e });
    setEditingIndex(i);
    setMsg("");
  };

  const cancelEdit = () => {
    setDraft(null);
    setEditingIndex(-1);
  };

  const handleDraftChange = (ev) => {
    const { name, value, type, checked } = ev.target;
    setDraft((d) => ({
      ...d,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "is_current" && checked
        ? { end: "" }
        : {}),
    }));
  };

  const saveDraft = async () => {
    if (!draft.company.trim() || !draft.role.trim()) {
      setMsg("Company and Role are required");
      setTimeout(() => setMsg(""), 2000);
      return;
    }

    setSaving(true);
    const next = [...exps];
    const obj = {
      company: draft.company.trim(),
      role: draft.role.trim(),
      start: draft.start.trim(),
      end: draft.end.trim(),
      location: draft.location.trim(),
      description: draft.description.trim(),
      is_current: !!draft.is_current,
      order:
        typeof draft.order === "number"
          ? draft.order
          : next.length,
    };

    if (editingIndex >= exps.length) next.push(obj);
    else next[editingIndex] = obj;

    try {
      await updateExperience({ experience: next });
      setExps(next);
      setMsg("Saved");
      cancelEdit();
    } catch (err) {
      console.error("save experience error:", err);
      localStorage.setItem("local_experience", JSON.stringify(next));
      setExps(next);
      setMsg("Saved locally (backend unreachable)");
      cancelEdit();
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 2000);
    }
  };

  const deleteExp = async (i) => {
    const next = exps.filter((_, idx) => idx !== i);
    setExps(next);
    try {
      await updateExperience({ experience: next });
      setMsg("Removed");
    } catch (err) {
      console.warn("delete experience fallback:", err);
      localStorage.setItem("local_experience", JSON.stringify(next));
      setMsg("Removed (saved locally)");
    } finally {
      setTimeout(() => setMsg(""), 2000);
    }
  };

  if (loading) return <div className="p-4">Loading experience...</div>;

  return (
    <div className="p-4 max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Experience</h2>

      {msg && <div className="mb-3 text-emerald-400">{msg}</div>}

      <div className="mb-4">
        <button
          onClick={startAdd}
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500"
        >
          + Add Experience
        </button>
      </div>

      <div className="grid gap-4">
        {exps.length === 0 && (
          <div className="text-slate-400">No experience entries yet.</div>
        )}

        {exps.map((e, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-800 rounded border border-slate-700"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {e.role} — {e.company}
                </h3>
                <p className="text-slate-300 text-sm">
                  {e.start || "?"} —{" "}
                  {e.is_current
                    ? "Present"
                    : e.end || "?"}
                </p>
                {e.description && (
                  <p className="mt-2 text-slate-300 text-sm">
                    {e.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => startEdit(idx)}
                  className="px-3 py-1 rounded border border-slate-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteExp(idx)}
                  className="px-3 py-1 rounded border border-red-600 text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {editingIndex >= 0 && draft && (
          <ExperienceForm
            exp={draft}
            onChange={handleDraftChange}
            onCancel={cancelEdit}
            onSave={saveDraft}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

