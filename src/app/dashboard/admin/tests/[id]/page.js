"use client";

import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import TestBuilder from "../components/TestBuilder";

function EditTestPageInner() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const isDuplicate = searchParams.get("duplicate") === "1";

  const [initial, setInitial] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.user_metadata?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/admin/tests/${params.id}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok) throw new Error(j.error || "Yuklashda xato");
        const t = j.test;
        if (isDuplicate) {
          const data = JSON.parse(JSON.stringify(t.data || {}));
          if (data.title) data.title = `${data.title} (nusxa)`;
          setInitial({ id: null, test_id: "", type: t.type, data });
        } else {
          setInitial({ id: t.id, test_id: t.test_id, type: t.type, data: t.data });
        }
      })
      .catch((e) => {
        setError(e.message);
        toast.error(e.message);
      });
  }, [params?.id, isDuplicate]);

  if (!user || user.user_metadata?.role !== "admin") return null;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-sm text-muted-foreground">
        <p>{error}</p>
        <button
          onClick={() => router.push("/dashboard/admin/tests")}
          className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          Ro'yxatga qaytish
        </button>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return <TestBuilder initial={initial} mode={isDuplicate ? "create" : "edit"} />;
}

export default function EditTestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full py-32">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      }
    >
      <EditTestPageInner />
    </Suspense>
  );
}
