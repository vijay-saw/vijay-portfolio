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

  // Default redirect after login
  const redirectTo = (location.state && location.state.from) || "/dashboard";

  const handleCancel = () => {
    navigate(-1); // go back to previous page
  };

  const validate = () => {
    const e = {};
    if (!form.usernameOrEmail.trim()) {
      e.usernameOrEmail = "Username or email is required";
    }
    if (!form.password.trim()) {
      e.password = "Password is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerMessage(null);
  };

  const handleSubmit = async (evt) => {
    evt?.preventDefault?.();
    if (!validate()) return;

    setLoading(true);
    setServerMessage(null);

    try {
      const payload = {
        username: form.usernameOrEmail.trim(),
        password: form.password,
        email: form.usernameOrEmail.trim(),
      };

      const res = await apiLogin(payload);

      // Try to get user info from response or fallback to getMe()
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

      // Set auth in context
      loginWithToken(accessToken, user || null);

      // Try React Router navigation first
      navigate(redirectTo, { replace: true });

      // Fallback in rare case route doesn't change
      setTimeout(() => {
        if (window.location.pathname === "/login" || window.location.pathname === "/") {
          window.location.href = redirectTo;
        }
      }, 300);
    } catch (err) {
      console.error("Login error:", err);
      const serverResp = err?.response;

      if (serverResp) {
        const { status, data } = serverResp;

        if (status === 400 || status === 401) {
          if (data?.detail) {
            setServerMessage(data.detail);
          } else if (typeof data === "object" && data !== null) {
            const fieldErrors = {};
            for (const key of Object.keys(data)) {
              const value = data[key];
              fieldErrors[key === "non_field_errors" ? "general" : key] =
                Array.isArray(value) ? value.join(", ") : String(value);
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
          <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>

          {serverMessage && (
            <div className="mb-3 p-3 bg-slate-900 text-xs text-amber-300 rounded">
              {serverMessage}
            </div>
          )}

          <label className="block mb-3">
            <span className="text-sm text-slate-300">Username or Email</span>
            <input
              name="usernameOrEmail"
              value={form.usernameOrEmail}
              onChange={handleChange}
              className={inputBase}
              autoComplete="username"
            />
            {errors.usernameOrEmail && (
              <div className="text-red-400 text-xs mt-1">
                {errors.usernameOrEmail}
              </div>
            )}
            {errors.username && (
              <div className="text-red-400 text-xs mt-1">{errors.username}</div>
            )}
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
              autoComplete="current-password"
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
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="flex justify-between items-center text-sm">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-slate-300 underline hover:text-white transition"
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-slate-300 underline hover:text-white transition"
            >
              Forgot?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

