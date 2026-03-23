"use client";

import { useState, createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      if (currentUser) {
        const meta = currentUser.user_metadata || {};
        const isPremium = meta.role === 'admin' || (meta.premium_until && new Date(meta.premium_until) > new Date());
        currentUser.isPremium = isPremium;
      }
      setUser(currentUser);
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        if (currentUser) {
          const meta = currentUser.user_metadata || {};
          const isPremium = meta.role === 'admin' || (meta.premium_until && new Date(meta.premium_until) > new Date());
          currentUser.isPremium = isPremium;
        }
        setUser(currentUser);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    window.location.href = "/dashboard";
    return data;
  };

  const getRedirectUrl = (path = '/api/auth/callback') => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    // Ensure no double slashes if path has leading slash
    return `${baseUrl.replace(/\/$/, '')}${path}`;
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl()
      }
    });
    if (error) throw error;
    // OAuth will automatically redirect to Google, then back to the `redirectTo` URL.
    return data;
  };

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: "student",
        }
      }
    });

    if (error) throw error;
    window.location.href = "/dashboard";
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      router.push("/");
    }
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getRedirectUrl('/api/auth/callback?next=/reset-password'),
    });
    if (error) throw error;
    return data;
  };

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
