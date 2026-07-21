"use client";

import { useState, createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    let channel = null;
    let realtimeReady = false;

    const withPremium = (u) => {
      const meta = u.user_metadata || {};
      u.isPremium = meta.role === 'admin' || (meta.premium_until && new Date(meta.premium_until) > new Date());
      return u;
    };

    // MUHIM: bu funksiya `onAuthStateChange` callback ICHIDA await qilinmaydi.
    // Supabase callback'ni auth lock'ni ushlab turgan holda chaqiradi; agar
    // callback ichida `getUser()` (yoki boshqa auth so'rovi) kutilsa, o'sha
    // lock hech qachon bo'shamaydi va butun client muzlab qoladi — keyin
    // getSession() ham, from() ham abadiy osilib turadi (admin panel
    // "Loading..." holatida qotib qolgani shundan edi).
    const refreshFromServer = async () => {
      try {
        const { data: { user: freshUser } } = await supabase.auth.getUser();
        if (freshUser && !cancelled) setUser(withPremium(freshUser));
      } catch (e) {
        console.error("Error fetching fresh user:", e);
      }
    };

    // Faqat sessiyadagi ma'lumot bilan darhol state ni yangilaymiz (sinxron).
    const applySession = (sessionUser) => {
      if (cancelled) return;
      if (!sessionUser) {
        setUser(null);
        return;
      }
      setUser(withPremium({ ...sessionUser }));
    };

    // Listen for auth state changes.
    // Callback SINXRON — ichida hech qanday await yo'q. Server so'rovi
    // lock bo'shagandan keyin (setTimeout 0) alohida bajariladi.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        applySession(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          setTimeout(() => {
            if (cancelled) return;
            refreshFromServer();
            if (!realtimeReady) {
              realtimeReady = true;
              setupRealtimePremium(session.user.id);
            }
          }, 0);
        }
      }
    );

    // Listen to changes in the 'payments' table to automatically refresh session for Premium status
    const setupRealtimePremium = (userId) => {
      if (!userId || channel) return;
      channel = supabase
        .channel('premium-updates')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'payments', filter: `user_id=eq.${userId}` },
          () => {
            console.log('[Auth] Payment detected, refreshing session for premium...');
            // Bu ham callback ichida await qilinmaydi.
            supabase.auth.refreshSession().catch(() => {});
          }
        )
        .subscribe();
    };

    // Xavfsizlik chorasi: supabase-js har doim INITIAL_SESSION hodisasini
    // yuboradi, lekin agar biror sababga ko'ra yubormasa — butun ilova
    // `loading` holatida qotib qolmasin.
    const loadingFallback = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(loadingFallback);
      subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
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
    
    // Add new user to Resend Audience list
    if (data?.user?.email) {
      try {
        await fetch("/api/add-contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.user.email })
        });
      } catch (err) {
        console.error("Failed to add contact to Resend:", err);
      }
    }

    window.location.href = "/dashboard";
    return data;
  };

  const logout = async () => {
    // Logout HAR DOIM ishlashi kerak. Ilgari signOut() xato bersa (tarmoq,
    // "Lock broken" AbortError, sessiya allaqachon yo'q bo'lsa) — hech narsa
    // bo'lmasdi: state tozalanmasdi, redirect yo'q edi. Bu "chiqish tugmasi
    // ishlamayapti" muammosini keltirib chiqarardi.
    // Endi: xato bo'lsa ham state ni tozalab, qattiq (hard) redirect qilamiz.
    try {
      // scope:'local' — faqat shu qurilma sessiyasini o'chiradi, global
      // signout tarmoq so'roviga bog'lanib qolmaydi (tezroq va ishonchliroq).
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      console.error("Logout error (ignored, forcing sign-out):", e);
    } finally {
      setUser(null);
      // router.push() o'rniga qattiq redirect: server komponentlari va
      // middleware qayta baholanadi, sessiya cookie'lari to'liq tozalanadi.
      if (typeof window !== 'undefined') {
        window.location.href = "/";
      } else {
        router.push("/");
      }
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
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  // Safe fallback — AuthProvider tashqarisida chaqirilsa crash qilmasin
  if (!ctx) {
    return {
      user: null,
      loading: true,
      login: async () => {},
      loginWithGoogle: async () => {},
      register: async () => {},
      logout: async () => {},
      resetPassword: async () => {},
      updatePassword: async () => {},
    };
  }
  return ctx;
}
