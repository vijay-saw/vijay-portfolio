// src/api.js
import axios from "axios";

/* -------------------------------------------------------
   BASE URL NORMALIZATION
------------------------------------------------------- */
const rawBase = import.meta.env.VITE_API_URL || "/api";
export const API_BASE = String(rawBase).replace(/\/+$/, "");
export const getPublicWhyHireMe = () => axios.get(`${API_BASE}/site-whyhireme/`);
export const getPublicSkills = () => axios.get(`${API_BASE}/site-skills/`);
export const getPublicExperience = () =>
  axios.get(`${API_BASE}/site-experience/`);
export const getPublicProjects = () =>
  axios.get(`${API_BASE}/site-projects/`);
export const getPublicCertifications = () =>
  axios.get(`${API_BASE}/site-certifications/`);

axios.defaults.baseURL = API_BASE;

/* -------------------------------------------------------
   AUTH HEADERS
------------------------------------------------------- */
const setAuthHeaderFromStorage = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete axios.defaults.headers.common["Authorization"];
  } catch (e) {
    delete axios.defaults.headers.common["Authorization"];
  }
};
setAuthHeaderFromStorage();

export const applyToken = (accessToken, refreshToken = null) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem("accessToken");
    delete axios.defaults.headers.common["Authorization"];
  }
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

export const clearAuth = () => {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  } catch (e) {}
  delete axios.defaults.headers.common["Authorization"];
};

/* -------------------------------------------------------
   TOKEN PARSER
------------------------------------------------------- */
const extractTokensFromResponse = (res) => {
  if (!res?.data) return { access: null, refresh: null };

  const data = res.data;

  if (typeof data === "string") return { access: data, refresh: null };

  const access =
    data.access ||
    data.token ||
    data.access_token ||
    data.tokens?.access ||
    data.tokens?.access_token ||
    null;

  const refresh =
    data.refresh ||
    data.refresh_token ||
    data.tokens?.refresh ||
    data.tokens?.refresh_token ||
    null;

  return { access, refresh };
};

