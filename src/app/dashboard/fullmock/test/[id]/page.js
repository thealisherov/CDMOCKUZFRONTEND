"use client";

/**
 * Public Full Mock Test Runner sahifasi.
 * localStorage'dan verify-code natijasini oladi va testni boshlaydi.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import PublicFullMockRunner from "./PublicFullMockRunner";

export default function FullMockTestPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fullmock_session");
      if (!raw) {
        router.replace("/dashboard/fullmock");
        return;
      }
      const parsed = JSON.parse(raw);
      if (!parsed.sections || !parsed.code_id) {
        router.replace("/dashboard/fullmock");
        return;
      }
      // Expire tekshirish
      if (parsed.expires_at && new Date() > new Date(parsed.expires_at)) {
        localStorage.removeItem("fullmock_session");
        router.replace("/dashboard/fullmock");
        return;
      }
      setSession(parsed);
    } catch {
      router.replace("/dashboard/fullmock");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <PublicFullMockRunner
      session={session}
      onComplete={() => {
        localStorage.removeItem("fullmock_session");
      }}
    />
  );
}
