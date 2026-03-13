"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/LanguageSelector";
import { LanguageProvider } from "@/components/LanguageContext";
import { useTheme } from "next-themes"; // Assuming next-themes for useTheme

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen flex" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

        {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-64"
        )}
        style={{
          boxShadow: '2px 0 24px oklch(0 0 0 / 0.18)',
        }}
      >
        <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      </aside>

      {/* ── Main content ── */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen",
          collapsed ? "md:pl-[68px]" : "md:pl-64"
        )}
      >
        {/* Mobile header */}
        <header
          className="sticky top-0 z-20 flex h-14 items-center border-b px-5 md:hidden backdrop-blur-xl"
          style={{
            background: 'oklch(from var(--background) l c h / 0.85)',
            borderColor: 'var(--border)',
          }}
        >
          <button
            className="mr-4 p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, oklch(0.68 0.22 270), oklch(0.72 0.2 200))' }}
            >
              <span className="text-white text-[10px] font-black">M</span>
            </div>
            <span className="font-bold text-base tracking-tight">Mega IELTS</span>
          </div>
          <div className="flex items-center justify-end">
            <LanguageSelector />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-hidden relative">
          {children}
        </main>
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 backdrop-blur-sm"
            style={{ background: 'oklch(0 0 0 / 0.6)' }}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Panel */}
          <div
            className="relative flex w-72 flex-col shadow-2xl animate-in slide-in-from-left duration-300"
            style={{ background: 'var(--sidebar-background)' }}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-lg transition-all"
              style={{
                background: 'oklch(0.72 0.2 270 / 0.15)',
                color: 'var(--sidebar-foreground)',
              }}
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </button>

            <Sidebar collapsed={false} />
          </div>
        </div>
      )}
      </div>
    </LanguageProvider>
  );
}
