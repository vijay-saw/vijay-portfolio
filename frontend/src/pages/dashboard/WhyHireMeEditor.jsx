// src/pages/dashboard/WhyHireMeEditor.jsx
import { useEffect, useState } from "react";
import { getWhyHireMe, updateWhyHireMe } from "../../api";

export default function WhyHireMeEditor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load WhyHireMe items
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getWhyHireMe();
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load WhyHireMe:", err);
        setError("Unable to load Why Hire Me items.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add new row
  const addItem = () => {
    setItems([
      ...items,
      { title: "", description: "", icon: "", priority: items.length },
    ]);
  };

  // Update field
  const updateField = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Delete row
  const deleteItem = (index) => {
    if (!confirm("Delete this item?")) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Save to API (PUT bulk update)
  const saveItems = async () => {
    setSaving(true);
    setError("");

    // Sanitize payload
    const payload = items.map((item, index) => ({
      title: item.title?.trim() || "",
      description: item.description?.trim() || "",
      icon: item.icon?.trim() || "",
      priority: item.priority ?? index,
    }));

    try {
      await updateWhyHireMe(payload); // API call
      alert("Saved successfully!");
    } catch (err) {
      console.error("Save failed:", err);
      setError("Failed to save items. Check console.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-slate-300 text-center">Loading...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Why Hire Me</h2>

      {error && (
        <p className="text-red-400 text-sm mb-4">
          {error}
        </p>
      )}

      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-5 bg-slate-900 border border-slate-700 rounded-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={item.title}
                onChange={(e) => updateField(index, "title", e.target.value)}
                className="p-2 rounded bg-slate-800 border border-slate-700"
              />

              <input
                type="text"
                placeholder="Icon (emoji or text)"
                value={item.icon}
                onChange={(e) => updateField(index, "icon", e.target.value)}
                className="p-2 rounded bg-slate-800 border border-slate-700"
              />
            </div>

            <textarea
              placeholder="Description"
              rows="3"
              value={item.description}
              onChange={(e) =>
                updateField(index, "description", e.target.value)
              }
              className="w-full mt-3 p-2 rounded bg-slate-800 border border-slate-700"
            />

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-400">Priority:</label>
                <input
                  type="number"
                  value={item.priority ?? index}
                  onChange={(e) =>
                    updateField(index, "priority", Number(e.target.value))
                  }
                  className="w-20 p-1 rounded bg-slate-800 border border-slate-700"
                />
              </div>

              <button
                onClick={() => deleteItem(index)}
                className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addItem}
          className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
        >
          + Add Item
        </button>

        <button
          onClick={saveItems}
          disabled={saving}
          className="px-5 py-2 bg-green-600 rounded hover:bg-green-500 ml-3 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

