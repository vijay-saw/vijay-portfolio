// src/pages/dashboard/ProjectsEditor.jsx
import { useEffect, useState } from "react";
import { getProjects, updateProjects } from "../../api";

function ProjectForm({ project, onChange, onCancel, onSave, saving }) {
  return (
    <div className="p-4 bg-slate-800 rounded shadow">
      <label className="block mb-2">
        <span className="text-sm text-slate-300">Title</span>
        <input
          name="title"
          value={project.title}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Project title"
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm text-slate-300">Description</span>
        <textarea
          name="description"
          value={project.description}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          rows={3}
          placeholder="Short description"
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm text-slate-300">Tech stack (comma separated)</span>
        <input
          name="tech_stack"
          value={project.tech_stack}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="React, Node, Docker"
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm text-slate-300">GitHub / Repo link</span>
        <input
          name="github_url"
          value={project.github_url}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="https://github.com/..."
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm text-slate-300">Demo / Live link</span>
        <input
          name="demo_url"
          value={project.demo_url}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="https://..."
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm text-slate-300">Image URL (optional)</span>
        <input
          name="project_image"
          value={project.project_image}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="https://..."
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            name="highlight"
            checked={!!project.highlight}
            onChange={onChange}
            className="h-4 w-4"
          />
          <span className="text-sm text-slate-300">
            Highlight this project on the portfolio
          </span>
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Order</span>
          <input
            type="number"
            name="order"
            value={project.order}
            onChange={onChange}
            className="mt-1 block w-24 rounded border border-slate-700 bg-slate-900 px-3 py-2"
            placeholder="0"
          />
        </label>
      </div>

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

export default function ProjectsEditor() {
  const [projects, setProjects] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1); // -1 means not editing
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getProjects()
      .then((res) => {
        const data = res && res.data ? res.data : res;
        const list = Array.isArray(data) ? data : data.projects || [];

        const normalized = list.map((p, idx) => ({
          id: p.id,
          title: p.title || "",
          description: p.description || "",
          tech_stack: p.tech_stack || "",
          github_url: p.github_url || "",
          demo_url: p.demo_url || "",
          project_image: p.project_image || "",
          highlight: !!p.highlight,
          order:
            typeof p.order === "number"
              ? p.order
              : typeof p.order === "string"
              ? Number(p.order) || idx
              : idx,
        }));

        setProjects(normalized);
      })
      .catch((err) => {
        console.error("getProjects error:", err);
        const stored = JSON.parse(
          localStorage.getItem("local_projects") || "[]"
        );
        setProjects(Array.isArray(stored) ? stored : []);
        setError(
          "Unable to load projects from server. Using local fallback if available."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const startAdd = () => {
    setDraft({
      title: "",
      description: "",
      tech_stack: "",
      github_url: "",
      demo_url: "",
      project_image: "",
      highlight: false,
      order: projects.length,
    });
    setEditingIndex(projects.length); // new item index
    setMessage("");
    setError("");
  };

  const startEdit = (idx) => {
    const p = projects[idx];
    setDraft({ ...p });
    setEditingIndex(idx);
    setMessage("");
    setError("");
  };

  const handleDraftChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDraft((d) => ({
      ...d,
      [name]:
        type === "checkbox"
          ? checked
          : name === "order"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const cancelEdit = () => {
    setDraft(null);
    setEditingIndex(-1);
  };

  const saveDraft = async () => {
    if (!draft.title.trim()) {
      setMessage("Project title is required");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const projectObj = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      tech_stack: draft.tech_stack.trim(),
      github_url: draft.github_url.trim(),
      demo_url: draft.demo_url.trim(),
      project_image: draft.project_image.trim(),
      highlight: !!draft.highlight,
      order:
        draft.order === "" || typeof draft.order !== "number"
          ? projects.length
          : draft.order,
    };

    const next = [...projects];
    if (editingIndex >= projects.length) {
      next.push(projectObj);
    } else {
      next[editingIndex] = projectObj;
    }

    try {
      await updateProjects({ projects: next });
      setProjects(next);
      setMessage("Projects saved");
      cancelEdit();
    } catch (err) {
      console.error("updateProjects error:", err);
      setError("Failed to save projects (saved locally).");
      try {
        localStorage.setItem("local_projects", JSON.stringify(next));
      } catch (_) {}
      setProjects(next);
      cancelEdit();
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 2500);
    }
  };

  const deleteProject = async (idx) => {
    const next = projects.filter((_, i) => i !== idx);
    setProjects(next);
    setMessage("");
    setError("");

    try {
      await updateProjects({ projects: next });
      setMessage("Project removed");
    } catch (err) {
      console.warn("deleteProject fallback local:", err);
      try {
        localStorage.setItem("local_projects", JSON.stringify(next));
      } catch (_) {}
      setMessage("Project removed (saved locally)");
    } finally {
      setTimeout(() => setMessage(""), 2000);
    }
  };

  if (loading) return <div className="p-4">Loading projects...</div>;

  return (
    <div className="p-4 max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Projects</h2>

      {error && <div className="mb-3 text-red-400 text-sm">{error}</div>}
      {message && !error && (
        <div className="mb-3 text-emerald-400 text-sm">{message}</div>
      )}

      <div className="mb-4">
        <button
          onClick={startAdd}
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500"
        >
          + Add Project
        </button>
      </div>

      <div className="grid gap-4">
        {projects.length === 0 && (
          <div className="text-slate-400">No projects added yet.</div>
        )}

        {projects.map((p, idx) => (
          <div
            key={p.id ?? idx}
            className="p-4 bg-slate-800 rounded border border-slate-700"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="text-slate-300 text-sm">{p.description}</p>

                {p.tech_stack && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {p.tech_stack
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 bg-slate-700 rounded"
                        >
                          {t}
                        </span>
                      ))}
                  </div>
                )}

                <div className="mt-2 text-xs text-slate-400 flex gap-3 flex-wrap">
                  {p.github_url && (
                    <a
                      href={p.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Repo
                    </a>
                  )}
                  {p.demo_url && (
                    <a
                      href={p.demo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Live
                    </a>
                  )}
                  {p.highlight && (
                    <span className="px-2 py-0.5 bg-emerald-600/30 text-emerald-300 rounded text-[11px]">
                      Highlight
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => startEdit(idx)}
                  className="px-3 py-1 rounded border border-slate-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProject(idx)}
                  className="px-3 py-1 rounded border border-red-600 text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Editor form */}
        {editingIndex >= 0 && draft && (
          <ProjectForm
            project={draft}
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

