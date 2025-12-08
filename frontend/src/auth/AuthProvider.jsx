// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { applyToken, clearAuth } from "../api"; // <-- IMPORTANT
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );

  const refreshToken = localStorage.getItem("refreshToken") || null;

  // --------------------------------------------------------
  // Sync token header when accessToken changes
  // --------------------------------------------------------
  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [accessToken]);

  // --------------------------------------------------------
  // Login with token (from login OR register)
  // --------------------------------------------------------
  const loginWithToken = (token, userObj = null, refresh = null) => {
    // Store token using central logic (api.js)
    applyToken(token, refresh);

    setAccessToken(token);
    localStorage.setItem("accessToken", token);

    if (refresh) {
      localStorage.setItem("refreshToken", refresh);
    }

    if (userObj) {
      setUser(userObj);
      localStorage.setItem("user", JSON.stringify(userObj));
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  // --------------------------------------------------------
  // Logout (clear everything everywhere)
  // --------------------------------------------------------
  const logout = () => {
    setUser(null);
    setAccessToken(null);

    clearAuth(); // <-- from api.js (removes tokens & axios header)

    delete axios.defaults.headers.common["Authorization"];
  };

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        loginWithToken,
        logout,
        isAuthenticated,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