/* -------------------------------------------------------
   AUTH: REGISTER
------------------------------------------------------- */
export const register = async ({ fullName, username, email, password }) => {
  const body = { full_name: fullName, username, email, password };

  const endpoints = [`${API_BASE}/auth/register/`, `${API_BASE}/register/`];

  let lastErr = null;
  for (const ep of endpoints) {
    try {
      const res = await axios.post(ep, body);
      const { access, refresh } = extractTokensFromResponse(res);
      if (access) applyToken(access, refresh);
      return res.data;
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error("Register failed");
};

/* -------------------------------------------------------
   AUTH: LOGIN
------------------------------------------------------- */
export const login = async (payload) => {
  const endpoints = [
    `${API_BASE}/auth/token/`,
    `${API_BASE}/token/`,
    `${API_BASE}/auth/login/`,
  ];

  let lastErr = null;
  for (const ep of endpoints) {
    try {
      const body = {
        username: payload.username || payload.email || payload.usernameOrEmail,
        password: payload.password,
      };

      const res = await axios.post(ep, body);
      const { access, refresh } = extractTokensFromResponse(res);
      if (access) applyToken(access, refresh);
      return res.data;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error("Login failed");
};

/* -------------------------------------------------------
   CURRENT USER
------------------------------------------------------- */
export const getMe = async () => {
  const endpoints = [
    `${API_BASE}/profile/`,
    `${API_BASE}/auth/me/`,
    `${API_BASE}/auth/user/`,
    `${API_BASE}/me/`,
    `${API_BASE}/public-profiles/`,
  ];

  for (const ep of endpoints) {
    try {
      const res = await axios.get(ep);
      return res.data;
    } catch (err) {
      // try next
    }
  }
  return null;
};

/* -------------------------------------------------------
   PROFILE
------------------------------------------------------- */
export const getProfile = () => {
  return axios
    .get(`${API_BASE}/profile/`)
    .then((res) => res)
    .catch((err) => {
      console.warn("getProfile network failed, using localStorage fallback.", err?.message || err);
      const data = JSON.parse(localStorage.getItem("local_profile") || "{}");
      return { data };
    });
};

// ---- updateProfile: single-endpoint PATCH /profile/
// ---- updateProfile: supports JSON or FormData (for file upload)
export const updateProfile = async (payload) => {
  try {
    const config = {};

    // If payload is FormData, let axios send multipart/form-data
    if (payload instanceof FormData) {
      config.headers = {
        // axios will add proper boundary
        "Content-Type": "multipart/form-data",
      };
    }

    const res = await axios.patch(`${API_BASE}/profile/`, payload, config);

    try {
      localStorage.setItem("local_profile", JSON.stringify(res.data));
    } catch (e) {}

    return res.data;
  } catch (err) {
    console.warn(
      "updateProfile network failed.",
      err?.response?.status,
      err?.response?.data || err?.message || err
    );
    // optional: cache whatever was sent (for text-only scenarios)
    if (!(payload instanceof FormData)) {
      try {
        localStorage.setItem("local_profile", JSON.stringify(payload));
      } catch (e) {}
    }
    throw err;
  }
};

/* -------------------------------------------------------
   BASIC READ API (needed by React components)
------------------------------------------------------- */
export const getSkills = () => axios.get(`${API_BASE}/skills/`);
export const getProjects = () => axios.get(`${API_BASE}/projects/`);
export const getExperience = () => axios.get(`${API_BASE}/experience/`);
export const getCertifications = () => axios.get(`${API_BASE}/certifications/`);
export const getWhyHireMe = () => axios.get(`${API_BASE}/whyhireme/`);

/* -------------------------------------------------------
   SKILLS: FIXED SANITIZED BULK UPDATE
------------------------------------------------------- */
export const updateSkills = async (payload) => {
  const items = Array.isArray(payload) ? payload : payload?.skills || [];

  const sanitized = items
    .map((item) => {
      if (typeof item === "string") return { name: item.trim() };

      if (item && typeof item === "object") {
        const name = item.name || item.label || item.title || item.value || "";
        const category = item.category || "";
        const level = item.level || "";
        const order = typeof item.order !== "undefined" ? Number(item.order) : 0;

        return {
          ...(name ? { name: String(name).trim() } : {}),
          ...(category ? { category: String(category) } : {}),
          ...(level ? { level: String(level) } : {}),
          order,
        };
      }

      return null;
    })
    .filter((x) => x && x.name);

  if (!Array.isArray(sanitized)) {
    console.error("updateSkills: expected array payload", payload);
    try { localStorage.setItem("local_skills", JSON.stringify(items)); } catch (e) {}
    return payload;
  }

  if (sanitized.length === 0) {
    console.warn("updateSkills: no valid skill items to send (filtered out empty names).");
    try { localStorage.setItem("local_skills", JSON.stringify([])); } catch (e) {}
    return [];
  }

  try {
    const res = await axios.put(`${API_BASE}/skills/`, sanitized);
    try {
      const list = Array.isArray(res.data) ? res.data : res.data.skills || [];
      localStorage.setItem("local_skills", JSON.stringify(list));
    } catch (e) {}
    return res.data;
  } catch (err) {
    console.warn("updateSkills failed, saving to localStorage fallback.", err?.message || err);
    if (err.response) {
      console.error("Server status:", err.response.status);
      console.error("Server response data (validation errors):", err.response.data);
    } else {
      console.error("No server response (network error):", err);
    }
    try { localStorage.setItem("local_skills", JSON.stringify(sanitized)); } catch (e) {}
    return payload;
  }
};

/* -------------------------------------------------------
   PROJECTS
   (accepts strings or objects; sanitizes to server shape)
------------------------------------------------------- */
export const updateProjects = async (payload) => {
  const items = Array.isArray(payload) ? payload : payload?.projects || [];

  const sanitized = items
    .map((item) => {
      if (typeof item === "string") {
        return { title: item.trim() };
      }
      if (item && typeof item === "object") {
        const title = item.title || item.name || item.project_title || item.label || "";
        const description = item.description || item.desc || item.summary || "";
        const tech_stack = item.tech_stack || item.techStack || item.technologies || item.tech || "";
        const github_url = item.github_url || item.github || item.repo || "";
        const url = item.url || item.link || item.project_url || "";
        const date = item.date || item.published || item.year || "";

        const out = {};
        if (title) out.title = String(title).trim();
        if (description) out.description = String(description);
        if (tech_stack) out.tech_stack = String(tech_stack);
        if (github_url) out.github_url = String(github_url);
        if (url) out.url = String(url);
        if (date) out.date = String(date);
        return out;
      }
      return null;
    })
    .filter((x) => x && x.title);

  if (sanitized.length === 0) {
    console.warn("updateProjects: no valid project items to send.");
    try { localStorage.setItem("local_projects", JSON.stringify([])); } catch (e) {}
    return [];
  }

  try {
    const res = await axios.put(`${API_BASE}/projects/`, sanitized);
    try {
      const list = Array.isArray(res.data) ? res.data : res.data.projects || [];
      localStorage.setItem("local_projects", JSON.stringify(list));
    } catch (e) {}
    return res.data;
  } catch (err) {
    console.warn("updateProjects failed, saving to localStorage fallback.", err?.message || err);
    try { localStorage.setItem("local_projects", JSON.stringify(sanitized)); } catch (e) {}
    return sanitized;
  }
};

/* -------------------------------------------------------
   EXPERIENCE
------------------------------------------------------- */
// DEBUG replace: updateExperience
/* -------------------------------------------------------
   EXPERIENCE
------------------------------------------------------- */
export const updateExperience = async (payload) => {
  const todayISO = () => new Date().toISOString().slice(0, 10);

  const tryParseToISO = (val) => {
    if (!val && val !== 0) return "";
    if (val instanceof Date && !isNaN(val)) return val.toISOString().slice(0, 10);

    const s = String(val || "").trim();
    if (!s) return "";

    // direct ISO or YYYY/MM/DD
    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(s)) {
      return s.replace(/\//g, "-").slice(0, 10);
    }

    // YYYYMMDD or DDMMYYYY
    if (/^\d{8}$/.test(s)) {
      const first4 = parseInt(s.slice(0, 4), 10);
      if (first4 >= 1900 && first4 <= 2100) {
        return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
      }
      return `${s.slice(4, 8)}-${s.slice(2, 4)}-${s.slice(0, 2)}`;
    }

    // YYYYMM or MMYYYY
    if (/^\d{6}$/.test(s)) {
      const first4 = parseInt(s.slice(0, 4), 10);
      if (first4 >= 1900 && first4 <= 2100) {
        return `${s.slice(0, 4)}-${s.slice(4, 6)}-01`;
      }
      return `${s.slice(2, 6)}-${s.slice(0, 2)}-01`;
    }

    // just year
    if (/^\d{4}$/.test(s)) return `${s}-01-01`;

    // DD/MM/YYYY etc.
    const dmy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (dmy) {
      let dd = dmy[1].padStart(2, "0");
      let mm = dmy[2].padStart(2, "0");
      let yy = dmy[3];
      if (yy.length === 2) {
        const y2 = parseInt(yy, 10);
        yy = y2 > 50 ? `19${yy}` : `20${yy}`;
      }
      if (yy.length === 4) return `${yy}-${mm}-${dd}`;
    }

    const pd = new Date(s);
    if (!isNaN(pd)) return pd.toISOString().slice(0, 10);

    return "";
  };

  // normalize input (array or { experience: [...] })
  const items = Array.isArray(payload) ? payload : payload?.experience || [];

  const sanitized = items
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          role: item.trim(),
          company: "",
          start_date: todayISO(),
          end_date: "Present",
          is_current: true,
          description: "",
          order: index,
        };
      }

      if (item && typeof item === "object") {
        const role = item.role || item.title || item.position || item.name || "";
        const company =
          item.company || item.employer || item.org || item.organization || "";

        let start_raw =
          item.start_date || item.from || item.start || item.started || "";
        let end_raw =
          item.end_date || item.to || item.end || item.ended || "";

        const period = item.period || item.date_range || item.dates || item.duration;
        if (!start_raw && period) {
          if (typeof period === "string") {
            const parsed = period.split(/\s*[-–—]\s*/);
            start_raw = parsed[0] || "";
            end_raw = parsed[1] || "";
          } else if (Array.isArray(period) && period.length > 0) {
            start_raw = period[0] || "";
            end_raw = period[1] || "";
          }
        }

        let start_iso = tryParseToISO(start_raw);
        let end_iso = tryParseToISO(end_raw);

        let is_current = false;
        if (typeof item.is_current === "boolean") {
          is_current = item.is_current;
        } else {
          const endStr = String(end_raw || "").toLowerCase();
          if (!end_iso || ["present", "current", "ongoing"].includes(endStr)) {
            is_current = true;
          }
        }

        if (!start_iso) start_iso = todayISO();

        if (is_current && !end_iso) {
          end_iso = "Present";
        }

        const description =
          item.description || item.summary || item.desc || "";

        const order =
          typeof item.order === "number"
            ? item.order
            : typeof item.order === "string"
            ? Number(item.order) || index
            : index;

        if (!role) return null;

        const out = {
          role: String(role).trim(),
          company: company ? String(company).trim() : "",
          start_date: start_iso,
          is_current,
          order,
        };

        if (end_iso) out.end_date = end_iso;
        if (description) out.description = String(description);

        return out;
      }

      return null;
    })
    .filter((x) => x && x.role);

  if (sanitized.length === 0) {
    console.warn("updateExperience: no valid items to send.");
    try {
      localStorage.setItem("local_experience", JSON.stringify([]));
    } catch (e) {}
    return [];
  }

  try {
    const res = await axios.put(`${API_BASE}/experience/`, sanitized);
    try {
      localStorage.setItem("local_experience", JSON.stringify(res.data));
    } catch (e) {}
    return res.data;
  } catch (err) {
    console.warn(
      "updateExperience failed, saving to localStorage fallback.",
      err?.response?.status,
      err?.response?.data || err?.message || err
    );
    try {
      localStorage.setItem("local_experience", JSON.stringify(sanitized));
    } catch (e) {}
    return sanitized;
  }
};
/* -------------------------------------------------------
   CONTACT MESSAGES (owner view in dashboard)
------------------------------------------------------- */
export const getMyMessages = () => axios.get(`${API_BASE}/contact-messages/`);
export const deleteMessage = (id) =>
  axios.delete(`${API_BASE}/contact-messages/${id}/`);
