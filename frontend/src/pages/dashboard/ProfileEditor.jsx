// src/pages/dashboard/ProfileEditor.jsx
import { useEffect, useState } from "react";
import { updateProfile } from "../../api";

export default function ProfileEditor({
  profile,
  loading,
  error,
  refresh,
}) {
  const [form, setForm] = useState({
    name: "",
    username: "",
    role: "",
    summary: "",
    location: "",
    email: "",
    linkedin: "",
    github: "",
    photo: "",   // existing photo URL/path from backend
    resume: "",  // existing resume URL/path from backend
    public: false,
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  // When profile is loaded from parent, populate form
  useEffect(() => {
    if (!profile) return;

    setForm({
      name: profile.name || "",
      username: profile.username || "",
      role: profile.role || "",
      summary: profile.summary || "",
      location: profile.location || "",
      email: profile.email || "",
      linkedin: profile.linkedin || "",
      github: profile.github || "",
      photo: profile.photo || "",
      resume: profile.resume || "",
      public: !!profile.public,
    });

    setPhotoFile(null);
    setResumeFile(null);
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccess("");
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (type === "photo") {
      setPhotoFile(file);
    } else if (type === "resume") {
      setResumeFile(file);
    }
    setSuccess("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.username.trim()) e.username = "Username is required";

    if (form.linkedin && !/^https?:\/\//.test(form.linkedin)) {
      e.linkedin = "LinkedIn must be a valid URL";
    }
    if (form.github && !/^https?:\/\//.test(form.github)) {
      e.github = "GitHub must be a valid URL";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSuccess("");
    setErrors({});

    // Build FormData so we can send optional files
    const fd = new FormData();

    // text fields
    fd.append("name", form.name);
    fd.append("username", form.username);
    fd.append("role", form.role);
    fd.append("summary", form.summary);
    fd.append("location", form.location);
    fd.append("email", form.email);
    fd.append("linkedin", form.linkedin);
    fd.append("github", form.github);
    fd.append("public", form.public ? "true" : "false");

    // only send files if user selected them (not mandatory)
    if (photoFile) {
      fd.append("photo", photoFile);
    }
    if (resumeFile) {
      fd.append("resume", resumeFile);
    }

    try {
      const saved = await updateProfile(fd);
      setSuccess("Profile updated successfully!");

      // update local form with server response (new URLs)
      setForm((prev) => ({
        ...prev,
        photo: saved.photo || prev.photo,
        resume: saved.resume || prev.resume,
      }));

      setPhotoFile(null);
      setResumeFile(null);

      if (typeof refresh === "function") {
        refresh();
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setErrors((prev) => ({
        ...prev,
        form: "Failed to save profile. Please try again.",
      }));
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(""), 2500);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  if (error) {
    return (
      <div className="p-4 text-red-400">
        Failed to load profile: {error}
      </div>
    );
  }

  const publicUrl =
    form.username && typeof window !== "undefined"
      ? `${window.location.origin}/public/${form.username}`
      : "";

  return (
    <div className="p-4 max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Profile Info</h2>

      {errors.form && (
        <div className="mb-4 text-red-400 text-sm">{errors.form}</div>
      )}
      {success && (
        <div className="mb-4 text-emerald-400 text-sm">{success}</div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {/* Full name */}
        <label className="block">
          <span className="text-sm text-slate-300">Full name</span>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2"
            placeholder="Your full name"
          />
          {errors.name && (
            <span className="text-red-400 text-xs">{errors.name}</span>
          )}
        </label>

        {/* Username */}
        <label className="block">
          <span className="text-sm text-slate-300">Username</span>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2"
            placeholder="username (used in public URL)"
          />
          {errors.username && (
            <span className="text-red-400 text-xs">{errors.username}</span>
          )}
          {publicUrl && (
            <p className="text-xs text-slate-400 mt-1">
              Public URL:{" "}
              <span className="text-indigo-300">{publicUrl}</span>
            </p>
          )}
        </label>

        {/* Role */}
        <label className="block">
          <span className="text-sm text-slate-300">Role / Title</span>
          <input
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2"
            placeholder="Cloud DevOps Engineer, SRE, etc."
          />
        </label>

        {/* Summary */}
        <label className="block">
          <span className="text-sm text-slate-300">Short summary</span>
          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2"
            rows={4}
            placeholder="One or two lines about you"
          />
        </label>

        {/* Location */}
        <label className="block">
          <span className="text-sm text-slate-300">Location</span>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2"
            placeholder="City, Country"
          />
        </label>

        {/* Email */}
        <label className="block">
          <span className="text-sm text-slate-300">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2"
            placeholder="you@example.com"
          />
        </label>

        {/* LinkedIn */}
        <label className="block">
          <span className="text-sm text-slate-300">LinkedIn URL</span>
          <input
            name="linkedin"
            value={form.linkedin}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2"
            placeholder="https://linkedin.com/in/..."
          />
        </label>

        {/* GitHub */}
        <label className="block">
          <span className="text-sm text-slate-300">GitHub URL</span>
          <input
            name="github"
            value={form.github}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2"
            placeholder="https://github.com/..."
          />
        </label>

        {/* PHOTO + RESUME UPLOAD SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">

          {/* -------- PROFILE PHOTO -------- */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <p className="text-sm font-semibold text-indigo-300 mb-3">
              Profile Photo
            </p>

            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full overflow-hidden border border-slate-600 shadow">
                <img
                  src={
                    photoFile
                      ? URL.createObjectURL(photoFile)
                      : form.photo || "/default-profile.png"
                  }
                  alt="Profile preview"
                  className="object-cover h-full w-full"
                />
              </div>

              <div className="flex-1">
                <label className="block cursor-pointer">
                  <span className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 hover:bg-slate-700 transition">
                    Select Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "photo")}
                    className="hidden"
                  />
                </label>

{/* Show current uploaded file */}
{photoFile ? (
  <p className="text-xs text-emerald-300 mt-1">{photoFile.name}</p>
) : form.photo ? (
  <p className="text-xs text-slate-400 mt-1">
    Current Photo: <span className="font-medium">{form.photo.split("/").pop()}</span>
    {" "}
    <span
      className="text-indigo-300 underline cursor-pointer ml-2"
      onClick={() => window.open(form.photo, "_blank")}
    >
      View
    </span>
  </p>
) : (
  <p className="text-xs text-slate-500 mt-1">No photo uploaded</p>
)}
</div>
            </div>
          </div>

          {/* -------- RESUME UPLOAD -------- */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <p className="text-sm font-semibold text-indigo-300 mb-3">
              Resume (PDF)
            </p>

            <div className="flex items-start gap-4">
              <div className="flex-1">
                <label className="block cursor-pointer">
                  <span className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 hover:bg-slate-700 transition">
                    Upload Resume
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, "resume")}
                    className="hidden"
                  />
                </label>

              {/* Show current uploaded resume */}
{resumeFile ? (
  <p className="text-xs text-emerald-300 mt-2">{resumeFile.name}</p>
) : form.resume ? (
  <p className="text-xs text-slate-400 mt-2">
    Current Resume: <span className="font-medium">{form.resume.split("/").pop()}</span>
    {" "}
    <span
      className="text-indigo-300 underline cursor-pointer ml-2"
      onClick={() => window.open(form.resume, "_blank")}
    >
      View
    </span>
  </p>
) : (
  <p className="text-xs text-slate-500 mt-2">No resume uploaded</p>
)}
</div>
            </div>
          </div>
        </div>

        {/* Public toggle */}
        <label className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            name="public"
            checked={form.public}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <span className="text-sm text-slate-300">
            Make my portfolio public (visible at the URL above)
          </span>
        </label>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded ${
              saving ? "bg-slate-700" : "bg-indigo-600 hover:bg-indigo-500"
            }`}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

