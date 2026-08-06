"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import TestsList from "./components/TestsList";

export default function AdminTestsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.user_metadata?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || user.user_metadata?.role !== "admin") return null;

  return <TestsList />;
}
