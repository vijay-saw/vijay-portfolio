// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { register as apiRegister, getMe } from "../api";

export default function Register() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password.trim() || form.password.length < 6) e.password = "Password min 6 chars";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    setErrors((s) => ({ ...s, [e.target.name]: "" }));
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
      // apiRegister will try the configured endpoints and call applyToken() if tokens are present.
      const payload = {
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password,
      };

      const res = await apiRegister({
        fullName: payload.fullName,
        username: payload.username,
        email: payload.email,
        password: payload.password,
      });

      // apiRegister applies token to axios/localStorage if found.
      // Try to obtain access token from localStorage (api.js uses "accessToken")
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken") || null;

      // Optional: try to fetch the user/profile if backend didn't return it directly
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
        // notify AuthProvider to set app-level auth state
        loginWithToken(accessToken, user || null, refreshToken);
        setMsg("Account created — redirecting...");
        setTimeout(() => navigate("/dashboard"), 600);
      } else {
        // If tokens weren't returned/applied, still show success and send to login page
        setMsg("Account created. Please log in.");
        setTimeout(() => navigate("/login"), 900);
      }
    } catch (err) {
      console.error("Register error:", err);
      const serverResp = err?.response;

      if (serverResp) {
        const data = serverResp.data;
        setServerError({ status: serverResp.status, data });
        // map field errors, if any
        if (typeof data === "object") {
          const fieldErrors = {};
          for (const k of Object.keys(data)) {
            const v = data[k];
            fieldErrors[k === "non_field_errors" ? "general" : k] =
              Array.isArray(v) ? v.join(", ") : String(v);
          }
          setErrors(fieldErrors);
          setMsg("Please fix the highlighted fields.");
        } else {
          setMsg(`Server ${serverResp.status}: ${String(data)}`);
        }
      } else {
        setMsg("Registration failed. Network or unexpected error (see console).");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-slate-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Create your account</h1>

        {msg && <div className="mb-3 text-amber-300 break-words">{msg}</div>}

        {serverError && (
          <div className="mb-3 p-3 bg-slate-900 text-sm text-red-300 rounded">
            <div><strong>Server error (status {serverError.status}):</strong></div>
            <pre className="whitespace-pre-wrap">{JSON.stringify(serverError.data, null, 2)}</pre>
          </div>
        )}

        <label className="block mb-2">
          <span className="text-sm text-slate-300">Full Name</span>
          <input name="fullName" value={form.fullName} onChange={handleChange} className="mt-1 block w-full rounded border border-slate-600 px-3 py-2 bg-slate-700" />
          {errors.fullName && <div className="text-red-400 text-sm">{errors.fullName}</div>}
        </label>

        <label className="block mb-2">
          <span className="text-sm text-slate-300">Username</span>
          <input name="username" value={form.username} onChange={handleChange} className="mt-1 block w-full rounded border border-slate-600 px-3 py-2 bg-slate-700" />
          {errors.username && <div className="text-red-400 text-sm">{errors.username}</div>}
        </label>

        <label className="block mb-2">
          <span className="text-sm text-slate-300">Email</span>
          <input name="email" value={form.email} onChange={handleChange} className="mt-1 block w-full rounded border border-slate-600 px-3 py-2 bg-slate-700" />
          {errors.email && <div className="text-red-400 text-sm">{errors.email}</div>}
        </label>

        <label className="block mb-4">
          <span className="text-sm text-slate-300">Password</span>
          <input type="password" name="password" value={form.password} onChange={handleChange} className="mt-1 block w-full rounded border border-slate-600 px-3 py-2 bg-slate-700" />
          {errors.password && <div className="text-red-400 text-sm">{errors.password}</div>}
        </label>

        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded mb-3">
          {loading ? "Creating..." : "Register"}
        </button>

        <button type="button" onClick={() => navigate("/login")} className="w-full border border-slate-600 text-slate-200 px-4 py-2 rounded">
          Already have an account? Login
        </button>
      </form>
    </div>
  );
}

