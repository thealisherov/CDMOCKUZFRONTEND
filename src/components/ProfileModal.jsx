"use client";

import { useEffect, useState } from "react";
import { X, Crown, ShieldCheck, Mail, User as UserIcon, Calendar } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";
import { format } from "date-fns";

export default function ProfileModal({ isOpen, onClose, user }) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen || !user) return null;

  const email = user.email || "";
  const meta = user.user_metadata || {};
  const fullName = meta.full_name || email.split("@")[0];
  const role = meta.role || "student";
  const isPremium = user.isPremium;
  const premiumUntil = meta.premium_until ? new Date(meta.premium_until) : null;
  const isExpired = premiumUntil && premiumUntil <= new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
        style={{ 
          background: "var(--card)", 
          border: "1px solid var(--border)",
          color: "var(--foreground)" 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Background */}
        <div className="h-28 w-full bg-gradient-to-br from-indigo-500 to-purple-600 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20mix-blend-overlay"></div>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-8 pt-0 relative">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full border-4 border-card flex items-center justify-center -mt-10 mb-4 font-black text-2xl shadow-lg"
            style={{ 
              background: "linear-gradient(135deg, #e22d2d, oklch(0.68 0.22 270))",
              color: "white"
            }}
          >
            {fullName.charAt(0).toUpperCase()}
          </div>

          <div className="mt-2 space-y-1">
            <h2 className="text-xl font-bold">{fullName}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Mail className="w-3.5 h-3.5" />
              {email}
            </div>
          </div>

          {/* Account Status */}
          <div className="mt-8 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Account Status</h3>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                {role === "admin" ? <ShieldCheck className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground">Role</p>
                <p className="text-sm font-bold capitalize">{role}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-xl border ${isPremium ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30' : 'bg-muted/50 border-border'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPremium ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40' : 'bg-gray-200 text-gray-500 dark:bg-gray-800'}`}>
                <Crown className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Plan</p>
                <p className={`text-sm font-bold ${isPremium ? 'text-amber-700 dark:text-amber-500' : ''}`}>
                  {isPremium ? "Premium" : "Free"}
                </p>
              </div>
              {isPremium && premiumUntil && (
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] font-semibold text-amber-600/70 dark:text-amber-400/70">Valid until</p>
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-500">{format(premiumUntil, "dd.MM.yyyy")}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
