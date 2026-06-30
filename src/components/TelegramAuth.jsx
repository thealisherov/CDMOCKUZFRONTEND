"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Send, Copy, Check, Loader2, AlertCircle, Phone, ArrowLeft } from "lucide-react";

export default function TelegramAuth() {
  const [showOtpView, setShowOtpView] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sessionRecord, setSessionRecord] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, generating, waiting_start, waiting_contact, authenticating, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const channelRef = useRef(null);

  const supabase = createClient();
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "megaielts_bot";

  // Clean up channel on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(otpCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const startTelegramLogin = async () => {
    setStatus("generating");
    setErrorMessage("");
    setShowOtpView(true);

    try {
      // Generate a 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(code);

      // Save the session in Supabase telegram_auth_sessions
      const { data: session, error } = await supabase
        .from("telegram_auth_sessions")
        .insert([{ otp_code: code }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message || "Failed to initialize session");
      }

      setSessionRecord(session);
      setStatus("waiting_start");

      // Subscribe to updates for this specific session row via Realtime
      const channel = supabase
        .channel(`telegram-auth-${session.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "telegram_auth_sessions",
            filter: `id=eq.${session.id}`,
          },
          async (payload) => {
            const updated = payload.new;
            console.log("[Telegram Auth] Session update received:", updated);

            if (updated.status === "waiting_contact") {
              setStatus("waiting_contact");
            } else if (updated.status === "authenticated") {
              setStatus("authenticating");
              
              // Automatically sign in the user using the temporary password
              const { error: signInError } = await supabase.auth.signInWithPassword({
                phone: updated.phone,
                password: updated.temp_password,
              });

              if (signInError) {
                console.error("Sign-in failed:", signInError);
                setStatus("error");
                setErrorMessage(signInError.message || "Avtorizatsiya muvaffaqiyatsiz tugadi.");
                return;
              }

              // On success, delete the session from DB for security
              await supabase.from("telegram_auth_sessions").delete().eq("id", session.id);
              
              setStatus("success");
              // Redirect to dashboard
              window.location.href = "/dashboard";
            }
          }
        )
        .subscribe((status) => {
          console.log("[Telegram Auth] Realtime channel status:", status);
        });

      channelRef.current = channel;
    } catch (err) {
      console.error("[Telegram Auth] Error starting login:", err);
      setStatus("error");
      setErrorMessage(err.message || "Sessiyani boshlashda xatolik yuz berdi.");
    }
  };

  const handleBack = () => {
    // Unsubscribe from channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setShowOtpView(false);
    setStatus("idle");
    setOtpCode("");
    setSessionRecord(null);
  };

  if (!showOtpView) {
    return (
      <Button
        variant="outline"
        type="button"
        onClick={startTelegramLogin}
        className="w-full bg-[#2EA6DA] hover:bg-[#2796C6] text-white border-none transition-all flex items-center justify-center gap-2 font-medium"
      >
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.79 4.6-1.12 6.37-.14.75-.41 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.54 3.65-.52.36-.99.53-1.42.52-.47-.01-1.37-.27-2.03-.49-.82-.27-1.47-.41-1.41-.87.03-.24.37-.48 1.02-.73 3.99-1.73 6.66-2.88 8.01-3.43 3.82-1.57 4.61-1.85 5.13-1.86.11 0 .37.03.54.17.14.12.18.28.2.44-.01.07.01.23 0 .32z" />
        </svg>
        Sign in with Telegram
      </Button>
    );
  }

  return (
    <div className="w-full p-6 border border-border bg-card/60 backdrop-blur-md rounded-2xl shadow-xl flex flex-col space-y-5 transition-all">
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Orqaga
      </button>

      <div className="flex flex-col space-y-2 text-center">
        <h3 className="font-bold text-lg text-foreground">Telegram orqali kirish</h3>
        <p className="text-xs text-muted-foreground leading-relaxed px-2">
          {status === "generating"
            ? "Sessiya yaratilmoqda..."
            : "Quyidagi 6 xonali OTP kodni botga yuborib, tizimga avtomatik kiring."}
        </p>
      </div>

      {status === "generating" && (
        <div className="flex flex-col items-center justify-center py-6 space-y-3">
          <Loader2 className="h-8 w-8 text-[#2EA6DA] animate-spin" />
          <span className="text-xs text-muted-foreground">Kodni tayyorlamoqdamiz...</span>
        </div>
      )}

      {status !== "generating" && status !== "error" && (
        <div className="flex flex-col space-y-4">
          {/* OTP Code display */}
          <div className="relative flex items-center justify-between bg-muted/60 p-4 rounded-xl border border-border/80">
            <span className="text-3xl font-mono font-extrabold tracking-widest text-[#2EA6DA] select-all">
              {otpCode}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>

          {/* Action step instructions */}
          <div className="space-y-3 text-sm text-foreground/90">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#2EA6DA]/10 text-[#2EA6DA] text-xs font-bold shrink-0">
                1
              </span>
              <p className="text-xs leading-relaxed">
                OTP kodni nusxalang va quyidagi <strong>Telegram Botga o'tish</strong> tugmasini bosing.
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#2EA6DA]/10 text-[#2EA6DA] text-xs font-bold shrink-0">
                2
              </span>
              <p className="text-xs leading-relaxed">
                Botni ishga tushiring (<strong>Start</strong> bosing) va bot so'raganda telefon raqamingizni ulashing.
              </p>
            </div>
          </div>

          {/* Telegram Bot Link Button */}
          <a
            href={`https://t.me/${botUsername}?start=${otpCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#2EA6DA] hover:bg-[#2796C6] text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#2EA6DA]/20"
          >
            <Send className="h-4 w-4 rotate-[-10deg]" /> Telegram Botga O'tish
          </a>

          {/* Realtime Connection Status Indicator */}
          <div className="flex items-center justify-center gap-2 p-3 bg-muted/40 rounded-lg border border-border/40">
            {status === "waiting_start" && (
              <>
                <Loader2 className="h-4 w-4 text-[#2EA6DA] animate-spin" />
                <span className="text-xs text-muted-foreground">Bot orqali start bosilishini kutilmoqda...</span>
              </>
            )}
            {status === "waiting_contact" && (
              <>
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs text-amber-600 font-medium">Iltimos, botda telefon raqamingizni yuboring...</span>
              </>
            )}
            {status === "authenticating" && (
              <>
                <Loader2 className="h-4 w-4 text-green-500 animate-spin" />
                <span className="text-xs text-green-600 font-semibold">Tizimga kirilmoqda...</span>
              </>
            )}
            {status === "success" && (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 font-bold">Muvaffaqiyatli! Yo'naltirilmoqda...</span>
              </>
            )}
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col space-y-4 text-center py-2">
          <div className="flex items-center justify-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-950/50">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-xs text-left font-medium">{errorMessage}</span>
          </div>
          <Button
            type="button"
            onClick={startTelegramLogin}
            className="w-full bg-[#2EA6DA] hover:bg-[#2796C6] text-white"
          >
            Qaytadan urinish
          </Button>
        </div>
      )}
    </div>
  );
}