export function markMessageRead(id) {
  return axios.post(`${API_BASE}/contact-messages/${id}/mark_read/`);
}
/* -------------------------------------------------------
   CERTIFICATIONS
------------------------------------------------------- */
export const updateCertifications = async (payload) => {
  const items = Array.isArray(payload) ? payload : payload?.certifications || [];

  const sanitized = items
    .map((item) => {
      if (typeof item === "string") return { title: item.trim() };
      if (item && typeof item === "object") {
        const title = item.title || item.name || item.cert || "";
        const issuer = item.issuer || item.company || item.organization || item.org || "";
        const date = item.date || item.issued || item.year || "";
        const url = item.url || item.link || item.certificate_url || "";

        const out = {};
        if (title) out.title = String(title).trim();
        if (issuer) out.issuer = String(issuer).trim();
        if (date) out.date = String(date);
        if (url) out.url = String(url);
        return out;
      }
      return null;
    })
    .filter((x) => x && x.title);

  if (sanitized.length === 0) {
    console.warn("updateCertifications: no valid certifications to send.");
    try { localStorage.setItem("local_certifications", JSON.stringify([])); } catch (e) {}
    return [];
  }

  try {
    const res = await axios.put(`${API_BASE}/certifications/`, sanitized);
    try {
      const list = Array.isArray(res.data) ? res.data : res.data.certifications || [];
      localStorage.setItem("local_certifications", JSON.stringify(list));
    } catch (e) {}
    return res.data;
  } catch (err) {
    console.warn("updateCertifications failed, saving to localStorage fallback.", err?.message || err);
    try { localStorage.setItem("local_certifications", JSON.stringify(sanitized)); } catch (e) {}
    return sanitized;
  }
};

