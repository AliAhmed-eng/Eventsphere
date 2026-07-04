import React, { createContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    let mounted = true;

    async function init() {
      // 1) Try to use Supabase session (handles OAuth redirects)
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (session?.user && mounted) {
          setUser(session.user);
          // update common localStorage keys used in the app
          localStorage.setItem("eventSphereUser", JSON.stringify(session.user));
          localStorage.setItem("user", JSON.stringify(session.user));
        }
      } catch (err) {
        console.error("Failed to get Supabase session:", err?.message || err);
      }

      // 2) Fallback to stored user
      const storedUser = localStorage.getItem("eventSphereUser");
      if (storedUser && mounted && !user) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error("Failed to parse stored user:", err);
          localStorage.removeItem("eventSphereUser");
        }
      }

      setLoading(false);

      // 3) Subscribe to auth state changes (so OAuth redirects update the app)
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const u = session?.user || null;
          setUser(u);
          localStorage.setItem("eventSphereUser", JSON.stringify(u));
          localStorage.setItem("user", JSON.stringify(u));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem("eventSphereUser");
          localStorage.removeItem("user");
        }
      });

      return () => {
        mounted = false;
        if (sub?.subscription) sub.subscription.unsubscribe();
      };
    }

    const cleanupPromise = init();
    return () => {
      // if init returned a cleanup (it returns a promise), ignore here — the async init handles unmount cleanup
      // ensure loading is toggled if component unmounts
      setLoading(false);
    };
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("eventSphereUser", JSON.stringify(userData));
    // also set the generic `user` key used elsewhere in the app
    try {
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (e) {}
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("eventSphereUser");
    localStorage.removeItem("user");
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser((prev) => {
      const updatedUser = { ...prev, ...updates };
      localStorage.setItem("eventSphereUser", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
