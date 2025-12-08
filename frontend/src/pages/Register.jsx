// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { register as apiRegister, getMe } from "../api";

export default function Register() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [serverError, setServerError] = useState(null);

  const handleCancel = () => {
    navigate(-1); // go back to previous page
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password.trim() || form.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError(null);
    setMsg("");
  };

  const handleSubmit = async (evt) => {
    evt?.preventDefault?.();
    if (!validate()) return;

    setLoading(true);
    setServerError(null);
    setMsg("");

    try {
      const payload = {
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      const res = await apiRegister(payload);

      // Try to read tokens from localStorage (as configured in api.js)
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken") || null;

      // Try to resolve user info
      let user = null;
      if (res && (res.user || res.username || res.email)) {
        user = res.user || { username: res.username, email: res.email, ...res };
      } else {
        try {
          user = await getMe();
        } catch {
          user = null;
        }
      }

      if (accessToken) {
        loginWithToken(accessToken, user || null, refreshToken);
        setMsg("Account created — redirecting...");
        setTimeout(() => navigate("/dashboard"), 600);
      } else {
        setMsg("Account created successfully. Please log in.");
        setTimeout(() => navigate("/login"), 900);
      }
    } catch (err) {
      console.error("Register error:", err);
      const serverResp = err?.response;

      if (serverResp) {
        const { status, data } = serverResp;
        setServerError({ status, data });

        if (typeof data === "object" && data !== null) {
          const fieldErrors = {};
          for (const key of Object.keys(data)) {
            const value = data[key];
            fieldErrors[key === "non_field_errors" ? "general" : key] =
              Array.isArray(value) ? value.join(", ") : String(value);
          }
          setErrors(fieldErrors);
          setMsg("Please fix the highlighted fields.");
        } else {
          setMsg(`Server ${serverResp.status}: ${String(data)}`);
        }
      } else {
        setMsg("Registration failed. Network or unexpected error.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "mt-1 block w-full rounded border border-slate-600 px-3 py-2 bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <div className="relative max-w-md w-full">
        {/* ❌ Cancel / Close button */}
        <button
          type="button"
          onClick={handleCancel}
          className="absolute -top-3 -right-3 bg-slate-800 border border-slate-600 rounded-full
                     w-9 h-9 flex items-center justify-center text-slate-300 text-xl 
                     hover:bg-slate-700 transition"
          aria-label="Go back"
        >
          ✕
        </button>

        <form
          onSubmit={handleSubmit}
          className="w-full bg-slate-800 p-6 rounded-lg shadow-lg"
          noValidate
        >
          <h1 className="text-2xl font-bold mb-4 text-center">Create your account</h1>

          {msg && (
            <div className="mb-3 text-amber-300 text-sm break-words">
              {msg}
            </div>
          )}

          {serverError && (
            <div className="mb-3 p-3 bg-slate-900 text-xs text-red-300 rounded">
              <div>
                <strong>Server error (status {serverError.status}):</strong>
              </div>
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(serverError.data, null, 2)}
              </pre>
            </div>
          )}

          <label className="block mb-2">
            <span className="text-sm text-slate-300">Full Name</span>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className={inputBase}
              autoComplete="name"
            />
            {errors.fullName && (
              <div className="text-red-400 text-xs mt-1">{errors.fullName}</div>
            )}
          </label>

          <label className="block mb-2">
            <span className="text-sm text-slate-300">Username</span>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className={inputBase}
              autoComplete="username"
            />
            {errors.username && (
              <div className="text-red-400 text-xs mt-1">{errors.username}</div>
            )}
          </label>

          <label className="block mb-2">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={inputBase}
              autoComplete="email"
            />
            {errors.email && (
              <div className="text-red-400 text-xs mt-1">{errors.email}</div>
            )}
          </label>

          <label className="block mb-4">
            <span className="text-sm text-slate-300">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={inputBase}
              autoComplete="new-password"
            />
            {errors.password && (
              <div className="text-red-400 text-xs mt-1">{errors.password}</div>
            )}
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed
                       text-white px-4 py-2 rounded mb-3 text-sm font-medium transition"
            aria-busy={loading}
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full border border-slate-600 text-slate-200 px-4 py-2 rounded text-sm hover:bg-slate-700 transition"
          >
            Already have an account? Login
          </button>
        </form>
      </div>
    </div>
  );
}