/* -------------------------------------------------------
   PUBLIC PROFILE
------------------------------------------------------- */
// -------------------------------------------------------
//   PUBLIC PROFILE BY USERNAME (no fallback to Vijay)
// -------------------------------------------------------
export const getPublicProfile = (username) => {
  return axios.get(`${API_BASE}/public-profiles/${username}/`);
};

/* -------------------------------------------------------
   THEME
------------------------------------------------------- */
export const updateTheme = async (payload) => {
  const endpoints = [`${API_BASE}/theme/`, `${API_BASE}/v1/theme/`];
  for (const ep of endpoints) {
    try {
      const res = await axios.put(ep, payload);
      try {
        if (payload.username) localStorage.setItem(`local_theme_${payload.username}`, JSON.stringify(payload.theme));
        else localStorage.setItem("local_theme", JSON.stringify(payload.theme));
      } catch (e) {}
      return res.data;
    } catch (err) {}
  }
  try {
    if (payload.username) localStorage.setItem(`local_theme_${payload.username}`, JSON.stringify(payload.theme));
    else localStorage.setItem("local_theme", JSON.stringify(payload.theme));
  } catch (e) {}
  return payload;
};

/* -------------------------------------------------------
   AXIOS: REFRESH TOKEN INTERCEPTOR
------------------------------------------------------- */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

async function attemptRefresh(refreshToken) {
  if (!refreshToken) throw new Error("No refresh token");

  const refreshEndpoints = [
    `${API_BASE}/auth/token/refresh/`,
    `${API_BASE}/token/refresh/`,
  ];

  let lastErr = null;
  for (const ep of refreshEndpoints) {
    try {
      const resp = await axios.post(ep, { refresh: refreshToken });
      return resp;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error("Token refresh failed");
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;
    const errorData = error.response?.data;

    const isTokenExpired =
      status === 401 &&
      ((errorData && (errorData.code === 'token_not_valid' || (errorData.code && errorData.code === 'token_not_valid'))) ||
        (errorData && errorData.detail && errorData.detail.toLowerCase().includes('token')));

    if (!isTokenExpired) return Promise.reject(error);

    if (originalRequest._retry) return Promise.reject(error);
    originalRequest._retry = true;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      clearAuth();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const resp = await attemptRefresh(refreshToken);
      const newAccess = resp.data?.access || resp.data?.token;
      if (!newAccess) {
        clearAuth();
        processQueue(new Error('No new access token'), null);
        return Promise.reject(error);
      }

      const newRefresh = resp.data?.refresh || refreshToken;
      applyToken(newAccess, newRefresh);
      processQueue(null, newAccess);
      originalRequest.headers['Authorization'] = 'Bearer ' + newAccess;
      return axios(originalRequest);
    } catch (err) {
      processQueue(err, null);
      clearAuth();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axios;

