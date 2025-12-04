// src/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

/**
 * ProtectedRoute: ensures child routes are only accessible when authenticated.
 * Uses AuthProvider's isAuthenticated value (single source of truth).
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  // If not authenticated, redirect to login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise render children (protected content)
  return children;
}

