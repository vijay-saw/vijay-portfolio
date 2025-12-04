// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login as apiLogin, getMe } from "../api";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();

  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState(null);

  // NOTE: default redirect changed to "/home" (user's personal portfolio)
  const redirectTo = (location.state && location.state.from) || "/dashboard";

  const validate = () => {
    const e = {};
    if (!form.usernameOrEmail.trim()) e.usernameOrEmail = "Username or email is required";
    if (!form.password.trim()) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    setErrors((s) => ({ ...s, [e.target.name]: "" }));
    setServerMessage(null);
  };

  const handleSubmit = async (evt) => {
    evt?.preventDefault?.();
    if (!validate()) return;
    setLoading(true);
    setServerMessage(null);

    try {
      const payload = {
        username: form.usernameOrEmail,
        password: form.password,
        email: form.usernameOrEmail,
      };

      const res = await apiLogin(payload);
      // Attempt to get user/profile either from login response or from getMe()
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

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setServerMessage("Login succeeded but server did not return an access token.");
        setLoading(false);
        return;
      }

      // Tell AuthProvider about token and user
      loginWithToken(accessToken, user || null);

      // Use React Router navigation. If for some reason that doesn't change route,
      // fallback to a hard redirect so user definitely leaves the login page.
      navigate(redirectTo, { replace: true });

      // Fallback after a tick if React Router didn't change the route (rare)
      setTimeout(() => {
        if (window.location.pathname === "/login" || window.location.pathname === "/") {
          // if still on login, force a full navigation
          window.location.href = redirectTo;
        }
      }, 300);
    } catch (err) {
      console.error("Login error:", err);
      const serverResp = err?.response;

      if (serverResp) {
        const status = serverResp.status;
        const data = serverResp.data;

        if (status === 400 || status === 401) {
          if (data?.detail) {
            setServerMessage(data.detail);
          } else if (typeof data === "object") {
            const fieldErrors = {};
            for (const k of Object.keys(data)) {
              const v = data[k];
              fieldErrors[k === "non_field_errors" ? "general" : k] =
                Array.isArray(v) ? v.join(", ") : String(v);
            }
            setErrors(fieldErrors);
            setServerMessage("Please fix the highlighted fields.");
          } else {
            setServerMessage(String(data));
          }
        } else {
          setServerMessage(`Server ${status}: ${JSON.stringify(data)}`);
        }
      } else {
        setServerMessage("Network error or server unreachable.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-slate-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        {serverMessage && <div className="mb-3 p-3 bg-slate-900 text-sm text-amber-300 rounded">{serverMessage}</div>}

        <label className="block mb-3">
          <span className="text-sm text-slate-300">Username or Email</span>
          <input
            name="usernameOrEmail"
            value={form.usernameOrEmail}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-slate-600 px-3 py-2 bg-slate-700"
            autoComplete="username"
          />
          {errors.usernameOrEmail && <div className="text-red-400 text-sm">{errors.usernameOrEmail}</div>}
          {errors.username && <div className="text-red-400 text-sm">{errors.username}</div>}
          {errors.email && <div className="text-red-400 text-sm">{errors.email}</div>}
        </label>

        <label className="block mb-4">
          <span className="text-sm text-slate-300">Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-slate-600 px-3 py-2 bg-slate-700"
            autoComplete="current-password"
          />
          {errors.password && <div className="text-red-400 text-sm">{errors.password}</div>}
        </label>

        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded mb-3">
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="flex justify-between items-center">
          <button type="button" onClick={() => navigate("/register")} className="text-sm text-slate-300 underline">
            Create account
          </button>
          <button type="button" onClick={() => navigate("/forgot-password")} className="text-sm text-slate-300 underline">
            Forgot?
          </button>
        </div>
      </form>
    </div>
  );
}

