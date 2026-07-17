"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Lock, User, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function MarkazLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Agar sessiya bo'lsa — to'g'ridan-to'g'ri yo'naltiramiz
  useEffect(() => {
    fetch("/api/centers/me").then(async (r) => {
      if (r.ok) {
        const d = await r.json();
        if (d.authenticated) router.replace(d.kind === "admin" ? "/markaz/panel" : "/markaz/tests");
      }
    }).catch(() => {});
  }, [router]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/centers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: login.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kirishda xatolik");
      router.replace(data.kind === "admin" ? "/markaz/panel" : "/markaz/tests");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">O'quv Markazlar uchun</h1>
          <p className="text-slate-500 mt-1 text-sm">Markaz login va parolingizni kiriting</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
          )}
          <div>
            <label className="text-sm font-medium text-slate-700">Login</label>
            <div className="mt-1 relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                placeholder="markaz_login"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Parol</label>
            <div className="mt-1 relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title={showPass ? "Parolni yashirish" : "Parolni ko'rsatish"}
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !login || !password}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg py-2.5 font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Kirish <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Oddiy foydalanuvchimisiz? <a href="/dashboard" className="text-indigo-500 hover:underline">Asosiy platformaga o'ting</a>
        </p>
      </div>
    </div>
  );
}
