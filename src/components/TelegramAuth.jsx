"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Key, Loader2, AlertCircle, Check } from "lucide-react";

export default function TelegramAuth({ mode = "login" }) {
  const [showInputView, setShowInputView] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle, authenticating, success, error
  const [errorMessage, setErrorMessage] = useState("");
  
  const supabase = createClient();
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "megaielts_bot";

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setErrorMessage("Iltimos, 6 xonali kodni to'liq kiriting.");
      setStatus("error");
      return;
    }

    setStatus("authenticating");
    setErrorMessage("");

    try {
      // OTP kodni serverga yuboramiz. Tekshirish va sessiya yaratish
      // to'liq serverda (service_role bilan) amalga oshiriladi — bu yerda
      // hech qanday email yoki parol clientga chiqmaydi.
      const res = await fetch("/api/telegram/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp_code: otpCode.trim() }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Avtorizatsiya muvaffaqiyatsiz tugadi.");
      }

      // Serverdan kelgan tayyor sessiya tokenlari bilan clientda login qilamiz
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });

      if (setSessionError) {
        throw new Error(setSessionError.message || "Sessiya o'rnatishda xatolik.");
      }

      setStatus("success");
      
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("[Telegram Auth] Verification error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Avtorizatsiya muvaffaqiyatsiz tugadi.");
    }
  };

  const handleToggleView = () => {
    setShowInputView(!showInputView);
    setOtpCode("");
    setStatus("idle");
    setErrorMessage("");
  };

  if (!showInputView) {
    return (
      <Button
        variant="outline"
        type="button"
        onClick={handleToggleView}
        className="w-full bg-[#2EA6DA] hover:bg-[#2796C6] text-white border-none transition-all flex items-center justify-center gap-2 font-medium"
      >
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.79 4.6-1.12 6.37-.14.75-.41 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.54 3.65-.52.36-.99.53-1.42.52-.47-.01-1.37-.27-2.03-.49-.82-.27-1.47-.41-1.41-.87.03-.24.37-.48 1.02-.73 3.99-1.73 6.66-2.88 8.01-3.43 3.82-1.57 4.61-1.85 5.13-1.86.11 0 .37.03.54.17.14.12.18.28.2.44-.01.07.01.23 0 .32z" />
        </svg>
        {mode === "register" ? "Sign up with Telegram" : "Sign in with Telegram"}
      </Button>
    );
  }

  return (
    <div className="w-full p-5 border border-border bg-card/60 backdrop-blur-md rounded-2xl shadow-xl flex flex-col space-y-4 transition-all">
      <div className="flex flex-col space-y-1 text-center">
        <h3 className="font-bold text-base text-foreground">Telegram tasdiqlash kodi</h3>
        <p className="text-xs text-muted-foreground">
          Botdan olgan 6 xonali kodni kiriting.
        </p>
      </div>

      <form onSubmit={handleVerifyOtp} className="space-y-3">
        <div className="flex flex-col space-y-1.5">
          <Input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
            disabled={status === "authenticating" || status === "success"}
            className="text-center font-mono text-2xl tracking-[0.4em] h-12 bg-muted/40 border-border focus:border-[#2EA6DA] focus:ring-1 focus:ring-[#2EA6DA]"
          />
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200 dark:border-red-950/50">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-xs text-left font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleToggleView}
            disabled={status === "authenticating" || status === "success"}
            className="flex-1"
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            disabled={status === "authenticating" || status === "success" || otpCode.length !== 6}
            className="flex-1 bg-[#2EA6DA] hover:bg-[#2796C6] text-white border-none"
          >
            {status === "authenticating" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "success" ? (
              <Check className="h-4 w-4" />
            ) : (
              mode === "register" ? "Ro'yxatdan o'tish" : "Kirish"
            )}
          </Button>
        </div>
      </form>

      <div className="border-t border-border/60 my-2 pt-3 text-center">
        <p className="text-xs text-muted-foreground mb-2">Hali kod olmadingizmi?</p>
        <a
          href={`https://t.me/${botUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2EA6DA] hover:text-[#2796C6] transition-colors"
        >
          <Send className="h-3 w-3 rotate-[-10deg]" /> Telegram botni ochish va kod olish
        </a>
      </div>
    </div>
  );
}
