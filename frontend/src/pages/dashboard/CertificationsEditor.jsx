// src/pages/dashboard/CertificationsEditor.jsx
import { useEffect, useState } from "react";
import { getCertifications, updateCertifications } from "../../api";

function CertForm({ cert, onChange, onCancel, onSave, saving }) {
  return (
    <div className="p-4 bg-slate-800 rounded shadow">
      <label className="block mb-2">
        <span className="text-sm text-slate-300">Title</span>
        <input
          name="title"
          value={cert.title}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Certification title"
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm text-slate-300">Issuer</span>
        <input
          name="issuer"
          value={cert.issuer}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Organization (e.g. Coursera, AWS)"
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm text-slate-300">Issue Date</span>
        <input
          name="date"
          value={cert.date}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="YYYY-MM or YYYY"
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm text-slate-300">
          Certificate URL (optional)
        </span>
        <input
          name="url"
          value={cert.url}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="https://..."
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm text-slate-300">Order</span>
        <input
          type="number"
          name="order"
          value={cert.order}
          onChange={onChange}
          className="mt-1 block w-24 rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="0"
        />
      </label>

      <div className="flex gap-3">
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

export default function CertificationsEditor() {
  const [list, setList] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getCertifications()
      .then((res) => {
        const data = res && res.data ? res.data : res;
        const arr = Array.isArray(data) ? data : data.certifications || [];

        const normalized = arr.map((c, idx) => ({
          id: c.id,
          title: c.title || "",
          issuer: c.issuer || "",
          date: c.date || "",
          // backend may not have url field; we keep it for now as link string
          url: c.url || "",
          order:
            typeof c.order === "number"
              ? c.order
              : typeof c.order === "string"
              ? Number(c.order) || idx
              : idx,
        }));
        setList(normalized);
      })
      .catch((err) => {
        console.error("getCertifications error:", err);
        const stored = JSON.parse(
          localStorage.getItem("local_certifications") || "[]"
        );
        setList(Array.isArray(stored) ? stored : []);
        setError(
          "Unable to load certifications from server. Using local fallback if available."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const startAdd = () => {
    setDraft({
      title: "",
      issuer: "",
      date: "",
      url: "",
      order: list.length,
    });
    setEditingIndex(list.length);
    setMsg("");
    setError("");
  };

  const startEdit = (i) => {
    const c = list[i];
    setDraft({ ...c });
    setEditingIndex(i);
    setMsg("");
    setError("");
  };

  const cancelEdit = () => {
    setDraft(null);
    setEditingIndex(-1);
  };

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraft((d) => ({
      ...d,
      [name]:
        name === "order"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const saveDraft = async () => {
    if (!draft.title.trim() || !draft.issuer.trim()) {
      setMsg("Title and Issuer are required");
      setTimeout(() => setMsg(""), 2000);
      return;
    }

    setSaving(true);
    setMsg("");
    setError("");

    const next = [...list];
    const obj = {
      title: draft.title.trim(),
      issuer: draft.issuer.trim(),
      date: draft.date.trim(),
      url: draft.url.trim(),
      order:
        draft.order === "" || typeof draft.order !== "number"
          ? next.length
          : draft.order,
    };

    if (editingIndex >= list.length) next.push(obj);
    else next[editingIndex] = obj;

    try {
      await updateCertifications({ certifications: next });
      setList(next);
      setMsg("Saved");
      cancelEdit();
    } catch (err) {
      console.error("save certifications error:", err);
      try {
        localStorage.setItem(
          "local_certifications",
          JSON.stringify(next)
        );
      } catch (_) {}
      setList(next);
      setMsg("Saved locally (backend unreachable)");
      cancelEdit();
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 2000);
    }
  };

  const deleteCert = async (i) => {
    const next = list.filter((_, idx) => idx !== i);
    setList(next);
    setMsg("");
    setError("");

    try {
      await updateCertifications({ certifications: next });
      setMsg("Removed");
    } catch (err) {
      console.warn("delete cert fallback:", err);
      try {
        localStorage.setItem(
          "local_certifications",
          JSON.stringify(next)
        );
      } catch (_) {}
      setMsg("Removed (saved locally)");
    } finally {
      setTimeout(() => setMsg(""), 2000);
    }
  };

  if (loading) return <div className="p-4">Loading certifications...</div>;

  return (
    <div className="p-4 max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Certifications</h2>

      {error && <div className="mb-3 text-red-400 text-sm">{error}</div>}
      {msg && !error && (
        <div className="mb-3 text-emerald-400 text-sm">{msg}</div>
      )}

      <div className="mb-4">
        <button
          onClick={startAdd}
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500"
        >
          + Add Certification
        </button>
      </div>

      <div className="grid gap-4">
        {list.length === 0 && (
          <div className="text-slate-400">No certifications added yet.</div>
        )}

        {list.map((c, idx) => (
          <div
            key={c.id ?? idx}
            className="p-4 bg-slate-800 rounded border border-slate-700"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold">{c.title}</h3>
                <p className="text-slate-300 text-sm">
                  {c.issuer} {c.date && <>• {c.date}</>}
                </p>
                {c.url && (
                  <p className="mt-2 text-xs">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      View certificate
                    </a>
                  </p>
                )}
                <p className="mt-1 text-[11px] text-slate-500">
                  Order: {c.order}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => startEdit(idx)}
                  className="px-3 py-1 rounded border border-slate-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCert(idx)}
                  className="px-3 py-1 rounded border border-red-600 text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {editingIndex >= 0 && draft && (
          <CertForm
            cert={draft}
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

